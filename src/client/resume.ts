/**
 * Hydrates the "Copy Markdown" button on /resume.
 * Inlined into a <script> tag via `mountResumeCopy.toString()` in src/index.tsx,
 * so keep all state/helpers inside this function body (no external imports).
 */
export function mountResumeCopy(): void {
  const btn = document.getElementById("copy-md") as HTMLButtonElement | null;
  const status = document.getElementById("copy-status");
  if (!btn) return;

  let cached: string | undefined;
  let pending: Promise<string> | undefined;
  let timer = 0;

  const getMd = (): Promise<string> => {
    if (cached !== undefined) return Promise.resolve(cached);
    pending ??= fetch("/resume?format=md")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        cached = text;
        return text;
      })
      .catch((err) => {
        pending = undefined;
        throw err;
      });
    return pending;
  };

  const copyFallback = (text: string): boolean => {
    const hadFocus = document.activeElement === btn;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    if (hadFocus) btn.focus({ preventScroll: true });
    return ok;
  };

  const copyText = async (): Promise<void> => {
    if (navigator.clipboard) {
      try {
        if (cached !== undefined) {
          await navigator.clipboard.writeText(cached);
          return;
        }
        if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
          try {
            const blob = getMd().then(
              (text) => new Blob([text], { type: "text/plain" }),
            );
            await navigator.clipboard.write([
              new ClipboardItem({ "text/plain": blob }),
            ]);
            return;
          } catch {
            // Fall through to writeText.
          }
        }
        await navigator.clipboard.writeText(await getMd());
        return;
      } catch {
        // Fall through to execCommand("copy") fallback.
      }
    }

    const text = cached ?? (await getMd());
    if (!copyFallback(text)) {
      throw new Error("Clipboard unavailable");
    }
  };

  // Pre-warm on hover/focus so clicking has the Markdown ready in memory.
  btn.addEventListener("pointerenter", () => void getMd().catch(() => {}), {
    once: true,
  });
  btn.addEventListener("focus", () => void getMd().catch(() => {}), {
    once: true,
  });

  btn.addEventListener("click", async () => {
    try {
      await copyText();
      btn.dataset.copied = "true";
      if (status) status.textContent = "Copied Markdown to clipboard";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        delete btn.dataset.copied;
        if (status) status.textContent = "";
      }, 1800);
    } catch (err) {
      console.error("Failed to copy Markdown", err);
      if (status) status.textContent = "Failed to copy Markdown";
    }
  });
}
