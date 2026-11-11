import { decideObservation, unitPriceOf } from './observation-policy.js';

describe('decideObservation', () => {
  const threshold = 0.3;

  it('accepts prices within the threshold', () => {
    expect(decideObservation({ unitPrice: 52000, baseline: 48500, threshold })).toEqual({ status: 'ACCEPTED', reason: null });
  });

  it('flags sharp increases for review', () => {
    expect(decideObservation({ unitPrice: 70000, baseline: 48500, threshold })).toEqual({
      status: 'PENDING_REVIEW',
      reason: 'Price changed by +44% against 48500',
    });
  });

  it('flags sharp drops for review', () => {
    expect(decideObservation({ unitPrice: 20000, baseline: 48500, threshold }).status).toBe('PENDING_REVIEW');
  });

  it('sends the first observation without a baseline to review', () => {
    expect(decideObservation({ unitPrice: 48500, baseline: null, threshold }).status).toBe('PENDING_REVIEW');
  });
});

describe('unitPriceOf', () => {
  it('divides the listing price by the pack size', () => {
    expect(unitPriceOf(234300, 2.13)).toBe(110000);
  });
});
