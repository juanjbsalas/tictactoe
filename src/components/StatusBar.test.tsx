import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBar from "./StatusBar";
import type { GameState } from "../game/types";

function fixture(overrides: Partial<GameState>): GameState {
  return {
    boards: Array.from({ length: 9 }, () => Array(9).fill(null)),
    boardResults: Array(9).fill(null),
    currentPlayer: "X",
    activeBoard: null,
    freePass: false,
    winner: null,
    moveCount: 0,
    ...overrides,
  };
}

describe("StatusBar", () => {
  it("prompts the first move at the start of the game", () => {
    render(<StatusBar state={fixture({})} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Player X's turn. Choose any board to start.",
    );
  });

  it("names the required board once one is active", () => {
    render(<StatusBar state={fixture({ currentPlayer: "O", activeBoard: 5, moveCount: 1 })} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Player O's turn. Must play in board 6.",
    );
  });

  it("announces a free pass", () => {
    render(
      <StatusBar
        state={fixture({ currentPlayer: "X", activeBoard: null, freePass: true, moveCount: 3 })}
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Player X's turn. Free Pass: play in any open board.");
    expect(status.className).toMatch(/amber/);
  });

  it("announces a player win", () => {
    render(<StatusBar state={fixture({ winner: "O", moveCount: 20 })} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Player O wins the game!");
    expect(status.className).toMatch(/emerald/);
  });

  it("announces an overall draw", () => {
    render(<StatusBar state={fixture({ winner: "draw", moveCount: 81 })} />);
    expect(screen.getByRole("status")).toHaveTextContent("The game is a draw.");
  });
});
