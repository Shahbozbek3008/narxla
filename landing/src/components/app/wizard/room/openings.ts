export const DOOR = { width: 0.9, height: 2 };
export const WINDOW = { width: 1.5, height: 1.4, sill: 0.9 };

export type Opening = { start: number; width: number };

export function windowOpenings(length: number, count: number): Opening[] {
  const width = Math.min(WINDOW.width, length / (count + 1));
  return Array.from({ length: count }, (_, index) => ({
    start: (length * (index + 1)) / (count + 1) - width / 2,
    width,
  }));
}

export function doorOpenings(length: number, count: number): Opening[] {
  const width = Math.min(DOOR.width, length / (count * 2));
  return Array.from({ length: count }, (_, index) => ({
    start: length * (0.08 + index * 0.32),
    width,
  }));
}
