# Agent Office World

**A visual operating environment for exploring how specialized AI agents could coordinate work inside one shared organization.**

[Live portfolio demo](https://agent-office-world.vercel.app) · [Jovan Franco](https://www.jovanfranco.com)

> **Portfolio classification:** interactive concept demonstrator. The current simulation is deterministic and runs locally in the browser; it does not call an LLM, execute autonomous work, or connect to production systems.

## Executive overview

Agent Office World turns an abstract multi-agent operating model into a visible, inspectable office. Instead of presenting agents as a chat list, node graph, or static org chart, it places specialized roles inside one continuous isometric workspace where they move, meet, review, escalate, and ship simulated work.

The project demonstrates how an AI-native organization can be communicated to executives and product teams through:

- clear role specialization and operating zones;
- visible states, tasks, energy, movement, and event history;
- shared rooms for strategy, risk, QA, security, finance, and delivery;
- a deterministic simulation that is easy to inspect and explain;
- a visual foundation that could later be connected to real agent telemetry.

## What this project demonstrates

| Capability | Evidence in the demo |
| --- | --- |
| AI operating-model design | 21 specialized agents across executive, engineering, risk, finance, legal, support, and delivery roles |
| Systems visualization | One continuous 26×22 isometric office with 12 operational zones |
| State-driven UX | Agent state controls animation, location, task context, energy, and status treatment |
| Simulation architecture | Deterministic browser-side clock with live, burst, and reset operations |
| Responsible representation | Explicit separation between visual simulation and real autonomous execution |
| Product delivery | Responsive Vite/React application deployed to Vercel |

## Experience

The office includes:

- Reception
- Open Workspace
- Engineering Pods
- Strategy Room
- War Room
- QA Lab
- Research Library
- Finance Desk
- Client Success
- Break Area
- Security Desk
- Command Center Wall

Each agent has a role, current state, task, zone, energy level, visual identity, and a unique Codex Pets / Petdex sprite. Agents sit at desks, gather in collaboration rooms, move between sensible locations, and emit simulated operating events.

### Simulation controls

- **Live Mode** advances the office every few seconds.
- **Simulate 1 Hour** executes a bounded burst of state transitions.
- **Reset Day** restores the initial roster and operating state.
- Inspectors expose agent and zone details without hiding the deterministic model.

## Architecture

```text
src/
├── components/   Office world, floor, inspectors, timeline, controls
├── data/         Agents, zones, furniture, events, pet manifest
├── lib/          Simulation, isometric projection, sprite animation
├── types/        Agent and sprite contracts
├── App.tsx
└── main.tsx

public/sprites/codex-pets/<slug>/
├── pet.json
└── spritesheet.webp
```

### Key design decisions

1. **Deterministic before autonomous.** The visual operating model can be evaluated without API keys, hidden prompts, or unpredictable outputs.
2. **One shared environment.** The product represents collaboration as movement and shared context rather than isolated agent cards.
3. **State drives animation.** Agent states map to visible animation rows such as working, reviewing, waving, jumping, or failure.
4. **Depth-sorted isometric rendering.** Furniture and agents use a 2:1 projection and painter-style ordering.
5. **Explicit asset boundaries.** Application source and third-party sprites are licensed separately.

### Isometric projection

```text
screen.x = (gridX - gridY) × tileWidth / 2
screen.y = (gridX + gridY) × tileHeight / 2
```

The scene scales responsively and uses `gridX + gridY` depth ordering so agents and furniture remain visually coherent.

## Simulation truth and limitations

The current implementation is intentionally a **local mock simulation**:

- no backend;
- no external API;
- no LLM calls;
- no autonomous execution;
- no production telemetry;
- no customer or employee data.

The simulation exposes three core operations in `src/lib/simulation.ts`:

- `tick(previousState, intensity)` — advances a small number of agents and events;
- `simulateHour(previousState)` — performs a bounded sequence of steps;
- `resetDay()` — restores the initial operating state.

A future production version would require authenticated telemetry, durable event storage, authorization controls, observability, cost governance, privacy review, and fail-closed action boundaries.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Validation commands

```bash
npm run typecheck
npm run build
```

### Sprite maintenance

```bash
npm run fetch-pets
```

See [`docs/codex-pets-usage.md`](docs/codex-pets-usage.md) before changing or commercially reusing any sprite asset.

## Portfolio context

Agent Office World is part of Jovan Franco's AI-native product and systems portfolio. It is designed as evidence of product architecture, operating-model thinking, interactive visualization, and governed AI-system communication—not as proof that a live autonomous workforce is currently operating behind the interface.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution and validation expectations.

## Security

See [`SECURITY.md`](SECURITY.md). Do not publish sensitive vulnerability details in a public issue.

## License and attribution

- Application source code: MIT; see [`LICENSE`](LICENSE).
- Codex Pets / Petdex sprites: owned by their respective submitters and not covered by the application MIT license.
- Validate every sprite's individual terms before commercial use.
