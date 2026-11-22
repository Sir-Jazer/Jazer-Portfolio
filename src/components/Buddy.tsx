import { useEffect, useRef } from 'react'
import { paint } from '../buddy/draw'
import { BuddyEngine } from '../buddy/engine'
import { SPRITE_H, SPRITE_W } from '../buddy/sprites'
import { buddy } from '../buddy/store'
import { cn } from '../lib/cn'

/** Mounts the walking mini Jazer. He stays hidden until thrown out of the photo. */
export function Buddy() {
  useEffect(() => {
    const engine = new BuddyEngine()
    const disconnect = buddy.connect(
      (l) => engine.launch(l),
      () => engine.callHome(),
    )
    return () => {
      disconnect()
      engine.destroy()
    }
  }, [])
  return null
}

/** A small looping sprite, used for the peek above the photo. */
export function SpriteCanvas({
  frames,
  play = true,
  every = 200,
  className,
}: {
  frames: string[]
  play?: boolean
  every?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const key = frames.join(',')

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    const list = key.split(',')
    let i = 0
    paint(ctx, list[0])
    if (!play || list.length < 2) return
    const id = window.setInterval(() => paint(ctx, list[++i % list.length]), every)
    return () => window.clearInterval(id)
  }, [key, play, every])

  return <canvas ref={ref} width={SPRITE_W} height={SPRITE_H} className={cn('buddy-sprite block size-full', className)} />
}
