import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Apply a saved light/dark choice before the first paint.
try {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved
} catch {
  /* storage can be blocked; the system theme still applies */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
