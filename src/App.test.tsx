import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

/** Clicks the cell identified by its accessible label, e.g. "Board 1, cell 1, empty". */
async function clickCell(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
) {
  await user.click(screen.getByRole("button", { name: label }));
}

describe("App", () => {
  it("renders the empty board with X to move and every cell available", () => {
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent(
      /player x's turn\. choose any board to start\./i,
    );

    const cells = screen.getAllByRole("button", {
      name: /board \d, cell \d, empty/i,
    });
    expect(cells).toHaveLength(81);
    expect(cells.every((cell) => !cell.hasAttribute("disabled"))).toBe(true);
  });

  it("plays a move, switches turns, and routes the opponent to the matching board", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Board 5 (index 4), cell 1 (index 0) -> routes O to board 1 (index 0)
    await clickCell(user, "Board 5, cell 1, empty");

    expect(
      screen.getByRole("button", { name: "Board 5, cell 1: X" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      /player o's turn\. must play in board 1\./i,
    );

    // Board 1 is now the only playable board; its cells stay enabled...
    expect(
      screen.getByRole("button", { name: "Board 1, cell 1, empty" }),
    ).toBeEnabled();
    // ...while every other board's cells are disabled.
    expect(
      screen.getByRole("button", { name: "Board 2, cell 1, empty" }),
    ).toBeDisabled();
  });

  it("does nothing when a disabled cell outside the active board is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickCell(user, "Board 5, cell 1, empty"); // routes O to board 1
    await user.click(
      screen.getByRole("button", { name: "Board 2, cell 1, empty" }),
    );

    // Still O's turn, still routed to board 1 — the illegal click was ignored.
    expect(screen.getByRole("status")).toHaveTextContent(
      /player o's turn\. must play in board 1\./i,
    );
    expect(
      screen.getByRole("button", { name: "Board 2, cell 1, empty" }),
    ).toBeInTheDocument();
  });

  it("restarts the game to its initial state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickCell(user, "Board 5, cell 1, empty");
    await user.click(screen.getByRole("button", { name: "Restart Game" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      /player x's turn\. choose any board to start\./i,
    );
    expect(
      screen.getByRole("button", { name: "Board 5, cell 1, empty" }),
    ).toBeInTheDocument();
  });

  it("wins a small board through play and locks it against further moves", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Same legal sequence verified in gameLogic.test.ts: X completes the top
    // row of board 1 (index 0) via cells 1, 2, 3 while O plays elsewhere.
    await clickCell(user, "Board 1, cell 1, empty"); // X: board0 cell0 -> routes O to board1
    await clickCell(user, "Board 1, cell 4, empty"); // O: board0 cell3 -> routes X to board4
    await clickCell(user, "Board 4, cell 6, empty"); // X: board3 cell5 -> routes O to board6
    await clickCell(user, "Board 6, cell 1, empty"); // O: board5 cell0 -> routes X to board1
    await clickCell(user, "Board 1, cell 2, empty"); // X: board0 cell1 -> routes O to board2
    await clickCell(user, "Board 2, cell 7, empty"); // O: board1 cell6 -> routes X to board7
    await clickCell(user, "Board 7, cell 5, empty"); // X: board6 cell4 -> routes O to board5
    await clickCell(user, "Board 5, cell 1, empty"); // O: board4 cell0 -> routes X to board1
    await clickCell(user, "Board 1, cell 3, empty"); // X: board0 cell2 -> completes top row

    const wonBoard = screen.getByRole("group", { name: /board 1, won by x/i });
    const overlay = wonBoard.querySelector('[aria-hidden="true"]');
    expect(overlay).toHaveTextContent("X");

    // The board is won, so its remaining empty cell can no longer be clicked.
    const remainingCells = within(wonBoard).getAllByRole("button");
    expect(remainingCells.every((cell) => cell.hasAttribute("disabled"))).toBe(
      true,
    );
  });
});
