import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Live clock for a time zone, e.g. "11:52 PM". */
export function useClock(timeZone: string, suffix = '') {
  const fmt = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }),
    [timeZone],
  )
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt.format(new Date())), 15_000)
    return () => window.clearInterval(id)
  }, [fmt])
  return suffix ? `${now} ${suffix}` : now
}

/** One short message at the bottom of the screen. */
export function useToast(ms = 1900) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef(0)
  const notify = useCallback(
    (text: string) => {
      window.clearTimeout(timer.current)
      setMessage(text)
      timer.current = window.setTimeout(() => setMessage(null), ms)
    },
    [ms],
  )
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return [message, notify] as const
}
