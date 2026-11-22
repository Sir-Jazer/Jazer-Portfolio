import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import type { ProjectId } from '../data/content'
import { cn, EASE } from '../lib/cn'

/* ------------------------------------------------------------------
   Small illustrations that stand in for real screenshots.
   Each scene is drawn on a fixed 480 x 300 canvas, sized in em, then
   scaled down to fit its box. It replays its entrance when it mounts.
------------------------------------------------------------------- */

const W = 480
const H = 300

/**
 * A project thumbnail. `replay` changes on hover, which remounts the scene
 * so its little animation plays again.
 * To use a real screenshot instead, pass `src`. To show a logo, pass `logo`.
 */
export function Thumb({
  id,
  replay,
  src,
  logo,
  logoDark,
}: {
  id: ProjectId
  replay: number
  src?: string
  logo?: string
  logoDark?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={box}
      aria-hidden="true"
      data-buddy-perch={`thumb-${id}`}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line bg-raise"
    >
      {src ? (
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : logo ? (
        <div className="absolute inset-0 [background:radial-gradient(var(--line)_1px,transparent_1.2px)_0_0/18px_18px]">
          {/* Absolute box + object-contain: any logo shape is centered and never cropped. */}
          {/* With a dark-theme version, both render and CSS shows the one that fits the theme. */}
          {(logoDark ? [[logo, 'logo-light'], [logoDark, 'logo-dark']] : [[logo, '']]).map(([file, theme]) => (
            <motion.img
              key={`${replay}-${file}`}
              src={file}
              alt=""
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              className={cn(
                'absolute inset-[10%] size-[80%] object-contain object-center drop-shadow-[0_6px_10px_var(--shade)]',
                theme,
              )}
            />
          ))}
        </div>
      ) : (
        <div
          className="absolute top-0 left-0 grid origin-top-left place-items-center text-[8.5px] leading-normal [background:radial-gradient(var(--line)_1px,transparent_1.2px)_0_0/18px_18px]"
          style={{ width: W, height: H, transform: `scale(${scale})` }}
        >
          <Scene key={replay} id={id} />
        </div>
      )}
    </div>
  )
}

function Scene({ id }: { id: ProjectId }) {
  if (id === 'epermit') return <PermitScene />
  if (id === 'church') return <LedgerScene />
  if (id === 'tubig') return <MapScene />
  return <CheckInScene />
}

/* ------------------------------ Parts ------------------------------ */

function Phone({ children, flush }: { children: ReactNode; flush?: boolean }) {
  return (
    <div
      className={cn(
        'flex aspect-[9/17] w-[16em] flex-col overflow-hidden rounded-[2.2em] border border-line bg-bg [box-shadow:0_0_0_.45em_var(--raise),0_0_0_calc(.45em_+_1px)_var(--line),0_2.4em_3.6em_-2em_var(--shade)]',
        flush ? 'gap-[.55em] p-[.55em]' : 'gap-[.95em] px-[1.2em] pt-[1.5em] pb-[1.2em]',
      )}
    >
      {children}
    </div>
  )
}

function Pill({ children, ok }: { children: ReactNode; ok?: boolean }) {
  return (
    <span
      className={cn(
        'rounded-full border px-[.75em] py-[.3em] font-mono text-[.72em] font-medium whitespace-nowrap',
        ok ? 'border-ok text-ok' : 'border-line text-soft',
      )}
    >
      {children}
    </span>
  )
}

/** Skeleton line standing in for text. */
function Sk({ w }: { w?: string }) {
  return <span style={{ width: w }} className="block h-[.6em] rounded-full bg-line" />
}

function Float({ children, className, delay, tick }: { children: ReactNode; className: string; delay: number; tick?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={cn(
        'absolute flex items-center gap-[.6em] rounded-[.85em] border border-line bg-raise px-[.95em] py-[.7em] text-[1.05em] font-medium whitespace-nowrap [box-shadow:0_1.4em_2.4em_-1.2em_var(--shade)]',
        className,
      )}
    >
      {tick && (
        <span className="grid size-[1.3em] flex-none place-items-center rounded-full bg-ok text-raise">
          <Check size="0.85em" strokeWidth={3.5} />
        </span>
      )}
      {children}
    </motion.div>
  )
}

/** A QR-looking code: real finder squares, seeded noise for the rest. */
function Qr() {
  const cells = useMemo(() => {
    const n = 21
    let seed = 20261
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const finder = (x: number, y: number) => {
      for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
        const dx = x - fx
        const dy = y - fy
        if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
          if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return 0
          const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6
          const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
          return ring || core ? 1 : 0
        }
      }
      return -1
    }
    const out: [number, number][] = []
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const f = finder(x, y)
        if (f === -1 ? rnd() > 0.52 : f === 1) out.push([x, y])
      }
    return out
  }, [])
  return (
    <svg viewBox="0 0 21 21" className="block h-auto w-full" aria-hidden="true">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.03" height="1.03" fill="currentColor" />
      ))}
    </svg>
  )
}

/* ------------------------------ Scenes ----------------------------- */

/** E-Permit: cashier clears the balance, the QR appears, the proctor scans it. */
function PermitScene() {
  return (
    <>
      <Phone>
        <div className="flex items-center justify-between gap-[.6em]">
          <b className="font-semibold">Exam permit</b>
          <Pill ok>Cleared</Pill>
        </div>
        <div className="relative overflow-hidden rounded-[1em] border border-line bg-raise p-[1em] text-ink">
          <Qr />
          <motion.i
            className="absolute inset-x-0 h-0.5 bg-accent [box-shadow:0_0_14px_2px_var(--accent)]"
            initial={{ top: '6%', opacity: 0 }}
            animate={{ top: '94%', opacity: [0, 1, 1, 0] }}
            transition={{
              top: { duration: 1.4, delay: 0.3, ease: 'easeInOut' },
              opacity: { duration: 1.4, delay: 0.3, times: [0, 0.12, 0.88, 1] },
            }}
          />
        </div>
        <Sk w="62%" />
        <Sk w="38%" />
      </Phone>
      <Float className="top-[22%] left-[6%]" delay={0.1} tick>
        Balance cleared
      </Float>
      <Float className="right-[6%] bottom-[20%]" delay={1.3} tick>
        Permit valid
      </Float>
    </>
  )
}

/** Church system: every branch's totals in one view. */
function LedgerScene() {
  return (
    <>
      <div className="flex aspect-[16/10.5] w-[34em] flex-col overflow-hidden rounded-[1em] border border-line bg-bg [box-shadow:0_2.4em_3.6em_-2em_var(--shade)]">
        <div className="flex items-center gap-[.4em] border-b border-line px-[.9em] py-[.75em]">
          {[0, 1, 2].map((i) => (
            <i key={i} className="size-[.55em] rounded-full bg-line" />
          ))}
          <span className="ml-[.8em] h-[.9em] flex-1 rounded-full border border-line bg-raise" />
        </div>
        <div className="grid flex-1 content-start gap-[1.2em] px-[1.4em] py-[1.3em]">
          <div className="flex items-center justify-between gap-[.6em]">
            <b className="font-semibold">All branches</b>
            <Pill>This month</Pill>
          </div>
          <div className="grid gap-[.95em]">
            {[88, 61, 74, 43, 56].map((v, i) => (
              <div key={i} className="grid grid-cols-[4.2em_1fr] items-center gap-[1em]">
                <Sk />
                <span className="block h-[.95em] overflow-hidden rounded-full border border-line bg-raise">
                  <motion.i
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: EASE }}
                    style={{ width: `${v}%` }}
                    className={cn('block h-full origin-left rounded-full', i === 0 ? 'bg-accent' : 'bg-mute/45')}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Float className="bottom-[9%] left-[9%]" delay={0.8} tick>
        Branch entry saved
      </Float>
    </>
  )
}

/** Gymspot: an active membership, this week's check-ins, today's lands last. */
function CheckInScene() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const done = [true, true, false, true, true, false, true]
  const today = days.length - 1
  return (
    <>
      <Phone>
        <div className="flex items-center justify-between gap-[.6em]">
          <b className="font-semibold">Membership</b>
          <Pill ok>Active</Pill>
        </div>
        <div className="grid gap-[.45em] rounded-[1em] border border-line bg-raise p-[1em]">
          <span className="font-mono text-[.72em] text-soft">MONTHLY PLAN</span>
          <b className="text-[1.9em] leading-none font-semibold tracking-[-.02em]">₱500</b>
          <span className="mt-[.35em] block h-[.6em] overflow-hidden rounded-full border border-line bg-bg">
            <motion.i
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              style={{ width: '64%' }}
              className="block h-full origin-left rounded-full bg-accent"
            />
          </span>
          <span className="font-mono text-[.68em] text-soft">11 days left</span>
        </div>
        <div className="grid grid-cols-7 gap-[.35em]">
          {days.map((d, i) => (
            <div key={i} className="grid justify-items-center gap-[.3em]">
              <span className="font-mono text-[.62em] text-soft">{d}</span>
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: i === today ? 1.2 : 0.3 + i * 0.07, ease: EASE }}
                className={cn(
                  'grid aspect-square w-full place-items-center rounded-[.45em] border',
                  i === today
                    ? 'border-accent bg-accent text-raise'
                    : done[i]
                      ? 'border-line bg-raise text-ink'
                      : 'border-dashed border-line',
                )}
              >
                {done[i] && <Check size="0.8em" strokeWidth={3.5} />}
              </motion.span>
            </div>
          ))}
        </div>
        <Sk w="54%" />
        <span className="mt-auto rounded-full bg-ink p-[.7em] text-center text-[.86em] font-semibold text-bg">
          Check in
        </span>
      </Phone>
      <Float className="top-[18%] left-[5%]" delay={0.1} tick>
        Payment recorded
      </Float>
      <Float className="right-[5%] bottom-[18%]" delay={1.3} tick>
        Checked in today
      </Float>
    </>
  )
}

/** Tubig-Go: stations on a map, one tap to order. */
function MapScene() {
  const pins = [
    { left: '20%', top: '30%', delay: 0.1 },
    { left: '66%', top: '47%', delay: 0.25, near: true },
    { left: '44%', top: '16%', delay: 0.4 },
    { left: '80%', top: '82%', delay: 0.55 },
  ]
  return (
    <>
      <Phone flush>
        <div className="map-art relative flex-1 rounded-t-[1.7em] rounded-b-[1em] border border-line">
          {pins.map((p) => (
            <motion.span
              key={p.left}
              initial={{ opacity: 0, y: '-1.4em' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: p.delay, ease: EASE }}
              style={{ left: p.left, top: p.top }}
              className="absolute -mt-[1.5em] -ml-[.75em] size-[1.5em]"
            >
              <i
                className={cn(
                  "relative block size-full -rotate-45 rounded-[50%_50%_50%_0] after:absolute after:inset-[32%] after:rounded-full after:bg-raise after:content-['']",
                  p.near ? 'bg-accent' : 'bg-mute/60',
                )}
              />
            </motion.span>
          ))}
          <span className="absolute top-[66%] left-[56%] size-[.8em] rounded-full bg-ink [box-shadow:0_0_0_.35em_var(--tint)]" />
        </div>
        <div className="grid gap-[.6em] px-[.7em] pt-[.8em] pb-[.7em]">
          <Sk w="58%" />
          <span className="mt-[.25em] rounded-full bg-ink p-[.7em] text-center text-[.86em] font-semibold text-bg">
            Order delivery
          </span>
        </div>
      </Phone>
      <Float className="top-[16%] right-[8%]" delay={0.6}>
        3 stations nearby
      </Float>
    </>
  )
}
