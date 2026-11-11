'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { Rotate3d, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { MathUtils, NeutralToneMapping, Vector3, type Vector3Tuple } from 'three';
import { dec } from '@/lib/format';
import { INITIAL_QUADRANT, roomDimensions, type DimensionId, type Quadrant } from './dimensions';
import { useScenePalette } from './palette';
import { RoomModel } from './RoomModel';
import type { RoomShape } from './types';

const CAMERA_DIRECTION = new Vector3(0.95, 1.75, 1.35).normalize();
const FIT_RATIO = 1.9;
const INTRO_RATIO = 1.45;
const SHADOW_EXTENT = 14;
const LABEL_CLASS =
  'pointer-events-none absolute top-0 left-0 rounded-md border border-line-2 bg-surface/90 px-1.5 py-px font-mono text-[11px] whitespace-nowrap text-fg-2 opacity-0 shadow-(--shadow-card) backdrop-blur-sm transition-opacity duration-300 select-none';
const OVERLAY_CHIP = 'rounded-lg border border-line bg-surface/85 shadow-(--shadow-card) backdrop-blur-sm';

type Controls = { target: Vector3; update: () => void };
type LabelRefs = RefObject<(HTMLSpanElement | null)[]>;

function LabelProjector({ anchors, labels }: { anchors: Vector3Tuple[]; labels: LabelRefs }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const point = useMemo(() => new Vector3(), []);

  useFrame(() => {
    anchors.forEach((anchor, index) => {
      const element = labels.current[index];
      if (!element) return;
      point.set(...anchor).project(camera);
      const x = ((point.x + 1) / 2) * size.width;
      const y = ((1 - point.y) / 2) * size.height;
      element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      element.style.opacity = point.z < 1 ? '1' : '0';
    });
  });

  return null;
}

type CameraRigProps = {
  distance: number;
  targetY: number;
  resetSignal: number;
};

function QuadrantTracker({ onChange }: { onChange: (quadrant: Quadrant) => void }) {
  const current = useRef<Quadrant>(INITIAL_QUADRANT);

  useFrame(({ camera }) => {
    const next: Quadrant = { x: camera.position.x >= 0 ? 1 : -1, z: camera.position.z >= 0 ? 1 : -1 };
    if (next.x === current.current.x && next.z === current.current.z) return;
    current.current = next;
    onChange(next);
  });

  return null;
}

function CameraRig({ distance, targetY, resetSignal }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as Controls | null;
  const invalidate = useThree((state) => state.invalidate);
  const reducedMotion = useReducedMotion();
  const mode = useRef<'idle' | 'distance' | 'full'>('distance');
  const goal = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (mode.current !== 'full') mode.current = 'distance';
    invalidate();
  }, [distance, targetY, invalidate]);

  useEffect(() => {
    if (resetSignal === 0) return;
    mode.current = 'full';
    invalidate();
  }, [resetSignal, invalidate]);

  useFrame((_, delta) => {
    if (mode.current === 'idle' || !controls) return;
    const lambda = reducedMotion ? Infinity : 5;
    controls.target.y = MathUtils.damp(controls.target.y, targetY, lambda, delta);

    if (mode.current === 'full') {
      goal.copy(CAMERA_DIRECTION).multiplyScalar(distance).add(controls.target);
      camera.position.set(
        MathUtils.damp(camera.position.x, goal.x, lambda, delta),
        MathUtils.damp(camera.position.y, goal.y, lambda, delta),
        MathUtils.damp(camera.position.z, goal.z, lambda, delta),
      );
    } else {
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(MathUtils.damp(offset.length(), distance, lambda, delta));
      camera.position.copy(controls.target).add(offset);
    }
    controls.update();

    const settled =
      Math.abs(camera.position.distanceTo(controls.target) - distance) < 0.01 &&
      Math.abs(controls.target.y - targetY) < 0.01 &&
      (mode.current !== 'full' || camera.position.distanceTo(goal) < 0.01);
    if (settled) mode.current = 'idle';
    else invalidate();
  });

  return null;
}

function Lights({ palette }: { palette: ReturnType<typeof useScenePalette> }) {
  return (
    <>
      <hemisphereLight args={[palette.sky, palette.ground, 1.5]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[6, 11, 7]}
        intensity={2.4}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
    </>
  );
}

export default function RoomScene3D(shape: RoomShape) {
  const t = useTranslations('app.wizard.dims');
  const palette = useScenePalette();
  const reducedMotion = useReducedMotion();
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const [resetSignal, setResetSignal] = useState(0);
  const [quadrant, setQuadrant] = useState<Quadrant>(INITIAL_QUADRANT);

  const diagonal = Math.hypot(shape.length, shape.width, shape.height);
  const distance = diagonal * FIT_RATIO;
  const [startPosition] = useState<Vector3Tuple>(() =>
    CAMERA_DIRECTION.clone()
      .multiplyScalar(distance * (reducedMotion ? 1 : INTRO_RATIO))
      .toArray(),
  );

  const dimensions = useMemo(
    () => roomDimensions(shape.length, shape.width, shape.height, quadrant),
    [shape.length, shape.width, shape.height, quadrant],
  );
  const anchors = useMemo(() => dimensions.map(({ label }) => label), [dimensions]);
  const labelText: Record<DimensionId, string> = {
    length: `${shape.lengthLabel} m`,
    width: `${shape.widthLabel} m`,
    height: `${shape.heightLabel} m`,
  };

  return (
    <div className="relative size-full overflow-hidden">
      <Canvas
        shadows="percentage"
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 32, position: startPosition, near: 0.1, far: 200 }}
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping;
        }}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <Lights palette={palette} />
        <RoomModel {...shape} dimensions={dimensions} />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping={!reducedMotion}
          dampingFactor={0.08}
          rotateSpeed={0.7}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.2}
          minDistance={diagonal * 0.9}
          maxDistance={diagonal * 3}
        />
        <CameraRig distance={distance} targetY={shape.height * 0.28} resetSignal={resetSignal} />
        <LabelProjector anchors={anchors} labels={labels} />
        <QuadrantTracker onChange={setQuadrant} />
      </Canvas>

      {dimensions.map(({ id }, index) => (
        <span
          key={id}
          ref={(element) => {
            labels.current[index] = element;
          }}
          className={LABEL_CLASS}
          aria-hidden
        >
          {labelText[id]}
        </span>
      ))}

      <div className={`pointer-events-none absolute top-3 left-3 flex items-baseline gap-1.5 px-2.5 py-1.5 tabular-nums ${OVERLAY_CHIP}`}>
        <span className="font-display text-[15px]/5 font-semibold">{dec(shape.area)} m²</span>
        <span className="text-[11px] text-fg-3">{t('floorCaption')}</span>
      </div>

      <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] text-fg-3">
        <Rotate3d size={13} strokeWidth={1.5} aria-hidden />
        {t('dragHint')}
      </span>

      <button
        type="button"
        aria-label={t('resetView')}
        title={t('resetView')}
        onClick={() => setResetSignal((value) => value + 1)}
        className={`absolute right-3 bottom-3 grid size-8 place-items-center text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg ${OVERLAY_CHIP}`}
      >
        <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
