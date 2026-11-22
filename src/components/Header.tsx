import { profile } from '../data/content'

const LINKS = [
  ['work', 'Work'],
  ['about', 'About'],
  ['contact', 'Contact'],
] as const

export function Header() {
  return (
    <header className="wrap flex h-[72px] items-center justify-between gap-6">
      <a href="#top" className="inline-flex items-center gap-2 font-bold tracking-[-.02em]">
        <span aria-hidden="true" className="size-2.5 bg-accent" />
        {profile.name}
      </a>
      <nav aria-label="Sections" className="flex gap-6 text-[.95rem] text-soft">
        {LINKS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="transition-colors hover:text-ink">
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}
