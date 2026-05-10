# Yahtzee

A web-based Yahtzee game built with React, TypeScript, and Vite. It supports local pass-and-play sessions, bot opponents, and a responsive UI with animated dice and score previews.

<p align="center"><img width="582" height="387" alt="image" src="https://github.com/user-attachments/assets/c75603b3-a5a2-4e8f-a8ab-bd81359a0fb0" /></p>

<p align="center"><img width="822" height="478" alt="image" src="https://github.com/user-attachments/assets/e2b1a48d-68a6-4612-8452-46e33d2b36a3" /></p>

<p align="center"><img width="1918" height="903" alt="image" src="https://github.com/user-attachments/assets/cd316f60-9e2e-4a48-8af6-fbe3268d588a" /></p>


## Built with AI Agents

This project was created entirely using AI agents orchestrated by GitHub Copilot in VS Code. Each agent played a specific role:

| Agent | Role | Contribution |
|-------|------|-------------|
| **Orchestrator** | Project coordinator | Broke down the full request into phased tasks, managed dependencies between phases, delegated work to specialist agents, and coordinated parallel execution |
| **Planner** | Architecture & design | Researched Yahtzee rules, designed the tech stack, defined the project structure (~60 files), planned the game engine architecture, bot AI strategy, and extensibility patterns |
| **Designer** | UI/UX design | Available for visual design tasks including color palettes, layout design, component styling, and responsive breakpoints. Informed the classic green-felt theme, dice dot patterns, and scorecard layout |
| **Coder** | Implementation | Built all code across 6 phases: project scaffolding, game engine (types, scoring, validation, state machine, bot AI), state management (Zustand stores, hooks, utilities), UI components (dice, scorecard, lobby, game, results screens), routing, service stubs, and final integration/bug fixes |

The build was executed in 6 phases with parallel task execution where possible, resulting in a fully functional app with 45 passing tests.

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework for rendering the game interface |
| **TypeScript** | Static type checking to catch bugs at compile time and improve code quality |
| **Vite** | Lightning-fast build tool and dev server with native ES module support |
| **Zustand v5** | Lightweight state management for game state, lobby setup, and app settings |
| **Framer Motion** | Declarative animation library for dice rolls, transitions, and UI effects |
| **CSS Modules** | Scoped, portable styling with CSS custom properties for a classic theme |
| **React Router v7** | Client-side routing for navigation between home, lobby, game, and results screens |
| **Vitest** | Fast unit test runner for testing game engine logic, scoring, and bot AI (45 tests passing) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (LTS recommended)
- npm (included with Node.js)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/CianSteenkamp96/Yahtzee.git
cd Yahtzee

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dev server will start and display a local URL in your terminal (typically **http://localhost:5173**). Open that URL in your browser to play the game.

> **Tip:** The app is fully responsive — it works on desktop, tablet, and mobile browsers. You can also open it on your phone by using your machine's local network IP (shown in the terminal output).

### Other Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:5173 |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | Lint the codebase (ESLint) |

## Folder Structure

`src/` is organized by game domain and UI responsibility:

```text
src/
  engine/        Core Yahtzee rules, scoring, validation, bots, and game state logic
  store/         Zustand stores for game, lobby, and settings state
  hooks/         Reusable React hooks (game flow, responsiveness, animations, score preview)
  components/    UI components by feature
    dice/        Die rendering and dice tray
    game/        Turn UI, roll controls, and in-game panels
    layout/      Shared game layout and header
    lobby/       Lobby setup screen components
    players/     Player list and badges
    results/     Final results screen components
    scorecard/   Scorecard rows and tabbed score views
    shared/      Reusable UI primitives (button, modal)
  pages/         Route-level pages (home, game, results)
  services/      API/auth/multiplayer service layer (current + future integration points)
  utils/         Generic helpers (formatting, randomness)
  styles/        Global styles, variables, and animations
```

## Game Rules

### Turn and Match Flow

- Each player rolls 5 dice.
- Up to 3 rolls are allowed per turn.
- A full game has 13 rounds (one score category per round per player).
- The game ends when every player has filled all 13 categories.
- Highest total score wins.

### Scoring Categories

| Section | Category | Rule | Points |
| --- | --- | --- | --- |
| Upper | Ones | Sum of dice showing 1 | Variable |
| Upper | Twos | Sum of dice showing 2 | Variable |
| Upper | Threes | Sum of dice showing 3 | Variable |
| Upper | Fours | Sum of dice showing 4 | Variable |
| Upper | Fives | Sum of dice showing 5 | Variable |
| Upper | Sixes | Sum of dice showing 6 | Variable |
| Lower | Three of a Kind | At least 3 equal dice; score sum of all 5 dice | Variable |
| Lower | Four of a Kind | At least 4 equal dice; score sum of all 5 dice | Variable |
| Lower | Full House | 3 of one value + 2 of another | 25 |
| Lower | Small Straight | Sequence of 4 consecutive values | 30 |
| Lower | Large Straight | Sequence of 5 consecutive values | 40 |
| Lower | Yahtzee | All 5 dice equal | 50 |
| Lower | Chance | Any combination; score sum of all 5 dice | Variable |

### Bonuses and Joker Rule

- Upper bonus: +35 when upper-section subtotal is 63 or more.
- Yahtzee bonus: +100 for each additional Yahtzee, only if the first Yahtzee was scored as 50.
- Forced Joker rule: when Yahtzee is rolled after the Yahtzee box is filled, category selection follows Joker constraints (including forced upper-category placement when applicable).

## Features

- Local pass-and-play for 2 to 6 players
- Bot opponents with `easy`, `medium`, and `hard` difficulty levels ([details below](#bot-ai))
- Two-column scorecard layout (upper section left, lower section right) - everything visible without scrolling
- All potential scores shown at a glance after each roll (no hover required)
- Dice rolling sound effects generated via the Web Audio API (no external audio files)
- Dice roll animations with Framer Motion - held dice stay completely still during rolls
- Responsive layout for desktop, tablet, and mobile
- Compact bottom bar with dice and roll button side by side

## Bot AI

The bot uses a **greedy heuristic with expected-value estimation** rather than a full game-tree search. Each bot turn follows a **decide -> act -> repeat** loop: evaluate available categories, decide whether to roll or score, and which dice to hold.

### Difficulty Levels

| Level | Scoring Strategy | Hold Strategy | Behaviour |
|---|---|---|---|
| **Easy** | Picks a **random** available category | Holds dice matching the most frequent value (simple frequency count) | No planning, no optimization. Often wastes good rolls on low-value categories |
| **Medium** | Picks the category with the **highest immediate score** | Calculates an expected score per category via `estimateExpectedScore()` and holds dice that best contribute to the top-scoring target | Greedy optimizer. Maximizes each individual turn but doesn't consider long-term strategy |
| **Hard** | Uses **weighted expected-value scoring** combining: immediate score, upper bonus progress tracking, category scarcity weighting, and Yahtzee bonus opportunism | Same expected-value targeting as Medium, but scoring picks account for remaining category count (scarcity), whether the upper bonus (>=63) is on track, and whether chasing a bonus Yahtzee is viable | Strategic. Prioritizes hard-to-fill categories when dice are close, tracks upper section progress against the 63 threshold, and adjusts weights as the game progresses |

### How Expected Value Works

The `estimateExpectedScore()` function uses heuristic multipliers based on how close the current dice are to achieving each category (e.g., frequency counts for n-of-a-kind, unique values for straights) scaled by rolls remaining. It is not a full probability calculation but a fast approximation that runs instantly on the client.

The `getBestHolds()` helper determines which dice to keep for a target category - for example, holding all dice matching the target value for upper categories, or holding the best partial straight sequence for straight categories.

## Future Plans

- Online multiplayer
- Google sign-in
- Persistent game history
- Leaderboards
- Mobile app
- Improve rolling dice sound
- Align upper and lower section rows
- General UI/UX aesthetic improvements (e.g. poor colour combinations on Setup Game page)
