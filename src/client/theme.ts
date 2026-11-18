/**
 * Sets `data-theme` ("dragon" | "lotus") before first paint and handles
 * `[data-theme-toggle]` clicks. Inlined into <head>; keep self-contained.
 */
export function initTheme(): void {
  const KEY = "theme";
  const COLORS = { dragon: "#181616", lotus: "#f9f6e1" } as const;
  type Theme = keyof typeof COLORS;

  const root = document.documentElement;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {}

  const initial: Theme =
    stored === "dragon" || stored === "lotus"
      ? stored
      : matchMedia("(prefers-color-scheme: light)").matches
        ? "lotus"
        : "dragon";

  const apply = (theme: Theme): void => {
    root.dataset.theme = theme;
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (meta) meta.content = COLORS[theme];
  };

  apply(initial);

  document.addEventListener("click", (e) => {
    if (!(e.target as Element | null)?.closest?.("[data-theme-toggle]")) return;
    const next: Theme = root.dataset.theme === "lotus" ? "dragon" : "lotus";
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  });
}
