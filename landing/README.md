# Smetachi — Landing

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · next-intl · framer-motion.

Dizayn tokenlari `src/styles/tokens.css` da (dark/light), Tailwind'ga `src/app/globals.css` dagi `@theme` orqali ulanadi: `bg-surface`, `text-fg-2`, `border-line`, `text-accent-text` va h.k. Breakpointlar: `sm` 640, `md` 900, `lg` 1024, `xl` 1180. Yorug‘ mavzu uchun `light:` varianti bor.

## Ishga tushirish

```bash
cp .env.example .env.local
npm install
npm run dev
```

| Skript | Vazifa |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build va server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

## Muhit o‘zgaruvchilari

| O‘zgaruvchi | Ma’nosi |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Landing domeni (metadata, hreflang) |
| `NEXT_PUBLIC_APP_URL` | Ilova manzili (`/new`, `/login`, `/calcs/:id`, `/estimates/demo`) |

## Tillar

`uz` (default, prefikssiz `/`), `ru` (`/ru`), `en` (`/en`). Matnlar — `messages/*.json`; `uz.json` tiplar uchun manba.

## Tuzilma

```
messages/                 tarjimalar
src/app/[locale]/         layout (metadata, shriftlar, mavzu) va sahifa
src/i18n/                 routing, navigation, request config
src/components/ui/        primitivlar: Button, Section, Reveal, Segmented, Badge…
src/components/landing/   sahifa bloklari (har biri o‘z papkasida)
src/components/theme/     mavzu almashtirgich
src/components/locale/    til menyusi
src/hooks/  src/lib/      umumiy hook va yordamchilar
src/styles/tokens.css     dizayn tokenlari
src/app/globals.css       Tailwind @theme, base qatlam, @utility (sheen, gloss, gradient-text, naqshlar)
```
