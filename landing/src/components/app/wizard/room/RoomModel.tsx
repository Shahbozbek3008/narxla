'use client';

import { Line } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { DoubleSide, MeshStandardMaterial, type BufferGeometry, type Texture, type Vector3Tuple } from 'three';
import { WALL_THICKNESS as T, type Dimension } from './dimensions';
import { createFloorTexture, TEXTURE_METERS } from './floorTexture';
import { DOOR, doorOpenings, WINDOW, windowOpenings, type Opening } from './openings';
import { useScenePalette, type ScenePalette } from './palette';
import type { RoomShape } from './types';
import { solidIntervals, wallGeometry, type WallCut } from './wallGeometry';

const CEILING_GAP = 0.1;
const SLAB_DEPTH = 0.14;
const SKIRTING = { height: 0.08, depth: 0.015 };
const FRAME = { size: 0.05, depth: T * 0.8 };
const DOOR_ANGLE = (75 * Math.PI) / 180;
const ARC_SEGMENTS = 32;
const MULLION_MIN_WIDTH = 0.9;


const toCut = ({ start, width }: Opening, bottom: number, top: number): WallCut => ({ start: start + T, width, bottom, top });

function useDisposable<T extends { dispose: () => void } | null>(resource: T) {
  useEffect(() => () => resource?.dispose(), [resource]);
  return resource;
}

type WallProps = {
  length: number;
  height: number;
  cuts: WallCut[];
  position: Vector3Tuple;
  rotationY: number;
  materials: MeshStandardMaterial[];
};

function useWallMaterials(palette: ScenePalette) {
  const materials = useMemo(
    () => [
      new MeshStandardMaterial({ color: palette.wall, roughness: 0.92 }),
      new MeshStandardMaterial({ color: palette.cap, roughness: 0.85 }),
    ],
    [palette.wall, palette.cap],
  );
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);
  return materials;
}

function Wall({ length, height, cuts, position, rotationY, materials }: WallProps) {
  const geometry = useDisposable(useMemo<BufferGeometry>(() => wallGeometry(length, height, T, cuts), [length, height, cuts]));

  return (
    <mesh
      geometry={geometry}
      material={materials}
      position={position}
      rotation={[0, rotationY, 0]}
      castShadow
      receiveShadow
    />
  );
}

function Box({ size, position, color, rotationY = 0 }: { size: Vector3Tuple; position: Vector3Tuple; color: string; rotationY?: number }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

function Window3D({ centerX, width, bottom, top, wallZ, palette }: { centerX: number; width: number; bottom: number; top: number; wallZ: number; palette: ScenePalette }) {
  const height = top - bottom;
  const midY = (bottom + top) / 2;
  const z = wallZ - T / 2;
  const { size: F, depth: D } = FRAME;

  return (
    <group>
      <Box size={[width, F, D]} position={[centerX, top - F / 2, z]} color={palette.frame} />
      <Box size={[width, F, D]} position={[centerX, bottom + F / 2, z]} color={palette.frame} />
      <Box size={[F, height, D]} position={[centerX - width / 2 + F / 2, midY, z]} color={palette.frame} />
      <Box size={[F, height, D]} position={[centerX + width / 2 - F / 2, midY, z]} color={palette.frame} />
      {width > MULLION_MIN_WIDTH && <Box size={[F * 0.8, height, D * 0.9]} position={[centerX, midY, z]} color={palette.frame} />}
      <mesh position={[centerX, midY, z]}>
        <planeGeometry args={[width - F * 2, height - F * 2]} />
        <meshStandardMaterial color={palette.glass} transparent opacity={0.38} roughness={0.05} metalness={0.1} side={DoubleSide} depthWrite={false} />
      </mesh>
      <Box size={[width + 0.12, 0.03, 0.22]} position={[centerX, bottom - 0.015, wallZ + 0.06]} color={palette.frame} />
    </group>
  );
}

function DoorArc({ hinge, radius, color }: { hinge: Vector3Tuple; radius: number; color: string }) {
  const points = useMemo(
    () =>
      Array.from({ length: ARC_SEGMENTS + 1 }, (_, index): Vector3Tuple => {
        const angle = (index / ARC_SEGMENTS) * DOOR_ANGLE;
        return [hinge[0] + radius * Math.cos(angle), 0.006, hinge[2] - radius * Math.sin(angle)];
      }),
    [hinge, radius],
  );

  return <Line points={points} color={color} lineWidth={1} dashed dashSize={0.07} gapSize={0.05} />;
}

function Door3D({ hingeX, width, top, wallZ, palette }: { hingeX: number; width: number; top: number; wallZ: number; palette: ScenePalette }) {
  const leafWidth = width - 0.02;
  const hinge = useMemo<Vector3Tuple>(() => [hingeX, 0, wallZ], [hingeX, wallZ]);

  return (
    <group>
      <group position={[hingeX + 0.01, 0, wallZ - 0.02]} rotation={[0, DOOR_ANGLE, 0]}>
        <Box size={[leafWidth, top - 0.01, 0.04]} position={[leafWidth / 2, (top - 0.01) / 2, 0]} color={palette.door} />
        <Box size={[0.12, 0.02, 0.03]} position={[leafWidth - 0.1, 0.95, -0.04]} color={palette.handle} />
        <Box size={[0.12, 0.02, 0.03]} position={[leafWidth - 0.1, 0.95, 0.04]} color={palette.handle} />
      </group>
      {[wallZ - 0.01, wallZ + T + 0.01].map((z) => (
        <group key={z}>
          <Box size={[0.06, top + 0.06, 0.02]} position={[hingeX - 0.03, (top + 0.06) / 2, z]} color={palette.frame} />
          <Box size={[0.06, top + 0.06, 0.02]} position={[hingeX + width + 0.03, (top + 0.06) / 2, z]} color={palette.frame} />
          <Box size={[width + 0.12, 0.06, 0.02]} position={[hingeX + width / 2, top + 0.03, z]} color={palette.frame} />
        </group>
      ))}
      <DoorArc hinge={hinge} radius={leafWidth} color={palette.arc} />
    </group>
  );
}

function Floor({ length, width, palette }: { length: number; width: number; palette: ScenePalette }) {
  const texture = useDisposable(useMemo<Texture | null>(() => createFloorTexture(palette.wood), [palette.wood]));

  useEffect(() => {
    if (!texture) return;
    texture.repeat.set(length / TEXTURE_METERS, width / TEXTURE_METERS);
    texture.needsUpdate = true;
  }, [texture, length, width]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial map={texture} roughness={0.65} />
      </mesh>
      <Box size={[length + T * 2, SLAB_DEPTH, width + T * 2]} position={[0, -SLAB_DEPTH / 2, 0]} color={palette.slab} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -SLAB_DEPTH, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={palette.shadowOpacity} />
      </mesh>
    </group>
  );
}

function DimensionLine({ dimension, color }: { dimension: Dimension; color: string }) {
  const { from, to, tick, extensions } = dimension;
  const ticks = useMemo(
    () =>
      [from, to].map((point): [Vector3Tuple, Vector3Tuple] => [
        [point[0] - tick[0] * 0.09, point[1] - tick[1] * 0.09, point[2] - tick[2] * 0.09],
        [point[0] + tick[0] * 0.09, point[1] + tick[1] * 0.09, point[2] + tick[2] * 0.09],
      ]),
    [from, to, tick],
  );

  return (
    <group>
      <Line points={[from, to]} color={color} lineWidth={1.2} />
      {[...ticks, ...extensions].map((points, index) => (
        <Line key={index} points={points} color={color} lineWidth={1} transparent opacity={index < 2 ? 1 : 0.6} />
      ))}
    </group>
  );
}

type RoomModelProps = RoomShape & { dimensions: Dimension[] };

export function RoomModel({ length: L, width: W, height: H, doors, windows, dimensions }: RoomModelProps) {
  const palette = useScenePalette();
  const wallMaterials = useWallMaterials(palette);

  const doorTop = Math.min(DOOR.height, H - CEILING_GAP);
  const windowTop = Math.min(WINDOW.sill + WINDOW.height, H - CEILING_GAP);
  const windowBottom = Math.min(WINDOW.sill, windowTop - 0.3);

  const doorList = useMemo(() => doorOpenings(L, doors), [L, doors]);
  const windowList = useMemo(() => windowOpenings(L, windows), [L, windows]);
  const frontCuts = useMemo(() => doorList.map((door) => toCut(door, 0, doorTop)), [doorList, doorTop]);
  const backCuts = useMemo(() => windowList.map((item) => toCut(item, windowBottom, windowTop)), [windowList, windowBottom, windowTop]);
  const noCuts = useMemo<WallCut[]>(() => [], []);
  const frontSkirting = useMemo(
    () => solidIntervals(L, doorList.map(({ start, width }) => ({ from: start, to: start + width }))),
    [L, doorList],
  );

  const outerLength = L + T * 2;
  const { height: SH, depth: SD } = SKIRTING;

  return (
    <group>
      <Floor length={L} width={W} palette={palette} />

      <Wall length={outerLength} height={H} cuts={backCuts} position={[-L / 2 - T, 0, -W / 2 - T]} rotationY={0} materials={wallMaterials} />
      <Wall length={outerLength} height={H} cuts={frontCuts} position={[-L / 2 - T, 0, W / 2]} rotationY={0} materials={wallMaterials} />
      <Wall length={W} height={H} cuts={noCuts} position={[-L / 2 - T, 0, W / 2]} rotationY={Math.PI / 2} materials={wallMaterials} />
      <Wall length={W} height={H} cuts={noCuts} position={[L / 2 + T, 0, -W / 2]} rotationY={-Math.PI / 2} materials={wallMaterials} />

      <Box size={[L, SH, SD]} position={[0, SH / 2, -W / 2 + SD / 2]} color={palette.skirting} />
      <Box size={[SD, SH, W]} position={[-L / 2 + SD / 2, SH / 2, 0]} color={palette.skirting} />
      <Box size={[SD, SH, W]} position={[L / 2 - SD / 2, SH / 2, 0]} color={palette.skirting} />
      {frontSkirting.map(({ from, to }) => (
        <Box key={from} size={[to - from, SH, SD]} position={[-L / 2 + (from + to) / 2, SH / 2, W / 2 - SD / 2]} color={palette.skirting} />
      ))}

      {windowList.map(({ start, width }, index) => (
          <Window3D
            key={`window-${index}`}
            centerX={-L / 2 + start + width / 2}
            width={width}
            bottom={windowBottom}
            top={windowTop}
            wallZ={-W / 2}
            palette={palette}
          />
        ))}

      {doorList.map(({ start, width }, index) => (
        <Door3D
          key={`door-${index}`}
          hingeX={-L / 2 + start}
          width={width}
          top={doorTop}
          wallZ={W / 2}
          palette={palette}
        />
      ))}

      {dimensions.map((dimension) => (
        <DimensionLine key={dimension.id} dimension={dimension} color={palette.dimension} />
      ))}
    </group>
  );
}
