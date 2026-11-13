'use client';

import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRef } from 'react';

type Reason = [label: string, value: string];

type OverspendCardProps = {
  title: string;
  planned: string;
  plannedValue: string;
  actual: string;
  actualValue: string;
  reasons: Reason[];
  solution: string;
};

const BAR_HEAD = 'mb-2 flex justify-between gap-3 text-sm/5';
const TRACK = 'flex h-3 overflow-hidden rounded-md bg-surface-3';
const PLANNED_SHARE = '68%';
const OVERSPEND_SHARE = '32%';
const REASON_START = 0.5;
const REASON_STEP = 0.1;

function useStage(progress: MotionValue<number>, from: number, to: number) {
  return useTransform(progress, [from, to], [0, 1], { clamp: true });
}

function ReasonRow({ progress, index, reason }: { progress: MotionValue<number>; index: number; reason: Reason }) {
  const start = REASON_START + index * REASON_STEP;
  const opacity = useStage(progress, start, start + REASON_STEP);
  const x = useTransform(opacity, [0, 1], [-12, 0]);
  const [label, value] = reason;

  return (
    <motion.li className="flex justify-between gap-4 text-fg-2" style={{ opacity, x }}>
      <span>{label}</span>
      <span className="whitespace-nowrap text-danger">{value}</span>
    </motion.li>
  );
}

export function OverspendCard({ title, planned, plannedValue, actual, actualValue, reasons, solution }: OverspendCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'center 55%'] });
  const progress = useTransform(scrollYProgress, (value) => (reducedMotion ? 1 : value));

  const plannedBar = useStage(progress, 0, 0.25);
  const actualBar = useStage(progress, 0.1, 0.32);
  const overspendBar = useStage(progress, 0.32, 0.5);
  const overspendValue = useStage(progress, 0.4, 0.5);
  const solutionReveal = useStage(progress, 0.85, 1);
  const solutionY = useTransform(solutionReveal, [0, 1], [10, 0]);

  return (
    <div
      ref={ref}
      className="spotlight flex flex-col gap-6 rounded-3xl border border-line bg-surface p-[clamp(20px,3vw,32px)] shadow-(--shadow-lift)"
    >
      <p className="text-sm/5 text-fg-2">{title}</p>

      <div className="flex flex-col gap-4 tabular-nums">
        <div>
          <div className={BAR_HEAD}>
            <span className="text-fg-2">{planned}</span>
            <span className="font-semibold">{plannedValue}</span>
          </div>
          <div className={TRACK}>
            <motion.div className="h-full origin-left rounded-md bg-fg-3" style={{ width: PLANNED_SHARE, scaleX: plannedBar }} />
          </div>
        </div>
        <div>
          <div className={BAR_HEAD}>
            <span className="text-fg-2">{actual}</span>
            <motion.span className="font-semibold text-danger" style={{ opacity: overspendValue }}>
              {actualValue}
            </motion.span>
          </div>
          <div className={TRACK}>
            <motion.div className="h-full origin-left bg-fg-3" style={{ width: PLANNED_SHARE, scaleX: actualBar }} />
            <motion.div
              className="h-full origin-left bg-danger opacity-85 shadow-[0_0_16px_var(--danger)]"
              style={{ width: OVERSPEND_SHARE, scaleX: overspendBar }}
            />
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-3 border-t border-line pt-4 text-sm/5 tabular-nums">
        {reasons.map((reason, index) => (
          <ReasonRow key={reason[0]} progress={progress} index={index} reason={reason} />
        ))}
      </ul>

      <motion.div
        className="flex items-center gap-3 rounded-xl bg-success-soft px-4 py-3 text-sm/5 font-medium text-success"
        style={{ opacity: solutionReveal, y: solutionY }}
      >
        <Check size={16} strokeWidth={1.75} aria-hidden />
        {solution}
      </motion.div>
    </div>
  );
}
