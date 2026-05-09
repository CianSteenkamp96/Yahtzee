# Yahtzee

A web-based Yahtzee game built with React, TypeScript, and Vite. It supports local pass-and-play sessions, bot opponents, and a responsive UI with animated dice and score previews.

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

- React 19
- TypeScript
- Vite
- Zustand v5
- Framer Motion
- CSS Modules
- React Router v7
- Vitest

## How to Run

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

### Other Scripts

```bash
npm run preview
npm run lint
```

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
- Bot opponents with `easy`, `medium`, and `hard` difficulty
- Responsive layout for desktop and mobile
- Dice roll/hold animation flow
- Live score previews before committing a category

## Future Plans

- Online multiplayer
- Google sign-in
- Persistent game history
- Leaderboards
- Mobile app
