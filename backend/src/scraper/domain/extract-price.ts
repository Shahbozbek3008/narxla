import { load, type CheerioAPI } from 'cheerio';
import { parsePrice } from './parse-price.js';

export type ExtractionStrategy = 'json-ld' | 'microdata' | 'meta' | 'selector';

export type ExtractedPrice = {
  price: number;
  strategy: ExtractionStrategy;
  title: string | null;
};

const ACCEPTED_CURRENCIES = new Set(['UZS', 'SUM', 'SOM', 'СУМ']);

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : value === undefined ? [] : [value]);

const hasType = (node: JsonObject, type: string) => asArray(node['@type']).some((item) => item === type);

const scalarText = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value) : null);

const currencyAccepted = (currency: unknown) =>
  typeof currency !== 'string' || ACCEPTED_CURRENCIES.has(currency.trim().toUpperCase());

function* walk(node: unknown): Generator<JsonObject> {
  if (Array.isArray(node)) {
    for (const item of node) yield* walk(item);
    return;
  }
  if (!isObject(node)) return;
  yield node;
  yield* walk(node['@graph']);
}

function offerPrice(offer: unknown): number | null {
  if (!isObject(offer) || !currencyAccepted(offer.priceCurrency)) return null;
  const direct = scalarText(offer.price ?? offer.lowPrice);
  if (direct !== null) return parsePrice(direct);
  const specification = asArray(offer.priceSpecification).find(isObject);
  return specification ? parsePrice(scalarText(specification.price)) : null;
}

function fromJsonLd($: CheerioAPI): ExtractedPrice | null {
  for (const element of $('script[type="application/ld+json"]').toArray()) {
    let parsed: unknown;
    try {
      parsed = JSON.parse($(element).text());
    } catch {
      continue;
    }
    for (const node of walk(parsed)) {
      if (!hasType(node, 'Product')) continue;
      const price = asArray(node.offers).map(offerPrice).find((value) => value !== null);
      if (price) return { price, strategy: 'json-ld', title: typeof node.name === 'string' ? node.name : null };
    }
  }
  return null;
}

function fromMicrodata($: CheerioAPI): number | null {
  const element = $('[itemprop="price"]').first();
  if (!element.length) return null;
  const currency = $('[itemprop="priceCurrency"]').first().attr('content');
  if (!currencyAccepted(currency)) return null;
  return parsePrice(element.attr('content') ?? element.text());
}

function fromMeta($: CheerioAPI): number | null {
  const currency = $('meta[property="product:price:currency"], meta[property="og:price:currency"]').first().attr('content');
  if (!currencyAccepted(currency)) return null;
  return parsePrice($('meta[property="product:price:amount"], meta[property="og:price:amount"]').first().attr('content'));
}

function fromSelector($: CheerioAPI, selector: string | null): number | null {
  if (!selector) return null;
  return parsePrice($(selector).first().text());
}

function pageTitle($: CheerioAPI) {
  const title = $('meta[property="og:title"]').attr('content') ?? $('h1').first().text() ?? $('title').text();
  return title.trim() || null;
}

export function extractPrice(html: string, selector: string | null = null): ExtractedPrice | null {
  const $ = load(html);
  const structured = fromJsonLd($);
  if (structured) return structured;

  const fallbacks: [ExtractionStrategy, () => number | null][] = [
    ['microdata', () => fromMicrodata($)],
    ['meta', () => fromMeta($)],
    ['selector', () => fromSelector($, selector)],
  ];
  for (const [strategy, read] of fallbacks) {
    const price = read();
    if (price) return { price, strategy, title: pageTitle($) };
  }
  return null;
}
