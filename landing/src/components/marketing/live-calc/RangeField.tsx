'use client';

import { type CSSProperties, useId } from 'react';
import { dec } from '@/lib/format';

type RangeFieldProps = {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

export function RangeField({ label, unit, value, min, max, step, onChange }: RangeFieldProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm/5 font-medium text-fg-2">
          {label}
        </label>
        <span className="font-display text-lg/6 font-semibold tabular-nums">
          {dec(value)} <span className="text-sm font-normal text-fg-3">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="range-input"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--fill': `${fill}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
