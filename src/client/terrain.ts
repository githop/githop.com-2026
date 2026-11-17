import { DEFAULT_TOPO, TOPO_CLASSES, TOPO_FADE_VAR, generateTopo, renderTopoLayer } from '../lib/topo-core'

/** Reads the crossfade duration from CSS so the stylesheet stays the single source of truth. */
function fadeMs(el: Element): number {
  const value = getComputedStyle(el).getPropertyValue(TOPO_FADE_VAR).trim()
  const n = Number.parseFloat(value)
  if (!Number.isFinite(n)) return 0
  return value.endsWith('ms') ? n : value.endsWith('s') ? n * 1000 : n
}

function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]
}

function retire(layer: HTMLElement, fade: number): void {
  let done = false
  const remove = () => {
    if (done) return
    done = true
    layer.remove()
  }
  layer.classList.remove(TOPO_CLASSES.visible)
  layer.addEventListener('transitionend', remove, { once: true })
  // Fallback for reduced motion (0ms, no transitionend) / interrupted transitions.
  setTimeout(remove, fade + 100)
}

export function mountTerrain(): void {
  const stage = document.getElementById('topo')
  const button = document.getElementById('new-terrain') as HTMLButtonElement | null
  const seedLabel = document.getElementById('topo-seed')
  if (!stage || !button) return

  button.addEventListener('click', () => {
    const seed = randomSeed()
    const previous = Array.from(stage.children) as HTMLElement[]
    stage.insertAdjacentHTML('beforeend', renderTopoLayer(generateTopo({ ...DEFAULT_TOPO, seed }), false))
    const layer = stage.lastElementChild as HTMLElement

    // Commit the opacity: 0 starting state before toggling, so the transition runs.
    void layer.offsetWidth
    layer.classList.add(TOPO_CLASSES.visible)
    const fade = fadeMs(stage)
    previous.forEach((el) => retire(el, fade))

    if (seedLabel) seedLabel.textContent = String(seed)
  })

  button.disabled = false
}
