# Localization Release Checker

> This document specifies phase 1 of the program in [#39](https://github.com/jortega0033/localization-release-checker/issues/39). Hour figures in it are early estimates for that phase; its open tickets add up to 73 to 112 hours (2026-11-24). Work that it defers is planned in the later phases only where the program names it.

Implementation plan. Product assumptions and all acceptance checks below describe proposed work.

## Product requirements

**Product outcome.** A frontend maintainer can load original example message catalogs, find contract differences, reproduce risky layouts, review changes since a saved baseline, and hand another engineer a report containing enough detail to reproduce each finding.

**Proposed users and problem.** A maintainer working with translators wants to catch a renamed variable, dropped plural branch, or label clipped at a narrow width before tagging a release. A reviewer needs the exact locale, key, branch and preview case that produced a finding. The owner will confirm which workflow to improve and why. All initial examples belong to a fictional parcel-tracking interface.

**First usable slice.** Load an English source and an Arabic target, audit a nested delivery message, filter results, then render one delivery-count case. A clean reload with the same inputs reproduces the findings. Subsequent milestones add saved runs, baseline comparison, export and independent offline release evidence.

**Release workflow.**

1. Load the bundled project or select one source and one to three target UTF-8 JSON files. Confirm the locale of each catalog and see its syntax status. Replace a catalog atomically after validation. An unreadable catalog leaves the prior valid selection in place and explains the failure.
2. Run the audit. Show the findings list with counts, severity, keys, rule names and branch paths. Navigate by keyboard. Selecting a finding opens its matching preview or the exact unsupported syntax location.
3. Open the parcel card or action strip. Select a scenario with synthetic values, target locale and preset width. Compare source and target text, natural direction, and measured overflow. Missing input and unsupported syntax render a visible status for the affected message.
4. Save the current run locally and optionally promote it to a baseline. Reopen the project after restart and compare an edited catalog. Inspect new, unchanged and resolved findings.
5. Export a reproducible JSON run report and a static HTML summary. Reopen the HTML offline. Both list input catalog names, locales, ruleset and versions, assumptions, and exact cases behind findings.

**Scope limits.** The first release audits a bounded string-message subset and two original test layouts. It does not translate text, grade wording, audit a live app, sign users in, or provide general accessibility or ICU compatibility review. Local experiments use synthetic messages and values. There is no private client material or outside translation service.

**Success criteria.** Audit results match hand-authored branch and locale expectations, invalid input cannot silently replace a prior valid catalog, layout regressions have reproducible scenarios, and the same fixture run produces the same finding identities and structured report on the declared runtime profile. A reviewer can complete the workflow in Chrome with the external network blocked.

## Technical design

### Runtime and input contract

Use an offline Node.js built-in HTTP server on a documented loopback address and port to serve static ES modules, HTML and CSS. Serve only a deploy-time allowlist of app assets and fixtures. User-selected catalogs stay in the browser. No package install, CDN or external font is required. Preflight the installed Node version, browser version and locale support. Record exact versions and locale probes in the verification report. Show the supported locale scope and a clear error for a profile the bundled browser cannot satisfy.

Catalogs are a flat JSON object of strings keyed by case-sensitive dot-separated names. Support ASCII letter, digit and underscore segments, starting with a letter, with no leading, trailing or repeated dot. Accept one optional initial UTF-8 BOM. Reject malformed UTF-8, duplicated decoded keys, non-string values, arrays, and trailing input. A bounded top-level tokenizer reads key and value string literals, then delegates standard JSON string decoding. Check duplicates on decoded keys before insertion. Store maps with no prototype or use `Map`. Initial limits are 128 KiB per file, 500 entries per catalog, 4 KiB per decoded message using UTF-8 byte count, and four active nested selectors. Report a file label and 1-based line and column on syntax failure. Cases that exceed an analysis limit get a visible error, with stable ordering, without partial result publication.

A project contains a source locale and selected target locales from en-US, nl-NL and ar-EG, one file per locale, plus an original preview manifest. The first release uses en-US as source. Each manifest declares layout, width and case IDs, declared text slots and argument samples. Runtime `Intl.PluralRules` and `Intl.NumberFormat` support those declared locales. Require each requested locale to be supported and its resolved base language to match. Require the exact category sets and sample outputs in the preflight fixture. Record the requested and resolved tags, category sets and browser version in every report. If support differs, mark the profile unsupported and do not silently switch to English. [ECMA-402 plural rules and locale resolution](https://tc39.es/ecma402/#sec-intl-pluralrules-objects)

### Supported message syntax

Use a small parser with positional errors and immutable nodes for text, named variables, select blocks, cardinal plural blocks, and the pound marker. Support `{customer}`, `{status, select, shipped {...} other {...}}` and `{count, plural, one {...} other {...}}` with nested selectors. Keys and ASCII argument names are case-sensitive. Select options are named ASCII tokens. Plural options are cardinal category names. Require exactly one `other` option per selector and unique options. Within a plural body, `#` is bound to the nearest enclosing plural, including when it is nested inside a select in that plural. Outside plural context it is literal. Plain apostrophes in text are accepted. Escape or quote syntax such as apostrophe before a brace or pound, exact selectors, offsets, ordinal variants, typed arguments, and unsupported selector syntax get a documented error. The aim is a clear testable subset inspired by ICU patterns. [ICU guide to formatted messages](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

Before comparison, reject duplicate selector occurrences with the same controller and kind in one sequence and contradictory controller types in one message. At each sequence, compare direct variable sets and the nearest-plural binding of the pound marker. Compare selector controllers by name and kind, independent of ordering. Report missing and unexpected variables separately. For each select, require the same option set as source and compare like-named options. For each plural, the project requires the target locale's full category set, including `other`. Extra categories get a distinct finding. Validate the source against its own category set first. For a target category supported by source, compare against that source category. For a locale-specific category, compare against source `other`. This is an explicit contract for the initial release and may flag a deliberate grammatical adaptation for human review. It checks semantic argument availability in reachable branches under a configured contract.

Run audits for missing/extra keys, invalid message patterns, branch coverage, and variable contract. Suppress dependent mismatch checks when a message cannot be parsed or its source contract is invalid. Continue auditing other keys. An empty catalog is valid input and yields missing-key findings. Use lexical order with a defined Unicode code-unit comparator for serialized machine output. UI sorting and filtering do not change exported order. Bound work by the catalog limits and a documented maximum number of visited node comparisons per run.

Findings contain `rule`, `severity`, `targetLocale`, `messageKey`, `branchPath`, `subject`, `detail` and optional `layoutCase`. The stable ID is the JSON encoding of the tuple `[rule, targetLocale, messageKey, branchPath, subject, layoutCase]` with array ordering fixed. Branch segments carry selector kind, controller and target branch. A preview case includes stable layout, scenario, width and slot IDs. Display order and diagnostic wording never control identity. Duplicate occurrences with the same identity aggregate with a deterministic occurrence count.

### Preview and accessibility

Bundled parcel card and action strip use semantic markup, logical CSS sizes and fixed preview widths of 144 and 512 CSS pixels. Labels render as text. Branch selection accepts fixture integers from 0 to 10,000. Use plural rules and localized integer formatting for `#`. Required missing or mistyped parameters surface a case error. Give each rendered panel explicit `lang` and `dir`, with dynamic names isolated from surrounding directional text. Text slots declaring an overflow check are measured after font readiness and two animation frames at the chosen width. Mark overflow when scroll extent exceeds client extent by more than one CSS pixel on either axis for declared clipped slots. Exclude unmeasurable cases using an explicit status, and keep human review for rounded or font-dependent visual issues. Recompute only fixed cases for reports. Browser size, system font availability and the measurement threshold are visible run metadata. [HTML directionality](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute) · [CSSOM View geometry](https://www.w3.org/TR/cssom-view/#dom-element-scrollwidth)

Use real buttons, clear focus indicators and a result summary announced once per completed run. Filters preserve keyboard focus. Group warnings by text severity and make the overflowing text readable outside the constrained preview. App navigation is left-to-right and independent of preview direction. With JS disabled, the page gives plain setup instructions.

### Storage, comparison and export

IndexedDB stores one project record with schema version, revision, catalogs, manifest ID, optional baseline and latest completed run. The project has a stable documented loopback origin. Every write uses one read-write transaction to read the revision and replace the record if the expected revision still matches. On a stale-tab write, retain edits in that tab and offer reload or export. A failed transaction or storage quota failure leaves the last known persisted revision available. On load, unknown schema versions require explicit recovery and may be exported as raw JSON. A persisted baseline stores an immutable copy of the completed report, including ruleset version, runtime locale profile and exact finding identities. Suppress automatic comparison on incompatible version or profile so findings are never marked resolved by a changed engine. A successful baseline write copies the current report.

Separate the audit engine, preview renderer, project store and report builder. Catalog input is explicitly committed to state only after successful parsing. Async layout results carry a job generation so stale callbacks cannot overwrite a newer audit. Reports contain no machine filesystem paths or arbitrary imported HTML. Use normalized JSON with a fixed key order and an escaped, script-free, self-contained HTML view. Export format includes a schema version, declared bounds, per-file names, synthetic run cases, exact measurements, findings and comparison counts. Wall-clock timestamp is optional metadata outside deterministic evidence comparison.

## Original verification fixtures

### F01. Nested message and branch-local variables

Use a source `en-US` entry `parcel.summary` with this pattern:

```text
{channel, select, delivery {{count, plural, one {One parcel for {customer}} other {# parcels for {customer}}}} other {Pickup for {customer}}}
```

Construct Arabic options for `zero`, `one`, `two`, `few`, `many`, and `other` under `delivery`. The selected `one` body has `{customer}` and no `#`. Each other body has `#` and `{customer}`. The outer `other` body has `{customer}`. The valid target has zero contract findings. In variant F01a replace `{customer}` with `{buyer}` only in `few`. The ordered findings are a missing customer and unexpected buyer at the same target branch path. The path is `select(channel).delivery / plural(count).few`. In F01b delete only `many` from the valid target. Expect exactly one missing plural category, with no dependent placeholder finding for the absent branch.

Independently precompute category examples under the declared profile. For ar-EG, the cardinal inputs 0, 1, 2, 3, 11 and 100 correspond to zero, one, two, few, many and other. For en-US and nl-NL, 1 is one and 3 is other. Confirm each browser runtime probe against this table. F01's expected placeholder findings are authored from the example branches and do not come from the checker.

### F02. JSON and unsupported patterns

Import `{"route":"one","\u0072oute":"two"}` and expect duplicate key `route`. Under a project with a working catalog already selected, import a catalog with valid JSON and an unterminated plural body for one entry. The import succeeds, audit shows a pattern error on that key, and another valid key audits normally. Importing invalid JSON is a distinct file error and preserves the old catalog. A literal `<button>sample</button>` stays visible as text. An exact-selector marker `=0` produces an unsupported-pattern result rather than approximate matching.

### F03. Reproducible preview and comparison

Use a fixture label of 40 uppercase `W` characters in a slot with a preflight-confirmed monospace font at 16 px. The short label fits at both widths. The long label overflows at 144 px and fits at 512 px. Spot-check panel computed directions for Arabic RTL and English LTR. Measure the named element independently in the browser and compare exported extents and overflow classification.

Save F01a as a baseline with the two branch findings. Next run uses F01's corrected Arabic and F03's single narrow overflow. It has one new, zero unchanged, and two resolved findings. Save again and reload. Both runs and counts are available. Save a baseline in tab A and try to mutate the old revision in tab B. Tab B displays a conflict and can export edits, and tab A's baseline stays intact.

## Epic · Make translated release regressions reproducible offline

**Outcome.** A maintainer can take a fictional release candidate from two catalog files to a reproducible review report and compare it against a prior release. The first vertical slice loads catalogs and lists missing keys. Then add branch checks and preview, compare saved runs, and verify the final report workflow. The estimates include implementation and ticket verification. **Total engineering estimate is 12–19 hours.**

| Wave | Work | Exit evidence |
|---|---|---|
| 1 | LR-01 establishes runtime, manifest, file schema and the initial audit path. | A clean offline launch imports a bundle and shows a reproducible missing-key result. |
| 2 | LR-02 and LR-03 work in parallel on audit and preview against the frozen contracts. LR-04 builds persisted reports once finding IDs are frozen by LR-02. | Independent expected branch findings and width results agree with the implemented features. |
| 3 | LR-05 integrates rendering, comparison and reports. LR-06 verifies the offline first release end to end. | Reopened baseline, report and expected outcome all match named original fixtures. |

### LR-01 · Build catalog intake and the first offline audit

**Estimate.** 2–3 hours. **Dependencies.** None.

**User story.** As a frontend maintainer, I can load two catalogs and see that a known translation key is missing.

- **LR-01-A.** An external-network-disabled Chrome tab opens the app through the installed Node runtime, loads the original bundle, selects en-US and nl-NL, and shows one documented missing key.
- **LR-01-B.** UTF-8 BOM plus CRLF parses. F02's escaped duplicate is caught by decoded name. Failures for invalid UTF-8, invalid JSON, duplicate locale or cap+1 bytes have visible errors and do not replace a working file selection.
- **LR-01-C.** Publish typed catalog, manifest and finding contracts for the other tickets. A fixture-driven UI can consume these contracts without a running full checker.

### LR-02 · Audit nested selectors and branch-level contracts

**Estimate.** 3–4 hours. **Dependencies.** LR-01.

**User story.** As a catalog reviewer, I can tell which target branch lost a variable and which locale category is missing.

- **LR-02-A.** Freeze the documented supported syntax and parse enough location data to point at one erroneous pattern. A four-level nesting fixture is accepted and a fifth selector level fails explicitly.
- **LR-02-B.** F01 and variants produce exactly zero, two and one contract findings respectively, including stable branch paths and IDs. Shuffling catalog keys or selector ordering preserves the finding identities and canonical exports.
- **LR-02-C.** Verify pound binding through a nested select, compare source versus target category contract, and reject an unsupported exact branch. A syntactically invalid message suppresses its dependent findings without preventing independent keys from auditing.

### LR-03 · Preview translated layouts and measure overflow

**Estimate.** 2–4 hours. **Dependencies.** LR-01. May proceed against parsed-fixture and render interfaces until LR-02 integration.

**User story.** As a reviewer, I can see the literal text and direction that triggered a clipping finding.

- **LR-03-A.** Both layouts respond to scenario, locale and width controls. For the F03 fixed-font case, independently measured extents produce exactly one narrow overflow. Changing the case while measurement is pending does not show stale results.
- **LR-03-B.** Arabic and English previews expose expected computed directions and isolated interpolated values. The same keyboard controls work without pointer input, and overflow text stays accessible outside the clipped slot.
- **LR-03-C.** A missing sample and display of literal `<button>sample</button>` produce the intended case status and text with no code execution. Unavailable fonts and unmeasurable results are visible and excluded from asserted overflow.

### LR-04 · Save runs and compare against an immutable baseline

**Estimate.** 2–3 hours. **Dependencies.** LR-02.

**User story.** As a release maintainer, I can pick a baseline and see what changed after editing translations.

- **LR-04-A.** Compare F03's baseline and current run by stable IDs. The result is one new, zero unchanged and two resolved, with proof for each row. Changed diagnostic wording alone does not create a different identity.
- **LR-04-B.** Save both results, close Chrome, and reopen using the documented same origin. The project loads the same baseline and latest run. A stale tab cannot overwrite a newer revision and can still export its work.
- **LR-04-C.** A forced write failure preserves the previously saved project. A changed ruleset or locale profile produces an incompatibility status and no fabricated resolution counts.

### LR-05 · Deliver review and portable report exports

**Estimate.** 2–3 hours. **Dependencies.** LR-02, LR-03 and LR-04.

**User story.** As a maintainer, I can give another engineer a report and the inputs needed to reproduce a finding.

- **LR-05-A.** Search and filter findings by locale, severity and key. Selecting a branch finding names its exact branch; selecting a preview finding opens the named scenario without a separate lookup.
- **LR-05-B.** Export versioned JSON and self-contained HTML. Reopen the HTML offline and compare all finding IDs, counts, exact case dimensions, rule version and metadata to the JSON and on-screen report.
- **LR-05-C.** Reports preserve canonical machine ordering across UI sorting, contain no user machine path or executable imported content, and use a recoverable error on export failure.

### LR-06 · Prove the offline release workflow

**Estimate.** 1–2 hours. **Dependencies.** LR-05.

**User story.** As a reviewer, I can open the project cold and reproduce the expected checks from public-safe synthetic fixtures.

- **LR-06-A.** From a fresh directory and Chrome profile, run the documented commands without downloads. Verify only loopback requests, record Node/Chrome versions and locale probes, and run the independent fixture, parser and comparison tests.
- **LR-06-B.** Load original catalogs, run audit and preview, save a baseline, reload, change a target and generate a new report. Check exact F01–F03 expected findings and counts against visible results and record any failed or unrun checks as such.
- **LR-06-C.** Document supported profiles, recovery after invalid input, baseline incompatibility and clearing site data. Include a keyboard walkthrough and known geometry measurement limits.

## Owner decisions and follow-on work

Confirm the actual frontend workflow the owner wants to improve, who will consume the report and whether this profile represents the messages they commonly use. End-to-end first-release defaults use synthetic parcel tracking solely to make the intended behavior testable. Following the first release, a maintainer can choose one extra catalog dialect, profile portability across browser builds, or a deterministic CLI check. The first epic remains independently useful.
