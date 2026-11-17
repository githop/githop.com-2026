/**
 * Zero-dependency topographic contour generator.
 *
 * seed -> seeded simplex fBm elevation field -> marching squares -> stitched
 * polylines -> compact SVG path data (1 decimal place).
 *
 * Runs unchanged in Node (build-time pre-render) and the browser (client regen),
 * so both produce byte-identical markup for the same options.
 */

export interface TopoOptions {
  seed: number
  width: number
  height: number
  /** Number of contour thresholds. Every 5th threshold is a major (index) contour. */
  levels: number
  /** Grid spacing in SVG units. Smaller = smoother lines, larger output. */
  cellSize?: number
  /** Size of one noise "feature" in SVG units. */
  scale?: number
  octaves?: number
}

export interface Contour {
  /** 1-based threshold index. */
  level: number
  threshold: number
  major: boolean
  d: string
}

export interface Topo {
  seed: number
  width: number
  height: number
  contours: Contour[]
}

export const DEFAULT_TOPO: TopoOptions = {
  seed: 1984,
  width: 1600,
  height: 1000,
  levels: 20,
  cellSize: 14,
  scale: 1200,
  octaves: 4,
}

export const MAJOR_EVERY = 5

/**
 * Class names shared by the generated markup, src/client/terrain.ts and
 * src/styles/home.css. The build checks that the stylesheet defines each one.
 */
export const TOPO_CLASSES = {
  svg: 'topo-svg',
  minor: 'topo-minor',
  major: 'topo-major',
  layer: 'topo-layer',
  visible: 'is-visible',
} as const

/** CSS custom property holding the crossfade duration (e.g. `1200ms`). */
export const TOPO_FADE_VAR = '--topo-fade'
const MIN_LOOP_POINTS = 8
const SIMPLIFY_TOLERANCE = 0.8

// ---------------------------------------------------------------------------
// PRNG + simplex noise
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6
const GRAD_X = [1, -1, 1, -1, 1, -1, 0, 0]
const GRAD_Y = [1, 1, -1, -1, 0, 0, 1, -1]

function createSimplex2D(random: () => number): (x: number, y: number) => number {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = p[i]
    p[i] = p[j]
    p[j] = tmp
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  const corner = (gi: number, x: number, y: number): number => {
    let t = 0.5 - x * x - y * y
    if (t <= 0) return 0
    t *= t
    return t * t * (GRAD_X[gi] * x + GRAD_Y[gi] * y)
  }

  return (xin, yin) => {
    const s = (xin + yin) * F2
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const t = (i + j) * G2
    const x0 = xin - (i - t)
    const y0 = yin - (j - t)
    const i1 = x0 > y0 ? 1 : 0
    const j1 = 1 - i1
    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2
    const y2 = y0 - 1 + 2 * G2
    const ii = i & 255
    const jj = j & 255
    return (
      70 *
      (corner(perm[ii + perm[jj]] & 7, x0, y0) +
        corner(perm[ii + i1 + perm[jj + j1]] & 7, x1, y1) +
        corner(perm[ii + 1 + perm[jj + 1]] & 7, x2, y2))
    )
  }
}

// ---------------------------------------------------------------------------
// Elevation field
// ---------------------------------------------------------------------------

interface Field {
  cols: number
  rows: number
  values: Float64Array
}

function buildField(opts: Required<TopoOptions>): Field {
  const random = mulberry32(opts.seed)
  const noise = createSimplex2D(random)
  const ox = random() * 1000
  const oy = random() * 1000

  const fbm = (x: number, y: number): number => {
    let sum = 0
    let amp = 0.5
    let freq = 1
    for (let o = 0; o < opts.octaves; o++) {
      sum += amp * noise(x * freq, y * freq)
      freq *= 2
      amp *= 0.5
    }
    return sum
  }

  const cols = Math.ceil(opts.width / opts.cellSize) + 1
  const rows = Math.ceil(opts.height / opts.cellSize) + 1
  const values = new Float64Array(cols * rows)
  let min = Infinity
  let max = -Infinity

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (i * opts.cellSize) / opts.scale + ox
      const y = (j * opts.cellSize) / opts.scale + oy
      // Light domain warp for more organic, ridge-like terrain.
      const wx = fbm(x + 5.2, y + 1.3)
      const wy = fbm(x + 1.7, y + 9.2)
      const v = fbm(x + 0.6 * wx, y + 0.6 * wy)
      values[j * cols + i] = v
      if (v < min) min = v
      if (v > max) max = v
    }
  }

  const range = max - min || 1
  for (let k = 0; k < values.length; k++) values[k] = (values[k] - min) / range
  return { cols, rows, values }
}

// ---------------------------------------------------------------------------
// Marching squares
// ---------------------------------------------------------------------------

// Cell edges: 0 = top, 1 = right, 2 = bottom, 3 = left.
// Corner bits: tl = 8, tr = 4, br = 2, bl = 1 (set when corner >= threshold).
// Saddles (5, 10) are resolved below using the cell-centre average.
const SEGMENTS: (readonly number[])[] = [
  [], // 0
  [3, 2], // 1
  [2, 1], // 2
  [3, 1], // 3
  [0, 1], // 4
  [], // 5 saddle
  [0, 2], // 6
  [3, 0], // 7
  [3, 0], // 8
  [0, 2], // 9
  [], // 10 saddle
  [0, 1], // 11
  [3, 1], // 12
  [2, 1], // 13
  [3, 2], // 14
  [], // 15
]

/**
 * Edge points are identified by grid edge rather than coordinates so adjacent
 * cells share exact endpoints and stitching is purely topological.
 *   horizontal edge (i,j)-(i+1,j): 2 * (j * cols + i)
 *   vertical edge   (i,j)-(i,j+1): 2 * (j * cols + i) + 1
 */
function edgeId(edge: number, i: number, j: number, cols: number): number {
  switch (edge) {
    case 0:
      return 2 * (j * cols + i)
    case 1:
      return 2 * (j * cols + i + 1) + 1
    case 2:
      return 2 * ((j + 1) * cols + i)
    default:
      return 2 * (j * cols + i) + 1
  }
}

function traceLevel(field: Field, threshold: number, cellSize: number): number[][] {
  const { cols, rows, values } = field
  const adjacency = new Map<number, number[]>()
  const link = (a: number, b: number) => {
    const la = adjacency.get(a)
    if (la) la.push(b)
    else adjacency.set(a, [b])
    const lb = adjacency.get(b)
    if (lb) lb.push(a)
    else adjacency.set(b, [a])
  }

  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const tl = values[j * cols + i]
      const tr = values[j * cols + i + 1]
      const br = values[(j + 1) * cols + i + 1]
      const bl = values[(j + 1) * cols + i]
      const c =
        (tl >= threshold ? 8 : 0) |
        (tr >= threshold ? 4 : 0) |
        (br >= threshold ? 2 : 0) |
        (bl >= threshold ? 1 : 0)
      if (c === 0 || c === 15) continue

      let segs: readonly number[] = SEGMENTS[c]
      if (c === 5 || c === 10) {
        const centreHigh = (tl + tr + br + bl) / 4 >= threshold
        // Isolate the two corners that are NOT connected through the centre.
        const isolateTlBr = (c === 5) === centreHigh
        segs = isolateTlBr ? [3, 0, 2, 1] : [0, 1, 3, 2]
      }
      for (let s = 0; s < segs.length; s += 2) {
        link(edgeId(segs[s], i, j, cols), edgeId(segs[s + 1], i, j, cols))
      }
    }
  }

  const point = (id: number): [number, number] => {
    const vertical = id & 1
    const k = id >> 1
    const i = k % cols
    const j = (k - i) / cols
    const a = values[k]
    const b = vertical ? values[k + cols] : values[k + 1]
    const t = (threshold - a) / (b - a)
    return vertical ? [i * cellSize, (j + t) * cellSize] : [(i + t) * cellSize, j * cellSize]
  }

  // Each edge point has degree <= 2, so the graph is a set of chains and cycles.
  const visited = new Set<number>()
  const lines: number[][] = []
  const walk = (start: number) => {
    const pts: number[] = []
    let prev = -1
    let cur = start
    for (;;) {
      visited.add(cur)
      const [x, y] = point(cur)
      pts.push(x, y)
      const nbrs = adjacency.get(cur)!
      const next = nbrs[0] === prev ? nbrs[1] : nbrs[0]
      if (next === undefined || visited.has(next)) {
        // NaN sentinel marks a closed loop (we walked back around to the start).
        if (next === start && pts.length > 4) pts.push(NaN)
        break
      }
      prev = cur
      cur = next
    }
    lines.push(pts)
  }

  for (const [id, nbrs] of adjacency) if (nbrs.length === 1 && !visited.has(id)) walk(id)
  for (const id of adjacency.keys()) if (!visited.has(id)) walk(id)
  return lines
}

// ---------------------------------------------------------------------------
// SVG path encoding
// ---------------------------------------------------------------------------

/** Formats an integer number of tenths, e.g. 35 -> "3.5", -5 -> "-.5", 30 -> "3". */
function fmt(tenths: number): string {
  const neg = tenths < 0
  const abs = neg ? -tenths : tenths
  const whole = Math.floor(abs / 10)
  const frac = abs % 10
  const s = frac ? `${whole || ''}.${frac}` : `${whole}`
  return neg ? `-${s}` : s
}

/** Appends a number using the shortest valid separator ("1.5-2", "1.5.5", "3 4"). */
function join(out: string, n: string): string {
  if (out === '' || n[0] === '-') return out + n
  if (n[0] === '.') {
    const lastNum = out.slice(Math.max(out.lastIndexOf(' '), out.lastIndexOf('-')) + 1)
    if (lastNum.includes('.')) return out + n
  }
  return `${out} ${n}`
}

/** Ramer–Douglas–Peucker simplification on a flat [x0, y0, x1, y1, ...] array. */
function simplify(pts: number[], n: number, tolerance: number): number[] {
  const count = n / 2
  if (count <= 2) return pts.slice(0, n)
  const keep = new Uint8Array(count)
  keep[0] = keep[count - 1] = 1
  const tol2 = tolerance * tolerance
  const stack = [0, count - 1]
  while (stack.length) {
    const last = stack.pop()!
    const first = stack.pop()!
    const ax = pts[first * 2]
    const ay = pts[first * 2 + 1]
    const dx = pts[last * 2] - ax
    const dy = pts[last * 2 + 1] - ay
    const len2 = dx * dx + dy * dy
    let maxD = 0
    let index = -1
    for (let k = first + 1; k < last; k++) {
      const px = pts[k * 2] - ax
      const py = pts[k * 2 + 1] - ay
      let d2: number
      if (len2 === 0) d2 = px * px + py * py
      else {
        const cross = px * dy - py * dx
        d2 = (cross * cross) / len2
      }
      if (d2 > maxD) {
        maxD = d2
        index = k
      }
    }
    if (index !== -1 && maxD > tol2) {
      keep[index] = 1
      stack.push(first, index, index, last)
    }
  }
  const out: number[] = []
  for (let k = 0; k < count; k++) if (keep[k]) out.push(pts[k * 2], pts[k * 2 + 1])
  return out
}

/** Encodes polylines as relative path data with coordinates rounded to 0.1. */
function encodePath(lines: number[][], minPoints: number, tolerance: number): string {
  let d = ''
  for (const raw of lines) {
    const closed = Number.isNaN(raw[raw.length - 1])
    const rawN = closed ? raw.length - 1 : raw.length
    // Skip tiny closed blips; they read as noise rather than terrain.
    if (rawN < 4 || (closed && rawN / 2 < minPoints)) continue
    const pts = simplify(raw, rawN, tolerance)
    const n = pts.length
    let px = Math.round(pts[0] * 10)
    let py = Math.round(pts[1] * 10)
    let seg = ''
    for (let k = 2; k < n; k += 2) {
      const x = Math.round(pts[k] * 10)
      const y = Math.round(pts[k + 1] * 10)
      if (x === px && y === py) continue
      seg = join(join(seg, fmt(x - px)), fmt(y - py))
      px = x
      py = y
    }
    if (!seg) continue
    const move = join(fmt(Math.round(pts[0] * 10)), fmt(Math.round(pts[1] * 10)))
    d += `M${move}l${seg}${closed ? 'z' : ''}`
  }
  return d
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generateTopo(options: TopoOptions): Topo {
  const opts: Required<TopoOptions> = {
    cellSize: DEFAULT_TOPO.cellSize!,
    scale: DEFAULT_TOPO.scale!,
    octaves: DEFAULT_TOPO.octaves!,
    ...options,
  }
  const field = buildField(opts)
  const contours: Contour[] = []
  for (let level = 1; level <= opts.levels; level++) {
    const threshold = level / (opts.levels + 1)
    const d = encodePath(traceLevel(field, threshold, opts.cellSize), MIN_LOOP_POINTS, SIMPLIFY_TOLERANCE)
    if (d) contours.push({ level, threshold, major: level % MAJOR_EVERY === 0, d })
  }
  return { seed: opts.seed, width: opts.width, height: opts.height, contours }
}

/** Renders a standalone, decorative `<svg>` string (2 paths: minor + major). */
export function renderTopoSvg(topo: Topo): string {
  const minor = topo.contours.filter((c) => !c.major).map((c) => c.d).join('')
  const major = topo.contours.filter((c) => c.major).map((c) => c.d).join('')
  return (
    `<svg class="${TOPO_CLASSES.svg}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${topo.width} ${topo.height}" ` +
    `preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" data-seed="${topo.seed}">` +
    `<path class="${TOPO_CLASSES.minor}" fill="none" stroke="currentColor" vector-effect="non-scaling-stroke" d="${minor}"/>` +
    `<path class="${TOPO_CLASSES.major}" fill="none" stroke="currentColor" vector-effect="non-scaling-stroke" d="${major}"/>` +
    `</svg>`
  )
}

/** Wraps the SVG in a crossfade layer, as used by the pre-render and the client. */
export function renderTopoLayer(topo: Topo, visible: boolean): string {
  const cls = visible ? `${TOPO_CLASSES.layer} ${TOPO_CLASSES.visible}` : TOPO_CLASSES.layer
  return `<div class="${cls}">${renderTopoSvg(topo)}</div>`
}
