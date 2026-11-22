import type { ReactNode } from 'react'

/* ==================================================================
   ALL OF THE SITE'S WORDS LIVE IN THIS FILE.
   Edit here and every section updates. Anything wrapped in <Ph> is a
   placeholder you still need to replace.
=================================================================== */

/** Shows the "Draft" checklist button. Set to false before you go live. */
export const DRAFT_MODE = false

export const profile = {
  name: 'Jazer Sanil',
  fullName: 'Jazer D. Sanil',
  city: 'San Jose City',
  timeZone: 'Asia/Manila',
  github: 'https://github.com/Sir-Jazer',
  // Fill these in and their placeholders disappear on their own.
  email: 'saniljazer@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jazer-sanil' as string | null,
  resume: null as string | null, // e.g. '/resume.pdf' (put the file in /public)
  portrait: '/portrait.jpg' as string | null, // put the file in /public
}

/* ---------------------------- Projects ---------------------------- */

export type ProjectId = 'epermit' | 'church' | 'gymspot' | 'tubig'

export interface Project {
  id: ProjectId
  name: string
  /** Short name used in the draft checklist. */
  short: string
  /** Small grey tag beside the name. */
  tag: string
  /** Logo (file in /public) shown in the thumbnail. */
  logo?: string
  /** Optional version of the logo for the dark theme (e.g. light text instead of dark). */
  logoDark?: string
  /** One or two sentences: what it is and who it is for. */
  pitch: string
  /** Tech stack, comma separated. Each name shows as a logo (see StackIcons.tsx). */
  stack: string
  /** Live site URL. null shows a placeholder while drafting and hides the link once live. */
  live: string | null
  /** Shown instead of the live link while the project isn't deployed yet. */
  liveNote?: string
  /** Demo video in /public/demos (e.g. '/demos/tubig.mp4'). null = no demo, so the button is hidden. */
  video: string | null
}

export const projects: Project[] = [
  {
    id: 'epermit',
    name: 'E-Permit',
    short: 'E-Permit',
    tag: 'Thesis',
    logo: '/sti-logo.png',
    pitch:
      'Replaces paper exam permits at STI College San Jose: the cashier issues QR-code permits that students carry on their phones and proctors scan at the exam room door. Staff also plan exam schedules in it.',
    stack: 'Laravel, MySQL, Alpine.js, Tailwind CSS',
    live: null,
    liveNote: 'Deploying soon, after QA and security testing',
    video: '/demos/epermit.mp4',
  },
  {
    id: 'church',
    name: 'Shepherd Jubilee Church Financial Transparency and Management System',
    short: 'Church system',
    tag: 'Client',
    logo: '/church-logo.png',
    pitch:
      'Each branch of Shepherd Jubilee Church Inc. logs its offerings and tithes, and the main branch sees every branch’s totals in one place.',
    stack: 'Next.js, TypeScript, Supabase, Vercel',
    live: 'https://app.shepherdjubillee.org',
    video: null,
  },
  {
    id: 'gymspot',
    name: 'Gymspot System',
    short: 'Gymspot',
    tag: 'In progress',
    logo: '/gymspot-logo.png',
    pitch:
      'Replaces a local gym’s paper attendance and membership log, so the owner sees every payment and check-in the front desk records in one place.',
    stack: 'Next.js, Tailwind CSS, Supabase, Cloudflare Workers',
    live: 'https://gymspot-system.saniljazer.workers.dev',
    video: null,
  },
  {
    id: 'tubig',
    name: 'Tubig-Go',
    short: 'Tubig-Go',
    tag: 'In progress',
    logo: '/tubig-logo.png',
    logoDark: '/tubig-logo-dark.png',
    pitch:
      'A map of water refilling stations with delivery ordering for households. It started with interviews: 10 households and the station owners who serve them.',
    stack: 'React Native, Expo, Firebase',
    live: 'https://tubig-go.vercel.app',
    video: '/demos/tubig.mp4',
  },
]

/* ------------------------- Timeline rows -------------------------- */
// Experience, Education and Recognition all use this shape.

export interface Entry {
  org: ReactNode
  when: ReactNode
  role: ReactNode
  summary?: ReactNode
  stack?: string
  /** Small logo (file in /public) shown beside the name. */
  logo?: string
}

export const experience: Entry[] = [
  {
    org: 'Gymspot Wellness and Fitness',
    when: '2026 → now',
    role: 'Developer, team of 3',
    summary: 'Replacing the gym’s paper attendance and membership log with a system the owner and front desk share.',
    stack: 'Next.js, Supabase, Cloudflare Workers',
  },
  {
    org: 'Tubig-Go',
    when: '2026 → now',
    role: 'Founder',
    summary: 'Water refilling stations on one map, with delivery for households. Interviews first, code second.',
    stack: 'React Native, Expo, Firebase, customer research',
  },
  {
    org: 'Shepherd Jubilee Church Inc.',
    when: '2026',
    role: 'Sole developer',
    summary: 'Built the system its branches use to log offerings and tithes for the main branch.',
    stack: 'Next.js, TypeScript, Supabase, Vercel',
  },
  {
    org: 'STI College San Jose',
    when: '2026',
    role: 'Thesis lead developer',
    summary: 'E-Permit: QR exam permits for 800+ students, released once the cashier clears a balance.',
    stack: 'Laravel, MySQL, Alpine.js, Tailwind CSS',
  },
]

export const education: Entry[] = [
  {
    org: 'STI College San Jose',
    logo: '/sti-logo.png',
    when: '2023 → 2027',
    role: 'BS Computer Science',
    summary: 'Expected to graduate in 2027.',
  },
]

export const recognition: Entry[] = [
  {
    org: 'Tagisan ng Talino, STI College San Jose',
    when: '2026',
    role: 'Two-time champion, Speech Competition',
  },
  {
    org: 'Cyber Threat Management',
    when: 'Nov 2025',
    role: 'DICT–ITU DTC Initiative',
  },
  {
    org: 'Digital Safety and Security Awareness',
    when: 'Sep 2025',
    role: 'Cisco Networking Academy',
  },
]

/* ------------------------------ Stack ----------------------------- */

export const stack: { label: string; items: string }[] = [
  { label: 'Languages', items: 'TypeScript, JavaScript, PHP, C#, Java, Python' },
  { label: 'Frameworks', items: 'Next.js, React, React Native, Laravel, ASP.NET, Tailwind CSS' },
  { label: 'Data', items: 'PostgreSQL, Supabase, MySQL, Firebase' },
  { label: 'Cloud', items: 'DigitalOcean, Laravel Cloud, Microsoft Azure, Cloudflare, Vercel' },
  { label: 'AI tools', items: 'ChatGPT Codex, Claude Code, GitHub Copilot, Windsurf, Higgsfield AI' },
]
