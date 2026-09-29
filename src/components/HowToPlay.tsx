export default function HowToPlay() {
  return (
    <details className="w-full max-w-xl rounded-lg border border-slate-600 bg-slate-800/60 p-4 text-slate-200">
      <summary className="cursor-pointer font-semibold text-slate-100">
        How to Play
      </summary>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed sm:text-base">
        <li>
          The board is nine small tic-tac-toe boards arranged in a 3×3 grid. X
          always moves first and may play in any cell of any board.
        </li>
        <li>
          Wherever you play within a small board sends your opponent to the
          matching small board. For example, playing in the top-right cell sends
          your opponent to the top-right board.
        </li>
        <li>
          Get three marks in a row in a small board to win it. A won board
          counts as your mark on the large board.
        </li>
        <li>
          Win three small boards in a row, horizontally, vertically, or
          diagonally, on the large board to win the game.
        </li>
        <li>
          <strong>Free Pass:</strong> if you're sent to a board that's already
          been won or is full, you may play in any cell of any board that's
          still open.
        </li>
        <li>
          If a small board fills up with no winner, it's drawn and can't be
          played in again. If every board is decided and no one has three in a
          row on the large board, the game ends in a draw.
        </li>
      </ol>
    </details>
  );
}
