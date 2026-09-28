import type { CellValue } from "../game/types";

interface CellProps {
  value: CellValue;
  label: string;
  disabled: boolean;
  onClick: () => void;
}

export default function Cell({ value, label, disabled, onClick }: CellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded text-lg font-black transition-colors sm:h-11 sm:w-11 sm:text-2xl ${
        value === "X"
          ? "text-player-x"
          : value === "O"
            ? "text-player-o"
            : "text-transparent"
      } ${
        disabled
          ? "cursor-not-allowed bg-slate-800/60"
          : "cursor-pointer bg-slate-800/60 hover:bg-slate-600/70"
      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400`}
    >
      {value ?? "·"}
    </button>
  );
}
