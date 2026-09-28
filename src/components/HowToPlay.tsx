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
          Once a player chooses which small board to play in, both players keep
          playing in that same board until it's won or drawn.
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
          <strong>Free Pass:</strong> once a small board is won or is completely
          full (drawn), it can't be played in anymore — the next player is free
          to choose any other open board to continue in.
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
