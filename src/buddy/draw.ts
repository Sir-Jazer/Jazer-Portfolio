import { FRAMES, PALETTE, SPRITE_H, SPRITE_W } from './sprites'

const cache = new Map<string, HTMLCanvasElement>()

/** One frame drawn at 1 px per pixel, made once and reused. */
function frameCanvas(name: string) {
  let c = cache.get(name)
  if (c) return c
  c = document.createElement('canvas')
  c.width = SPRITE_W
  c.height = SPRITE_H
  const ctx = c.getContext('2d')!
  const rows = FRAMES[name] ?? FRAMES.down
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = PALETTE[row[x]]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(x, y, 1, 1)
    }
  })
  cache.set(name, c)
  return c
}

/** Paint a frame onto a 24 x 24 canvas (CSS scales it up with crisp pixels). */
export function paint(ctx: CanvasRenderingContext2D, name: string) {
  ctx.clearRect(0, 0, SPRITE_W, SPRITE_H)
  ctx.drawImage(frameCanvas(name), 0, 0)
}
