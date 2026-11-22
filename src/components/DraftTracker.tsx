import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { projects, type ProjectId } from '../data/content'
import { EASE } from '../lib/cn'

interface Item {
  need: string
  where: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Opens a project in the Work accordion so its placeholders are visible. */
  onRevealProject: (id: ProjectId) => void
}

const all = () => Array.from(document.querySelectorAll<HTMLElement>('[data-need]'))
const isVisible = (el: HTMLElement) => el.offsetParent !== null

/**
 * The "Draft" button. Lists every <Ph> placeholder on the page and jumps to it.
 * Remove it for launch by setting DRAFT_MODE = false in src/data/content.tsx.
 */
export function DraftTracker({ open, onOpenChange, onRevealProject }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loud, setLoud] = useState(() => {
    try {
      return localStorage.getItem('phLoud') === '1'
    } catch {
      return false
    }
  })

  // Collect placeholders once the page has rendered.
  useEffect(() => {
    const seen = new Map<string, string>()
    for (const el of all()) {
      const need = el.dataset.need!
      if (seen.has(need)) continue
      const projectId = el.closest<HTMLElement>('[data-project]')?.dataset.project
      const section = el.closest<HTMLElement>('[data-section]')?.dataset.section
      seen.set(need, projects.find((p) => p.id === projectId)?.short ?? section ?? 'Page')
    }
    setItems([...seen].map(([need, where]) => ({ need, where })))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('ph-loud', loud)
    try {
      localStorage.setItem('phLoud', loud ? '1' : '0')
    } catch {
      /* storage can be blocked */
    }
  }, [loud])

  const jumpTo = (need: string) => {
    const find = () => {
      const matches = all().filter((el) => el.dataset.need === need)
      return matches.find(isVisible) ?? matches[0]
    }
    const first = find()
    if (!first) return
    const project = first.closest<HTMLElement>('[data-project]')
    let wait = 0
    if (project && project.dataset.open !== 'true') {
      onRevealProject(project.dataset.project as ProjectId)
      wait = 650 // let the accordion finish opening
    }
    window.setTimeout(() => {
      const el = find()
      if (!el) return
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' })
      el.classList.remove('flash')
      void el.offsetWidth // restart the animation
      el.classList.add('flash')
    }, wait)
  }

  return (
    <div
      data-buddy-ignore
      className="fixed z-40 grid justify-items-end gap-2.5"
      style={{
        right: 'calc(16px + env(safe-area-inset-right, 0px))',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id="draft-panel"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="max-h-[min(62vh,500px)] w-[min(340px,calc(100vw-32px))] origin-bottom-right overflow-auto rounded-[14px] border border-line bg-raise p-4 [box-shadow:0_30px_60px_-24px_var(--shade)]"
          >
            <div className="mb-2.5 grid gap-2">
              <b className="font-semibold">Details still to fill</b>
              <p className="text-[.86rem] leading-snug text-soft">
                Dotted underlines mark placeholder text. Tap an item to jump to it.
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-[.86rem]">
                <input id="ph-loud" type="checkbox" checked={loud} onChange={(e) => setLoud(e.target.checked)} />
                Highlight them on the page
              </label>
            </div>
            <ul>
              {items.map((item) => (
                <li key={item.need}>
                  <button
                    type="button"
                    onClick={() => jumpTo(item.need)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2.5 rounded-lg p-2 text-left text-[.86rem] leading-snug hover:bg-bg focus-visible:bg-bg"
                  >
                    <span>{item.need}</span>
                    <small className="pt-[.2em] font-mono text-[.68rem] whitespace-nowrap text-soft">{item.where}</small>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="draft-panel"
        className="rounded-full border border-bg/35 bg-ink px-3.5 py-2 font-mono text-[.76rem] font-medium text-bg [box-shadow:0_12px_30px_-12px_var(--shade)]"
      >
        Draft · {items.length} to fill
      </button>
    </div>
  )
}
