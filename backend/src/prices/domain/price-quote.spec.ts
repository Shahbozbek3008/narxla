import { buildQuote, median, type SourcePrice } from './price-quote.js';

const source = (unitPrice: number, day: number): SourcePrice => ({
  storeCode: `store-${unitPrice}`,
  storeName: 'Store',
  url: `https://example.uz/${unitPrice}`,
  unitPrice,
  observedAt: new Date(Date.UTC(2026, 10, day)),
});

describe('median', () => {
  it('returns the middle value for odd lists', () => {
    expect(median([5, 1, 3])).toBe(3);
  });

  it('averages the two middle values for even lists', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('throws on empty input', () => {
    expect(() => median([])).toThrow();
  });
});

describe('buildQuote', () => {
  it('falls back to the reference price without sources', () => {
    expect(buildQuote(48500, [], 3)).toMatchObject({ price: 48500, status: 'estimated', sampleSize: 0, checkedAt: null });
  });

  it('marks the quote as partial below the minimum number of sources', () => {
    expect(buildQuote(48500, [source(47000, 1), source(50000, 3)], 3)).toMatchObject({
      price: 48500,
      min: 47000,
      max: 50000,
      status: 'partial',
      sampleSize: 2,
    });
  });

  it('verifies the quote with enough sources and keeps the latest check date', () => {
    const quote = buildQuote(48500, [source(52000, 2), source(47000, 8), source(49250, 5)], 3);
    expect(quote).toMatchObject({ price: 49300, status: 'verified', checkedAt: new Date(Date.UTC(2026, 10, 8)) });
    expect(quote.sources.map((item) => item.unitPrice)).toEqual([47000, 49250, 52000]);
  });
});
