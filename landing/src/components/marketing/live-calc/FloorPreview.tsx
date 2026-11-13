'use client';

import { motion } from 'framer-motion';
import { WET_ROOMS, type RoomId } from '@/lib/calc-engine';
import { dec } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

type FloorPreviewProps = {
  room: RoomId;
  length: number;
  width: number;
  maxLength: number;
  maxWidth: number;
  unit: string;
};

const SPRING = { type: 'spring', stiffness: 160, damping: 22, mass: 0.6 } as const;

export function FloorPreview({ room, length, width, maxLength, maxWidth, unit }: FloorPreviewProps) {
  const pattern = WET_ROOMS.includes(room) ? 'pattern-tile' : 'pattern-planks';

  return (
    <div className="relative grid h-44 place-items-center rounded-2xl border border-dashed border-line-2 bg-bg-2/60" aria-hidden>
      <motion.div
        className={cn(
          'relative rounded-[6px] border-2 border-accent/70 bg-accent-soft shadow-[0_0_0_6px_var(--accent-soft),0_12px_32px_-12px_var(--glow)]',
          pattern,
        )}
        initial={false}
        animate={{ width: `${(length / maxLength) * 78}%`, height: `${(width / maxWidth) * 74}%` }}
        transition={SPRING}
      >
        <motion.span
          key={`${room}-door`}
          className="absolute bottom-[-2px] left-[14%] h-[2px] w-[22%] bg-bg-2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        />
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] whitespace-nowrap text-fg-2 tabular-nums">
          {dec(length)} {unit}
        </span>
        <span className="absolute top-1/2 -right-3 translate-x-full -translate-y-1/2 font-mono text-[11px] whitespace-nowrap text-fg-2 tabular-nums">
          {dec(width)} {unit}
        </span>
      </motion.div>
    </div>
  );
}
