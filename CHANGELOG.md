# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.2.0] - 2026-03-04
### Added
- Brand customization inputs (logo URL and brand color).
- One-click sample invoice template for easier first use.
- GitHub Actions workflow for automatic GitHub Pages deployment on `main`.

### Changed
- Invoice preview now sanitizes user-entered text before rendering.
- Currency formatting now falls back safely if a saved invoice has invalid currency data.
- Updated form wording and sample data for elderly care service use cases.

## [0.1.0] - 2026-03-04
### Added
- Initial web app scaffold with no build dependencies.
- Senior-friendly invoice form layout with clear, large controls.
- Live invoice preview with dynamic totals.
- Line item management (add/remove description, quantity, price).
- Tax, discount, and currency handling.
- Local browser storage for saved invoices.
- Invoice history with open, duplicate, and delete actions.
- Print/save-as-PDF support.
- Project docs: README, CONTRIBUTING, and `.gitignore`.
