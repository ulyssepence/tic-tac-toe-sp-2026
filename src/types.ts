import * as audio from "./audio"
import * as mail from "./mail"

export type Coord = [number, number]
export type Player = "X" | "O"
export type Cell = Player | 'Empty'
export type Board = Cell[][]

export type GameState = {
  board: Board;
  currentPlayer: Player;
}

export type ToServerMessage =
  | { type: 'MOVE', coord: [number, number] }
  | { type: 'GAME' }

export type ToClientMessage =
  | { type: 'GAME', game: GameState }

export type Response =
  | { type: 'SUCCESS', result: any }
  | { type: 'ERROR', error: string }
