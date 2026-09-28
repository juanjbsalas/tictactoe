import { describe, it, expect } from "vitest";
import {
  createInitialState,
  isMoveValid,
  playMove,
  getPlayableBoards,
  evaluateSmallBoard,
  evaluateLargeBoard,
  checkLineWinner,
} from "./gameLogic";
import type { BoardResult, CellValue, GameState } from "./types";

/** All 8 three-in-a-row index combinations shared by small and large boards. */
const WIN_LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function cells(marks: Partial<Record<number, CellValue>>): CellValue[] {
  const arr: CellValue[] = Array(9).fill(null);
  for (const [index, value] of Object.entries(marks)) {
    arr[Number(index)] = value ?? null;
  }
  return arr;
}

function results(marks: Partial<Record<number, BoardResult>>): BoardResult[] {
  const arr: BoardResult[] = Array(9).fill(null);
  for (const [index, value] of Object.entries(marks)) {
    arr[Number(index)] = value ?? null;
  }
  return arr;
}

function emptyBoards() {
  return Array.from({ length: 9 }, () => cells({}));
}

/** Builds a full GameState fixture, defaulting to the initial state's shape. */
function fixture(overrides: Partial<GameState>): GameState {
  return {
    boards: emptyBoards(),
    boardResults: results({}),
    currentPlayer: "X",
    activeBoard: null,
    freePass: false,
    winner: null,
    moveCount: 0,
    ...overrides,
  };
}

describe("checkLineWinner", () => {
  it("returns null for a board with no line filled", () => {
    expect(checkLineWinner(cells({ 0: "X", 1: "O" }))).toBeNull();
  });

  it("returns null for an all-empty board", () => {
    expect(checkLineWinner(cells({}))).toBeNull();
  });

  for (const line of WIN_LINES) {
    it(`detects X across line [${line.join(",")}]`, () => {
      expect(
        checkLineWinner(
          cells({ [line[0]]: "X", [line[1]]: "X", [line[2]]: "X" }),
        ),
      ).toBe("X");
    });

    it(`detects O across line [${line.join(",")}]`, () => {
      expect(
        checkLineWinner(
          cells({ [line[0]]: "O", [line[1]]: "O", [line[2]]: "O" }),
        ),
      ).toBe("O");
    });
  }
});

describe("evaluateSmallBoard", () => {
  it("is null while the board is still playable", () => {
    expect(evaluateSmallBoard(cells({ 0: "X", 4: "O" }))).toBeNull();
  });

  it("declares a winner as soon as a line is complete", () => {
    expect(
      evaluateSmallBoard(cells({ 0: "X", 1: "X", 2: "X", 3: "O", 4: "O" })),
    ).toBe("X");
  });

  it("declares a draw when full with no line", () => {
    // X O X / X O O / O X X — full board, no three-in-a-row for either player
    const board = cells({
      0: "X",
      1: "O",
      2: "X",
      3: "X",
      4: "O",
      5: "O",
      6: "O",
      7: "X",
      8: "X",
    });
    expect(checkLineWinner(board)).toBeNull();
    expect(evaluateSmallBoard(board)).toBe("draw");
  });
});

describe("evaluateLargeBoard", () => {
  it("is null while fewer than a full line of boards is decided", () => {
    expect(evaluateLargeBoard(results({ 0: "X", 4: "draw" }))).toBeNull();
  });

  for (const line of WIN_LINES) {
    it(`declares X the overall winner across boards [${line.join(",")}]`, () => {
      expect(
        evaluateLargeBoard(
          results({ [line[0]]: "X", [line[1]]: "X", [line[2]]: "X" }),
        ),
      ).toBe("X");
    });

    it(`declares O the overall winner across boards [${line.join(",")}]`, () => {
      expect(
        evaluateLargeBoard(
          results({ [line[0]]: "O", [line[1]]: "O", [line[2]]: "O" }),
        ),
      ).toBe("O");
    });
  }

  it("declares an overall draw when every board is decided with no line", () => {
    const decided = results({
      0: "X",
      1: "O",
      2: "X",
      3: "X",
      4: "O",
      5: "O",
      6: "O",
      7: "X",
      8: "X",
    });
    expect(evaluateLargeBoard(decided)).toBe("draw");
  });

  it("a drawn small board does not count toward a line for either player", () => {
    // Top row: X, draw, X — no winner despite two X boards in the row
    expect(
      evaluateLargeBoard(results({ 0: "X", 1: "draw", 2: "X" })),
    ).toBeNull();
  });
});

describe("createInitialState", () => {
  const state = createInitialState();

  it("has 9 empty small boards of 9 empty cells each", () => {
    expect(state.boards).toHaveLength(9);
    for (const board of state.boards) {
      expect(board).toHaveLength(9);
      expect(board.every((c) => c === null)).toBe(true);
    }
  });

  it("has no board results yet", () => {
    expect(state.boardResults).toEqual(Array(9).fill(null));
  });

  it("starts with X to move", () => {
    expect(state.currentPlayer).toBe("X");
  });

  it("allows X to play in any board", () => {
    expect(state.activeBoard).toBeNull();
    expect(state.freePass).toBe(false);
  });

  it("has no winner and zero moves played", () => {
    expect(state.winner).toBeNull();
    expect(state.moveCount).toBe(0);
  });
});

describe("getPlayableBoards", () => {
  it("returns all 9 boards at the start of the game", () => {
    expect(getPlayableBoards(createInitialState())).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("returns only the active board when one is set", () => {
    const state = fixture({ activeBoard: 4 });
    expect(getPlayableBoards(state)).toEqual([4]);
  });

  it("excludes finished boards during a free pass", () => {
    const state = fixture({
      activeBoard: null,
      boardResults: results({ 0: "X", 1: "draw" }),
    });
    expect(getPlayableBoards(state)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });

  it("returns nothing once the game is over", () => {
    const state = fixture({ winner: "X" });
    expect(getPlayableBoards(state)).toEqual([]);
  });
});

describe("isMoveValid / playMove — basic validation", () => {
  it("accepts X's first move anywhere", () => {
    const state = createInitialState();
    expect(isMoveValid(state, 4, 4)).toBe(true);
  });

  it("rejects a move onto an occupied cell", () => {
    const afterFirstMove = playMove(createInitialState(), 4, 4);
    expect(isMoveValid(afterFirstMove, 4, 4)).toBe(false);
    expect(() => playMove(afterFirstMove, 4, 4)).toThrow();
  });

  it("rejects a move into a board other than the active board", () => {
    const state = fixture({ activeBoard: 2 });
    expect(isMoveValid(state, 5, 0)).toBe(false);
    expect(() => playMove(state, 5, 0)).toThrow();
  });

  it("rejects a move into a board that has already been won", () => {
    const state = fixture({
      activeBoard: null,
      boardResults: results({ 3: "O" }),
    });
    expect(isMoveValid(state, 3, 0)).toBe(false);
  });

  it("rejects a move into a board that has already been drawn", () => {
    const state = fixture({
      activeBoard: null,
      boardResults: results({ 3: "draw" }),
    });
    expect(isMoveValid(state, 3, 0)).toBe(false);
  });

  it("accepts a legal move into the active board on an empty cell", () => {
    const state = fixture({ activeBoard: 2 });
    expect(isMoveValid(state, 2, 7)).toBe(true);
  });

  it("rejects out-of-range board or cell indexes", () => {
    const state = createInitialState();
    expect(isMoveValid(state, -1, 0)).toBe(false);
    expect(isMoveValid(state, 9, 0)).toBe(false);
    expect(isMoveValid(state, 0, -1)).toBe(false);
    expect(isMoveValid(state, 0, 9)).toBe(false);
  });
});

describe("playMove — turn switching", () => {
  it("switches the current player after every move", () => {
    let state = createInitialState();
    expect(state.currentPlayer).toBe("X");

    state = playMove(state, 4, 0);
    expect(state.currentPlayer).toBe("O");

    state = playMove(state, 4, 1); // board 4 is still open, so O must play there too
    expect(state.currentPlayer).toBe("X");
  });

  it("increments moveCount on every move", () => {
    let state = createInitialState();
    state = playMove(state, 4, 0);
    expect(state.moveCount).toBe(1);
    state = playMove(state, 4, 1);
    expect(state.moveCount).toBe(2);
  });

  it("records the mark on the played cell", () => {
    const state = playMove(createInitialState(), 4, 0);
    expect(state.boards[4][0]).toBe("X");
  });
});

describe("playMove — sticky board routing", () => {
  for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
    it(`stays active on board 4 after playing cell ${cellIndex}, since the board isn't finished`, () => {
      // Only one mark goes down, so board 4 can never be decided by this
      // move alone — whichever cell is chosen, the board stays sticky.
      const state = playMove(createInitialState(), 4, cellIndex);
      expect(state.activeBoard).toBe(4);
      expect(state.freePass).toBe(false);
    });
  }

  it("keeps the same board active across several moves while it remains open", () => {
    let state = fixture({ activeBoard: 2 });
    state = playMove(state, 2, 0);
    expect(state.activeBoard).toBe(2);
    state = playMove(state, 2, 4);
    expect(state.activeBoard).toBe(2);
  });

  it("releases the board to a free choice once the move just played wins it", () => {
    const state = fixture({
      activeBoard: 0,
      boards: (() => {
        const boards = emptyBoards();
        boards[0] = cells({ 0: "X", 1: "X", 3: "O", 4: "O" });
        return boards;
      })(),
    });
    const next = playMove(state, 0, 2); // X completes the top row of board 0
    expect(next.boardResults[0]).toBe("X");
    expect(next.activeBoard).toBeNull();
    expect(next.freePass).toBe(true);
  });

  it("releases the board to a free choice once the move just played draws it", () => {
    const state = fixture({
      activeBoard: 0,
      boards: (() => {
        const boards = emptyBoards();
        boards[0] = cells({
          0: "X",
          1: "O",
          2: "X",
          3: "X",
          4: "O",
          5: "O",
          6: "O",
          7: "X",
        });
        return boards;
      })(),
    });
    const next = playMove(state, 0, 8); // fills the board with no line for either player
    expect(next.boardResults[0]).toBe("draw");
    expect(next.activeBoard).toBeNull();
    expect(next.freePass).toBe(true);
  });

  it("during a free choice, any unfinished board's cells are playable", () => {
    const state = fixture({
      activeBoard: null,
      freePass: true,
      boardResults: results({ 0: "X", 1: "draw" }),
    });
    expect(isMoveValid(state, 2, 0)).toBe(true);
    expect(isMoveValid(state, 0, 0)).toBe(false); // board 0 already won
    expect(isMoveValid(state, 1, 0)).toBe(false); // board 1 already drawn
  });

  it("the very first move of the game is a free choice", () => {
    const state = createInitialState();
    expect(getPlayableBoards(state)).toHaveLength(9);
  });
});

describe("playMove — winning a small board", () => {
  it("marks the small board as won for the player completing a line", () => {
    const state = fixture({
      activeBoard: 0,
      boards: (() => {
        const boards = emptyBoards();
        boards[0] = cells({ 0: "X", 1: "X", 3: "O", 4: "O" });
        return boards;
      })(),
    });
    const next = playMove(state, 0, 2); // X completes the top row of board 0
    expect(next.boardResults[0]).toBe("X");
  });

  it("a won board can no longer be played in, even via free pass", () => {
    const state = fixture({
      activeBoard: 0,
      boards: (() => {
        const boards = emptyBoards();
        boards[0] = cells({ 0: "X", 1: "X", 3: "O", 4: "O" });
        return boards;
      })(),
    });
    const next = playMove(state, 0, 2);
    expect(isMoveValid(next, 0, 5)).toBe(false);
  });
});

describe("playMove — drawn small boards", () => {
  it("marks a full small board with no line as drawn", () => {
    const state = fixture({
      activeBoard: 0,
      currentPlayer: "X",
      boards: (() => {
        const boards = emptyBoards();
        // One cell short of the full no-winner board used in evaluateSmallBoard tests.
        boards[0] = cells({
          0: "X",
          1: "O",
          2: "X",
          3: "X",
          4: "O",
          5: "O",
          6: "O",
          7: "X",
        });
        return boards;
      })(),
    });
    const next = playMove(state, 0, 8);
    expect(next.boardResults[0]).toBe("draw");
  });

  it("a drawn board can no longer be played in", () => {
    const state = fixture({
      activeBoard: null,
      boardResults: results({ 4: "draw" }),
    });
    expect(isMoveValid(state, 4, 0)).toBe(false);
  });
});

describe("playMove — winning the overall game", () => {
  for (const line of WIN_LINES) {
    it(`ends the game for X completing large-board line [${line.join(",")}]`, () => {
      const [a, b] = line;
      const c = line[2];
      const state = fixture({
        activeBoard: c,
        boardResults: results({ [a]: "X", [b]: "X" }),
        boards: (() => {
          const boards = emptyBoards();
          boards[c] = cells({ 0: "X", 1: "X", 3: "O", 4: "O" });
          return boards;
        })(),
      });
      const next = playMove(state, c, 2); // X completes board c, and thus the large-board line
      expect(next.boardResults[c]).toBe("X");
      expect(next.winner).toBe("X");
    });
  }

  it("stops routing once the game has been won", () => {
    const state = fixture({
      activeBoard: 8,
      boardResults: results({ 0: "X", 4: "X" }),
      boards: (() => {
        const boards = emptyBoards();
        boards[8] = cells({ 0: "X", 1: "X", 3: "O", 4: "O" });
        return boards;
      })(),
    });
    const next = playMove(state, 8, 2);
    expect(next.winner).toBe("X");
    expect(next.activeBoard).toBeNull();
  });
});

describe("playMove — overall draw", () => {
  it("declares an overall draw when every board is decided with no large-board line", () => {
    const decidedResults = results({
      0: "X",
      1: "O",
      2: "X",
      3: "X",
      4: "O",
      5: "O",
      6: "O",
      7: "X",
    });
    const state = fixture({
      activeBoard: 8,
      boardResults: decidedResults,
      boards: (() => {
        const boards = emptyBoards();
        boards[8] = cells({
          0: "X",
          1: "O",
          2: "X",
          3: "X",
          4: "O",
          5: "O",
          6: "O",
          7: "X",
        });
        return boards;
      })(),
      currentPlayer: "X",
    });
    const next = playMove(state, 8, 8); // completes the last board as a draw, no line for either player
    expect(next.boardResults[8]).toBe("draw");
    expect(next.winner).toBe("draw");
  });
});

describe("playMove — game over prevents further moves", () => {
  it("rejects any move once there is a winner", () => {
    const state = fixture({ winner: "X", activeBoard: 3 });
    expect(isMoveValid(state, 3, 0)).toBe(false);
    expect(() => playMove(state, 3, 0)).toThrow();
  });

  it("rejects any move once the game is a draw", () => {
    const state = fixture({ winner: "draw", activeBoard: null });
    expect(isMoveValid(state, 0, 0)).toBe(false);
    expect(() => playMove(state, 0, 0)).toThrow();
  });
});

describe("a short realistic sequence", () => {
  it("plays out sticky-board routing and turn order across a full small-board win", () => {
    let state = createInitialState();

    state = playMove(state, 4, 0); // X's free first move: board 4, cell 0
    expect(state.currentPlayer).toBe("O");
    expect(state.activeBoard).toBe(4); // board 4 not finished -> stays sticky for O

    state = playMove(state, 4, 3); // O must also play board 4
    expect(state.currentPlayer).toBe("X");
    expect(state.activeBoard).toBe(4);

    state = playMove(state, 4, 1); // X, still board 4 (top row: X _ X pending)
    expect(state.activeBoard).toBe(4);

    state = playMove(state, 4, 4); // O, still board 4
    expect(state.activeBoard).toBe(4);

    state = playMove(state, 4, 2); // X completes the top row of board 4
    expect(state.boardResults[4]).toBe("X");
    expect(state.moveCount).toBe(5);
    expect(state.winner).toBeNull(); // only one small board won so far

    // Board 4 is decided, so O gets a free choice of any other open board.
    expect(state.activeBoard).toBeNull();
    expect(state.freePass).toBe(true);
    expect(state.currentPlayer).toBe("O");

    state = playMove(state, 0, 0); // O freely chooses board 0
    expect(state.activeBoard).toBe(0); // now sticky on board 0 for X
    expect(state.freePass).toBe(false);
  });
});
