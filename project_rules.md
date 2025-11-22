# Finansr - Project Rules & Guidelines

## Project Overview
**Finansr** is a personal finance management tool designed for local usage with cloud sync capabilities (Google Sheets).
- **Core Philosophy**: Local-first, privacy-focused, manual review of transactions.
- **Primary Flow**: Launch -> Fetch Transactions (Last Month) -> Review & Categorize -> Sync.

## Technology Stack
- **Frontend/Fullstack**: Next.js (App Router), TypeScript.
- **Internationalization**: English & Polish (UI must support both).
- **Styling**: Tailwind CSS.
- **Database**: SQLite (Local file-based).
- **External Integrations**: 
    - Banks: mBank, Citi Handlowy.
    - Export: Google Sheets.

## Coding Standards
### General
- Use **TypeScript** for all code. Strict mode enabled.
- Prefer **Server Components** by default; use Client Components only for interactivity.
- Use **Server Actions** for data mutations.

### Data Management
- **Transactions**:
    - Must always preserve the `originalDescription` from the bank.
    - `amount` should be stored as integers (cents/grosze) or high-precision decimals to avoid floating point errors.
    - `sorrowLevel` values: `HAVE_TO`, `WANTED_TO`, `NOT_NEEDED`, `REGRET`.
- **Categories**:
    - Support dynamic creation (User types -> Create if not exists).
    - Support hierarchy (Parent -> Child) in the future.

### UI/UX
- **Aesthetics**: Clean, modern, "Premium" feel. Avoid generic Bootstrap-like looks.
- **Input**: Optimized for keyboard usage (tabbing through transactions).

## Feature Specifics
### Bank Integration
- Abstract bank differences into a common `Transaction` interface.
- Handle duplicate detection (idempotency) based on Bank Transaction IDs.

### Sorrow Level
- This is a core unique feature. It should be prominent in the UI.
- Visual cues (colors) for different levels (e.g., Regret = Red, Wanted = Green).

## Future Proofing
- Code should be modular enough to switch the DB provider (e.g., to Postgres) later.
- Analytics module should be separate from the core transaction storage.
