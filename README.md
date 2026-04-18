# Finansr

A personal finance tracker for importing, categorizing, and analyzing bank transactions — with Google Sheets sync for flexible reporting.

## Features

- **Multi-source import** — Upload CSV exports from mBank or Citi (auto-detected), or connect live bank accounts via [Tink](https://tink.com/)
- **Staging workflow** — Review and categorize transactions before committing them
- **Spending analysis** — Tag each transaction with a "wanted level": `HAD_TO`, `WANTED`, `DIDNT_NEED`, or `REGRET`
- **Google Sheets sync** — Push finalized transactions to a spreadsheet with auto-generated monthly overview tabs and QUERY-based aggregations
- **Multi-account support** — Track personal and joint accounts across multiple currencies
- **Duplicate prevention** — Import coverage tracking prevents re-importing the same date ranges
- **Multi-language** — English and Polish (PL) UI

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI |
| Database | SQLite via Prisma |
| Bank connectivity | Tink API |
| Spreadsheet sync | Google Sheets API (service account) |
| Testing | Vitest (unit), Playwright (E2E) |

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud service account with access to a Google Sheet (for sync)
- A Tink developer account (optional, for live bank connections)

### Installation

```bash
git clone https://github.com/M4giic/finansr.git
cd finansr
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="file:./dev.db"

# Google Sheets sync
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id

# Tink API (optional — for live bank connections)
TINK_CLIENT_ID=your_tink_client_id
TINK_CLIENT_SECRET=your_tink_client_secret
TINK_ENV=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Create an account** — Configure at least one account (personal or joint) in the Admin tab.
2. **Import transactions** — Upload a CSV from your bank or connect via Tink.
3. **Categorize** — Assign categories, subcategories, and wanted levels to staged transactions.
4. **Submit** — Finalize transactions to move them out of the staging area.
5. **Sync to Sheets** — Push submitted transactions to Google Sheets for reporting.

## Supported CSV Formats

| Bank | Format |
|---|---|
| mBank | Standard export |
| Citi | Legacy and new export formats |

Tink integration supports any bank available in the Tink network.

## Project Structure

```
src/
  app/
    [locale]/          # i18n routes (en, pl)
    api/tink/          # Tink OAuth flow and transaction sync
    actions/           # Next.js server actions (mutations)
  components/          # UI components
  lib/
    csv/               # Bank CSV parsers (factory pattern)
    google-sheets.ts   # Sheets sync logic
    tink.ts            # Tink API client
prisma/
  schema.prisma        # Database schema
```

## License

MIT
