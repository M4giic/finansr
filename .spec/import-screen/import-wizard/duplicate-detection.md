# Duplicate Detection

## Overview
Detects and prevents importing duplicate transactions that already exist in the database.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/import-wizard.tsx` (lines 87-100)
- Action: `src/app/actions/coverage.ts` - `getConflictingTransactions()`

## Functionality

### How It Works
1. When user proceeds to CONFIG step, system checks for duplicates
2. Compares incoming transactions with existing ones by:
   - Date range
   - Account
   - Bank
   - External ID (if available)
3. Builds conflict map showing which transactions already exist
4. Requires user consent to proceed if conflicts found

### Detection Logic
```typescript
// Matches transactions by:
- Same account
- Same bank
- Same date range
- Same externalId (if present)
```

### Conflict Resolution

**When Duplicates Found:**
1. System displays count of conflicting transactions
2. Shows checkbox: "I understand there are X duplicate transactions"
3. User must acknowledge before proceeding
4. Staging button disabled until consent given

**Conflict Map Structure:**
```typescript
{
  [transactionId]: [existingTransactionIds]
}
```

## User Experience

### Visual Indicators
- ⚠️ Warning message with duplicate count
- 🔒 Disabled staging button until acknowledged
- ☑️ Consent checkbox required

### User Flow
1. Upload CSV and configure
2. System checks for duplicates
3. If found: Warning + consent required
4. User acknowledges
5. Can proceed to stage (duplicates will be created)

## Related Features
- [Coverage Period Tracking](./coverage-period.md)
- [CSV File Upload](./csv-file-upload.md)

## Technical Notes
- Duplicate detection is informational, not preventative
- User can choose to import duplicates (e.g., for corrections)
- Helps prevent accidental re-imports
- External ID matching is most reliable when available

## Future Enhancements
- Option to skip duplicate transactions
- Merge/update existing transactions instead of creating duplicates
- More sophisticated matching (amount + description similarity)
