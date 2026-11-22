import { paint } from './draw'
import { scanPlatforms, type Platform } from './platforms'
import { GRAB_ROW, SPRITE_H, SPRITE_W } from './sprites'
import { buddy, type Launch } from './store'

/* ------------------------------------------------------------------
   Mini Jazer's brain. Plain DOM + requestAnimationFrame, no React,
   so 60 fps updates never re-render the page.

   Modes (borrowed from desktop mascots like Shimeji):
     off     hidden, waiting in the photo
     air     falling under gravity (thrown, dropped, or the line moved)
     drag    held by the belt, swinging
     ground  standing on a platform and working through a plan of
             steps: walk, climb, hop, act (a short animation), wait

   Position (x, y) is his feet, bottom centre, in page coordinates.
------------------------------------------------------------------- */

export const SCALE = 2
const W = SPRITE_W * SCALE
const H = SPRITE_H * SCALE
/** Half the width of his body (the canvas has empty space for arms). */
const HALF_BODY = 8 * SCALE
const GRAVITY = 2200
/** Keep his feet this far inside a platform's ends. */
const EDGE = 6

/* ------------------------------ Lines ----------------------------- */

const LINES: Record<string, string[]> = {
  click: ['hi, I’m Jazer!', 'hire me?', 'it works on my machine', 'ctrl+s, always', 'need a system built?', 'reading the docs…'],
  carried: ['my pants!!', 'put me down!', 'not the suit!', 'wheee'],
  notice: ['!', 'wait up!', 'coming!'],
  land: ['ow.', 'nailed it', '10/10 landing'],
  dizzy: ['@_@', 'ok, ok…', 'too many clicks'],
  type: ['</>', 'npm run dev', 'shipping…', 'fixing bugs'],
  home: ['home!', 'brb', 'back to the photo'],
}
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

/* ------------------------------ Acts ------------------------------
   A short animation is a list of keys. Each key shows a frame (or
   cycles through several) for d ms, and tweens his offset (x, y),
   rotation (r) and scale (sx, sy) from the previous key's values.
   say: "@list" picks a random line from LINES.
------------------------------------------------------------------- */

interface Key {
  f: string | string[]
  d: number
  x?: number
  y?: number
  r?: number
  sx?: number
  sy?: number
  say?: string
  ease?: 'in' | 'out' | 'linear'
  /** ms per frame when f is a list */
  every?: number
  /** rotate around the middle instead of the feet */
  mid?: boolean
  /** hide whatever is below his feet (for diving back into the photo) */
  clip?: boolean
}

const faint = (say: string): Key[] => [
  { f: 'shock', d: 160, y: -4, say },
  { f: 'blink', d: 260, r: 90, y: 8, mid: true, ease: 'in' },
  { f: 'blink', d: 1000, r: 90, y: 8, mid: true },
  { f: 'blink', d: 220, mid: true },
  { f: 'down', d: 150 },
]

const ACTS: Record<string, Key[]> = {
  spin: [
    ...Array.from({ length: 3 }, (): Key[] => [
      { f: 'down', d: 65 },
      { f: 'right~', d: 65 },
      { f: 'up', d: 65 },
      { f: 'right', d: 65 },
    ]).flat(),
    { f: 'down', d: 140 },
  ],
  jump: [
    { f: 'crouch', d: 90, sx: 1.08, sy: 0.92 },
    { f: 'cheer', d: 200, y: -26, ease: 'out' },
    { f: 'cheer', d: 180, ease: 'in' },
    { f: 'crouch', d: 90, sx: 1.1, sy: 0.9 },
    { f: 'down', d: 120 },
  ],
  backflip: [
    { f: 'crouch', d: 110, sx: 1.1, sy: 0.9 },
    { f: 'fall', d: 230, y: -38, r: -180, mid: true, ease: 'out' },
    { f: 'fall', d: 230, r: -360, mid: true, ease: 'in' },
    { f: 'crouch', d: 100, r: -360, mid: true, sx: 1.1, sy: 0.9 },
    { f: 'cheer', d: 600, r: -360, mid: true, say: 'ta-da!' },
  ],
  dance: [
    ...Array.from({ length: 4 }, (_, i): Key[] => [
      { f: 'stepDown', d: 150, r: -7, y: -3, say: i === 0 ? '♪' : undefined },
      { f: 'stepDown~', d: 150, r: 7 },
    ]).flat(),
    { f: 'cheer', d: 400 },
  ],
  wave: [
    { f: ['wave', 'waveB'], d: 1300, every: 180, say: '@click' },
    { f: 'down', d: 120 },
  ],
  tie: [
    { f: 'tie', d: 380 },
    { f: 'tie', d: 240, y: -1 },
    { f: 'tie', d: 380 },
    { f: 'down', d: 160, sx: 1.05, sy: 1.05, say: '✨ sharp' },
    { f: 'down', d: 500 },
  ],
  type: [
    { f: 'crouch', d: 120 },
    { f: ['type', 'typeB'], d: 2200, every: 120, say: '@type' },
    { f: 'crouch', d: 120 },
    { f: 'down', d: 100 },
  ],
  panic: [
    { f: ['stepRightA', 'stepRightB'], d: 380, x: 16, every: 70, say: '!!' },
    { f: ['stepRightA~', 'stepRightB~'], d: 760, x: -16, every: 70 },
    { f: ['stepRightA', 'stepRightB'], d: 380, every: 70 },
    { f: 'shock', d: 220 },
  ],
  cheer: [{ f: ['cheer', 'down'], d: 1000, every: 160, say: '@click' }],
  faint: faint('@dizzy'),
  look: [
    { f: 'right', d: 700 },
    { f: 'right~', d: 700 },
    { f: 'down', d: 200 },
  ],
  sit: [
    { f: 'crouch', d: 120 },
    { f: 'sit', d: 2600 },
    { f: 'crouch', d: 120 },
  ],
  notice: [
    { f: 'shock', d: 140, y: -8, ease: 'out', say: '@notice' },
    { f: 'shock', d: 160, ease: 'in' },
    { f: 'shock', d: 180 },
  ],
  land: [
    { f: 'crouch', d: 90, sx: 1.12, sy: 0.86 },
    { f: 'down', d: 110 },
  ],
  hardLand: [
    { f: 'crouch', d: 140, sx: 1.2, sy: 0.8, say: '@land' },
    { f: 'blink', d: 320 },
    { f: 'down', d: 100 },
  ],
  home: [
    { f: ['wave', 'waveB'], d: 800, every: 160, say: '@home' },
    { f: 'cheer', d: 160, y: -14, ease: 'out', clip: true },
    { f: 'fall', d: 240, y: H + 6, ease: 'in', clip: true },
  ],
}
/** What a click can trigger. Two are chained per click. */
const TRICKS = ['spin', 'jump', 'backflip', 'dance', 'wave', 'tie', 'type', 'panic', 'cheer']
const IDLE_TRICKS = ['dance', 'tie', 'type', 'wave', 'cheer']

/* ------------------------------ Steps ----------------------------- */

type Step =
  | { k: 'walk'; x: number }
  | { k: 'climb'; to: Platform; x: number }
  | { k: 'hop'; to: Platform; x: number; t: number; x0: number; y0: number; dur: number; arc: number; started: boolean }
  | { k: 'act'; name: string; t: number; key: number }
  | { k: 'wait'; ms: number; t: number }
  | { k: 'vanish' }

const walk = (x: number): Step => ({ k: 'walk', x })
const act = (name: string): Step => ({ k: 'act', name, t: 0, key: -1 })
const wait = (ms: number): Step => ({ k: 'wait', ms, t: 0 })

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const rand = (a: number, b: number) => a + Math.random() * (b - a)
/** Horizontal distance from x to a platform (0 when x is above it). */
const gap = (p: Platform, x: number) => (x < p.x1 ? p.x1 - x : x > p.x2 ? x - p.x2 : 0)

interface Pose {
  x: number
  y: number
  r: number
  sx: number
  sy: number
  mid: boolean
  clip: boolean
}
const NEUTRAL: Pose = { x: 0, y: 0, r: 0, sx: 1, sy: 1, mid: false, clip: false }

export class BuddyEngine {
  private layer = document.createElement('div')
  private el = document.createElement('div')
  private inner = document.createElement('div')
  private canvas = document.createElement('canvas')
  private ctx = this.canvas.getContext('2d')!
  private bubble = document.createElement('div')
  private bubbleUntil = 0

  private x = 0
  private y = 0
  private vx = 0
  private vy = 0
  private rot = 0
  private spin = 0
  private mode: 'off' | 'ground' | 'air' | 'drag' = 'off'
  private plat: Platform | null = null
  private plats: Platform[] = []
  private plan: Step[] = []
  private pose: Pose = { ...NEUTRAL }
  private frame = 'down'
  private drawn = ''
  /** Speed multiplier: rises when he has a long way to go. */
  private mult = 1
  private noticed = false
  private goingHome = false
  private clicks: number[] = []
  private now = 0
  private raf = 0
  private last = 0
  private lastScan = 0
  private dirty = true
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  private drag: {
    id: number
    sx: number
    sy: number
    cx: number
    cy: number
    moved: boolean
    samples: { t: number; x: number; y: number }[]
    a: number
    w: number
  } | null = null
  private observer: MutationObserver

  constructor() {
    this.layer.dataset.buddyIgnore = ''
    this.layer.className = 'buddy-layer'
    this.el.className = 'buddy'
    this.el.style.width = `${W}px`
    this.el.style.height = `${H}px`
    this.inner.className = 'buddy-inner'
    this.canvas.width = SPRITE_W
    this.canvas.height = SPRITE_H
    this.canvas.className = 'buddy-sprite'
    this.canvas.setAttribute('role', 'img')
    this.canvas.setAttribute('aria-label', 'Mini Jazer. Click for tricks, drag to carry him.')
    this.bubble.className = 'buddy-bubble'
    this.inner.append(this.canvas)
    this.el.append(this.inner, this.bubble)
    this.layer.append(this.el)
    document.body.append(this.layer)

    this.canvas.addEventListener('pointerdown', this.onDown)
    this.canvas.addEventListener('pointermove', this.onMove)
    this.canvas.addEventListener('pointerup', this.onUp)
    this.canvas.addEventListener('pointercancel', this.onUp)
    window.addEventListener('resize', this.markDirty)
    document.fonts?.ready.then(this.markDirty)
    this.observer = new MutationObserver(this.markDirty)
    const root = document.getElementById('root')
    if (root) this.observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true })
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.observer.disconnect()
    window.removeEventListener('resize', this.markDirty)
    this.layer.remove()
    buddy.setOut(false)
  }

  /* ---------------------------- Public ---------------------------- */

  launch(l: Launch) {
    this.x = l.x
    this.y = l.y
    this.vx = l.vx
    this.vy = l.vy
    this.spin = Math.sign(l.vx || 1) * 720
    this.rot = 0
    this.plan = []
    this.plat = null
    this.goingHome = false
    this.noticed = true
    this.mode = 'air'
    this.layer.classList.add('is-out')
    this.scan()
    this.say('wheee!')
    buddy.setOut(true)
    this.last = performance.now()
    cancelAnimationFrame(this.raf)
    this.raf = requestAnimationFrame(this.loop)
  }

  callHome() {
    if (this.mode === 'off') return
    // Out of sight (say, at the bottom of a long phone page): a climb nobody can
    // see just looks like the photo ignoring the tap, so he pops straight home.
    const top = window.scrollY
    const bottom = top + window.innerHeight
    if (this.mode !== 'drag' && (this.y < top || this.y - H > bottom)) return this.vanish()
    this.goingHome = true
    this.say('coming!')
    if (this.mode === 'ground') {
      const s = this.plan[0]
      this.plan = s && (s.k === 'climb' || s.k === 'hop') ? [s] : []
      this.pose = { ...NEUTRAL }
    }
  }

  /** Back inside the photo; the loop stops on its next frame. */
  private vanish() {
    this.mode = 'off'
    this.goingHome = false
    this.plan = []
    this.pose = { ...NEUTRAL }
    this.layer.classList.remove('is-out')
    buddy.setOut(false)
  }

  /* ----------------------------- Loop ----------------------------- */

  private loop = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    this.now = now
    if ((this.dirty && now - this.lastScan > 100) || now - this.lastScan > 900) this.scan()

    if (this.mode === 'air') this.updateAir(dt)
    else if (this.mode === 'drag') this.updateDrag(dt)
    else if (this.mode === 'ground') this.updateGround(dt)

    if (this.mode === 'off') return
    this.render()
    this.raf = requestAnimationFrame(this.loop)
  }

  private markDirty = () => {
    this.dirty = true
  }

  /** Re-read the page's lines and keep him on his line if it moved. */
  private scan() {
    this.dirty = false
    this.lastScan = this.now || performance.now()
    this.plats = scanPlatforms()
    const byKey = new Map(this.plats.map((p) => [p.key, p]))

    // Steps that target a platform follow it; if it is gone, drop the plan.
    for (const s of this.plan) {
      if (s.k === 'climb' || s.k === 'hop') {
        const next = byKey.get(s.to.key)
        if (!next) {
          this.plan = []
          if (!this.plat && this.mode === 'ground') this.fall()
          break
        }
        s.x = clamp(s.x + (next.x1 - s.to.x1), next.x1 + EDGE, next.x2 - EDGE)
        s.to = next
      }
    }

    if (this.mode !== 'ground' || !this.plat) return
    const same = byKey.get(this.plat.key)
    if (same) {
      this.x = clamp(this.x + (same.x1 - this.plat.x1), same.x1 + EDGE, same.x2 - EDGE)
      this.y = same.y
      this.plat = same
      return
    }
    const under = this.plats.find((p) => Math.abs(p.y - this.y) <= 6 && this.x >= p.x1 - 2 && this.x <= p.x2 + 2)
    if (under) {
      this.plat = under
      this.y = under.y
    } else this.fall()
  }

  /* ----------------------------- Air ------------------------------ */

  private fall() {
    this.mode = 'air'
    this.plat = null
    this.plan = []
    this.vx = 0
    this.vy = 0
    this.spin = 0
    this.pose = { ...NEUTRAL }
  }

  private updateAir(dt: number) {
    const docW = document.documentElement.clientWidth
    this.vy = Math.min(this.vy + GRAVITY * dt, 2600)
    const prevY = this.y
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.vx *= Math.pow(0.55, dt)
    if (this.x < HALF_BODY) {
      this.x = HALF_BODY
      this.vx = Math.abs(this.vx) * 0.45
    } else if (this.x > docW - HALF_BODY) {
      this.x = docW - HALF_BODY
      this.vx = -Math.abs(this.vx) * 0.45
    }
    this.rot = this.spin ? this.rot + this.spin * dt : this.rot * Math.pow(0.02, dt)
    this.frame = 'fall'

    if (this.vy > 0) {
      let land: Platform | null = null
      for (const p of this.plats) {
        if (p.y >= prevY - 0.5 && p.y <= this.y && this.x >= p.x1 - 2 && this.x <= p.x2 + 2 && (!land || p.y < land.y)) land = p
      }
      if (land) this.touchDown(land, this.vy)
    }
  }

  private touchDown(p: Platform, impact: number) {
    this.mode = 'ground'
    this.plat = p
    this.y = p.y
    this.x = clamp(this.x, p.x1 + EDGE, Math.max(p.x1 + EDGE, p.x2 - EDGE))
    this.vx = this.vy = this.rot = this.spin = 0
    this.plan = impact > 1500 ? [act('hardLand')] : impact > 500 ? [act('land')] : []
  }

  /* ----------------------------- Drag ----------------------------- */

  private onDown = (e: PointerEvent) => {
    if (this.mode === 'off' || e.button > 0) return
    e.preventDefault()
    this.canvas.setPointerCapture(e.pointerId)
    this.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, cx: e.clientX, cy: e.clientY, moved: false, samples: [], a: 0, w: 0 }
  }

  private onMove = (e: PointerEvent) => {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    d.cx = e.clientX
    d.cy = e.clientY
    const t = performance.now()
    d.samples.push({ t, x: e.clientX + window.scrollX, y: e.clientY + window.scrollY })
    d.samples = d.samples.filter((s) => t - s.t < 120)
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) {
      d.moved = true
      this.mode = 'drag'
      this.plat = null
      this.plan = []
      this.goingHome = false
      this.pose = { ...NEUTRAL }
      this.canvas.classList.add('is-grabbing')
      this.say(pick(LINES.carried))
    }
  }

  private onUp = (e: PointerEvent) => {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    this.drag = null
    this.canvas.classList.remove('is-grabbing')
    if (!d.moved) return this.click()
    // Let go: keep the hand's speed so he can be tossed.
    const [v1, v2] = this.handVelocity(d.samples, 90)
    this.mode = 'air'
    this.vx = clamp(v1, -1800, 1800)
    this.vy = clamp(v2, -1800, 1800)
    this.rot = d.a
    this.spin = Math.hypot(this.vx, this.vy) > 900 ? clamp(this.vx * 0.8, -900, 900) : 0
  }

  private handVelocity(samples: { t: number; x: number; y: number }[], within: number) {
    const t = performance.now()
    const recent = samples.filter((s) => t - s.t < within)
    if (recent.length < 2) return [0, 0]
    const a = recent[0]
    const b = recent[recent.length - 1]
    const dt = Math.max((b.t - a.t) / 1000, 0.016)
    return [(b.x - a.x) / dt, (b.y - a.y) / dt]
  }

  private updateDrag(dt: number) {
    const d = this.drag
    if (!d) return this.fall()
    // The hand holds his belt; his feet hang below it.
    this.x = d.cx + window.scrollX
    this.y = d.cy + window.scrollY + (SPRITE_H - GRAB_ROW - 0.5) * SCALE
    // He swings like a pendulum, lagging behind the hand.
    const [hv] = this.handVelocity(d.samples, 100)
    const target = clamp(hv * 0.03, -55, 55)
    d.w += (120 * (target - d.a) - 9 * d.w) * dt
    d.a += d.w * dt
    this.frame = this.cycle(['carried', 'carried~'], 150)
  }

  /* ---------------------------- Clicks ---------------------------- */

  private click() {
    const now = performance.now()
    this.clicks = this.clicks.filter((t) => now - t < 2500)
    this.clicks.push(now)
    if (this.mode === 'air') return this.say('wheee!')
    if (this.mode !== 'ground') return

    let acts: Step[]
    if (this.clicks.length >= 5) {
      this.clicks = []
      acts = [act('faint')]
    } else {
      const first = pick(TRICKS)
      const second = pick(TRICKS.filter((t) => t !== first))
      acts = [act(first), act(second)]
    }
    const s = this.plan[0]
    if (s && (s.k === 'climb' || s.k === 'hop')) this.plan.splice(1, 0, ...acts)
    else {
      this.plan = acts
      this.pose = { ...NEUTRAL }
    }
    if (!this.bubbleVisible()) this.say(pick(LINES.click))
  }

  /* ---------------------------- Ground ---------------------------- */

  private updateGround(dt: number) {
    if (!this.plan.length) this.decide()
    const s = this.plan[0]
    if (!s) return
    const face = (dir: number) => (dir < 0 ? '~' : '')

    switch (s.k) {
      case 'walk': {
        if (!this.plat) return this.fall()
        s.x = clamp(s.x, this.plat.x1 + EDGE, Math.max(this.plat.x1 + EDGE, this.plat.x2 - EDGE))
        const sp = Math.min(55 * this.mult, 600)
        const d = s.x - this.x
        if (Math.abs(d) <= sp * dt) {
          this.x = s.x
          this.plan.shift()
        } else this.x += Math.sign(d) * sp * dt
        this.frame = this.cycle(['stepRightA', 'stepRightB'], 150 / Math.min(this.mult, 3)) + face(d)
        break
      }
      case 'climb': {
        this.plat = null
        this.x = s.x
        const sp = Math.min(50 * this.mult, 600)
        const d = s.to.y - this.y
        if (Math.abs(d) <= sp * dt) {
          this.y = s.to.y
          this.plat = s.to
          this.plan.shift()
        } else this.y += Math.sign(d) * sp * dt
        this.frame = this.cycle(['climb', 'climb~'], 170 / Math.min(this.mult, 3))
        break
      }
      case 'hop': {
        if (!s.started) {
          s.started = true
          s.x0 = this.x
          s.y0 = this.y
          const dx = Math.abs(s.x - this.x)
          const dy = s.to.y - this.y
          s.dur = clamp(0.26 + dx / 700 + Math.abs(dy) / 1100, 0.26, 0.9) / Math.sqrt(Math.min(this.mult, 4))
          s.arc = dy < 0 ? -dy + 16 : 14
          this.plat = null
        }
        s.t = Math.min(s.t + dt / s.dur, 1)
        this.x = lerp(s.x0, s.x, s.t)
        this.y = lerp(s.y0, s.to.y, s.t) - s.arc * 4 * s.t * (1 - s.t)
        const dx = s.x - s.x0
        this.frame = Math.abs(s.to.y - s.y0) > 20 ? 'fall' : 'stepRightA' + face(dx)
        if (s.t >= 1) {
          this.y = s.to.y
          this.plat = s.to
          this.plan.shift()
          if (Math.abs(s.to.y - s.y0) > 20) this.plan.unshift(act('land'))
        }
        break
      }
      case 'act': {
        s.t += dt * 1000
        const keys = ACTS[s.name] ?? []
        let start = 0
        let from: Pose = { ...NEUTRAL }
        let i = 0
        for (; i < keys.length; i++) {
          const k = keys[i]
          const to: Pose = { x: k.x ?? 0, y: k.y ?? 0, r: k.r ?? 0, sx: k.sx ?? 1, sy: k.sy ?? 1, mid: !!k.mid, clip: !!k.clip }
          if (s.t < start + k.d) {
            if (i !== s.key) {
              s.key = i
              if (k.say) this.say(k.say.startsWith('@') ? pick(LINES[k.say.slice(1)]) : k.say)
            }
            const p = (s.t - start) / k.d
            const e = k.ease === 'in' ? p * p : k.ease === 'out' ? 1 - (1 - p) * (1 - p) : k.ease === 'linear' ? p : p * p * (3 - 2 * p)
            this.pose = {
              x: lerp(from.x, to.x, e),
              y: lerp(from.y, to.y, e),
              r: lerp(from.r, to.r, e),
              sx: lerp(from.sx, to.sx, e),
              sy: lerp(from.sy, to.sy, e),
              mid: to.mid,
              clip: to.clip,
            }
            this.frame = Array.isArray(k.f) ? k.f[Math.floor((s.t - start) / (k.every ?? 140)) % k.f.length] : k.f
            break
          }
          start += k.d
          from = to
        }
        if (i >= keys.length) {
          this.pose = { ...NEUTRAL }
          this.plan.shift()
        }
        break
      }
      case 'wait': {
        s.t += dt * 1000
        // Blink now and then.
        this.frame = (this.now + this.x * 37) % 3600 < 130 ? 'blink' : 'down'
        if (s.t >= s.ms) this.plan.shift()
        break
      }
      case 'vanish':
        this.vanish()
        break
    }
  }

  /** The visible part of the page he should stay in (feet positions). */
  private band() {
    const top = window.scrollY + 64 + H
    const bottom = Math.max(top + 40, window.scrollY + window.innerHeight - 12)
    return { top, bottom }
  }

  private decide() {
    this.mult = 1
    if (!this.plat) return this.fall()
    if (this.goingHome) return this.planHome()
    const band = this.band()
    if (this.y < band.top - 8 || this.y > band.bottom + 8) return this.planFollow(band)
    this.noticed = false
    this.planWander(band)
  }

  /** He is off screen: work back towards the visitor, line by line. */
  private planFollow(band: { top: number; bottom: number }) {
    const dir = this.y < band.top ? 1 : -1
    const dist = dir > 0 ? band.top - this.y : this.y - band.bottom
    if (!this.noticed && dist > 150) {
      this.noticed = true
      this.plan.push(act('notice'))
      return
    }
    this.noticed = true
    this.mult = clamp(1 + dist / 350, 1, 7)
    const span = band.bottom - band.top
    const goal = dir > 0 ? band.top + span * 0.35 : band.bottom - span * 0.35
    const p = this.choose(dir, goal)
    if (p) this.moveTo(p)
    else this.plan.push(wait(400))
  }

  private planWander(band: { top: number; bottom: number }) {
    const p = this.plat!
    if (p.key === 'floor') {
      const up = this.choose(-1, band.bottom - 120)
      if (up) return this.moveTo(up)
    }
    if (this.reduced) {
      this.plan.push(Math.random() < 0.75 ? wait(rand(2500, 5000)) : act('look'))
      return
    }
    const r = Math.random()
    const width = p.x2 - p.x1 - EDGE * 2
    if (r < 0.32 && width > 60) {
      let tx = rand(p.x1 + EDGE, p.x2 - EDGE)
      if (Math.abs(tx - this.x) < 30) tx = this.x > (p.x1 + p.x2) / 2 ? p.x1 + EDGE : p.x2 - EDGE
      this.plan.push(walk(tx))
    } else if (r < 0.52) this.plan.push(wait(rand(1200, 3200)))
    else if (r < 0.61) this.plan.push(act('look'))
    else if (r < 0.69) this.plan.push(act('sit'))
    else if (r < 0.9) {
      const dir = Math.random() < 0.5 ? -1 : 1
      const near = this.plats
        .filter((q) => q !== p && q.key !== 'floor')
        .filter((q) => {
          const dy = (q.y - this.y) * dir
          return dy > 20 && dy < 140 && q.y > band.top && q.y < band.bottom && gap(q, this.x) < 260
        })
        .sort((a, b) => Math.abs(a.y - this.y) + gap(a, this.x) - (Math.abs(b.y - this.y) + gap(b, this.x)))
        .slice(0, 3)
      if (near.length) this.moveTo(pick(near))
      else this.plan.push(wait(rand(800, 1600)))
    } else this.plan.push(act(pick(IDLE_TRICKS)))
  }

  /** Walk back to the photo, wave, and drop back into it. */
  private planHome() {
    const home = this.plats.find((p) => p.key === 'perch:portrait')
    if (!home) {
      this.goingHome = false
      return this.plan.push(wait(300))
    }
    const mid = (home.x1 + home.x2) / 2
    if (this.plat === home) {
      if (Math.abs(this.x - mid) > 2) this.plan.push(walk(mid))
      this.plan.push(act('home'), { k: 'vanish' })
      return
    }
    const dy = home.y - this.y
    this.mult = clamp(1 + Math.abs(dy) / 300, 1, 7)
    if (Math.abs(dy) <= 140) return this.moveTo(home)
    const p = this.choose(Math.sign(dy), home.y, mid)
    if (p) this.moveTo(p)
    else this.moveTo(home)
  }

  /**
   * The best next platform in a direction (1 = down, -1 = up): big steps
   * when he is in a hurry, small ones otherwise, without overshooting goal.
   */
  private choose(dir: number, goal: number, preferX?: number): Platform | null {
    const maxStep = this.mult > 2.5 ? 320 : this.mult > 1.5 ? 160 : 70
    let best: Platform | null = null
    let bestScore = Infinity
    let nearest: Platform | null = null
    let nearestScore = Infinity
    for (const p of this.plats) {
      if (p === this.plat) continue
      const dy = (p.y - this.y) * dir
      if (dy < 6) continue
      const g = gap(p, this.x)
      const toward = preferX === undefined ? 0 : Math.abs(clamp(preferX, p.x1, p.x2) - preferX) * 0.5
      const fallback = dy + g * 1.6 + toward
      if (fallback < nearestScore) {
        nearestScore = fallback
        nearest = p
      }
      if (dy > maxStep) continue
      const overshoot = Math.max(0, (p.y - goal) * dir)
      const score = g * 1.6 - dy + overshoot * 2 + toward
      if (score < bestScore) {
        bestScore = score
        best = p
      }
    }
    return best ?? nearest
  }

  /** Queue the steps that get him from his platform onto p. */
  private moveTo(p: Platform) {
    const c = this.plat!
    const lo = Math.max(c.x1, p.x1) + EDGE
    const hi = Math.min(c.x2, p.x2) - EDGE
    const dy = p.y - this.y
    const hop = (x: number): Step => ({ k: 'hop', to: p, x, t: 0, x0: 0, y0: 0, dur: 0.3, arc: 0, started: false })
    if (lo <= hi) {
      const tx = clamp(this.x, lo, hi)
      if (Math.abs(tx - this.x) > 1) this.plan.push(walk(tx))
      if (Math.abs(dy) <= 34 || (dy > 0 && this.mult >= 3)) this.plan.push(hop(tx))
      else this.plan.push({ k: 'climb', to: p, x: tx })
    } else {
      // No overlap: go to the nearer end and jump across.
      const edge = p.x1 > c.x2 ? c.x2 - EDGE : c.x1 + EDGE
      if (Math.abs(edge - this.x) > 1) this.plan.push(walk(edge))
      this.plan.push(hop(clamp(edge, p.x1 + EDGE, p.x2 - EDGE)))
    }
  }

  /* ---------------------------- Drawing --------------------------- */

  private cycle(frames: string[], every: number) {
    return frames[Math.floor(this.now / every) % frames.length]
  }

  private bubbleVisible() {
    return this.now < this.bubbleUntil
  }

  private say(text: string, ms = 1900) {
    this.bubble.textContent = text
    this.bubble.classList.add('is-on')
    this.bubbleUntil = (this.now || performance.now()) + ms
  }

  private render() {
    const docW = document.documentElement.clientWidth
    const left = Math.round(this.x - W / 2)
    const top = Math.round(this.y - H)
    this.el.style.transform = `translate3d(${left}px, ${top}px, 0)`

    let r = this.pose.r
    let origin = this.pose.mid ? '50% 50%' : '50% 100%'
    if (this.mode === 'drag' && this.drag) {
      r = this.drag.a
      origin = `50% ${GRAB_ROW * SCALE + SCALE / 2}px`
    } else if (this.mode === 'air') {
      r = this.rot
      origin = '50% 50%'
    }
    this.inner.style.transformOrigin = origin
    this.inner.style.transform = `translate(${this.pose.x}px, ${this.pose.y}px) rotate(${r}deg) scale(${this.pose.sx}, ${this.pose.sy})`
    this.el.style.clipPath = this.pose.clip ? 'inset(-200px -200px 0 -200px)' : ''

    if (this.frame !== this.drawn) {
      paint(this.ctx, this.frame)
      this.drawn = this.frame
    }

    // Speech bubble: keep it on screen.
    if (this.bubbleVisible()) {
      const bw = this.bubble.offsetWidth
      const centre = left + W / 2
      const shift = clamp(centre - bw / 2, 8, docW - 8 - bw) - (centre - bw / 2)
      this.bubble.style.setProperty('--shift', `${Math.round(shift)}px`)
    } else if (this.bubble.classList.contains('is-on')) this.bubble.classList.remove('is-on')
  }
}
