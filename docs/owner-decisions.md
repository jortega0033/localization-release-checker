# Owner decisions

A dated record of the decisions made for this repository, so the rules do not depend on anyone's memory of a conversation. Changing any entry needs the owner. An agent that finds a decision blocking a ticket stops and says so.

The owner made decisions 1 to 10 and 12 on 2026-11-22 for all repositories that get the SDLC kit, and asked on 2026-11-24 to apply the kit here (jortega0033/sdlc-kit v1.2.0). Each row says who decided.

| # | Decision | Source | Date | Implemented in |
|---|---|---|---|---|
| 1 | The instructions, tooling and playbook live on the default branch (`main`). | decided by the owner | 2026-11-22 | `CLAUDE.md`, `.claude/`, `.github/` |
| 2 | Persona agents run automatically during ticket work and carry instructions tailored to this project. | decided by the owner | 2026-11-22 | `.claude/agents/`, `.claude/agency-agents/README.md`, `CLAUDE.md` "Agent roles" |
| 3 | Every open ticket is about app implementation; tooling is installed, not ticketed. | decided by the owner | 2026-11-22 | `.claude/`, `.github/`, `docs/` |
| 4 | Agents may take a ticket up to a ready pull request. Only the owner merges and releases. | decided by the owner | 2026-11-22 | `CLAUDE.md`, `.claude/skills/next-ticket/SKILL.md`, `docs/RELEASING.md`, `.claude/settings.json` |
| 5 | No scheduler. Ticket work starts only on the owner's go signal (`/next-ticket`), because the repository is used to train AI models. | decided by the owner | 2026-11-22 | `.claude/skills/next-ticket/SKILL.md`, `LOOP.md` |
| 6 | A review gate hook blocks opening or readying a pull request until the gate roles have run after the last code edit. | decided by the owner | 2026-11-22 | `.claude/hooks/role-gate.mjs`, `.claude/settings.json` |
| 7 | Loop Engineering stays at L1, report-only and unscheduled. | decided by the owner | 2026-11-22 | `LOOP.md`, `loop-constraints.md`, `loop-budget.md` |
| 8 | Continuous integration runs on Linux and Windows; the default branch requires a pull request and green checks. | decided by the owner | 2026-11-22 | `.github/workflows/ci.yml`; branch protection is a repository setting |
| 9 | Permission rules: documented commands are allowed; force pushes, pushes to the default branch, merges, releases and reads of secrets are denied; edits to CI, agent configuration and Loop files ask first. | decided by the owner | 2026-11-22 | `.claude/settings.json` |
| 10 | Open decisions on tickets are settled with the ticket's stated default; where a ticket states none, the conservative option is taken and flagged in the issue. | decided by the owner | 2026-11-22 | The list below; the issues themselves |
| 11 | Nothing is installed on the owner's PC for this project: Node is already there. No npm dependency is used, in the application or in tests. | recommended by the orchestrator, following the plan (Node's built-in server, static modules, no package install) | 2026-11-24 | `CLAUDE.md` "Commands", `.github/workflows/ci.yml` |
| 12 | The ten UI rules in `docs/ui-quality.md` are binding, and the `ui-ux-pro-max` and `unslop` skills are installed in the repository and used for UI work and for copy. | decided by the owner | 2026-11-22 | `docs/ui-quality.md`, `.claude/skills/` |

## Open ticket decisions settled by default (entry 10)

The plan leaves these open. Each is a recommendation by the orchestrator, adopted under entry 10 on 2026-11-24, and holds unless the owner changes it in the issue. None blocks a ticket.

| Issue | Decision | Default |
|---|---|---|
| all | Node version | 22, in CI and as `engines` in `package.json`. |
| all | Workflow and reader | The plan asks which real workflow to improve and who reads the report. Until the owner says otherwise the fictional parcel-tracking release and an engineer who reproduces findings are used. |
| #2 | Fixed address | `http://127.0.0.1:8791`. Another port is another origin with other saved projects, so the server fails when the port is taken. |
| #2 | Supported locales | en-US as source; nl-NL and ar-EG as targets. |
| #3 | Work limit | 200,000 visited node comparisons per run; more gives a visible error and no partial result. |
| #4 | Monospace font | The preflight measures the generic `monospace` family and records the resolved font; a case that cannot be confirmed is shown as unmeasurable. |
| #4 | Browser test method | Headless Chrome started from `node --test` over `--remote-debugging-pipe`, no dependency; Linux CI only, skipped locally when Chrome is absent and failing in CI when it is absent. |
| #5 | Projects | One project record per origin. |
| none | Licence | MIT, already in the repository (`LICENSE`). No ticket changes it. |
