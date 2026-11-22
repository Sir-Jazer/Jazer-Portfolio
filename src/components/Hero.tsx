import { useEffect, useRef, useState } from 'react'
import { buddy, useBuddyOut } from '../buddy/store'
import { profile } from '../data/content'
import { useClock } from '../hooks'
import { cn } from '../lib/cn'
import { SpriteCanvas } from './Buddy'
import { Ph } from './Ph'

export function Hero() {
  return (
    <section data-section="Intro" className="wrap pt-[clamp(40px,8vw,112px)] pb-[clamp(56px,8vw,104px)]">
      <h1 className="max-w-[15ch] text-[length:clamp(2.75rem,7.6vw,5.5rem)] leading-[.95] font-bold tracking-[-.045em]">
        From thought to prod, and every line in between.
        <span aria-hidden="true" className="cursor-block" />
      </h1>

      <div className="mt-[clamp(44px,6vw,72px)] grid items-start gap-x-16 gap-y-10 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="grid max-w-[58ch] gap-4 text-[1.06rem] leading-[1.65]">
          <p>
            I build web applications from the first idea to the live release: the data, the logic, the interface and
            everything that keeps it running.
          </p>
          <p>
            I care about software that solves a real problem for the people using it, and about code that is clear
            enough for the next person to pick up.
          </p>
          <p>
            I’m a Computer Science student graduating in 2027, looking for{' '}
            <Ph need="Role you want (internship, OJT, junior full-stack)">an internship or junior full-stack role</Ph>.
            See the{' '}
            <a className="tlink" href="#work">
              work
            </a>
            , or{' '}
            <a className="tlink" href="#contact">
              get in touch
            </a>
            .
          </p>
        </div>

        <aside className="flex items-start gap-5 max-md:-order-1 md:flex-col">
          <Portrait />
          <Status />
        </aside>
      </div>
    </section>
  )
}

/**
 * A plain square photo, greyscale until you point at it. Pointing at it
 * also makes mini Jazer pop up over the top edge; click him to throw him
 * onto the page. While he is out, clicking the photo calls him back.
 */
function Portrait() {
  const out = useBuddyOut()
  const [peek, setPeek] = useState(false)
  const hideTimer = useRef(0)
  const showing = peek && !out

  const show = () => {
    window.clearTimeout(hideTimer.current)
    setPeek(true)
  }
  const hide = () => {
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setPeek(false), 400)
  }
  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  const throwHim = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const towardLeft = r.left + r.width / 2 > window.innerWidth / 2
    buddy.launch({
      x: r.left + r.width / 2 + window.scrollX,
      y: r.bottom + window.scrollY,
      vx: (towardLeft ? -1 : 1) * (520 + Math.random() * 180),
      vy: -820,
    })
    setPeek(false)
  }

  return (
    <div
      className="relative w-[clamp(112px,30vw,220px)] flex-none"
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
    >
      <button
        type="button"
        data-buddy-perch="portrait"
        aria-label={out ? 'Call mini Jazer back to the photo' : 'Show mini Jazer'}
        onClick={() => (out ? buddy.callHome() : setPeek((v) => !v))}
        className="group block w-full overflow-hidden rounded-md border border-line bg-raise"
      >
        {profile.portrait ? (
          <img
            src={profile.portrait}
            alt={`Portrait of ${profile.fullName}`}
            className={cn(
              'aspect-square w-full object-cover transition-[filter] duration-500 group-hover:grayscale-0',
              showing ? 'grayscale-0' : 'grayscale',
            )}
          />
        ) : (
          <div className="grid aspect-square place-items-center p-4 text-center text-[.85rem] text-soft">
            <Ph need="Portrait photo (square, professional or semi-formal)">Your photo here</Ph>
          </div>
        )}
      </button>

      {/* The peek window: he rises from behind the frame's top edge. */}
      <div className="pointer-events-none absolute bottom-full left-1/2 size-12 -translate-x-1/2 overflow-hidden">
        <button
          type="button"
          tabIndex={showing ? 0 : -1}
          aria-hidden={!showing}
          aria-label="Throw mini Jazer onto the page"
          title="Click me"
          onClick={throwHim}
          className={cn(
            'block size-12 transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)]',
            showing ? 'pointer-events-auto translate-y-0 cursor-pointer' : 'translate-y-full',
          )}
        >
          <SpriteCanvas frames={['wave', 'waveB']} play={showing} every={220} />
        </button>
      </div>
    </div>
  )
}

/** A small status readout, like the top of a dev log. */
function Status() {
  const time = useClock(profile.timeZone, '')
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-mono text-[.76rem] leading-snug">
      <dt className="text-mute">status</dt>
      <dd className="flex items-center gap-2">
        <span className="relative size-1.5 flex-none rounded-full bg-accent after:absolute after:-inset-[4px] after:animate-[pulse-ring_2.8s_ease-out_infinite] after:rounded-full after:border after:border-accent after:content-['']" />
        <Ph need="Availability line (e.g. open to OJT, internship, junior roles)">Available June 2027</Ph>
      </dd>
      <dt className="text-mute">local</dt>
      <dd className="tabular-nums">
        {time.trim()} · {profile.city}, PH
      </dd>
    </dl>
  )
}
