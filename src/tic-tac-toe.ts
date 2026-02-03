export type Player = "X" | "O";

export type Cell = Player | null;

// Board is a 3x3 grid, represented as a 9-element array.
// Indices map to positions:
//  0 | 1 | 2
//  ---------
//  3 | 4 | 5
//  ---------
//  6 | 7 | 8
export type Board = Cell[]

export type GameState = {
  board: Board;
  currentPlayer: Player;
};

export function createGame(): GameState {
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: "X",
  };
}

export function makeMove(state: GameState, position: number): GameState {
  if (getWinner(state) != null) {
    throw new Error("Game is already over")
  } else if (typeof position !== 'number' || Math.floor(position) !== position) {
    throw new Error("Position must be an integer")
  } else if (position < 0 || 8 < position) {
    throw new Error("Position must be between 0 and 8")
  } else if (state.board[position] != null) {
    throw new Error("Position is already occupied")
  }

  const newBoard = [...state.board]
  newBoard[position] = state.currentPlayer
  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer == 'X' ? 'O' : 'X'
  }
}

export function getWinner(state: GameState): Player | null {
  const players: Player[] = ['X',  'O']
  for (const player of players) {
    if (
      // Horizontal
      (state.board[0] === player && state.board[1] === player && state.board[2] === player) ||
      (state.board[3] === player && state.board[4] === player && state.board[5] === player) ||
      (state.board[6] === player && state.board[7] === player && state.board[8] === player) ||
      // Vertical
      (state.board[0] === player && state.board[3] === player && state.board[6] === player) ||
      (state.board[1] === player && state.board[4] === player && state.board[7] === player) ||
      (state.board[2] === player && state.board[5] === player && state.board[8] === player) ||
      // Diagonal
      (state.board[0] === player && state.board[4] === player && state.board[8] === player) ||
      (state.board[2] === player && state.board[4] === player && state.board[6] === player)
    ) {
      return player
    }
  }

  return null
}
