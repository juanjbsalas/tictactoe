import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SmallBoard from "./SmallBoard";
import type { SmallBoard as SmallBoardType } from "../game/types";

const emptyBoard: SmallBoardType = Array(9).fill(null);

describe("SmallBoard", () => {
  it("marks a drawn board and disables its cells", () => {
    render(
      <SmallBoard
        board={emptyBoard}
        boardIndex={0}
        result="draw"
        isPlayable={false}
        onCellClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Board 1, drawn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Board 1, cell 1, empty" }),
    ).toBeDisabled();
  });

  it("labels an unfinished board that isn't currently playable", () => {
    render(
      <SmallBoard
        board={emptyBoard}
        boardIndex={2}
        result={null}
        isPlayable={false}
        onCellClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Board 3, not playable" }),
    ).toBeInTheDocument();
  });
});
