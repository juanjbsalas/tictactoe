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

  it("plays a move, switches turns, and keeps the same board active for the opponent", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Board 5 (index 4) isn't finished by a single mark, so it stays sticky for O.
    await clickCell(user, "Board 5, cell 1, empty");

    expect(
      screen.getByRole("button", { name: "Board 5, cell 1: X" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      /player o's turn\. must play in board 5\./i,
    );

    // Board 5 is now the only playable board; its cells stay enabled...
    expect(
      screen.getByRole("button", { name: "Board 5, cell 2, empty" }),
    ).toBeEnabled();
    // ...while every other board's cells are disabled.
    expect(
      screen.getByRole("button", { name: "Board 1, cell 1, empty" }),
    ).toBeDisabled();
  });

  it("does nothing when a disabled cell outside the active board is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickCell(user, "Board 5, cell 1, empty"); // board 5 stays active for O
    await user.click(
      screen.getByRole("button", { name: "Board 1, cell 1, empty" }),
    );

    // Still O's turn, still confined to board 5 — the illegal click was ignored.
    expect(screen.getByRole("status")).toHaveTextContent(
      /player o's turn\. must play in board 5\./i,
    );
    expect(
      screen.getByRole("button", { name: "Board 1, cell 1, empty" }),
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

    // Sticky-board rule: both players stay in board 1 (index 0) until it's
    // decided. X completes the top row (cells 1, 2, 3) while O fills in below.
    await clickCell(user, "Board 1, cell 1, empty"); // X
    await clickCell(user, "Board 1, cell 4, empty"); // O
    await clickCell(user, "Board 1, cell 2, empty"); // X
    await clickCell(user, "Board 1, cell 5, empty"); // O
    await clickCell(user, "Board 1, cell 3, empty"); // X completes the top row

    const wonBoard = screen.getByRole("group", { name: /board 1, won by x/i });
    const overlay = wonBoard.querySelector('[aria-hidden="true"]');
    expect(overlay).toHaveTextContent("X");

    // The board is won, so its remaining empty cells can no longer be clicked.
    const remainingCells = within(wonBoard).getAllByRole("button");
    expect(remainingCells.every((cell) => cell.hasAttribute("disabled"))).toBe(
      true,
    );

    // Board 1 is decided, so O now gets a free choice of any other open board.
    expect(screen.getByRole("status")).toHaveTextContent(
      /player o's turn\. free pass: play in any open board\./i,
    );
    expect(
      screen.getByRole("button", { name: "Board 5, cell 1, empty" }),
    ).toBeEnabled();
  });
});
