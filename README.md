# Steroids Tic-Tac-Toe

A web implementation of Tic-Tac-Toe: nine 3×3 boards arranged in a 3×3 grid.

> **Note on scope:** given the small scale of this project, I've deliberately chosen not to set up CI checks on pull/push requests, and not to maintain a `DECISIONS.md`.

## Rules

- X always moves first and may play in any cell of any board.
- Wherever you play within a small board sends your opponent to the matching small board (e.g. playing in the center cell sends them to the center board).
- Three marks in a row within a small board wins that board, which then counts as that player's mark on the large 3×3 board.
- Three small boards in a row wins the game.
- **Free Pass:** if you're sent to a board that's already been won or is completely full (drawn), you may instead play in any cell of any other open board.
- If a small board fills up with no winner, it's drawn. If every board is decided with no line on the large board, the game ends in an overall draw.

See the "How to Play" section in the app itself for the same rules in context.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) for tests
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

The game logic ([`src/game/`](src/game/)) is a pure, framework-independent module, tested in isolation from the UI components ([`src/components/`](src/components/)).

## How to run

Requires [Node.js](https://nodejs.org/) 24 and [pnpm](https://pnpm.io/) (enable via Corepack: `corepack enable`).

```bash
# Install dependencies
pnpm install

# Start the dev server (http://localhost:5173)
pnpm dev

# Run the test suite
pnpm test

# Run tests with coverage
pnpm test:cov

# Type-check
pnpm typecheck

# Lint
pnpm lint

# Build for production
pnpm build

# Preview the production build
pnpm preview
```

## Deploying to GitHub Pages

This repo builds and deploys itself automatically via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — every push to `main` runs lint, typecheck, and tests, then publishes `dist/` to GitHub Pages.

One-time setup on GitHub:

1. Push this repo to GitHub (already done: `juanjbsalas/tictactoe`).
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions** (not "Deploy from a branch").
4. Push to `main` (or go to **Actions** and manually run "Deploy to GitHub Pages").
5. Once the workflow finishes, the site is live at **https://juanjbsalas.github.io/tictactoe/**.

If you ever rename the repo, update `base` in [vite.config.ts](vite.config.ts) to match (`/new-repo-name/`), since GitHub Pages serves a project site from that subpath.

## Project structure

```
src/
  game/          # Pure game engine: types, rules, win/draw detection (fully unit-tested)
  components/    # Presentational React components
  styles/        # Tailwind entry point
  test/          # Vitest/Testing Library setup
  App.tsx        # Wires game state to the UI
```

## Author

**Juan Salas**
[jbsalas05@gmail.com](mailto:jbsalas05@gmail.com) · [salasgonzalezjj@wofford.edu](mailto:salasgonzalezjj@wofford.edu)

This project was completed as an assignment for **COSC 410 – Software Engineering** at **Wofford College**, taught by **Dr. Garrett** ([GarrettAL@wofford.edu](mailto:GarrettAL@wofford.edu)).
