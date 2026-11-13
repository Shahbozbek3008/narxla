import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { labourKeys, type LabourRate } from '@/entities/labour-rate';
import { http } from '@/shared/api';
import { fmt, notifySuccess, parseNumber } from '@/shared/lib';
import { Button, Input } from '@/shared/ui';

type RangeKey = 'minPrice' | 'price' | 'maxPrice';

const KEYS: RangeKey[] = ['minPrice', 'price', 'maxPrice'];
const LABEL: Record<RangeKey, string> = { minPrice: 'Minimum', price: 'O‘rtacha', maxPrice: 'Maksimum' };

const toFields = (rate: LabourRate) => Object.fromEntries(KEYS.map((key) => [key, fmt(rate[key])])) as Record<RangeKey, string>;

export function LabourRateEditor({ rate }: { rate: LabourRate }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(() => toFields(rate));
  const parsed = Object.fromEntries(KEYS.map((key) => [key, parseNumber(values[key])])) as Record<RangeKey, number>;
  const dirty = KEYS.some((key) => parsed[key] !== rate[key]);
  const valid = parsed.minPrice > 0 && parsed.minPrice <= parsed.price && parsed.price <= parsed.maxPrice;

  const save = useMutation({
    mutationFn: () => http.patch(`/admin/labour-rates/${rate.code}`, parsed),
    onSuccess: () => {
      notifySuccess(`${rate.name} saqlandi`);
      return queryClient.invalidateQueries({ queryKey: labourKeys.all });
    },
  });

  return (
    <div className="flex flex-wrap items-end gap-2">
      {KEYS.map((key) => (
        <label key={key} className="flex w-[120px] flex-col gap-1">
          <span className="text-[11px] text-fg-3">{LABEL[key]}</span>
          <Input
            inputMode="numeric"
            value={values[key]}
            aria-invalid={!valid || undefined}
            onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
            className="h-9 text-right tabular-nums"
          />
        </label>
      ))}
      <Button size="sm" disabled={!dirty || !valid || save.isPending} onClick={() => save.mutate()}>
        Saqlash
      </Button>
    </div>
  );
}
