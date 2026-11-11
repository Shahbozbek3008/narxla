import type { Vector3Tuple } from 'three';

export const WALL_THICKNESS = 0.1;

const OFFSET = 0.45;
const LIFT = 0.01;
const EXTENSION_GAP = 0.06;
const EXTENSION_OVERSHOOT = 0.1;

export type Side = 1 | -1;
export type Quadrant = { x: Side; z: Side };
export type DimensionId = 'length' | 'width' | 'height';

export type Dimension = {
  id: DimensionId;
  from: Vector3Tuple;
  to: Vector3Tuple;
  tick: Vector3Tuple;
  extensions: [Vector3Tuple, Vector3Tuple][];
  label: Vector3Tuple;
};

export const INITIAL_QUADRANT: Quadrant = { x: 1, z: 1 };

const midpoint = (a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];

export function roomDimensions(length: number, width: number, height: number, { x: sx, z: sz }: Quadrant): Dimension[] {
  const halfL = length / 2;
  const halfW = width / 2;
  const outerL = halfL + WALL_THICKNESS;
  const outerW = halfW + WALL_THICKNESS;
  const lineZ = sz * (outerW + OFFSET);
  const lineX = sx * (outerL + OFFSET);
  const wallZ = sz * (outerW + EXTENSION_GAP);
  const wallX = sx * (outerL + EXTENSION_GAP);
  const overZ = lineZ + sz * EXTENSION_OVERSHOOT;
  const overX = lineX + sx * EXTENSION_OVERSHOOT;

  const lengthFrom: Vector3Tuple = [-halfL, LIFT, lineZ];
  const lengthTo: Vector3Tuple = [halfL, LIFT, lineZ];
  const widthFrom: Vector3Tuple = [lineX, LIFT, -halfW];
  const widthTo: Vector3Tuple = [lineX, LIFT, halfW];
  const heightFrom: Vector3Tuple = [lineX, 0, -sz * outerW];
  const heightTo: Vector3Tuple = [lineX, height, -sz * outerW];

  return [
    {
      id: 'length',
      from: lengthFrom,
      to: lengthTo,
      tick: [0, 0, 1],
      extensions: [
        [[-halfL, LIFT, wallZ], [-halfL, LIFT, overZ]],
        [[halfL, LIFT, wallZ], [halfL, LIFT, overZ]],
      ],
      label: midpoint(lengthFrom, lengthTo),
    },
    {
      id: 'width',
      from: widthFrom,
      to: widthTo,
      tick: [1, 0, 0],
      extensions: [
        [[wallX, LIFT, -halfW], [overX, LIFT, -halfW]],
        [[wallX, LIFT, halfW], [overX, LIFT, halfW]],
      ],
      label: midpoint(widthFrom, widthTo),
    },
    {
      id: 'height',
      from: heightFrom,
      to: heightTo,
      tick: [1, 0, 0],
      extensions: [[[wallX, height, -sz * outerW], [overX, height, -sz * outerW]]],
      label: midpoint(heightFrom, heightTo),
    },
  ];
}
