import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * Every game is its own lazy-loaded bundle. To add a game:
 *  1. create src/games/<slug>/ with a default-exported React component
 *     (a Unity/Three.js game can be a component that mounts its own canvas or iframe)
 *  2. add an entry below.
 */
export interface GameEntry {
  slug: string
  title: string
  tagline: string
  genre: 'Mystery' | 'Horror' | 'Mystery / Horror'
  length: string
  status: 'playable' | 'coming-soon'
  accent: string
  Component?: LazyExoticComponent<ComponentType>
}

export const GAMES: GameEntry[] = [
  {
    slug: 'night-clerk',
    title: 'The Night Clerk',
    tagline:
      'Monsoon night at a highway lodge near Khandala. A guest vanished from Room 9. The police say he left. The desk computer says otherwise.',
    genre: 'Mystery / Horror',
    length: '30–45 min',
    status: 'playable',
    accent: '#3fa79a',
    Component: lazy(() => import('./night-clerk/NightClerk.tsx')),
  },
  {
    slug: 'coming-soon-1',
    title: 'Untitled Case #2',
    tagline: 'Something else is waiting after dark.',
    genre: 'Horror',
    length: 'TBA',
    status: 'coming-soon',
    accent: '#8a3b3b',
  },
  {
    slug: 'coming-soon-2',
    title: 'Untitled Case #3',
    tagline: 'Another file is still being written.',
    genre: 'Mystery',
    length: 'TBA',
    status: 'coming-soon',
    accent: '#6b5fa8',
  },
]

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug)
