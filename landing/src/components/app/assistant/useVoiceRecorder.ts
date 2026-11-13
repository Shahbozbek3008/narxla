'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const TARGET_SAMPLE_RATE = 16_000;
const MAX_SECONDS = 28;
const LEVEL_SMOOTHING = 0.75;

const CAPTURE_WORKLET = `
class CaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice(0));
    return true;
  }
}
registerProcessor('narxla-capture', CaptureProcessor);
`;

export type RecorderStatus = 'idle' | 'starting' | 'recording';
export type RecorderError = 'unsupported' | 'denied' | 'failed';

function downsample(chunks: Float32Array[], sourceRate: number) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  const ratio = sourceRate / TARGET_SAMPLE_RATE;
  const output = new Int16Array(Math.floor(length / ratio));
  for (let index = 0; index < output.length; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(length, Math.floor((index + 1) * ratio));
    let sum = 0;
    for (let cursor = start; cursor < end; cursor += 1) sum += merged[cursor];
    const sample = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

type Session = {
  context: AudioContext;
  stream: MediaStream;
  node: AudioWorkletNode;
  chunks: Float32Array[];
  timer: ReturnType<typeof setTimeout>;
  moduleUrl: string;
};

export function useVoiceRecorder(onAudio: (pcm: Int16Array) => void) {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);
  const session = useRef<Session | null>(null);
  const onAudioRef = useRef(onAudio);

  useEffect(() => {
    onAudioRef.current = onAudio;
  });

  const release = useCallback(() => {
    const current = session.current;
    session.current = null;
    if (!current) return null;
    clearTimeout(current.timer);
    current.node.port.onmessage = null;
    current.node.disconnect();
    current.stream.getTracks().forEach((track) => track.stop());
    void current.context.close();
    URL.revokeObjectURL(current.moduleUrl);
    setStatus('idle');
    setLevel(0);
    return current;
  }, []);

  const stop = useCallback(() => {
    const finished = release();
    if (!finished || finished.chunks.length === 0) return;
    onAudioRef.current(downsample(finished.chunks, finished.context.sampleRate));
  }, [release]);

  const cancel = useCallback(() => {
    release();
  }, [release]);

  const start = useCallback(async () => {
    if (session.current) return;
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioWorkletNode === 'undefined') {
      setError('unsupported');
      return;
    }
    setStatus('starting');
    setSeconds(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    } catch (failure) {
      setStatus('idle');
      setError(failure instanceof DOMException && failure.name === 'NotAllowedError' ? 'denied' : 'failed');
      return;
    }

    try {
      const context = new AudioContext();
      const moduleUrl = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: 'application/javascript' }));
      await context.audioWorklet.addModule(moduleUrl);
      const source = context.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(context, 'narxla-capture');
      const chunks: Float32Array[] = [];
      const startedAt = performance.now();
      let smoothed = 0;

      node.port.onmessage = ({ data }: MessageEvent<Float32Array>) => {
        chunks.push(data);
        let energy = 0;
        for (const sample of data) energy += sample * sample;
        smoothed = smoothed * LEVEL_SMOOTHING + Math.sqrt(energy / data.length) * (1 - LEVEL_SMOOTHING);
        setLevel(Math.min(1, smoothed * 6));
        setSeconds(Math.floor((performance.now() - startedAt) / 1000));
      };
      const silence = context.createGain();
      silence.gain.value = 0;
      source.connect(node);
      node.connect(silence).connect(context.destination);

      session.current = { context, stream, node, chunks, moduleUrl, timer: setTimeout(stop, MAX_SECONDS * 1000) };
      setStatus('recording');
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      setStatus('idle');
      setError('failed');
    }
  }, [stop]);

  useEffect(() => () => void release(), [release]);

  return { status, level, seconds, error, maxSeconds: MAX_SECONDS, start, stop, cancel, clearError: () => setError(null) };
}
