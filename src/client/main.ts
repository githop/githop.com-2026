// Tiny bootstrap: the terrain is already painted from static HTML, so the
// interactive bundle (and topo-core) is fetched only once the browser is idle.

const whenIdle = (cb: () => void): void => {
  if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 3000 })
  else setTimeout(cb, 200)
}

const hydrate = () =>
  whenIdle(() => {
    import('./terrain')
      .then(({ mountTerrain }) => mountTerrain())
      .catch((err) => console.error('Failed to load terrain controls', err))
  })

if (document.readyState === 'complete') hydrate()
else addEventListener('load', hydrate, { once: true })
