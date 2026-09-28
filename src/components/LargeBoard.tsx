import { getPlayableBoards } from "../game/gameLogic";
import type { GameState } from "../game/types";
import SmallBoard from "./SmallBoard";

interface LargeBoardProps {
  state: GameState;
  onCellClick: (boardIndex: number, cellIndex: number) => void;
}

export default function LargeBoard({ state, onCellClick }: LargeBoardProps) {
  const playableBoards = new Set(getPlayableBoards(state));

  return (
    <div
      role="group"
      aria-label="Ultimate tic-tac-toe board"
      className="grid grid-cols-3 gap-2 rounded-xl bg-slate-700 p-2 sm:gap-3 sm:p-3"
    >
      {state.boards.map((board, boardIndex) => (
        <SmallBoard
          key={boardIndex}
          board={board}
          boardIndex={boardIndex}
          result={state.boardResults[boardIndex]}
          isPlayable={playableBoards.has(boardIndex)}
          onCellClick={onCellClick}
        />
      ))}
    </div>
  );
}
