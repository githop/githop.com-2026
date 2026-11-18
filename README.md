# githop.com

Two-page personal site on Cloudflare Workers (Hono + Vite).

| Route     | Served by                         | Notes |
| --------- | --------------------------------- | ----- |
| `/`       | Static asset (`index.html`)       | No Worker invocation. Topographic SVG is pre-rendered at build time. |
| `/resume` | Worker (`run_worker_first`)       | HTML by default; Markdown when `Accept` prefers `text/markdown`/`text/plain`, or `?format=md`. |

```txt
npm install
npm run dev        # local dev (Vite + workerd)
npm run build      # dist/client (assets) + dist/githop (worker)
npm run typecheck
npm run deploy
```

## Layout

- `index.html` – landing page; `<!--styles:home-->`, `<!--topo:layer-->` and `<!--topo:seed-->` are replaced at build time by the `githop:home-prerender` plugin in `vite.config.ts`.
- `src/lib/topo-core.ts` – zero-dependency seeded simplex fBm + marching squares → SVG path data. `TOPO_CLASSES` / `TOPO_FADE_VAR` are the class names and fade variable shared with the CSS.
- `src/client/main.ts` – tiny bootstrap; loads `src/client/terrain.ts` via `import()` on `requestIdleCallback` after `load`.
- `src/index.tsx` – Hono Worker serving `/resume`.
- `src/content/resume.md` – résumé source, compiled to `{ html, raw, title }` at build time. In the HTML, the first `#` stays `<h1>` and every later heading drops one level (`#` → `<h2>`, `##` → `<h3>`), so write sections as `#` and entries as `##`. `?format=md` serves the file unchanged.

## Styles

- `src/styles/theme.css` – two-tier theme architecture (`--palette-*` primitives mapped to semantic tokens) for Kanagawa Dragon (`[data-theme="dragon"]`, dark) and Lotus (`[data-theme="lotus"]`, light).
- `src/styles/base.css` – shared typography tokens and base element styles.
- `src/styles/home.css` – landing page, scoped under `.home`; inlined into `index.html`. The build fails if it's missing any `TOPO_CLASSES` selector or `--topo-fade`.
- `src/styles/resume.css` – résumé page and print styles, scoped under `.resume`; inlined by the Worker via `?inline`.

Both pages ship `theme.css` + `base.css` + their page file as a single inline `<style>` (no extra requests).
The crossfade duration lives only in `--topo-fade`; `terrain.ts` reads it at runtime.

`vite.config.ts` is type-checked separately via `tsconfig.node.json` (Node types); `tsconfig.json` covers `src/` (browser + Worker).
