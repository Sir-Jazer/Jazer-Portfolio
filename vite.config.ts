import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// npm run build         -> normal multi-file build in dist/ (deploy this to Vercel or Netlify)
// npm run build:single  -> one self-contained HTML file in dist-single/ (handy for sharing a preview)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  // Shown in the footer as "last build".
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString()) },
  build: mode === 'single' ? { outDir: 'dist-single' } : {},
}))
