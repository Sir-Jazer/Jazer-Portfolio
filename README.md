# Jazer Sanil · Portfolio

A single-page developer portfolio. Clean, fast, and built with the tools teams use today.

## Tech

| Tool | What it does here |
| --- | --- |
| **React 19 + TypeScript** | Every section is a typed component |
| **Tailwind CSS v4** | All styling, with design tokens set up in `src/index.css` |
| **Motion** (formerly Framer Motion) | Demo video open/close, thumbnail animations |
| **Vite** | Dev server and production build |
| **Lucide** | Icons |

The look is deliberately minimal: white and black, one signal-orange accent, numbered
sections, and one bold sans (Inter Tight) with Geist Mono for small technical details.

## Run it

You need Node.js 20 or newer.

```bash
npm install      # once
npm run dev      # start at http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
```

## Where things are

```
src/
  data/content.tsx     <- ALL the words, links, projects and timeline rows. Edit here first.
  index.css            <- colours, fonts, and a few custom Tailwind utilities
  App.tsx              <- the order of the sections
  hooks/index.ts       <- live clock, toast
  components/
    Header.tsx         <- name + Work / About / Contact
    Hero.tsx           <- headline, square photo, intro, status readout
    Layout.tsx         <- Row (numbered section) and Entries (year-first timeline list)
    Work.tsx           <- project cards: pitch, stack, live link, demo video
    Scenes.tsx         <- the three thumbnail illustrations (stand-ins for screenshots)
    Sections.tsx       <- Experience, Education, Recognition, Stack, About, Contact, Footer
    DraftTracker.tsx   <- the "Draft · N to fill" checklist
    Ph.tsx             <- placeholder helper
```

## Mini Jazer

Point at the photo and a pixel-art mini Jazer pops up over its top edge. Click him to throw him
onto the page. After that he:

- walks along lines of text, climbs and hops between them, and sits on the photo and thumbnails
- does a random pair of tricks when clicked; click five times quickly and he faints
- can be dragged by his belt and thrown; he swings as you move him
- follows when you scroll away, climbing line by line, faster the further behind he is
- walks back and drops into the photo when you click the photo again

```
src/buddy/
  sprites.ts    <- the pixel art: every frame as text, one character per pixel
  engine.ts     <- movement, physics, tricks, dragging (plain DOM, no React)
  platforms.ts  <- finds every line of text on the page to stand on
  store.ts      <- lets the photo and the character talk to each other
src/components/Buddy.tsx   <- mounts the engine; SpriteCanvas for the peek
```

Speech-bubble lines are in `LINES` at the top of `engine.ts`. Add `data-buddy-perch="name"` to any
element to make its top edge a place he can stand.

## Filling in your details

Everything you still need to supply is marked with a dotted underline on the page.
Click **Draft** (bottom right) to see the full list and jump to each one.

1. **Links and photo**: open `src/data/content.tsx` and fill in the `profile` object
   (`email`, `linkedin`, `resume`, `portrait`). Those placeholders then disappear by themselves.
   Put files such as `resume.pdf` or `portrait.jpg` in `public/` and reference them as `/resume.pdf`.
2. **Text**: search the same file for `<Ph`. Replace each one with plain text.

   ```tsx
   // before
   body: <Ph need="Church system: number of branches">several</Ph>
   // after
   body: 'four'
   ```
3. **Project links**: each project has `links: [{ label, need, href: null }]`. Set `href` to the URL.
4. **Done?** Set `DRAFT_MODE = false` at the top of `content.tsx` to remove the Draft button.

To use a real screenshot, pass `src` to `<Thumb>` in `src/components/Work.tsx`,
for example `<Thumb id={p.id} replay={replay} src="/epermit.png" />` with the image in `public/`.

## Changing the look

- **Colours**: the `:root` block at the top of `src/index.css`. Change `--accent` (marks, large text)
  and `--accent-text` (its darker, readable-at-small-size shade) together. Keep the two dark blocks in sync.
- **Fonts**: the Google Fonts link in `index.html` and the `--font-*` values in `src/index.css`.

## Deploy (Vercel)

1. Push this folder to a GitHub repo.
2. In Vercel, choose **Add New > Project** and import the repo.
3. Vercel detects Vite. Keep the defaults (`npm run build`, output `dist`) and deploy.

`npm run build:single` makes one self-contained HTML file in `dist-single/`, useful for sending a preview.
