# All Transactions View

## Overview
Paginated view of all submitted transactions across all accounts.

## Status
✅ **IMPLEMENTED** (basic pagination)

## Location
- Component: `src/components/all-transactions.tsx`
- Used in: All Transactions tab

## Functionality

### Features
- **Pagination**: 50 transactions per page
- **Navigation**: Previous/Next buttons
- **Count Display**: Shows current page and total
- **All Accounts**: Shows transactions from all accounts

### UI Layout
```
All Transactions

[Transaction Table]

Page 1 of 5 (250 total)
[Previous] [Next]
```

### Current Limitations
- No filtering by date, account, category
- No sorting options
- No search functionality
- Fixed page size (50)

## User Experience
- Simple pagination controls
- Shows all submitted transactions
- Chronological order (newest first)

## Related Features
- [Transaction Table](../import-screen/staging-view/transaction-table.md)

## Future Enhancements
- Date range filtering
- Account/category filtering
- Search by description
- Sortable columns
- Configurable page size
- Export to CSV
