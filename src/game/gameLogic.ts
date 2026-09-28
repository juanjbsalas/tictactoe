import type {
  BoardResult,
  BoardResults,
  Boards,
  CellValue,
  GameState,
  Player,
  SmallBoard,
} from "./types";

export const WIN_LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** Returns the player who completes a three-in-a-row across `cells`, or null. */
export function checkLineWinner(
  cells: readonly (CellValue | BoardResult)[],
): Player | null {
  for (const [a, b, c] of WIN_LINES) {
    const mark = cells[a];
    if (mark && mark !== "draw" && mark === cells[b] && mark === cells[c]) {
      return mark;
    }
  }
  return null;
}

/** Evaluates a single small board: a winner, a draw once full, or null while still playable. */
export function evaluateSmallBoard(board: SmallBoard): BoardResult {
  const winner = checkLineWinner(board);
  if (winner) return winner;
  return board.every((cell) => cell !== null) ? "draw" : null;
}

/** Evaluates the large board from the nine small-board results. */
export function evaluateLargeBoard(boardResults: BoardResults): BoardResult {
  const winner = checkLineWinner(boardResults);
  if (winner) return winner;
  return boardResults.every((result) => result !== null) ? "draw" : null;
}

export function createInitialState(): GameState {
  return {
    boards: Array.from({ length: 9 }, () => Array<CellValue>(9).fill(null)),
    boardResults: Array<BoardResult>(9).fill(null),
    currentPlayer: "X",
    activeBoard: null,
    freePass: false,
    winner: null,
    moveCount: 0,
  };
}

/** The boards a player may currently choose a cell in. Empty once the game is over. */
export function getPlayableBoards(state: GameState): number[] {
  if (state.winner) return [];
  if (state.activeBoard !== null) return [state.activeBoard];
  return state.boardResults
    .map((result, index) => (result === null ? index : -1))
    .filter((index) => index !== -1);
}

export function isMoveValid(
  state: GameState,
  boardIndex: number,
  cellIndex: number,
): boolean {
  if (state.winner) return false;
  if (boardIndex < 0 || boardIndex > 8 || cellIndex < 0 || cellIndex > 8) {
    return false;
  }
  if (state.boardResults[boardIndex] !== null) return false;
  if (state.boards[boardIndex][cellIndex] !== null) return false;
  if (state.activeBoard !== null && state.activeBoard !== boardIndex) {
    return false;
  }
  return true;
}

/** Applies a move and returns the resulting state. Throws if the move is not legal. */
export function playMove(
  state: GameState,
  boardIndex: number,
  cellIndex: number,
): GameState {
  if (!isMoveValid(state, boardIndex, cellIndex)) {
    throw new Error(`Invalid move: board ${boardIndex}, cell ${cellIndex}`);
  }

  const player = state.currentPlayer;

  const boards: Boards = state.boards.map((board, i) =>
    i === boardIndex
      ? board.map((cell, j) => (j === cellIndex ? player : cell))
      : board,
  );

  const boardResults: BoardResults = state.boardResults.map((result, i) =>
    i === boardIndex ? evaluateSmallBoard(boards[boardIndex]) : result,
  );

  const winner = evaluateLargeBoard(boardResults);
  // Sticky-board rule: the board just played in stays active for the next
  // player unless that move just decided it (won or drawn), in which case
  // the next player is free to choose any other open board.
  const playedBoardFinished = boardResults[boardIndex] !== null;
  const freePass = !winner && playedBoardFinished;

  return {
    boards,
    boardResults,
    currentPlayer: player === "X" ? "O" : "X",
    activeBoard: winner ? null : freePass ? null : boardIndex,
    freePass,
    winner,
    moveCount: state.moveCount + 1,
  };
}
