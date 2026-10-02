# Documentation map

This directory keeps project documentation, but each file has a different job.
Use this map to avoid duplicating the same information in multiple places.

## Quick path

1. Read `README.md` for the public overview and run commands.
2. Read `docs/guia-arquitectura-y-repaso.md` to recover context and understand the system step by step.
3. Read `docs/architecture.md` for the current technical architecture.
4. Read `docs/api.md` for the current HTTP endpoint inventory.
5. Read `docs/audits/2026-05-05-system-audit.md` for the detailed historical audit.

## Source-of-truth rules

| Need | Read/update this | Do not duplicate in |
|---|---|---|
| Product vision and MVP scope | `docs/PRD.md` | `architecture.md`, `api.md` |
| Current architecture | `docs/architecture.md` | `PRD.md`, `backlog.md` |
| API endpoint inventory | `docs/api.md` | `architecture.md`, audit docs |
| Issue-generation backlog | `docs/backlog.yaml` | `docs/backlog.md` |
| Human-readable backlog narrative | `docs/backlog.md` | `README.md` |
| Workflow/governance rules | `docs/governance.md` and `AGENTS.md` | Feature docs |
| Known technical debt | `docs/TECH_DEBT.md` | PR descriptions only |
| Design system and static mockups | `docs/design/` | `README.md` |
| Historical state audit | `docs/audits/` | Current reference docs |
| Learning/onboarding recap | `docs/guia-arquitectura-y-repaso.md` | Reference docs |

## Document roles

| Document | Role |
|---|---|
| `PRD.md` | Product intent: problem, target users, MVP scope, monetization, success metrics. |
| `architecture.md` | Current technical architecture: modules, boundaries, data model, rules. |
| `api.md` | Current backend HTTP contract inventory. |
| `backlog.yaml` | Structured backlog consumed by `pnpm issues:create`. Keep machine-readable. |
| `backlog.md` | Narrative backlog for humans. Keep high-level; avoid endpoint details. |
| `governance.md` | Team/workflow rules. Keep process here, not product behavior. |
| `parallel-agent-workflow.md` | Coordination rules for parallel agent work. |
| `TECH_DEBT.md` | Known debt with reason, risk, and priority. |
| `audits/` | Historical snapshots of real system state. The newest audit wins for historical context. |
| `design/` | Visual design system and static reference mockups. |
| `guia-arquitectura-y-repaso.md` | Learning guide. It explains; it is not the canonical API or architecture reference. |

## Maintenance checklist

- [ ] Product scope changed -> update `PRD.md`.
- [ ] Module boundaries changed -> update `architecture.md`.
- [ ] Endpoint added/changed/removed -> update `api.md`.
- [ ] Backlog issue changed -> update `backlog.yaml` first.
- [ ] Workflow changed -> update `governance.md` or `AGENTS.md`.
- [ ] Debt introduced -> update `TECH_DEBT.md`.
- [ ] Visual pattern changed -> update `design/design-system.md`.

## Important rule

The code is the final source of truth when docs drift. If a document disagrees
with controllers, Prisma schema, tests, or actual behavior, fix the document in
the same PR that discovers the drift.
