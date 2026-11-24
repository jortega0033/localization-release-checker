# Localization Release Checker

An offline checker for translation catalogs, message contracts and rendered layouts.

This repository contains the plan for the first implementation epic.

- [Product requirements](docs/PROJECT-PLAN.md#product-requirements)
- [Technical design](docs/PROJECT-PLAN.md#technical-design)
- [Epic and implementation tickets](https://github.com/jortega0033/localization-release-checker/issues)

The first plan of phase 1 said 12–19 engineering hours. Its open tickets, with tests and review, add up to 73 to 112 hours; the whole program is larger and is described below. All figures are estimates.

Licensed under the [MIT License](LICENSE).

## Program goal

Build the whole path from a translated message to the pixels it needs: own message languages, own number, date and plural formatting, own Unicode text processing and text shaping, and a proof that every message fits its place for every possible value, with no internationalisation, font or layout library.

The program is planned ([#39](https://github.com/jortega0033/localization-release-checker/issues/39)). Phase 1 is the current epic [#1](https://github.com/jortega0033/localization-release-checker/issues/1) and the only phase with tickets.

**Score.** Share of cases passed in the public Unicode and MessageFormat test files, and the share of generated messages whose overflow verdict equals the one measured in Chrome.

| Phase | Content | Hours (rough) | Issue |
|---|---|---|---|
| 1 | The current epic and its tickets | 73 to 112 | [#1](https://github.com/jortega0033/localization-release-checker/issues/1) |
| 2 | Message languages | 130 to 220 | [#40](https://github.com/jortega0033/localization-release-checker/issues/40) |
| 3 | Unicode text | 110 to 190 | [#41](https://github.com/jortega0033/localization-release-checker/issues/41) |
| 4 | Shaping and layout | 180 to 320 | [#42](https://github.com/jortega0033/localization-release-checker/issues/42) |
| 5 | Proof of fit | 120 to 210 | [#43](https://github.com/jortega0033/localization-release-checker/issues/43) |
| 6 | Catalogs and source code | 130 to 230 | [#44](https://github.com/jortega0033/localization-release-checker/issues/44) |

About 740 to 1280 engineer hours in total: rough estimates, not measurements. The numbers in the score and the finish lines are targets until a run shows them. Only phase 1 has tickets to work; the sub-issues of a later phase are written when it starts. No single session is expected to reach the end.
