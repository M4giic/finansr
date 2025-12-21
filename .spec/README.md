# Finansr - Application Specification

## Overview
Personal finance management application for importing, categorizing, and analyzing bank transactions from Polish banks (mBank, Citi Handlowy).

## Architecture

### Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: SQLite with Prisma ORM
- **UI**: Radix UI components, Tailwind CSS
- **Language**: TypeScript
- **Internationalization**: next-intl (Polish/English)

### Directory Structure
```
.spec/                          # Specification documentation
├── import-screen/              # Import & staging features
│   ├── import-wizard/          # CSV upload wizard
│   └── staging-view/           # Transaction review
├── admin-screen/               # Admin features
│   ├── accounts/               # Account management
│   └── categories/             # Category management
├── all-transactions/           # Transaction history
├── navigation/                 # App navigation
├── database/                   # Schema documentation
└── features/                   # Cross-cutting features
```

## Main Screens

### 1. Import & Staging Tab
**Purpose**: Import and prepare transactions for submission

**Components:**
- Import Wizard (CSV upload, configuration)
- Staging View (transaction review, editing)
- Submit Button (validation, submission)

**Features:**
- [CSV File Upload](./import-screen/import-wizard/csv-file-upload.md)
- [Auto Bank Selection](./import-screen/import-wizard/auto-bank-selection.md)
- [Date Range Detection](./import-screen/import-wizard/date-range-detection.md)
- [Coverage Period Tracking](./import-screen/import-wizard/coverage-period.md)
- [Duplicate Detection](./import-screen/import-wizard/duplicate-detection.md)
- [Category Assignment](./import-screen/staging-view/category-assignment.md)
- [Editable Descriptions](./import-screen/staging-view/editable-descriptions.md)
- [Wanted Level Selector](./import-screen/staging-view/wanted-level.md)
- [Submit Validation](./import-screen/staging-view/submit-validation.md)

### 2. Admin Tab
**Purpose**: Manage accounts and categories

**Components:**
- Account Manager
- Category Manager

**Features:**
- [Account Management](./admin-screen/accounts/account-management.md)
- [Category Management](./admin-screen/categories/category-management.md)
- [Subcategory System](./admin-screen/categories/subcategories.md)

### 3. Analytics Tab
**Status**: Placeholder for future analytics features

### 4. All Transactions Tab
**Purpose**: View complete transaction history

**Features:**
- [All Transactions View](./all-transactions/all-transactions-view.md)

## Core Features

### Multi-Account Support
- Personal and Joint account types
- Account-scoped categories
- Separate import tracking per account

### Hierarchical Categories
- Main categories with optional subcategories
- 1-level depth (Category → Subcategory)
- Inline creation in dropdowns
- Visual hierarchy with → indicator

### Import Management
- CSV parsing for mBank and Citi Handlowy
- Auto-detection of bank format
- Coverage tracking to prevent duplicates
- Duplicate transaction detection
- Date range auto-detection

### Transaction Workflow
1. **Import**: Upload CSV, configure account/bank/dates
2. **Stage**: Review, edit, categorize transactions
3. **Validate**: Ensure all required fields filled
4. **Submit**: Move to permanent storage
5. **Sync**: Optional Google Sheets integration

## Database Schema
See [Database Schema](./database/schema.md) for complete model documentation.

**Key Models:**
- Account - Financial accounts
- Transaction - Transaction data with categorization
- Category - Main categories (account-scoped)
- Subcategory - Sub-categories (1-level)
- ImportCoverage - Import tracking
- BankConnection - Bank API credentials

## Navigation
See [Tabbed Navigation](./navigation/tabbed-navigation.md)

## Recent Implementations (December 2024)

### Category System Enhancements
- [Global vs Account-Specific Categories](./admin-screen/categories/global-vs-account-categories.md)
- [Delete Functionality](./admin-screen/categories/delete-functionality.md) - Categories, subcategories, and accounts

### Import Wizard Improvements
- [Coverage Visualization](./import-screen/import-wizard/coverage-visualization.md) - Calendar highlighting and date range display
- [Calendar Enhancements](./import-screen/import-wizard/calendar-enhancements.md) - Week start, header removal, month navigation

### Staging View Improvements
- [Transaction List Pagination](./import-screen/staging-view/pagination.md) - 50 items per page with Previous/Next navigation

## Removed/Not Implemented Features
The following features were considered but not implemented:

- **PDF Parsing**: CSV-only import approach chosen for simplicity
- **Plaid Integration**: Manual CSV import preferred
- **GoCardless Integration**: Not implemented
- **Tink Integration**: Infrastructure exists but not actively used

## Partially Implemented Features

### Transaction Splitting
**Status**: UI created, backend pending

See [Transaction Splitting](./features/transaction-splitting.md)

## Future Enhancements

### High Priority
- Complete transaction splitting implementation
- Analytics dashboard with charts
- Advanced filtering/sorting in All Transactions
- Export functionality

### Medium Priority
- Multi-level subcategories (if needed)
- Budget tracking
- Recurring transaction detection
- Mobile responsive improvements

### Low Priority
- Bank API integration (Tink)
- Automated imports
- Receipt attachment
- Multi-currency support

## Development Notes

### Code Organization
- Server Actions: `src/app/actions/`
- Components: `src/components/`
- CSV Parsers: `src/lib/csv/`
- Database: `prisma/`

### Key Conventions
- Amounts stored in cents (integer)
- Dates in ISO format
- Status: STAGED → SUBMITTED
- Optimistic UI updates

### Testing
- Manual testing via browser
- No automated tests currently

## Internationalization
- Supported: Polish (pl), English (en)
- Messages: `messages/pl.json`, `messages/en.json`
- Default: Polish

## Version Control
- Git repository
- `.gitignore` includes `*.csv`, `*.pdf` for data privacy
- CSV files removed from tracking

---

**Last Updated**: December 20, 2024
**Maintained By**: Development team
**Purpose**: Living documentation of application features and architecture

