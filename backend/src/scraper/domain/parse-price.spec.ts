import { parsePrice } from './parse-price.js';

describe('parsePrice', () => {
  it.each([
    ['48 500 so‘m', 48500],
    ['48 500 сум', 48500],
    ['1 250 000', 1250000],
    ['48500', 48500],
    ['48 500.00', 48500],
    ['48 500,50', 48501],
    ['1,250,000', 1250000],
    ['1.250.000', 1250000],
    ['1.250.000,00 UZS', 1250000],
    ['59500.5', 59501],
    ['Narxi: 110 000 so‘m / m²', 110000],
  ])('parses %s', (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each([null, undefined, '', 'Narxi kelishiladi', '0 so‘m'])('rejects %s', (input) => {
    expect(parsePrice(input)).toBeNull();
  });
});
