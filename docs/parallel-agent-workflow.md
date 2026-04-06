# Parallel Agent Workflow

## Purpose

This workflow lets two agents move in parallel with low collision risk:

- Agent A owns `backend E3`
- Agent B owns `frontend E2 redesign`

The goal is to keep both lanes moving without inventing contracts, mixing scopes, or creating hard-to-review pull requests.

## Why this split works

`frontend E2 redesign` is allowed to reuse the E2 backend that already exists. That lane can improve structure, UX, and UI without waiting for the new `Vehicle` and `Trailer` resources from E3.

`backend E3` builds the next operational capability for fleet management. That lane can move independently as long as it stays inside E3 scope and respects protected zones from `AGENTS.md`.

## Lane ownership

### Lane A - backend E3

Owns:

- Prisma schema changes required by E3
- NestJS modules, DTOs, services, repositories, and tests for `Vehicle` and `Trailer`
- reusable backend eligibility criteria for future offer publication

Does not own:

- E2 onboarding UX redesign
- frontend-only layout, copy, and interaction changes
- auth, payments, webhooks, roles, or anti-overbooking without explicit approval

### Lane B - frontend E2 redesign

Owns:

- visual redesign of the current E2 transporter experience
- page composition, forms, feedback states, navigation, and UX polish
- reuse of the existing E2 API contracts

Does not own:

- changing the backend contract on its own
- inventing new API fields for convenience
- E3 fleet flows unless a separate issue explicitly assigns that work

## Dependency rules

1. `frontend E2 redesign` must consume the existing E2 backend contract as-is.
2. If frontend needs more backend data, create a separate support issue instead of changing the contract inside the UI issue.
3. `backend E3` can add new shared schemas only when they belong to E3 scope.
4. If both lanes would touch `@logistica/shared`, split the work so one issue lands first and the second lane rebases after merge.
5. No lane may touch protected zones from `AGENTS.md` without explicit approval.

## Issue design

Every issue used by an agent should include:

- a single lane owner
- a concrete objective
- acceptance criteria
- explicit non-goals
- dependency notes when the issue is blocked by another lane

Recommended labels:

- `lane:backend-e3`
- `lane:frontend-e2-redesign`
- `needs-api-contract`
- `blocked`
- `ready`

## Branch naming

Use one branch per issue.

Format:

```bash
feature/<issue-number>-<lane>-<slug>
fix/<issue-number>-<lane>-<slug>
docs/<issue-number>-<lane>-<slug>
```

Examples:

```bash
feature/123-backend-e3-implementar-alta-de-vehicle
feature/124-frontend-e2-redesign-redisenar-onboarding-transporter
fix/125-frontend-e2-redesign-corregir-estado-de-carga
```

Helper command:

```bash
pnpm agent:branch --lane backend-e3 --issue-number 123 --issue-title "Implementar alta de vehicle"
```

## Pull request standard

Each issue produces exactly one PR unless the issue is split before implementation.

The PR must include:

- `Closes #<issue-number>`
- lane owner
- what changed
- acceptance criteria checklist copied from the issue
- validation evidence
- risks
- screenshots when UI changes

Helper command:

```bash
pnpm agent:pr --lane frontend-e2-redesign --issue-number 124 --issue-title "Redisenar onboarding transporter"
```

Optional repeated flags:

```bash
--acceptance "El transportista entiende el estado actual"
--acceptance "La UI usa la API existente"
--test "pnpm --filter @logistica/web test"
--risk "Pendiente validar copy final con negocio"
--notes "No cambia contrato backend"
```

## Agent lifecycle for each issue

1. Sync from `develop`.
2. Create a branch from updated `develop`.
3. Implement only the assigned issue scope.
4. Run the relevant tests and checks.
5. Push the branch.
6. Open the PR with the standard template.
7. Wait for human review and merge.
8. After the user confirms merge, return to `develop`, pull the latest changes, create the next branch, and start the next ready issue in the same lane.

## Post-merge handoff

After the user says the PR was merged, the agent should do this sequence:

```bash
git checkout develop
git fetch origin
git pull origin develop
git checkout -b <next-branch-name>
```

The next issue must be:

- in the same lane
- marked ready
- not blocked by another open issue
- not dependent on an unmerged contract change

## Collision prevention checklist

Before starting an issue, the agent should verify:

- the issue belongs to its lane
- there is no open PR already covering the same outcome
- the issue does not require a blocked backend contract
- the issue does not modify a protected zone without approval
- the issue stays small enough for a focused PR

## Suggested operating rhythm

- Backend E3 agent pulls the next ready E3 backend issue.
- Frontend E2 redesign agent pulls the next ready E2 redesign issue.
- If frontend needs a backend support change, create a new backend issue and pause only that dependency, not the whole lane.
- Merge order should follow dependencies, not agent speed.

## Example coordination

Good parallel pair:

- Backend E3: `Implementar alta de trailer con capacidad operativa`
- Frontend E2 redesign: `Redisenar pantalla de onboarding del transportista`

Bad parallel pair:

- Backend E3: `Cambiar schema compartido de perfil`
- Frontend E2 redesign: `Refactor general del mismo schema y formularios`

In the bad case, split one issue first, merge it, and let the second lane rebase before continuing.
