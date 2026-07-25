# Contributing

Thanks for helping improve Agent Office World.

## Contribution principles

- Preserve the distinction between a deterministic visual simulation and real autonomous AI execution.
- Keep the office as one continuous isometric environment rather than converting it into a dashboard or disconnected node map.
- Do not add customer, employee, child, credential, or other sensitive data.
- Respect the separate licensing requirements of Codex Pets / Petdex sprite assets.
- Prefer focused changes with clear user or architecture value.

## Development workflow

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run typecheck
npm run build
```

## Pull request expectations

Describe:

1. the problem or experience being improved;
2. the scope of the change;
3. how the change was validated;
4. any visual, performance, accessibility, licensing, or security impact;
5. whether the change affects simulation truth or product claims.

Include screenshots or a short recording for visible UI changes.

## Asset contributions

Do not add a new sprite unless its ownership and reuse terms are understood. Application source code and sprite assets have different licensing boundaries; see `LICENSE` and `docs/codex-pets-usage.md`.
