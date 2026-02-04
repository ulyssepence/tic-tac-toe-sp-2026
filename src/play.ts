import * as t from "./types"

export function createGame(): t.GameState {
  return {
      board: [
        ['Empty', 'Empty', 'Empty'],
        ['Empty', 'Empty', 'Empty'],
        ['Empty', 'Empty', 'Empty'],
      ],
      currentPlayer: 'X',
    }
}

export function canMove(state: t.GameState, coord: t.Coord): boolean {
  return getWinner(state) == null && state.board[coord[0]][coord[1]] == 'Empty'
}

export function makeMove(state: t.GameState, coord: [number, number]): t.GameState {
  const newBoard = [...state.board]
  newBoard[coord[0]][coord[1]] = state.currentPlayer
  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer == 'X' ? 'O' : 'X',
  }
}

export function getWinner(state: t.GameState): t.Winner | null {
  const players: t.Player[] = ['X',  'O']
  for (const player of players) {
    if (
      // Horizontal
      (state.board[0][0] === player && state.board[1][0] === player && state.board[2][0] === player) ||
      (state.board[0][1] === player && state.board[1][1] === player && state.board[2][1] === player) ||
      (state.board[0][2] === player && state.board[1][2] === player && state.board[2][2] === player) ||
      // Vertical
      (state.board[0][0] === player && state.board[0][1] === player && state.board[0][2] === player) ||
      (state.board[1][0] === player && state.board[1][1] === player && state.board[1][2] === player) ||
      (state.board[2][0] === player && state.board[2][1] === player && state.board[2][2] === player) ||
      // Diagonal
      (state.board[0][0] === player && state.board[1][1] === player && state.board[2][2] === player) ||
      (state.board[0][2] === player && state.board[1][1] === player && state.board[2][0] === player)
    ) {
      return player
    }
  }

  const isDraw = state.board.every((column) => column.every(cell => cell != 'Empty'))
  return isDraw ? 'Draw' : null
}
