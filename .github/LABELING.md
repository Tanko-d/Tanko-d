# Issue and label guide (Tanko)

This document explains how we use GitHub labels and how to write issues so contributors can ship confidently—especially during Drips / **Stellar Waves** waves.

## Program label

| Label | When to use |
| --- | --- |
| **Stellar Waves** | Any issue that counts toward the Drips / Stellar Waves program for this repo. Wave contributors should filter by this label. |

## Area labels (required for most engineering issues)

Pick every area that materially applies. If work spans layers, use multiple labels.

| Label | Scope |
| --- | --- |
| **area: frontend** | Next.js (App Router), React components, Tailwind/shadcn UI, Freighter wallet UX, client-side data fetching. |
| **area: backend** | Express routes/controllers, Prisma, services, validation middleware, server-side Stellar helpers. |
| **area: blockchain** | Stellar testnet/mainnet flows, Trustless Work escrow integration, Horizon/XDR concerns, on-chain verification steps. |
| **area: contracts** | Soroban contracts in `contracts/` (e.g. `tanko-registry`), Rust, deployment and invocation from tooling or docs. |
| **area: devops** | GitHub Actions, build pipelines, deployment, Docker/hosting, secrets management, production env matrix. |
| **area: docs** | README, runbooks, API documentation, architecture notes for contributors. |

## Optional GitHub defaults

Use when they add signal:

- **bug** — regression or incorrect behavior.
- **enhancement** — net-new capability or meaningful improvement.
- **good first issue** — small scope, clear acceptance criteria, safe for newcomers.
- **documentation** — doc-only change (often overlaps **area: docs**).

## Issue quality checklist

1. **Impact** — Why does this matter for fleet managers or drivers?
2. **Context** — Background, constraints, and links (Stellar testnet, Trustless Work, Figma if any).
3. **Scope** — Completable in one wave; split if it spans unrelated deliverables.
4. **Pointers** — Key files, modules, and edge cases (wallet disconnected, API 5xx, empty DB).
5. **Done means** — Bullet acceptance criteria and how to validate (commands, screenshots, testnet explorer).
6. **Drips complexity** — State complexity in the issue body (Trivial / Medium / High and points) so rewards stay fair.

## Milestones

Milestones group roadmap themes (infrastructure, escrow, frontend polish, Soroban, QA). Prefer **one primary milestone** per issue; use the description to clarify ordering if needed.

## Pull requests

- Reference the issue: `Closes #123` when applicable.
- Keep the PR scoped to a single issue when possible.
- Note test evidence (commands run, screenshots for UI, explorer links for on-chain steps).

## Issue template (copy into new issues)

**Summary** — Problem and who benefits (fleet manager / driver / maintainer).

**Area** — Check all that apply: `area: frontend`, `area: backend`, `area: blockchain`, `area: contracts`, `area: devops`, `area: docs`.

**Context** — Background, links (Stellar, Trustless Work), constraints.

**Scope** — In scope / out of scope.

**Implementation notes** — Key files, APIs, edge cases, security/performance.

**Acceptance criteria** — Checkbox list of “done”.

**Validation** — Commands, screenshots, explorer links.

**Drips complexity** — Trivial (100), Medium (150), or High (200) with a one-line justification.
