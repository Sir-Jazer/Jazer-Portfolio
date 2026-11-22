import type { ReactNode } from 'react'
import type { Entry } from '../data/content'

/**
 * One section of the page: a hairline, a numbered heading (01, 02...),
 * then the content. Numbers follow page order, so reordering sections
 * in App.tsx renumbers them on its own.
 */
export function Row({ id, label, children }: { id?: string; label: string; children: ReactNode }) {
  return (
    <section id={id} data-section={label} className="wrap">
      <div className="border-t border-line py-[clamp(48px,7vw,88px)]">
        <h2 className="sec-num mb-[clamp(28px,4vw,44px)] flex items-baseline gap-3.5 text-[length:clamp(1.5rem,3vw,2rem)] leading-none font-bold tracking-[-.035em]">
          {label}
        </h2>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

/**
 * A timeline list. The date leads in mono on the left; the name, role,
 * one line of summary and an optional stack line sit on the right,
 * after a small logo when the entry has one.
 */
export function Entries({ items }: { items: Entry[] }) {
  return (
    <ol className="grid">
      {items.map((e, i) => (
        <li
          key={i}
          className="grid gap-x-8 gap-y-1 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
        >
          <span className="font-mono text-[.8rem] text-mute tabular-nums sm:pt-[3px]">{e.when}</span>
          <div className="flex min-w-0 max-w-[62ch] items-start gap-3.5">
            {e.logo && (
              // Fixed box + object-contain keeps any logo shape centered and uncropped.
              <span className="relative mt-0.5 h-9 w-14 flex-none overflow-hidden rounded-md border border-line bg-raise">
                <img src={e.logo} alt="" className="absolute inset-[3px] size-[calc(100%-6px)] object-contain object-center" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold">{e.org}</h3>
              <p>{e.role}</p>
              {e.summary && <p className="mt-1 text-soft">{e.summary}</p>}
              {e.stack && <p className="mt-1.5 font-mono text-[.76rem] text-mute">{e.stack}</p>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
