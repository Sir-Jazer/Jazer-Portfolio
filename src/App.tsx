import { useCallback, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Buddy } from './components/Buddy'
import { DraftTracker } from './components/DraftTracker'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About, Contact, Education, Experience, Footer, Recognition, Stack } from './components/Sections'
import { Work } from './components/Work'
import { DRAFT_MODE, profile, type ProjectId } from './data/content'
import { useToast } from './hooks'

/** The email copied until a real one is set in content.tsx. */
const EMAIL_FALLBACK = 'your.email@example.com'

export default function App() {
  const [openProject, setOpenProject] = useState<ProjectId | null>(null)
  const [draftOpen, setDraftOpen] = useState(false)
  const [toast, notify] = useToast()

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email ?? EMAIL_FALLBACK)
      notify('Email copied')
      return true
    } catch {
      notify('Could not copy. Select the address instead.')
      return false
    }
  }, [notify])

  return (
    // reducedMotion="user": Motion drops movement for visitors who ask for less of it.
    <MotionConfig reducedMotion="user">
      <Header />
      <main id="top">
        <Hero />
        <Work openId={openProject} onOpenChange={setOpenProject} />
        <Experience />
        <Education />
        <Recognition />
        <Stack />
        <About />
        <Contact onCopyEmail={copyEmail} />
      </main>
      <Footer />
      <Buddy />

      {DRAFT_MODE && <DraftTracker open={draftOpen} onOpenChange={setDraftOpen} onRevealProject={setOpenProject} />}

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            data-buddy-ignore
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{ bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
            className="fixed left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-4.5 py-2.5 text-[.88rem] leading-tight font-medium whitespace-nowrap text-bg [box-shadow:0_12px_30px_-12px_var(--shade)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
