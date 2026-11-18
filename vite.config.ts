import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { Marked, type Tokens } from "marked";
import { defineConfig, transformWithOxc, type Plugin } from "vite";
import {
  DEFAULT_TOPO,
  TOPO_CLASSES,
  TOPO_FADE_VAR,
  generateTopo,
  renderTopoLayer,
} from "./src/lib/topo-core.ts";

const LAYER_PLACEHOLDER = "<!--topo:layer-->";
const SEED_PLACEHOLDER = "<!--topo:seed-->";
const STYLES_PLACEHOLDER = "<!--styles:home-->";
const THEME_PLACEHOLDER = "<!--script:theme-->";

/** Stylesheets inlined into index.html, in cascade order. */
const HOME_STYLES = ["theme.css", "base.css", "home.css"].map((name) =>
  fileURLToPath(new URL(`./src/styles/${name}`, import.meta.url)),
);
const THEME_SCRIPT = fileURLToPath(
  new URL("./src/client/theme.ts", import.meta.url),
);

function readHomeStyles(): string {
  const css = HOME_STYLES.map((file) => readFileSync(file, "utf8")).join("\n");
  const missing = [
    ...Object.values(TOPO_CLASSES)
      .map((cls) => `.${cls}`)
      .filter((selector) => !css.includes(selector)),
    ...(css.includes(`${TOPO_FADE_VAR}:`) ? [] : [TOPO_FADE_VAR]),
  ];
  if (missing.length) {
    throw new Error(
      `src/styles/home.css is missing definitions used by topo-core: ${missing.join(", ")}`,
    );
  }
  return css;
}

function requirePlaceholder(html: string, placeholder: string): void {
  if (!html.includes(placeholder)) {
    throw new Error(`index.html is missing the ${placeholder} placeholder`);
  }
}

/**
 * Pre-renders the default terrain and inlines the page CSS into index.html so
 * first paint needs zero JS and zero extra requests.
 */
function homePrerender(): Plugin {
  return {
    name: "githop:home-prerender",
    transformIndexHtml: {
      // Runs before Vite's HTML pipeline, so the inlined <style>/<script> still get minified.
      order: "pre",
      async handler(html) {
        requirePlaceholder(html, LAYER_PLACEHOLDER);
        requirePlaceholder(html, STYLES_PLACEHOLDER);
        requirePlaceholder(html, THEME_PLACEHOLDER);
        const { code } = await transformWithOxc(
          readFileSync(THEME_SCRIPT, "utf8"),
          THEME_SCRIPT,
        );
        const themeBody = code.replace(
          /\bexport\s+function\s+initTheme\b/,
          "function initTheme",
        );
        return html
          .replace(THEME_PLACEHOLDER, `<script>{${themeBody}\ninitTheme();}</script>`)
          .replace(STYLES_PLACEHOLDER, `<style>\n${readHomeStyles()}</style>`)
          .replace(
            LAYER_PLACEHOLDER,
            renderTopoLayer(generateTopo(DEFAULT_TOPO), true),
          )
          .replaceAll(SEED_PLACEHOLDER, String(DEFAULT_TOPO.seed));
      },
    },
    configureServer(server) {
      // index.html doesn't import these files, so reload it manually when they change.
      const watched = [...HOME_STYLES, THEME_SCRIPT];
      server.watcher.add(watched);
      server.watcher.on("change", (file) => {
        if (watched.includes(file)) server.ws.send({ type: "full-reload" });
      });
    },
  };
}

/**
 * Keeps the first `#` as the page's only <h1> and shifts every later heading
 * down one level, so `#` sections → <h2> and `##` entries → <h3>.
 * Only the HTML changes; the raw Markdown (served by ?format=md) stays as written.
 */
function compileMarkdown(source: string): string {
  let seenTitle = false;
  const md = new Marked({
    gfm: true,
    walkTokens(token) {
      if (token.type !== "heading") return;
      const heading = token as Tokens.Heading;
      if (!seenTitle && heading.depth === 1) {
        seenTitle = true;
        return;
      }
      heading.depth = Math.min(heading.depth + 1, 6);
    },
  });
  return md.parse(source, { async: false });
}

/**
 * Compiles plain `*.md` imports to `{ html, raw, title }` at build time so the
 * Worker ships no Markdown parser. Queried imports (e.g. `?raw`) are untouched.
 */
function markdownPrecompile(): Plugin {
  return {
    name: "githop:markdown-precompile",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith(".md")) return null;
      const html = compileMarkdown(code);
      const title = code.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "";
      return {
        code:
          `export const raw = ${JSON.stringify(code)};\n` +
          `export const html = ${JSON.stringify(html)};\n` +
          `export const title = ${JSON.stringify(title)};\n`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [cloudflare(), homePrerender(), markdownPrecompile()],
  // The bootstrap's single dynamic import has no shared deps; skip the
  // modulepreload polyfill to keep the entry chunk tiny.
  build: { modulePreload: false },
  server: {
    allowedHosts: ["local.gnarlybox-ai"],
  },
});
