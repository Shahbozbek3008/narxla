# Narxla Admin

React + Vite + TypeScript admin panel for the Narxla catalog, prices and users.

## Run

```bash
npm install --ignore-scripts
npm run dev
```

Opens on http://localhost:5174. API requests to `/api` are proxied to the backend (`API_PROXY_TARGET`, default `http://localhost:4000`). Sign in with `ADMIN_API_KEY` from `backend/.env`.

## Architecture — Feature-Sliced Design

```
src/
  app/        providers, router, guards, global styles
  pages/      route screens: review, catalog, labour, scraper, users, reports, login
  widgets/    composite blocks: app-shell, material-browser, material-workspace
  features/   user actions: sign-in, manage-product, create-listing, manage-listing,
              review-observation, edit-labour-rate, run-scraper, grant-plan, resolve-report, toggle-theme
  entities/   business objects with types and queries: session, material, product, listing,
              store, observation, labour-rate, scrape-run, user, report
  shared/     api client, config, lib helpers, ui kit
```

Layers import only from layers below them; slices are consumed through their `index` public API.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Typecheck and production build |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | ESLint |
