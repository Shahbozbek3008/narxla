import { ExtrudeGeometry, Path, Shape } from 'three';

export type WallCut = { start: number; width: number; bottom: number; top: number };
export type Interval = { from: number; to: number };

const EPSILON = 0.02;

const isGap = (cut: WallCut, height: number) => cut.bottom <= 0 && cut.top >= height - EPSILON;

export function solidIntervals(length: number, gaps: Interval[]): Interval[] {
  const sorted = [...gaps].sort((a, b) => a.from - b.from);
  const result: Interval[] = [];
  let cursor = 0;
  sorted.forEach((gap) => {
    if (gap.from - cursor > EPSILON) result.push({ from: cursor, to: gap.from });
    cursor = Math.max(cursor, gap.to);
  });
  if (length - cursor > EPSILON) result.push({ from: cursor, to: length });
  return result;
}

function rectanglePath(cut: WallCut) {
  const path = new Path();
  path.moveTo(cut.start, cut.bottom);
  path.lineTo(cut.start + cut.width, cut.bottom);
  path.lineTo(cut.start + cut.width, cut.top);
  path.lineTo(cut.start, cut.top);
  path.closePath();
  return path;
}

function segmentShape({ from, to }: Interval, height: number, cuts: WallCut[]) {
  const inside = cuts.filter((cut) => cut.start > from + EPSILON && cut.start + cut.width < to - EPSILON);
  const notches = inside.filter((cut) => cut.bottom <= 0).sort((a, b) => a.start - b.start);

  const shape = new Shape();
  shape.moveTo(from, 0);
  notches.forEach((cut) => {
    shape.lineTo(cut.start, 0);
    shape.lineTo(cut.start, cut.top);
    shape.lineTo(cut.start + cut.width, cut.top);
    shape.lineTo(cut.start + cut.width, 0);
  });
  shape.lineTo(to, 0);
  shape.lineTo(to, height);
  shape.lineTo(from, height);
  shape.closePath();
  shape.holes = inside.filter((cut) => cut.bottom > 0 && cut.top < height - EPSILON).map(rectanglePath);
  return shape;
}

export function wallGeometry(length: number, height: number, thickness: number, cuts: WallCut[]) {
  const usable = cuts.filter((cut) => cut.width > EPSILON && cut.bottom < height - EPSILON);
  const gaps = usable.filter((cut) => isGap(cut, height)).map((cut) => ({ from: cut.start, to: cut.start + cut.width }));
  const shapes = solidIntervals(length, gaps).map((interval) => segmentShape(interval, height, usable));
  return new ExtrudeGeometry(shapes, { depth: thickness, bevelEnabled: false });
}
