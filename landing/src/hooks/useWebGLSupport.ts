import { useSyncExternalStore } from 'react';

let supported: boolean | null = null;

const detect = () => {
  if (supported === null) {
    try {
      const canvas = document.createElement('canvas');
      supported = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      supported = false;
    }
  }
  return supported;
};

const subscribe = () => () => undefined;

export function useWebGLSupport() {
  return useSyncExternalStore(subscribe, detect, () => true);
}
