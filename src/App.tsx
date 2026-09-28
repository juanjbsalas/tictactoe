import { useState } from "react";
import { createInitialState, isMoveValid, playMove } from "./game/gameLogic";
import type { GameState } from "./game/types";
import HowToPlay from "./components/HowToPlay";
import LargeBoard from "./components/LargeBoard";
import RestartButton from "./components/RestartButton";
import StatusBar from "./components/StatusBar";

export default function App() {
  const [state, setState] = useState<GameState>(createInitialState);

  function handleCellClick(boardIndex: number, cellIndex: number) {
    if (!isMoveValid(state, boardIndex, cellIndex)) return;
    setState(playMove(state, boardIndex, cellIndex));
  }

  function handleRestart() {
    setState(createInitialState());
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-5 px-4 py-8 text-slate-100 sm:gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ultimate Tic-Tac-Toe
        </h1>
      </header>

      <StatusBar state={state} />
      <LargeBoard state={state} onCellClick={handleCellClick} />
      <RestartButton onRestart={handleRestart} />
      <HowToPlay />
    </div>
  );
}
