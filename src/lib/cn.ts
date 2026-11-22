import clsx, { type ClassValue } from 'clsx'

/** Join class names, skipping false/null/undefined. */
export const cn = (...classes: ClassValue[]) => clsx(classes)

/** The easing curve used across the site (matches --ease-soft in index.css). */
export const EASE = [0.2, 0.7, 0.2, 1] as const
