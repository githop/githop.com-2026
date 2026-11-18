import { Hono } from "hono";
import { raw } from "hono/html";
// Pre-compiled to HTML at build time by the markdown plugin in vite.config.ts.
import {
  html as resumeHtml,
  raw as resumeMd,
  title,
} from "./content/resume.md";
import { mountResumeCopy } from "./client/resume";
import { initTheme } from "./client/theme";
import { prefersMarkdown } from "./lib/negotiate";
import themeCss from "./styles/theme.css?inline";
import baseCss from "./styles/base.css?inline";
import resumeCss from "./styles/resume.css?inline";

const resumeTitle = title || "Resume";

const CACHE_CONTROL = import.meta.env.DEV
  ? "no-store"
  : "public, max-age=300, s-maxage=3600";

const RESUME_CSS = themeCss + baseCss + resumeCss;
const THEME_SCRIPT = `(${initTheme.toString()})();`;
const COPY_MD_SCRIPT = `(${mountResumeCopy.toString()})();`;

const ResumePage = ({ title, body }: { title: string; body: string }) => (
  <>
    {raw("<!doctype html>")}
    <html lang="en" data-theme="dragon">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`${title} — Résumé`}</title>
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#181616" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="text/markdown" href="/resume?format=md" />
        <script>{raw(THEME_SCRIPT)}</script>
        <style>{raw(RESUME_CSS)}</style>
      </head>
      <body class="resume">
        <div class="page">
          <nav class="toolbar" aria-label="Résumé">
            <a href="/">← githop.com</a>
            <button id="copy-md" class="copy-md" type="button">
              <span class="copy-label">Copy Markdown</span>
              <span class="copy-done" aria-hidden="true">
                ✓ Copied
              </span>
            </button>
          </nav>
          <span
            id="copy-status"
            class="sr-only"
            role="status"
            aria-live="polite"
          />
          <article>{raw(body)}</article>
        </div>
        <button
          class="theme-toggle"
          type="button"
          aria-label="Toggle color theme"
          data-theme-toggle
        >
          <svg
            class="theme-to-light"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg
            class="theme-to-dark"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
        <script>{raw(COPY_MD_SCRIPT)}</script>
      </body>
    </html>
  </>
);

const app = new Hono();

app.get("/resume", (c) => {
  const format = c.req.query("format");
  const wantsMarkdown =
    format === "md" ||
    format === "markdown" ||
    (format === undefined && prefersMarkdown(c.req.header("Accept")));

  c.header("Vary", "Accept");
  c.header("Cache-Control", CACHE_CONTROL);

  if (wantsMarkdown) {
    return c.body(resumeMd, 200, {
      "Content-Type": "text/markdown; charset=utf-8",
    });
  }
  return c.html(<ResumePage title={resumeTitle} body={resumeHtml} />);
});

export default app;
