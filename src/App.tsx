import { Suspense } from 'react'
import { HashRouter, Route, Routes, useParams, Link } from 'react-router-dom'
import Hub from './hub/Hub.tsx'
import { getGame } from './games/registry.ts'

function GameRoute() {
  const { slug } = useParams()
  const game = slug ? getGame(slug) : undefined
  if (!game || !game.Component) {
    return (
      <div className="notfound">
        <p>That door is locked.</p>
        <Link to="/">Back to the games</Link>
      </div>
    )
  }
  const Game = game.Component
  return (
    <Suspense fallback={<div className="loading">Loading {game.title}…</div>}>
      <Game />
    </Suspense>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/play/:slug" element={<GameRoute />} />
        <Route path="*" element={<Hub />} />
      </Routes>
    </HashRouter>
  )
}
