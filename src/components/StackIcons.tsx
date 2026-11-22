import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  siAlpinedotjs,
  siClaude,
  siCloudflare,
  siCloudflareworkers,
  siDigitalocean,
  siDotnet,
  siExpo,
  siFirebase,
  siGithubcopilot,
  siJavascript,
  siLaravel,
  siMysql,
  siNextdotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siReact,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siWindsurf,
  type SimpleIcon,
} from 'simple-icons'
import { cn, EASE } from '../lib/cn'

/* ------------------------------------------------------------------
   Tech logos, shown as a row of grey icons. Hover, focus or tap one
   and it lifts, takes its brand colour and shows its name.
   Names are matched exactly as written in content.tsx. A name with no
   logo in Simple Icons gets a two-letter badge instead.
------------------------------------------------------------------- */

type Logo = { icon: SimpleIcon } | { badge: string; hex: string }

const LOGOS: Record<string, Logo> = {
  // Languages
  TypeScript: { icon: siTypescript },
  JavaScript: { icon: siJavascript },
  PHP: { icon: siPhp },
  'C#': { badge: 'C#', hex: '512BD4' },
  Java: { icon: siOpenjdk },
  Python: { icon: siPython },
  // Frameworks
  'Next.js': { icon: siNextdotjs },
  React: { icon: siReact },
  'React Native': { icon: siReact },
  Expo: { icon: siExpo },
  Laravel: { icon: siLaravel },
  'Alpine.js': { icon: siAlpinedotjs },
  'ASP.NET': { icon: siDotnet },
  'Tailwind CSS': { icon: siTailwindcss },
  // Data
  PostgreSQL: { icon: siPostgresql },
  Supabase: { icon: siSupabase },
  MySQL: { icon: siMysql },
  Firebase: { icon: siFirebase },
  // Cloud
  DigitalOcean: { icon: siDigitalocean },
  'Laravel Cloud': { icon: siLaravel },
  'Microsoft Azure': { badge: 'Az', hex: '0078D4' },
  Cloudflare: { icon: siCloudflare },
  'Cloudflare Workers': { icon: siCloudflareworkers },
  Vercel: { icon: siVercel },
  // AI tools
  'ChatGPT Codex': { badge: 'Cx', hex: '10A37F' },
  'Claude Code': { icon: siClaude },
  'GitHub Copilot': { icon: siGithubcopilot },
  Windsurf: { icon: siWindsurf },
  'Higgsfield AI': { badge: 'Hf', hex: 'FF4F00' },
}

/** Near-black brand colours (Next.js, Vercel...) would vanish on the dark theme, so they use the ink colour. */
function brandColor(hex: string) {
  const n = parseInt(hex, 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum < 0.2 ? 'var(--ink)' : `#${hex}`
}

/** Splits 'Next.js, Supabase, Vercel' into names. */
export const splitStack = (items: string) => items.split(',').map((s) => s.trim()).filter(Boolean)

export function StackIcons({ items, size = 'sm', label }: { items: string; size?: 'sm' | 'md'; label: string }) {
  const names = splitStack(items)
  const [active, setActive] = useState<string | null>(null)
  const timer = useRef<number>(undefined)

  // A tapped tooltip hides on its own after a moment. (No toggling: on some phones
  // the tap also focuses the logo, and a toggle would close what focus just opened.)
  const tap = (name: string) => {
    window.clearTimeout(timer.current)
    setActive(name)
    timer.current = window.setTimeout(() => setActive(null), 1800)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ul aria-label={label} className={cn('flex flex-wrap items-center', size === 'sm' ? 'gap-1' : 'gap-1.5')}>
      {names.map((name, i) => (
        <Item
          key={name}
          name={name}
          index={i}
          size={size}
          active={active === name}
          onShow={() => setActive(name)}
          onHide={() => setActive((cur) => (cur === name ? null : cur))}
          onTap={() => tap(name)}
        />
      ))}
    </ul>
  )
}

function Item({
  name,
  index,
  size,
  active,
  onShow,
  onHide,
  onTap,
}: {
  name: string
  index: number
  size: 'sm' | 'md'
  active: boolean
  onShow: () => void
  onHide: () => void
  onTap: () => void
}) {
  const logo = LOGOS[name]
  const hex = logo ? ('icon' in logo ? logo.icon.hex : logo.hex) : 'FF4F00'
  const px = size === 'sm' ? 18 : 22

  return (
    <motion.li
      role="img"
      aria-label={name}
      tabIndex={0}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onShow()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHide()}
      onPointerUp={(e) => e.pointerType !== 'mouse' && onTap()}
      onFocus={onShow}
      onBlur={onHide}
      style={{ '--brand': brandColor(hex) } as CSSProperties}
      className={cn(
        'relative grid cursor-default place-items-center rounded-md outline-offset-1 transition-colors duration-200',
        size === 'sm' ? 'size-[30px]' : 'size-9',
        active ? 'bg-raise text-[var(--brand)]' : 'text-mute',
      )}
    >
      <motion.span
        animate={{ y: active ? -3 : 0, scale: active ? 1.14 : 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="grid place-items-center"
      >
        {logo && 'icon' in logo ? (
          <svg viewBox="0 0 24 24" width={px} height={px} fill="currentColor" aria-hidden="true">
            <path d={logo.icon.path} />
          </svg>
        ) : (
          <span
            aria-hidden="true"
            style={{ width: px, height: px }}
            className="grid place-items-center rounded-[4px] border-[1.5px] border-current font-mono text-[9px] leading-none font-bold tracking-tight"
          >
            {logo && 'badge' in logo ? logo.badge : name.slice(0, 2)}
          </span>
        )}
      </motion.span>

      <AnimatePresence>{active && <Tooltip name={name} />}</AnimatePresence>
    </motion.li>
  )
}

/** The name above a logo. Nudged sideways if it would run off the edge of a narrow screen. */
function Tooltip({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shift, setShift] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const b = el.getBoundingClientRect()
    const edge = 8
    const room = document.documentElement.clientWidth - edge
    if (b.left < edge) setShift(edge - b.left)
    else if (b.right > room) setShift(room - b.right)
  }, [])

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      initial={{ opacity: 0, y: 4, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 2, scale: 0.96 }}
      transition={{ duration: 0.16, ease: EASE }}
      style={{ marginLeft: shift }}
      className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 rounded-[4px] bg-ink px-2 py-1 font-mono text-[11px] leading-none font-medium whitespace-nowrap text-bg"
    >
      {name}
    </motion.span>
  )
}
