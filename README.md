# Invoice Generator (Senior-Friendly)

A clean, easy-to-use invoice generator built for non-technical users.

## Why this app
- Large, clear form labels and buttons
- Live invoice preview while typing
- Save invoices locally in the browser
- Re-open, duplicate, and delete saved invoices
- Print directly or save as PDF
- Mobile-friendly layout

## Features
- Business and client information sections
- Auto-generated invoice numbers (`INV-0001`, `INV-0002`, ...)
- Invoice and due date inputs with sensible defaults
- Flexible line items (description, quantity, unit price)
- Tax and discount percentages
- Currency selection (USD, EUR, GBP, CAD, AUD)
- Notes section for payment terms or custom messages

## Run locally
This project has no build step.

1. Open [index.html](/Users/niko/Desktop/Invoice-Generator/index.html) in your browser.
2. Start filling in details and click **Save Invoice**.
3. Use **Print / Save as PDF** to export.

Tip: If you use VS Code, you can run a simple static server (e.g. Live Server) for the same result.

## Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In repo settings, go to **Pages**.
3. Set source to `Deploy from a branch` and choose `main` + `/ (root)`.
4. Save. Your app will be available at your GitHub Pages URL.

## Version control workflow (recommended)
- Keep `main` always stable.
- For each new app iteration:
  - create a branch: `git checkout -b codex/<short-feature-name>`
  - commit in small chunks with clear messages
  - open a pull request
  - merge after review/testing
- Track notable changes in [CHANGELOG.md](/Users/niko/Desktop/Invoice-Generator/CHANGELOG.md).

## Accessibility and usability notes
- Buttons and inputs are sized for easy tapping/clicking.
- High contrast and readable fonts improve clarity.
- Destructive actions (clear/delete) ask for confirmation.

## Future enhancements
- Email invoice directly
- Add logo upload
- Optional cloud backup (beyond local browser storage)
- Payment status tracking and reminders
