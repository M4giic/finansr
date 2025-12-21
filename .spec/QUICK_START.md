# Specification Documentation - Quick Reference

## Purpose
This `.spec` directory contains comprehensive documentation of all features, components, and functionality in the Finansr application. It serves as:
- **Reference documentation** for understanding existing features
- **Onboarding guide** for new developers
- **Planning basis** for future changes
- **Historical record** of implementation decisions

## Structure

```
.spec/
├── README.md                          # Main overview and index
├── SUMMARY.md                         # Documentation summary
├── QUICK_START.md                     # This file
├── import-screen/                     # Import & Staging features
│   ├── import-wizard/                 # CSV upload wizard
│   └── staging-view/                  # Transaction review
├── admin-screen/                      # Admin features
│   ├── accounts/                      # Account management
│   └── categories/                    # Category management
├── all-transactions/                  # Transaction history
├── navigation/                        # App navigation
├── database/                          # Schema documentation
├── features/                          # Cross-cutting features
└── sessions/                          # Session summaries

Total: 27 specification documents
```

## Quick Navigation

### By Feature Area

**Import & Staging**
- [CSV File Upload](./import-screen/import-wizard/csv-file-upload.md)
- [Auto Bank Selection](./import-screen/import-wizard/auto-bank-selection.md)
- [Coverage Period Tracking](./import-screen/import-wizard/coverage-period.md)
- [Coverage Visualization](./import-screen/import-wizard/coverage-visualization.md) 🆕
- [Calendar Enhancements](./import-screen/import-wizard/calendar-enhancements.md) 🆕
- [Transaction Table](./import-screen/staging-view/transaction-table.md)
- [Category Assignment](./import-screen/staging-view/category-assignment.md)
- [Pagination](./import-screen/staging-view/pagination.md) 🆕

**Admin & Configuration**
- [Account Management](./admin-screen/accounts/account-management.md)
- [Category Management](./admin-screen/categories/category-management.md)
- [Global vs Account Categories](./admin-screen/categories/global-vs-account-categories.md) 🆕
- [Delete Functionality](./admin-screen/categories/delete-functionality.md) 🆕
- [Subcategories](./admin-screen/categories/subcategories.md)

**Database**
- [Database Schema](./database/schema.md)

### By Status

**✅ Fully Implemented** (22 features)
- All import wizard features
- All staging view features
- All admin features
- Navigation
- Database schema

**⚠️ Partially Implemented** (1 feature)
- [Transaction Splitting](./features/transaction-splitting.md) - UI exists, backend pending

**❌ Not Implemented**
- Analytics Dashboard (placeholder only)
- Advanced filtering/sorting

### Recent Additions (December 2024) 🆕

1. **Global vs Account-Specific Categories** - Flexible category scoping system
2. **Delete Functionality** - Full CRUD for categories and accounts
3. **Coverage Visualization** - Calendar highlighting and date range display
4. **Calendar Enhancements** - Monday start, hidden headers, smart navigation
5. **Transaction Pagination** - 50 items per page with navigation controls

## How to Use This Documentation

### For New Developers
1. Start with [README.md](./README.md) for overview
2. Review [Database Schema](./database/schema.md) to understand data model
3. Explore feature docs by screen (import-screen, admin-screen, etc.)
4. Check session summaries for recent changes

### For Feature Development
1. Find related feature docs
2. Review implementation details and code locations
3. Check "Related Features" sections for dependencies
4. Update docs after implementing changes

### For Debugging
1. Locate feature documentation
2. Review "How It Works" section
3. Check code locations
4. Verify implementation matches spec

### For Planning
1. Review "Future Enhancements" sections
2. Check "Partially Implemented" features
3. Read session summaries for context
4. Create new specs for planned features

## Documentation Standards

### File Structure
Each feature doc should include:
- **Overview**: Brief description
- **Status**: ✅ IMPLEMENTED / ⚠️ PARTIAL / ❌ NOT IMPLEMENTED
- **Location**: File paths and line numbers
- **Functionality**: How it works
- **User Experience**: What users see/do
- **Related Features**: Links to related docs
- **Technical Notes**: Implementation details

### Status Indicators
- ✅ **IMPLEMENTED**: Feature is complete and working
- ⚠️ **PARTIAL**: Feature partially implemented or has known issues
- ❌ **NOT IMPLEMENTED**: Feature planned but not built
- 🆕 **NEW**: Recently added (within last month)

### Maintenance
- Update specs when features change
- Mark status accurately
- Link related features
- Include code snippets for key implementations
- Document technical decisions and rationale
- Add session summaries after major work

## Session Summaries

Session summaries capture work done in specific time periods:
- [December 14-20, 2024](./sessions/2024-12-14-to-20-session.md) - Category system, coverage viz, calendar, pagination

## Key Concepts

### Multi-Account Support
- Personal and Joint account types
- Account-scoped categories
- Separate import tracking per account

### Category System
- **Global Categories**: Available to all accounts (accountId: null)
- **Account-Specific**: Scoped to one account (accountId: uuid)
- **Subcategories**: One level of hierarchy under categories

### Import Workflow
1. Upload CSV file
2. Auto-detect bank and date range
3. Check for coverage and duplicates
4. Review and categorize transactions
5. Validate completeness
6. Submit to permanent storage

### Transaction States
- **STAGED**: Pre-submission, editable
- **SUBMITTED**: Permanent, read-only

## Finding Information

### By Component
- Components are in `src/components/`
- Find component name in spec docs
- Check "Location" section for file path

### By Feature
- Use directory structure (import-screen, admin-screen, etc.)
- Check README.md index
- Search spec files for keywords

### By Database Model
- See [Database Schema](./database/schema.md)
- Models: Account, Transaction, Category, Subcategory, ImportCoverage

## Contributing to Specs

When implementing new features:
1. Create spec file in appropriate directory
2. Follow documentation standards
3. Update README.md and SUMMARY.md
4. Link related features
5. Create session summary if significant work

When modifying features:
1. Update existing spec file
2. Update status if needed
3. Add notes about changes
4. Update "Last Modified" date

## Common Tasks

### Add New Feature Spec
```bash
# Create file in appropriate directory
.spec/{screen-name}/{component}/{feature-name}.md

# Update README.md with link
# Update SUMMARY.md with file count
```

### Update Existing Spec
```bash
# Edit the spec file
# Update status if changed
# Add implementation notes
# Update related features if needed
```

### Create Session Summary
```bash
# Create file in sessions/
.spec/sessions/{date-range}-session.md

# Document features implemented
# List files modified
# Capture decisions and iterations
```

## Tools and Scripts

### Seed Scripts
- `scripts/seed-categories.ts` - Populate default Global categories
- `scripts/seed-staged-transactions.ts` - Create test data

### Database
- `prisma/schema.prisma` - Database schema
- `npx prisma db push` - Apply schema changes
- `npx prisma studio` - Visual database browser

## Support

For questions about:
- **Features**: Check feature spec docs
- **Database**: See database/schema.md
- **Implementation**: Check code locations in specs
- **History**: Review session summaries

---

**Last Updated**: December 20, 2024
**Total Specs**: 27 documents
**Recent Additions**: 5 new specs (December 2024)
