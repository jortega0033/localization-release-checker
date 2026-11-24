# Implementer map

Status: **only the scaffold exists (stubs, static shell, smoke tests); no product behaviour.** This page maps the boundaries that [PROJECT-PLAN.md](PROJECT-PLAN.md) requires onto a module layout so that parallel tickets do not collide. It adds no requirement; the plan wins where they differ. The names are the orchestrator's proposal, fixed by the scaffold; a ticket that changes one corrects this page in the same pull request.

## Planned module map

| Boundary | Module | Owns | Parent ticket |
|---|---|---|---|
| Catalog intake | `app/catalog/` | Bounded JSON tokens, duplicate keys, limits, locations, manifest | #2 |
| Message parser | `app/message/` | Subset grammar, positions, immutable nodes | #3 |
| Audit engine | `app/audit/` | Key, branch, variable and plural-category findings with stable identity | #2 (missing keys), #3 |
| Preview | `app/preview/` | Parcel card, action strip, scenarios, measurement | #4 |
| Project store | `app/store/` | IndexedDB record, revisions, baseline, recovery | #5 |
| Reports | `app/report/` | Comparison counts, JSON and self-contained HTML export | #5 (comparison), #6 |
| Page | `app/ui/` | Workflow screens, filters, status, locale preflight | #2, #6 |
| Fixtures | `app/fixtures/` | Original parcel catalogs and manifest | #2, #3, #4 |
| Static server | `server/serve.mjs` | Loopback server with a file allowlist on a fixed port | #2 |
| Tests | `test/` | `node --test` for pure modules; headless Chrome runs for layout, storage and keyboard | every ticket |

Dependency direction: `ui` depends on every module below it; `report` on `audit` and `store` shapes; `preview` on `message`; `audit` on `message` and `catalog`; `store` on no engine module. `catalog` and `message` import nothing from the app.

## Freeze points

Parallel tickets rely on these shapes. A ticket that changes a frozen shape updates this page and every dependent ticket in the same pull request.

- **Catalog, manifest and finding shapes**: ticket #2 writes them down here before #3 and #4 start in parallel.
- **Finding identity and branch path form**: #3 freezes it before #5 compares runs.
- **Parsed message nodes and render interface**: #3 provides them, #4 may start from fixture nodes of the same shape.
- **Report JSON schema version 1**: #5 writes it, #6 exports it.

## What is verified where

Pure modules run under `node --test` locally and in CI on Linux and Windows. Browser checks use headless Chrome over the DevTools pipe without a dependency, or a manual run in Chrome; the pull request says which, with the Chrome version.
