import { extractPrice } from './extract-price.js';

const page = (head: string, body = '') => `<html><head>${head}</head><body>${body}</body></html>`;

const jsonLd = (data: unknown) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;

describe('extractPrice', () => {
  it('reads a Product offer from JSON-LD', () => {
    const html = page(
      jsonLd({ '@context': 'https://schema.org', '@type': 'Product', name: 'Knauf Rotband 30 kg', offers: { price: '48500', priceCurrency: 'UZS' } }),
    );
    expect(extractPrice(html)).toEqual({ price: 48500, strategy: 'json-ld', title: 'Knauf Rotband 30 kg' });
  });

  it('finds products inside @graph and aggregate offers', () => {
    const html = page(
      jsonLd({ '@graph': [{ '@type': 'WebPage' }, { '@type': ['Product'], name: 'Laminat', offers: [{ '@type': 'AggregateOffer', lowPrice: 97500, priceCurrency: 'UZS' }] }] }),
    );
    expect(extractPrice(html)?.price).toBe(97500);
  });

  it('ignores offers in foreign currencies', () => {
    const html = page(jsonLd({ '@type': 'Product', offers: { price: '12', priceCurrency: 'USD' } }));
    expect(extractPrice(html)).toBeNull();
  });

  it('skips malformed JSON-LD and falls back to microdata', () => {
    const html = page('<script type="application/ld+json">{broken</script>', '<h1>Gipsokarton</h1><span itemprop="price" content="59500">59 500</span>');
    expect(extractPrice(html)).toEqual({ price: 59500, strategy: 'microdata', title: 'Gipsokarton' });
  });

  it('falls back to Open Graph price meta tags', () => {
    const html = page('<meta property="product:price:amount" content="465000"><meta property="product:price:currency" content="UZS">');
    expect(extractPrice(html)?.strategy).toBe('meta');
  });

  it('uses the store selector as the last resort', () => {
    const html = page('', '<div class="price-box"><b>21 500 so‘m</b></div>');
    expect(extractPrice(html, '.price-box b')).toMatchObject({ price: 21500, strategy: 'selector' });
  });

  it('returns null when no price is present', () => {
    expect(extractPrice(page('<title>Empty</title>'))).toBeNull();
  });
});
