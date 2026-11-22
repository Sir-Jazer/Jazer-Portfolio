import type { ReactNode } from 'react'
import { DRAFT_MODE } from '../data/content'
import { cn } from '../lib/cn'

/**
 * Ph = placeholder. Wrap any text you still need to replace:
 *
 *   <Ph need="LinkedIn profile URL">linkedin.com/in/you</Ph>
 *
 * It gets a dotted underline, and the "Draft" button (bottom right) lists every
 * one on the page. When you have the real text, delete the <Ph> wrapper.
 * With DRAFT_MODE off it renders the text as plain text, with no marking.
 */
export function Ph({ need, children, className }: { need: string; children: ReactNode; className?: string }) {
  if (!DRAFT_MODE) return <>{children}</>
  return (
    <span data-need={need} title={`To fill: ${need}`} className={cn('ph', className)}>
      {children}
    </span>
  )
}

/** A link that shows as a placeholder until you give it an href (and is hidden when DRAFT_MODE is off). */
export function LinkOrPh({ href, need, children }: { href: string | null; need: string; children: ReactNode }) {
  if (!href) {
    if (!DRAFT_MODE) return null
    return (
      <Ph need={need} className="tlink">
        {children} ↗
      </Ph>
    )
  }
  return (
    <a className="tlink" href={href} target="_blank" rel="noopener">
      {children} ↗
    </a>
  )
}
