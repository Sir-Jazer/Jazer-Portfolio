import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { DRAFT_MODE, education, experience, profile, recognition, stack } from '../data/content'
import { cn } from '../lib/cn'
import { Entries, Row } from './Layout'
import { LinkOrPh, Ph } from './Ph'
import { StackIcons } from './StackIcons'

export function Experience() {
  return (
    <Row id="experience" label="Experience">
      <Entries items={experience} />
    </Row>
  )
}

export function Education() {
  return (
    <Row id="education" label="Education">
      <Entries items={education} />
    </Row>
  )
}

export function Recognition() {
  return (
    <Row id="recognition" label="Recognition">
      <Entries items={recognition} />
    </Row>
  )
}

export function Stack() {
  return (
    <Row id="stack" label="Stack">
      <dl className="grid gap-3">
        {stack.map((s) => (
          <div key={s.label} className="grid items-center gap-x-6 gap-y-1 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
            <dt className="font-mono text-[.8rem] text-mute lowercase">{s.label}</dt>
            <dd className="-ml-1.5">
              <StackIcons items={s.items} size="md" label={s.label} />
            </dd>
          </div>
        ))}
      </dl>
    </Row>
  )
}

export function About() {
  return (
    <Row id="about" label="About">
      <div className="grid max-w-[60ch] gap-4">
        <p>
          I’m a developer from Nueva Ecija, Philippines. I enjoy taking a slow, manual process and turning it into a
          simple system that people actually want to use.
        </p>
        <p>
          I like explaining my work as much as building it. Walking a teammate, a client or a panel through how
          something works is one of my favorite parts of the job.
        </p>
        <p className="text-soft">Comfortable across the stack, and always learning whatever the next project needs.</p>
      </div>
    </Row>
  )
}

export function Contact({ onCopyEmail }: { onCopyEmail: () => Promise<boolean> }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (await onCopyEmail()) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <Row id="contact" label="Contact">
      <p className="max-w-[18ch] text-[length:clamp(2rem,4.4vw,3.25rem)] leading-[1] font-bold tracking-[-.04em]">
        Have a system that needs building? <span className="text-accent">Let’s talk.</span>
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {/* Real text, so it can always be selected by hand. */}
        <span className="font-mono text-[.95rem] select-all">
          {profile.email ?? <Ph need="Professional email address">your.email@example.com</Ph>}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-raise px-3.5 text-[.85rem] font-medium transition-colors hover:border-ink"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <li>
          <a className="tlink" href={profile.github} target="_blank" rel="noopener">
            GitHub ↗
          </a>
        </li>
        <li>
          <LinkOrPh href={profile.linkedin} need="LinkedIn profile URL">
            LinkedIn
          </LinkOrPh>
        </li>
        {(profile.resume || DRAFT_MODE) && (
          <li>
            <LinkOrPh href={profile.resume} need="Resume PDF link (Google Drive or hosted file)">
              Resume
            </LinkOrPh>
          </li>
        )}
      </ul>
    </Row>
  )
}

/** Build date, set by vite.config.ts each time the site is built. */
const BUILT = new Date(__BUILD_DATE__).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function Footer() {
  return (
    <footer className="wrap">
      <div
        className={cn(
          'flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-line pt-6 pb-10 font-mono text-[.76rem] text-mute',
          DRAFT_MODE && 'pb-20 sm:pb-10 sm:pr-48',
        )}
      >
        <span>
          <span className="text-accent-text">$</span> © {new Date(__BUILD_DATE__).getFullYear()} {profile.name}
        </span>
        <span>
          last build {BUILT} ·{' '}
          <a href="#top" className="transition-colors hover:text-ink">
            top ↑
          </a>
        </span>
      </div>
    </footer>
  )
}
