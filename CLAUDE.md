# CLAUDE.md

Working instructions for this repository. Read this file first, then the documents it links to. It does not repeat them.

## What this is

An offline checker for a frontend maintainer: load a source and one to three translated catalogs, find missing keys, lost variables and missing plural branches, see where a translated label overflows its place, compare the result with a saved baseline and export a report another engineer can reproduce. Static JavaScript modules, IndexedDB, a small Node server on `127.0.0.1`, no dependencies, synthetic parcel-tracking messages.

**Only the scaffold exists, with no product behaviour.** The repository holds the plan, the delivery tooling and the backlog in epic #1. Commands marked planned below do not work yet; those marked real (scaffold) run. Do not describe a planned thing as working, and do not claim a passing baseline: there is none.

## Sources of truth

| Topic | Document |
|---|---|
| Product scope, design, fixtures with expected values | [docs/PROJECT-PLAN.md](docs/PROJECT-PLAN.md) |
| Planned module map, freeze points, planned versus implemented | [docs/architecture.md](docs/architecture.md) |
| Backlog | Epic issue #1 and its child tickets on GitHub. The epic's table is authoritative for order, dependencies and estimates; tickets state their own owner-decision defaults. |
| Loop setup and its limits | [LOOP.md](LOOP.md), [loop-constraints.md](loop-constraints.md) |
| Project subagents, origin and local changes | [.claude/agency-agents/README.md](.claude/agency-agents/README.md) |
| Ticket workflow and the step at which each role runs | [.claude/skills/implement-ticket/SKILL.md](.claude/skills/implement-ticket/SKILL.md), section "Agent roles" below |
| How a ticket goes from the queue to a ready pull request, who may do what | "Delivery workflow" below |
| UI and copy rules, design tokens | [docs/ui-quality.md](docs/ui-quality.md), [docs/design-tokens.md](docs/design-tokens.md) |
| Decisions the owner made, with dates | [docs/owner-decisions.md](docs/owner-decisions.md) |

The plan wins for product design; the epic and tickets win for order and scope. A ticket that changes a contract fixes the plan in the same pull request.

## Stack and constraints

- Static HTML, CSS and JavaScript modules. **No npm dependency and no build step.**
- Node 22 for the static server and the test runner. The page itself runs in desktop Chrome.
- Offline: same-origin assets only, verified with external networking disabled. No external font.
- Limits: 128 KiB per catalog, 500 entries, 4 KiB per message, four nested selectors.
- Locales en-US, nl-NL and ar-EG; preview widths 144 and 512 CSS pixels; two original layouts.
- Translation, wording grades, live applications, sign-in, general ICU compatibility and general accessibility review are outside the first release.
- A runtime version change, a dependency, an external request or a non-loopback listener needs the owner's approval first, not a pull request.

## Commands

Node 22. No install step is needed.

| Purpose | Command | Status |
|---|---|---|
| Tests | `node --test` | real (scaffold) |
| Run the app | `node server/serve.mjs` | real (scaffold: static shell); checker planned from #2 |

## Architecture boundaries

The planned module map is in [docs/architecture.md](docs/architecture.md). Invariants every change must keep (the plan is the source):

- Catalog intake, message parser, audit engine, preview renderer, project store and report builder stay separate. Parser and audit are pure modules that run under Node without a browser.
- Catalogs are checked before they replace anything: size, fatal UTF-8 decoding, key and value tokens, duplicate decoded keys, entry and message limits. A rejected catalog leaves the prior valid one in place and names line and column.
- Catalog and argument maps have no prototype (`Map` or `Object.create(null)`). Message text, names and imported content are rendered as text, never as HTML, in the page and in the exported report.
- Only the documented message subset is accepted. Exact selectors, offsets, ordinals, typed arguments and quote syntax give a documented error and are never approximated.
- The pound marker binds to the nearest enclosing plural, also through a nested select; outside a plural it is literal.
- A message that cannot be parsed, or whose source contract is invalid, suppresses its dependent findings and nothing else; other keys are still audited.
- A finding's identity is the JSON of `[rule, targetLocale, messageKey, branchPath, subject, layoutCase]`. Wording and display order never change it. Machine output is ordered by UTF-16 code unit and is not affected by sorting or filters on screen.
- A limit that is exceeded gives a visible error and publishes no partial result.
- A locale the browser cannot satisfy makes the profile unsupported; the checker never falls back to English silently. Requested and resolved tags, categories and browser version are in every report.
- Overflow is measured after fonts are ready and two animation frames, on declared slots only, with the one-pixel rule of the plan. Unmeasurable cases are shown as such and never counted as a pass. A stale measurement never replaces a newer audit.
- Every project write compares the stored revision in the same IndexedDB transaction. A stale tab keeps its edits and can export them. A failed write leaves the last saved revision. Baselines are immutable copies.
- Comparison with a baseline of another ruleset or locale profile is refused; nothing is marked resolved by a changed engine.
- Same-origin assets only. The server binds `127.0.0.1` and serves an allowlist of files. Catalogs never leave the browser. Reports hold no machine paths and no script.
- Previews set their own `lang` and `dir` and isolate inserted values; the application itself stays left to right. Everything works by keyboard, filters keep focus, and clipped text can be read outside its slot.

## Git workflow

- `main` is the default branch. Work on one branch per ticket: `<issue-number>-<short-slug>`. Never commit to `main`.
- Small commits with imperative subjects and a type prefix (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- Order for every ticket: local evidence, Code Reviewer, Reality Checker, then a draft pull request that says `Part of epic #1` and `Closes #<ticket>`, then CI on that draft, then `gh pr ready` only when CI is green.
- Do not push or open a pull request unless the owner asked in the current session; starting `/next-ticket` is that request for one ticket. Only the owner merges and releases. Do not push to `main`, force-push, or merge your own pull request.
- Never commit exported reports, `.env*`, or build output.
- Do not change `.claude/agents/`, `LOOP.md`, `loop-constraints.md` or `loop-budget.md` as part of a feature ticket.
- Open owner decisions on a ticket are settled with the ticket's stated default. Where a ticket states none, take the conservative option and say so in the pull request.

## Evidence before a ticket is called done

Paste real output into the pull request; never summarise a run you did not make.

1. For each acceptance criterion of the issue: the name of the test that proves it, or the exact step and what was observed.
2. The full output of `node --test` locally, and the link to the green CI run on the draft pull request (Linux and Windows).
3. For an audit change: the fixture (F01, F01a, F01b, F02), the expected findings with their branch paths and the observed ones.
4. For a layout change: the Chrome version, the resolved font, the measured extents and the independent measurement.
5. For a UI change: the Chrome version, the keyboard path walked and what was observed, and that the page made no external request.
6. `git status` shows no stray files, and no dependency, external URL or non-loopback listener was added.
7. Anything not verified, said plainly.

## Agent roles

Project subagents are in `.claude/agents/`: six Agency Agents roles and `loop-verifier`, which belongs to the Loop setup. Each Agency Agents role file starts with a section "In this repository", written for this project. That section and this file override the generic text below it. Sources, licence, local changes and the name collision with a user-level install are in [.claude/agency-agents/README.md](.claude/agency-agents/README.md).

When asked to implement, continue or finish a GitHub issue, follow the playbook [`.claude/skills/implement-ticket/SKILL.md`](.claude/skills/implement-ticket/SKILL.md). Claude Code loads it on its own for ticket work; `/implement-ticket <issue number>` starts it by hand. Delegate to the roles without waiting to be asked: each role's `description` ends with a "Use proactively ..." sentence, which is what makes Claude Code delegate. The playbook gives the exact trigger of each role.

| When | Roles | Access |
|---|---|---|
| Before coding | Software Architect | `Read, Grep, Glob` |
| While coding | Frontend Developer | can edit |
| After coding, when the trigger matches | Application Security Engineer, Accessibility Auditor | `Read, Grep, Glob` |
| Gate on every ticket | Code Reviewer on the full diff, until no material finding is left | `Read, Grep, Glob` |
| Acceptance gate on every ticket, after Code Reviewer | Reality Checker on each acceptance criterion and the recorded evidence, and that CI is configured to run the checks (no CI result is needed yet) | `Read, Grep, Glob` |

- The two gates run on every ticket, whatever its size. A ticket is not called done before both have passed.
- Roles limited to `Read, Grep, Glob` cannot run commands. Give them the diff, the acceptance criteria and whatever command output exists.
- The session or role that wrote a change does not count as its reviewer.
- If a role is missing or cannot be delegated to, the session does the before-coding, while-coding and specialist steps itself and says so. It cannot pass the two gates on its own change: do not push or open the pull request. Stop, report that the gates could not run, and leave the run for the owner. This overrides the playbook's sentence "do that step yourself" for the two gates.
- In the pull request description, list under "Agent roles run" each role that ran, what it was asked and its verdict, and any step done without a role.

## Delivery workflow

How a ticket reaches the owner. Each piece is described in its own file; this part only links them.

- **Start:** the owner runs `/next-ticket` ([`.claude/skills/next-ticket/SKILL.md`](.claude/skills/next-ticket/SKILL.md)); it picks one leaf ticket (never a `tracking` parent or a ticket with open sub-issues; the last sub-issue's pull request also closes the parent), creates the branch and worktree, and runs the playbook [`.claude/skills/implement-ticket/SKILL.md`](.claude/skills/implement-ticket/SKILL.md). Nothing is scheduled.
- **Gate hook:** [`.claude/hooks/role-gate.mjs`](.claude/hooks/role-gate.mjs) blocks `gh pr create` and `gh pr ready` until Code Reviewer and Reality Checker ran after the last code edit. `ROLE_GATE=off` in the environment Claude Code is started from switches it off for that session; only the owner does that.
- **Permissions:** [`.claude/settings.json`](.claude/settings.json). Agent configuration edits ask in the main checkout and in ticket worktrees; CI, `CLAUDE.md`, `AGENTS.md` and Loop-file edits ask only in the main checkout; in a ticket worktree they are limited by the playbook's scope rule and reviewed by the owner at merge (shell-made edits are not covered, so a ticket never changes agent configuration); force pushes, pushes to `main`, `gh pr merge`, releases and reads of `.env` are denied.
- **CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Every job must be green on the current diff before a pull request is marked ready. The agent does not poll: it ends its turn with "Draft pull request #N is waiting for CI" and reads `gh pr checks` once when woken. Reviewers read the diff and evidence from `.claude/state/review/`. An acceptance step that needs a person is listed under "Owner checks" in the pull request.
- **Pull request:** [`.github/pull_request_template.md`](.github/pull_request_template.md). Tickets use [`.github/ISSUE_TEMPLATE/implementation-ticket.md`](.github/ISSUE_TEMPLATE/implementation-ticket.md).
- **Labels:** `status:ready`, `status:blocked`, `status:in-progress`, `needs-decision`, `tracking` (parent container, never worked; its sub-issues are the work items).
- **Changelog:** every ticket pull request adds one line under Unreleased in [CHANGELOG.md](CHANGELOG.md).
- **UI and copy:** [docs/ui-quality.md](docs/ui-quality.md); the `ui-ux-pro-max` and `unslop` skills are in `.claude/skills/`. Colours come from the shared design tokens in `app/tokens.css` ([docs/design-tokens.md](docs/design-tokens.md)); new UI adds no colour literals.
- **Decisions:** [docs/owner-decisions.md](docs/owner-decisions.md). Security reports: [SECURITY.md](SECURITY.md).
- **Merge and release:** only the owner merges and releases ([docs/RELEASING.md](docs/RELEASING.md)). An agent stops at a ready pull request.

## Loop

Issue triage runs at L1: report-only, started by hand, no scheduler, no GitHub writes. See [LOOP.md](LOOP.md).
