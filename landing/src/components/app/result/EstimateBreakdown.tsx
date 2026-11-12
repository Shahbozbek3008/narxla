import type { Estimate } from '@/lib/calc-engine';
import { CostBreakdown } from './CostBreakdown';
import { KpiGrid } from './KpiGrid';
import { LabourCard } from './LabourCard';
import { MaterialsTable } from './MaterialsTable';
import { TotalsCard } from './TotalsCard';

export function EstimateBreakdown({ result, progress }: { result: Estimate; progress: number }) {
  return (
    <>
      <KpiGrid result={result} progress={progress} />
      <CostBreakdown result={result} progress={progress} />
      <MaterialsTable lines={result.mats} total={result.matTotal} reserve={result.reserve} />
      <LabourCard lines={result.lab} total={result.labTotal} />
      <TotalsCard result={result} />
    </>
  );
}
