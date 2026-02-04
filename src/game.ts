export type Coord = [number, number]

export type Player = "X" | "O"

export type Cell = Player | 'Empty'

export type Board = Cell[][]

export type State = {
  board: Board;
  currentPlayer: Player;
};

export function createGame(): State {
  return {
    board: [
      ['Empty', 'Empty', 'Empty'],
      ['Empty', 'Empty', 'Empty'],
      ['Empty', 'Empty', 'Empty'],
    ],
    currentPlayer: 'X',
  };
}

export function canMove(state: State, coord: Coord): boolean {
  return getWinner(state) == null && state.board[coord[0]][coord[1]] == 'Empty'
}

export function makeMove(state: State, coord: [number, number]): State {
  const newBoard = [...state.board]
  newBoard[coord[0]][coord[1]] = state.currentPlayer
  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer == 'X' ? 'O' : 'X'
  }
}

export function getWinner(state: State): Player | null {
  const players: Player[] = ['X',  'O']
  for (const player of players) {
    if (
      // Horizontal
      (state.board[0][0] === player && state.board[0][1] === player && state.board[0][2] === player) ||
      (state.board[1][0] === player && state.board[1][1] === player && state.board[1][2] === player) ||
      (state.board[2][0] === player && state.board[2][1] === player && state.board[2][2] === player) ||
      // Vertical
      (state.board[0][0] === player && state.board[1][0] === player && state.board[2][0] === player) ||
      (state.board[0][1] === player && state.board[1][2] === player && state.board[2][1] === player) ||
      (state.board[0][2] === player && state.board[1][1] === player && state.board[2][2] === player) ||
      // Diagonal
      (state.board[0][0] === player && state.board[1][1] === player && state.board[2][2] === player) ||
      (state.board[0][2] === player && state.board[1][1] === player && state.board[2][0] === player)
    ) {
      return player
    }
  }

  return null
}

export type Response =
  | { type: 'SUCCESS', result: any }
  | { type: 'ERROR', error: string }
