export const hostOf = (value: string) => new URL(value).hostname.replace(/^www\./, '');

export const sameHost = (url: string, baseUrl: string) => hostOf(url) === hostOf(baseUrl);
