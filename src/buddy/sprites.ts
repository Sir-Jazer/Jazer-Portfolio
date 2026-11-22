/* ------------------------------------------------------------------
   Mini Jazer: a 24 x 24 pixel overworld sprite in a grey suit, white
   shirt and navy tie. Frames are drawn as text, one character per
   pixel (see PALETTE). Heads, torsos, legs and raised arms are
   separate parts that get combined below, and every frame also has
   a mirrored copy named "<name>~" (e.g. "right~" faces left).
------------------------------------------------------------------- */

export const SPRITE_W = 24
export const SPRITE_H = 24
/** Row of the belt, where you grab him when dragging. */
export const GRAB_ROW = 14

export const PALETTE: Record<string, string> = {
  o: '#1b1a20', // outline
  h: '#26252c', // hair
  H: '#4a4856', // hair shine
  s: '#f1c7a3', // skin
  S: '#d7a07a', // skin shade
  e: '#1b1a20', // eyes
  m: '#b56f5c', // mouth
  w: '#f6f6f6', // shirt
  W: '#cfd4dc', // shirt shade
  t: '#1f2c5e', // tie
  T: '#3d55a3', // tie shine
  g: '#5f636b', // suit
  G: '#42454c', // suit shade, trousers
  b: '#141418', // shoes, belt
  L: '#c7cad0', // laptop
  a: '#ff4f00', // laptop logo (the site accent)
}

/* ------------------------------ Parts ------------------------------ */
// Parts are 16 px wide; they are centred on the 24 px canvas.

const HEAD_DOWN = [
  '....oooooooo....',
  '..oohhhhhhhhoo..',
  '.ohhhhhhHHhhhho.',
  'ohhhHHhhhhhhhhho',
  'ohhhhhhhhhhhhhho',
  'ohhhhhhhhhhhhhho',
  'ohhhshhhhhhshhho',
  'ohsshsssssshssho',
  'ohsseesssseessho',
  'oSsseesssseessSo',
  '.oSssssmmssssSo.',
  '..ooSssssssSoo..',
]
const HEAD_BLINK = swapRows(HEAD_DOWN, {
  8: 'ohssssssssssssho',
  9: 'oSsseesssseessSo',
})
const HEAD_SHOCK = swapRows(HEAD_DOWN, {
  10: '.oSsssseessssSo.',
})
const HEAD_UP = [
  '....oooooooo....',
  '..oohhhhhhhhoo..',
  '.ohhhhhhhhhhhho.',
  'ohhhhhHHhhhhhhho',
  'ohhhhHhhhhhhhhho',
  'ohhhhhhhhhhhhhho',
  'ohhhhhhhhhhhhhho',
  'ohhhhhhhhhhhhhho',
  'oShhhhhhhhhhhhSo',
  'oShhhhhhhhhhhhSo',
  '.oShhhhhhhhhhSo.',
  '..ooSSSSSSSSoo..',
]
const HEAD_RIGHT = [
  '....oooooooo....',
  '..oohhhhhhhhoo..',
  '.ohhhhhhhHHhhho.',
  'ohhhhhhhHhhhhhho',
  'ohhhhhhhhhhhhhho',
  'ohhhhhhhhhhhhhho',
  'ohhhhhhhhhhshsho',
  'ohhhhhSsssshssso',
  'ohhhhSSsssssesso',
  'ohhhhSssssssesso',
  '.ohhhSssssssmso.',
  '..oohSSssssSoo..',
]

const TORSO_DOWN = [
  '...oowwttwwoo...',
  '..oggGwttwGggo..',
  '.ogggGwTtwGgggo.',
  '.oggoGGttGGoggo.',
  '.oggoggttggoggo.',
  '.oggoggggggoggo.',
  '.ossoGggggGosso.',
  '..oGGGGGGGGGGo..',
]
const TORSO_UP = [
  '...ooggggggoo...',
  '..oggggggggggo..',
  '.oggggggggggggo.',
  '.oggoggggggoggo.',
  '.oggogggGggoggo.',
  '.oggogggGggoggo.',
  '.ossoGggGgGosso.',
  '..oGGGGGGGGGGo..',
]
/** Back view with the left arm lifted away (it is drawn by ARM_UP). */
const TORSO_UP_REACH = [
  '...ooggggggoo...',
  '..oggggggggggo..',
  '...oggggggggggo.',
  '....oggggggoggo.',
  '....ogggGggoggo.',
  '....ogggGggoggo.',
  '....oGggGgGosso.',
  '..oGGGGGGGGGGo..',
]
/** Front view with the right arm lifted away, for waving. */
const TORSO_WAVE = [
  '...oowwttwwoo...',
  '..oggGwttwGggo..',
  '.ogggGwTtwGggo..',
  '.oggoGGttGGggo..',
  '.oggoggttgggo...',
  '.oggogggggggo...',
  '.ossoGggggGo....',
  '..oGGGGGGGGGGo..',
]
/** Both arms lifted away: falling, cheering, being carried. */
const TORSO_ARMS_UP = [
  '...oowwttwwoo...',
  '..ogGGwttwGGgo..',
  '...ogGwTtwGgo...',
  '...oGGGttGGGo...',
  '...oggggggggo...',
  '...oggggggggo...',
  '...oGGGGGGGGo...',
  '...oGGGooGGGo...',
]
/** Hands on the knot, straightening the tie. */
const TORSO_TIE = [
  '...oowwttwwoo...',
  '..oggssttssggo..',
  '.oggggGttGggggo.',
  '.oggGGGttGGGggo.',
  '.ogggggttgggggo.',
  '..oggggggggggo..',
  '..oGggggggggGo..',
  '..oGGGGGGGGGGo..',
]
/** Held up by the belt, trousers hiked to the chest. */
const TORSO_CARRIED = [
  '...oowwttwwoo...',
  '..ogGGwttwGGgo..',
  '...obbbbbbbbo...',
  '...oGGGGGGGGo...',
  '...oGGGGGGGGo...',
  '...oGGGooGGGo...',
  '...oGGo..oGGo...',
  '...oGGo..oGGo...',
]
const TORSO_RIGHT = [
  '....oowwwtoo....',
  '...ogggggGwto...',
  '...ogggoggGwo...',
  '...ogggoggoGo...',
  '...ogggoggoGo...',
  '...ogggossoGo...',
  '...oGGGGooGGo...',
  '....oGGGGGGo....',
]

const LEGS_STAND = [
  '...oGGGooGGGo...',
  '...oGGGooGGGo...',
  '...obbboobbbo...',
  '....ooo..ooo....',
]
const LEGS_STEP = [
  '...oGGGooGGGo...',
  '...obbbooGGGo...',
  '....ooo.obbbo...',
  '.........ooo....',
]
const LEGS_APART = [
  '..oGGGo..oGGGo..',
  '..oGGo....oGGo..',
  '.obbbo....obbbo.',
  '..ooo......ooo..',
]
const LEGS_DANGLE = [
  '...oGGo..oGGo...',
  '...obbo..oGGo...',
  '....oo...obbo...',
  '..........oo....',
]
const LEGS_RIGHT = [
  '....oGGGGGo.....',
  '....oGGGGGo.....',
  '....obbbbbbo....',
  '.....oooooo.....',
]
const LEGS_RIGHT_A = [
  '...oGGo..oGGo...',
  '..oGGo....oGGo..',
  '.obbbo....obbbbo',
  '..ooo......oooo.',
]
const LEGS_RIGHT_B = [
  '....oGGGGGo.....',
  '....oGGoGGo.....',
  '...obbbobbbbo...',
  '....ooo.oooo....',
]

/** A raised left arm, drawn over the 24 px canvas (spaces leave pixels alone). */
const ARM_UP: Record<number, string> = {
  2: '  oo    ',
  3: ' oss    ',
  4: ' oss    ',
  5: ' oww    ',
  6: ' ogg    ',
  7: ' ogg    ',
  8: ' ogg    ',
  9: ' ogg    ',
  10: ' oggo   ',
  11: ' oggggo ',
  12: '  oggggg',
  13: '   oooo ',
}
/** The same arm tilted outward, for the second wave frame. */
const ARM_TILT: Record<number, string> = {
  2: ' oo     ',
  3: 'osso    ',
  4: 'osso    ',
  5: 'owwo    ',
  6: ' ogg    ',
  7: ' ogg    ',
  8: ' ogg    ',
  9: ' ogg    ',
  10: ' oggo   ',
  11: ' oggggo ',
  12: '  oggggg',
  13: '   oooo ',
}

/** Laptop on his lap, drawn over the sitting frame (rows of the 16 px part). */
const LAPTOP: Record<number, string> = {
  16: '...oooooooooo...',
  17: '...oLLLLLLLLo...',
  18: '...oLLLaaLLLo...',
  19: '...oLLLLLLLLo...',
  20: '..soooooooooos..',
}

/* ---------------------------- Assembly ---------------------------- */

type Grid = string[]

function swapRows(rows: Grid, swaps: Record<number, string>): Grid {
  return rows.map((r, i) => swaps[i] ?? r)
}
const center = (rows: Grid): Grid => rows.map((r) => '....' + r + '....')
const mirror = (rows: Grid): Grid => rows.map((r) => [...r].reverse().join(''))

/** Draw `layer` over `rows`; a space keeps the pixel underneath. */
function over(rows: Grid, layer: Record<number, string>, width = SPRITE_W, flip = false): Grid {
  return rows.map((r, i) => {
    let paint = layer[i]
    if (paint === undefined) return r
    paint = paint.padEnd(width, ' ')
    if (flip) paint = [...paint].reverse().join('')
    return [...r].map((ch, x) => (paint[x] === ' ' || paint[x] === undefined ? ch : paint[x])).join('')
  })
}
/** Add empty rows on top so a short frame (sitting, crouching) still stands on the floor. */
const toFloor = (rows: Grid): Grid => [...Array(SPRITE_H - rows.length).fill('.'.repeat(SPRITE_W)), ...rows]

const build = (...parts: Grid[]) => center(parts.flat())

const down = build(HEAD_DOWN, TORSO_DOWN, LEGS_STAND)
const sitBase = toFloor(build(HEAD_DOWN, TORSO_DOWN.slice(0, 6), ['.oGGGGGGGGGGGGo.', '.oGGGGooooGGGGo.', '.obbbo....obbbo.', '..ooo......ooo..']))
const typing = over(sitBase, Object.fromEntries(Object.entries(LAPTOP).map(([k, v]) => [Number(k), '    ' + v])))
const armsUp = (rows: Grid) => over(over(rows, ARM_UP), ARM_UP, SPRITE_W, true)

const BASE: Record<string, Grid> = {
  down,
  blink: build(HEAD_BLINK, TORSO_DOWN, LEGS_STAND),
  shock: build(HEAD_SHOCK, TORSO_DOWN, LEGS_STAND),
  stepDown: build(HEAD_DOWN, TORSO_DOWN, LEGS_STEP),
  up: build(HEAD_UP, TORSO_UP, LEGS_STAND),
  stepUp: build(HEAD_UP, TORSO_UP, LEGS_STEP),
  climb: over(build(HEAD_UP, TORSO_UP_REACH, mirror(LEGS_STEP)), ARM_UP),
  right: build(HEAD_RIGHT, TORSO_RIGHT, LEGS_RIGHT),
  stepRightA: build(HEAD_RIGHT, TORSO_RIGHT, LEGS_RIGHT_A),
  stepRightB: build(HEAD_RIGHT, TORSO_RIGHT, LEGS_RIGHT_B),
  fall: armsUp(build(HEAD_SHOCK, TORSO_ARMS_UP, LEGS_APART)),
  cheer: armsUp(build(HEAD_DOWN, TORSO_ARMS_UP, LEGS_STAND)),
  carried: armsUp(build(HEAD_SHOCK, TORSO_CARRIED, LEGS_DANGLE)),
  wave: over(build(HEAD_DOWN, TORSO_WAVE, LEGS_STAND), ARM_UP, SPRITE_W, true),
  waveB: over(build(HEAD_DOWN, TORSO_WAVE, LEGS_STAND), ARM_TILT, SPRITE_W, true),
  tie: build(HEAD_BLINK, TORSO_TIE, LEGS_STAND),
  sit: sitBase,
  type: typing,
  typeB: over(typing, { 19: '      s          s      ', 20: '      o          o      ' }),
  crouch: toFloor(build(HEAD_DOWN, TORSO_DOWN.slice(0, 5), TORSO_DOWN.slice(7), LEGS_STAND.slice(1))),
}

/** Every frame, plus a mirrored "<name>~" copy of each. */
export const FRAMES: Record<string, Grid> = {}
for (const [name, rows] of Object.entries(BASE)) {
  FRAMES[name] = rows
  FRAMES[name + '~'] = mirror(rows)
}

/** Throws if any frame has a row of the wrong width or an unknown colour. */
export function checkFrames() {
  for (const [name, rows] of Object.entries(FRAMES)) {
    if (rows.length !== SPRITE_H) throw new Error(`${name}: ${rows.length} rows`)
    rows.forEach((r, i) => {
      if (r.length !== SPRITE_W) throw new Error(`${name} row ${i}: ${r.length} wide`)
      for (const ch of r) if (ch !== '.' && !PALETTE[ch]) throw new Error(`${name} row ${i}: unknown "${ch}"`)
    })
  }
}
