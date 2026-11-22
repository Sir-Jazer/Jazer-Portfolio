import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Clock, Play } from 'lucide-react'
import { DRAFT_MODE, projects, type Project, type ProjectId } from '../data/content'
import { cn, EASE } from '../lib/cn'
import { Row } from './Layout'
import { LinkOrPh } from './Ph'
import { Thumb } from './Scenes'
import { StackIcons } from './StackIcons'

interface Props {
  openId: ProjectId | null
  onOpenChange: (id: ProjectId | null) => void
}

/** Selected work: logo, one-line pitch, stack logos, live link, and a demo video that opens in place. */
export function Work({ openId, onOpenChange }: Props) {
  return (
    <Row id="work" label="Selected work">
      <ol className="grid gap-10">
        {projects.map((p) => (
          <ProjectItem
            key={p.id}
            project={p}
            open={openId === p.id}
            onToggle={() => onOpenChange(openId === p.id ? null : p.id)}
          />
        ))}
      </ol>
    </Row>
  )
}

function ProjectItem({ project: p, open, onToggle }: { project: Project; open: boolean; onToggle: () => void }) {
  const [replay, setReplay] = useState(0)
  // A project without a video has no demo button. A missing link shows a
  // placeholder while drafting and disappears once the site goes live.
  const hasDemo = p.video !== null
  const hasLive = p.live !== null || DRAFT_MODE

  return (
    <li
      id={`project-${p.id}`}
      data-project={p.id}
      data-open={open}
      onMouseEnter={() => setReplay((n) => n + 1)}
      className="grid gap-x-5 gap-y-4 sm:grid-cols-[176px_minmax(0,1fr)]"
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={hasDemo ? onToggle : undefined}
        className={cn('block w-full self-start', !hasDemo && 'cursor-default')}
        aria-hidden="true"
      >
        <Thumb id={p.id} replay={replay} logo={p.logo} logoDark={p.logoDark} />
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 className="text-[1.08rem] font-semibold tracking-[-.015em]">{p.name}</h3>
          <span className="rounded-[3px] border border-line px-1.5 py-px font-mono text-[.68rem] tracking-wide text-mute uppercase">
            {p.tag}
          </span>
        </div>
        <p className="mt-1 text-soft">{p.pitch}</p>
        <div className="mt-2 -ml-1.5">
          <StackIcons items={p.stack} label={`${p.short} tech stack`} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[.92rem] font-medium">
          {p.liveNote ? (
            <span className="inline-flex items-center gap-1.5 font-normal text-mute">
              <Clock size={13} />
              {p.liveNote}
            </span>
          ) : (
            hasLive && (
              <LinkOrPh href={p.live} need={`${p.short}: live site link`}>
                Live site
              </LinkOrPh>
            )
          )}
          {hasDemo && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={`panel-${p.id}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-accent-text"
            >
              <Play size={13} className="fill-current" />
              {open ? 'Close demo' : 'Watch demo'}
            </button>
          )}
        </div>
      </div>

      {hasDemo && (
        <motion.div
          id={`panel-${p.id}`}
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          inert={!open}
          data-buddy-clip
          className="overflow-hidden sm:col-start-2"
        >
          <Demo src={p.video!} open={open} />
        </motion.div>
      )}
    </li>
  )
}

function Demo({ src, open }: { src: string; open: boolean }) {
  const video = useRef<HTMLVideoElement>(null)

  // Stop playback when the panel closes.
  useEffect(() => {
    if (!open) video.current?.pause()
  }, [open])

  return (
    <video
      ref={video}
      src={src}
      controls
      playsInline
      preload="metadata"
      className="block aspect-video w-full rounded-lg border border-line bg-raise"
    >
      Your browser can’t play this video.
    </video>
  )
}
