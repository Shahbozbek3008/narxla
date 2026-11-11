export type ObservationDecision =
  | { status: 'ACCEPTED'; reason: null }
  | { status: 'PENDING_REVIEW'; reason: string };

export type ObservationInput = {
  unitPrice: number;
  baseline: number | null;
  threshold: number;
};

export function relativeChange(value: number, baseline: number) {
  return (value - baseline) / baseline;
}

export function decideObservation({ unitPrice, baseline, threshold }: ObservationInput): ObservationDecision {
  if (!baseline) return { status: 'PENDING_REVIEW', reason: 'No baseline price to compare with' };

  const change = relativeChange(unitPrice, baseline);
  if (Math.abs(change) <= threshold) return { status: 'ACCEPTED', reason: null };

  const percent = Math.round(change * 100);
  return { status: 'PENDING_REVIEW', reason: `Price changed by ${percent > 0 ? '+' : ''}${percent}% against ${baseline}` };
}

export function unitPriceOf(price: number, packSize: number) {
  return Math.round(price / packSize);
}
