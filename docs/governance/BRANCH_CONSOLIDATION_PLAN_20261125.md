# Plan de consolidación de ramas — Agent-Office-World (2026-11-25)

Cierre **solo local**: sin push, sin tocar ramas/tags remotos ni PRs.

## Resumen
- SHA de `main` antes: `c9ddb5f`
- SHA de `main` tras integraciones (antes de este documento): `c9ddb5f`
- `main` final = commit que añade este documento (hijo directo del anterior).
- Respaldo: `C:\Repositorios\_aloria_backups\Agent-Office-World\Agent-Office-World-all-refs-20261125.bundle` (`git bundle create --all`, verificado con `git bundle verify`). Stash: ninguno.
- Verificaciones: el repo no tiene node_modules y no se instalaron dependencias; no se ejecutaron tsc/lint/tests/build.

## Clasificación de ramas

| Clasificación | Rama | Nota |
|---|---|---|
| CLOSE | `ale-003/remediation-main (local)` | Mismo SHA que main; rama local borrada. |
| CLOSE | `integration/closure-003-Agent-Office-World (local)` | Mismo SHA que main; NO borrada: en uso por un worktree externo. |
| CLOSE | `origin/docs/public-portfolio-upgrade` | Ancestro de main; remota intacta. |
| CLOSE | `origin/audit/p2-exhaustive-agent-office-world-20261006` | 3 commits; según forense sus 2 archivos son idénticos a main. Tag creado; remota intacta. |
| RETAIN | `docs/readme-reconciliation-001` | No integrada: fusiona limpio, pero reescribe el README completo y elimina contenido existente del propietario (ver nota). No pude contrastar el README nuevo contra el código en esta fase y la regla es no perder contenido; queda a decisión del dueño (PR abierto). |
| CONSOLIDATE | `origin/policy/aloria-cf01-20261009` | Solo añade AGENTS.md; decisión de gobernanza común a varios repos pendiente. Tag creado. |
| CONSOLIDATE | `origin/program/canonical-state-20261007-wave8` | Solo añade ALORIA_PRODUCT_STATE.yaml; ídem. Tag creado. |

> El README nuevo elimina, entre otros, el resumen ejecutivo, la tabla de capacidades, la arquitectura/proyección isométrica y la sección de limitaciones de la simulación del README actual.

## Tags de archivo creados (locales)
- `archive/20261125/audit/p2-exhaustive-agent-office-world-20261006`
- `archive/20261125/docs/readme-reconciliation-001`
- `archive/20261125/policy/aloria-cf01-20261009`
- `archive/20261125/program/canonical-state-20261007-wave8`

## Ramas locales borradas
- `ale-003/remediation-main`

Ramas locales conservadas por estar en uso por worktrees externos (no se tocan worktrees ajenos): `docs/readme-reconciliation-001`, `integration/closure-003-Agent-Office-World`.

## PRs abiertos (según informe forense; sin cerrar ni comentar)
#4 (readme, no draft), #3 (policy, draft), #2 (canonical-state, draft)

## Pendiente de autorización del dueño
- Decidir sobre los PRs listados y sobre borrar ramas remotas ya fusionadas/archivadas (nada remoto fue modificado).
- Publicar (push) el main local si se desea.
- Decidir las ramas CONSOLIDATE (AGENTS.md / ALORIA_PRODUCT_STATE.yaml) como política común.
- Resolver las ramas RETAIN indicadas arriba.
