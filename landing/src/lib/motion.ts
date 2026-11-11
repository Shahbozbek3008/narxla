export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const MAX_STAGGER_DELAY = 600;

export function stagger(index: number, step: number) {
  return Math.min(index * step, MAX_STAGGER_DELAY);
}
