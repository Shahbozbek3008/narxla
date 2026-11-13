export const routes = {
  login: '/login',
  review: '/',
  catalog: '/catalog',
  material: (code: string) => `/catalog/${code}`,
  labour: '/labour',
  scraper: '/scraper',
  users: '/users',
  reports: '/reports',
} as const;
