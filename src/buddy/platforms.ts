/* ------------------------------------------------------------------
   Platforms: every visible line of text on the page, plus the top
   edge of anything marked data-buddy-perch, plus the page floor.
   All values are page coordinates (they don't change on scroll).
------------------------------------------------------------------- */

export interface Platform {
  /** Stays the same for the same line between scans, so he can ride a line when the layout shifts. */
  key: string
  x1: number
  x2: number
  /** Where his feet go: roughly the cap height of the text. */
  y: number
}

const SKIP = '[aria-hidden="true"],[inert],[data-buddy-ignore],script,style,noscript,title'

const ids = new WeakMap<Node, number>()
let nextId = 1
const idOf = (n: Node) => {
  let id = ids.get(n)
  if (!id) ids.set(n, (id = nextId++))
  return id
}

export function scanPlatforms(): Platform[] {
  const sx = window.scrollX
  const sy = window.scrollY
  const raw: Platform[] = []

  // 1. Text lines. One rect per line of each text node.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue?.trim()) return NodeFilter.FILTER_REJECT
      const el = n.parentElement
      if (!el || el.closest(SKIP)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const range = document.createRange()
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    // Text inside an animating panel only counts where the panel shows it.
    const clip = n.parentElement!.closest('[data-buddy-clip]')?.getBoundingClientRect()
    range.selectNodeContents(n)
    let line = 0
    for (const r of range.getClientRects()) {
      if (r.width < 3 || r.height < 3) continue
      if (clip && (r.top < clip.top - 1 || r.bottom > clip.bottom + 1)) continue
      raw.push({ key: `t${idOf(n)}:${line++}`, x1: r.left + sx, x2: r.right + sx, y: r.top + sy + r.height * 0.2 })
    }
  }

  // 2. Merge pieces that sit on the same line (a link inside a sentence, etc.).
  raw.sort((a, b) => a.y - b.y || a.x1 - b.x1)
  const lines: Platform[] = []
  for (const r of raw) {
    let merged = false
    for (let i = lines.length - 1; i >= 0 && lines[i].y > r.y - 5; i--) {
      const p = lines[i]
      if (Math.abs(p.y - r.y) < 5 && r.x1 - p.x2 < 14 && r.x2 > p.x1 - 14) {
        p.x1 = Math.min(p.x1, r.x1)
        p.x2 = Math.max(p.x2, r.x2)
        merged = true
        break
      }
    }
    if (!merged) lines.push({ ...r })
  }

  // 3. Perches: the photo frame, project thumbnails.
  document.querySelectorAll<HTMLElement>('[data-buddy-perch]').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width < 20 || r.height < 4) return
    lines.push({ key: `perch:${el.dataset.buddyPerch}`, x1: r.left + sx + 4, x2: r.right + sx - 4, y: r.top + sy })
  })

  // 4. The floor, so he can never fall out of the page.
  const doc = document.documentElement
  lines.push({ key: 'floor', x1: 0, x2: doc.clientWidth, y: doc.scrollHeight - 2 })

  return lines.filter((p) => p.x2 - p.x1 >= 12)
}
