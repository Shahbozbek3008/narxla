import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import type { ScenePalette } from './palette';

export const TEXTURE_METERS = 2;

const SIZE = 1024;
const PLANK_WIDTH_M = 0.2;
const PLANK_LENGTH_M = { min: 0.9, max: 1.5 };
const SEED = 20261111;

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawPlank(
  context: CanvasRenderingContext2D,
  random: () => number,
  wood: ScenePalette['wood'],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const lightness = wood.lightness + (random() - 0.5) * 9;
  const saturation = wood.saturation + (random() - 0.5) * 8;
  context.fillStyle = `hsl(${wood.hue + (random() - 0.5) * 4} ${saturation}% ${lightness}%)`;
  context.fillRect(x, y, width, height);

  const grains = 6 + Math.floor(random() * 6);
  for (let index = 0; index < grains; index += 1) {
    const offset = y + random() * height;
    context.strokeStyle = `hsl(${wood.hue} ${saturation}% ${lightness - 8 - random() * 6}% / ${0.18 + random() * 0.2})`;
    context.lineWidth = 0.6 + random() * 1.4;
    context.beginPath();
    context.moveTo(x, offset);
    context.bezierCurveTo(
      x + width * 0.33,
      offset + (random() - 0.5) * 6,
      x + width * 0.66,
      offset + (random() - 0.5) * 6,
      x + width,
      offset + (random() - 0.5) * 4,
    );
    context.stroke();
  }

  context.strokeStyle = wood.seam;
  context.lineWidth = 2;
  context.strokeRect(x + 1, y + 1, width - 2, height - 2);
}

export function createFloorTexture(wood: ScenePalette['wood']) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const random = mulberry32(SEED);
  const pxPerMeter = SIZE / TEXTURE_METERS;
  const plankHeight = PLANK_WIDTH_M * pxPerMeter;
  const rows = Math.round(SIZE / plankHeight);

  for (let row = 0; row < rows; row += 1) {
    const y = row * plankHeight;
    const rowStart = random() * SIZE;
    const rowEnd = rowStart + SIZE;
    let x = rowStart;
    while (x < rowEnd - 1) {
      const preferred = (PLANK_LENGTH_M.min + random() * (PLANK_LENGTH_M.max - PLANK_LENGTH_M.min)) * pxPerMeter;
      const length = Math.min(preferred, rowEnd - x);
      const plankSeed = Math.floor(random() * 2 ** 31);
      drawPlank(context, mulberry32(plankSeed), wood, x, y, length, plankHeight);
      drawPlank(context, mulberry32(plankSeed), wood, x - SIZE, y, length, plankHeight);
      x += length;
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
