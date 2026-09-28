export type Player = "X" | "O";

export type CellValue = Player | null;

export type BoardResult = Player | "draw" | null;

/** Always exactly 9 entries, one per cell of a small board. */
export type SmallBoard = readonly CellValue[];

/** Always exactly 9 entries, one per small board on the large board. */
export type Boards = readonly SmallBoard[];

/** Always exactly 9 entries, one result per small board. */
export type BoardResults = readonly BoardResult[];

export interface GameState {
  readonly boards: Boards;
  readonly boardResults: BoardResults;
  readonly currentPlayer: Player;
  /**
   * Which small board the current player must play in. Sticky: once a board
   * is chosen, both players keep playing there until it's won or drawn.
   * `null` means any unfinished board (first move, or a free pass after the
   * active board was just decided).
   */
  readonly activeBoard: number | null;
  /** True when `activeBoard` is `null` because the board just played in was won or drawn, rather than because it is the first move of the game. */
  readonly freePass: boolean;
  readonly winner: BoardResult;
  readonly moveCount: number;
}
