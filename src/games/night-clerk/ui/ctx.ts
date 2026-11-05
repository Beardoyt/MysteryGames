import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { Action, GameState } from '../state.ts'
import type { AppId } from '../data/clues.ts'

export interface GameCtx {
  s: GameState
  dispatch: Dispatch<Action>
  /** try to pin a clue; handles "already pinned" / "not yet" feedback */
  pin: (clue: number) => void
  status: (msg: string) => void
  sfx: (id: string) => void
  open: (app: AppId) => void
}

export const Ctx = createContext<GameCtx>(null as unknown as GameCtx)
export const useGame = () => useContext(Ctx)
