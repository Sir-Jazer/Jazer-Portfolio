import { useSyncExternalStore } from 'react'

/* A tiny shared state so the photo (Hero) and the walking character
   (Buddy) can talk without passing props through the whole app. */

export interface Launch {
  /** Feet position in page coordinates. */
  x: number
  y: number
  /** Starting velocity in px/s. */
  vx: number
  vy: number
}

let out = false
const listeners = new Set<() => void>()
let launcher: ((l: Launch) => void) | null = null
let homeCaller: (() => void) | null = null

export const buddy = {
  /** True while he is loose on the page. */
  isOut: () => out,
  setOut(next: boolean) {
    out = next
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  /** Throw him out of the photo. */
  launch: (l: Launch) => launcher?.(l),
  /** Ask him to walk back to the photo. */
  callHome: () => homeCaller?.(),
  /** Used by the Buddy component to wire up the engine. */
  connect(onLaunch: (l: Launch) => void, onHome: () => void) {
    launcher = onLaunch
    homeCaller = onHome
    return () => {
      launcher = null
      homeCaller = null
    }
  },
}

export const useBuddyOut = () => useSyncExternalStore(buddy.subscribe, buddy.isOut, buddy.isOut)
