import { Bath, Bed, BrickWall, CookingPot, DoorOpen, Droplet, Layers, Smile, Sofa, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import { Ceiling, type IconProps } from '@/components/icons';
import type { RoomId, WorkId } from '@/lib/calc-engine';

export const ROOM_ICONS: Record<RoomId, ComponentType<IconProps>> = {
  yotoq: Bed,
  mehmon: Sofa,
  oshxona: CookingPot,
  hammom: Bath,
  koridor: DoorOpen,
  bolalar: Smile,
};

export const WORK_ICONS: Record<WorkId, ComponentType<IconProps>> = {
  pol: Layers,
  devor: BrickWall,
  shift: Ceiling,
  elektr: Zap,
  santex: Droplet,
};
