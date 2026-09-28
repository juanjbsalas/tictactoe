import type { GameState } from "../game/types";

interface StatusBarProps {
  state: GameState;
}

function getStatusMessage(state: GameState): string {
  const { winner, currentPlayer, activeBoard, freePass, moveCount } = state;

  if (winner === "X" || winner === "O") {
    return `Player ${winner} wins the game!`;
  }
  if (winner === "draw") {
    return "The game is a draw.";
  }
  if (moveCount === 0) {
    return `Player ${currentPlayer}'s turn. Choose any board to start.`;
  }
  if (freePass) {
    return `Player ${currentPlayer}'s turn. Free Pass: play in any open board.`;
  }
  if (activeBoard !== null) {
    return `Player ${currentPlayer}'s turn. Must play in board ${activeBoard + 1}.`;
  }
  return `Player ${currentPlayer}'s turn.`;
}

export default function StatusBar({ state }: StatusBarProps) {
  const isGameOver = state.winner !== null;
  const message = getStatusMessage(state);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full max-w-xl rounded-lg border px-4 py-3 text-center text-base font-medium sm:text-lg ${
        isGameOver
          ? "border-emerald-400 bg-emerald-900/40 text-emerald-200"
          : state.freePass
            ? "border-amber-400 bg-amber-900/30 text-amber-200"
            : "border-slate-600 bg-slate-800/60 text-slate-100"
      }`}
    >
      {message}
    </div>
  );
}
