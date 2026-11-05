import { Link } from 'react-router-dom'
import { GAMES } from '../games/registry.ts'
import { loadJSON } from '../shared/storage.ts'
import './hub.css'

export default function Hub() {
  return (
    <div className="hub">
      <header className="hub-head">
        <div className="hub-logo" aria-hidden>◉</div>
        <h1>After Hours</h1>
        <p>Free mystery and horror games. No ads, no accounts. Your progress saves in your browser.</p>
      </header>
      <main className="hub-grid">
        {GAMES.map((g) => {
          const hasSave = g.status === 'playable' && !!loadJSON(`${g.slug}:save`)
          const card = (
            <>
              <div className="hub-card-art" style={{ ['--accent' as string]: g.accent }}>
                <span>{g.title}</span>
              </div>
              <div className="hub-card-body">
                <div className="hub-meta">
                  <span>{g.genre}</span>
                  <span>{g.length}</span>
                </div>
                <h2>{g.title}</h2>
                <p>{g.tagline}</p>
                <div className="hub-cta">
                  {g.status === 'playable' ? (hasSave ? 'Continue your shift →' : 'Play free →') : 'Coming soon'}
                </div>
              </div>
            </>
          )
          return g.status === 'playable' ? (
            <Link key={g.slug} to={`/play/${g.slug}`} className="hub-card">
              {card}
            </Link>
          ) : (
            <div key={g.slug} className="hub-card is-soon" aria-disabled>
              {card}
            </div>
          )
        })}
      </main>
      <footer className="hub-foot">Best with headphones, lights off.</footer>
    </div>
  )
}
