# Contributing Guide

## Branching
- Create feature branches from `main` using prefix `codex/`.
- Example: `codex/add-client-search`

## Commit style
Use clear and focused commit messages.

Examples:
- `feat: add invoice status filter`
- `fix: correct tax rounding in preview`
- `docs: update deployment steps`

## Pull requests
- Keep PR scope small.
- Include screenshots for UI updates.
- Ensure manual smoke test passes before merge.

## Manual smoke test checklist
- Can create an invoice with at least 2 items.
- Totals update when quantity/price/tax/discount change.
- Invoice saves and appears in history.
- Can re-open and duplicate a saved invoice.
- Delete asks for confirmation.
- Print view hides editing controls.

## Versioning
- Update [CHANGELOG.md](/Users/niko/Desktop/Invoice-Generator/CHANGELOG.md) for user-visible changes.
- Use SemVer tags when releasing (`v0.1.0`, `v0.2.0`, ...).
