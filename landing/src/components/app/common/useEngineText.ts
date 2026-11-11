import { useTranslations } from 'next-intl';
import type { Calculator, Line, Unit } from '@/lib/calc-engine';
import { dec, fmt } from '@/lib/format';

export function useEngineText() {
  const t = useTranslations('app');

  const unit = (value: Unit) => t(`units.${value}`);
  const quantity = (value: number, unitId: Unit, precise = unitId === 'm2') =>
    `${precise ? dec(value) : fmt(value)} ${unit(unitId)}`;

  return {
    unit,
    quantity,
    lineQty: (line: Pick<Line, 'qty' | 'unit'>) => quantity(line.qty, line.unit),
    lineName: (line: Line) => (line.kind === 'material' ? t(`materials.${line.code}`) : t(`labour.${line.code}`)),
    calcName: (calculator: Calculator) => t(`calcs.items.${calculator.id}.name`),
    calcDesc: (calculator: Calculator) => t(`calcs.items.${calculator.id}.desc`),
  };
}
