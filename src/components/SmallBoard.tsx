import type { BoardResult, SmallBoard as SmallBoardType } from "../game/types";
import Cell from "./Cell";

interface SmallBoardProps {
  board: SmallBoardType;
  boardIndex: number;
  result: BoardResult;
  isPlayable: boolean;
  onCellClick: (boardIndex: number, cellIndex: number) => void;
}

export default function SmallBoard({
  board,
  boardIndex,
  result,
  isPlayable,
  onCellClick,
}: SmallBoardProps) {
  const statusLabel =
    result === "draw"
      ? "drawn"
      : result
        ? `won by ${result}`
        : isPlayable
          ? "playable now"
          : "not playable";

  return (
    <div
      role="group"
      aria-label={`Board ${boardIndex + 1}, ${statusLabel}`}
      className={`relative grid grid-cols-3 gap-1 rounded-md p-1 transition-colors sm:p-1.5 ${
        isPlayable
          ? "bg-emerald-900/40 ring-2 ring-emerald-400"
          : "bg-slate-800/80"
      }`}
    >
      {board.map((cellValue, cellIndex) => (
        <Cell
          key={cellIndex}
          value={cellValue}
          label={`Board ${boardIndex + 1}, cell ${cellIndex + 1}${
            cellValue ? `: ${cellValue}` : ", empty"
          }`}
          disabled={!isPlayable || cellValue !== null || result !== null}
          onClick={() => onCellClick(boardIndex, cellIndex)}
        />
      ))}
      {result && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center rounded-md bg-slate-900/85 text-4xl font-black sm:text-5xl ${
            result === "X"
              ? "text-player-x"
              : result === "O"
                ? "text-player-o"
                : "text-slate-400"
          }`}
        >
          {result === "draw" ? "—" : result}
        </div>
      )}
    </div>
  );
}
