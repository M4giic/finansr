# Auto Bank Selection

## Overview
Automatically detects and selects the bank name based on the uploaded CSV file format.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/import-wizard.tsx` (lines 115-118)
- Logic: `src/lib/csv/factory.ts`

## Functionality

### How It Works
1. When CSV is uploaded, parser factory tries each parser's `detect()` method
2. First parser that successfully detects format is used
3. Parser returns `bankName` property (e.g., "MBANK", "CITI")
4. ImportWizard automatically sets `selectedBank` state to detected bank name

### Code Implementation
```typescript
// In import-wizard.tsx handleUpload()
if (result.success && result.transactions) {
    setTransactions(result.transactions);
    setBankName(result.bankName || '');
    setSelectedBank(result.bankName || 'MBANK'); // Auto-select detected bank
    // ...
}
```

### Supported Banks
- **MBANK** - Detected from mBank CSV format
- **CITI** - Detected from Citi Handlowy CSV formats (new and legacy)

## User Experience
- Bank field is automatically populated after CSV upload
- User can manually override the auto-selected bank if needed
- Provides seamless experience without requiring user to know/select bank format

## Related Features
- [CSV File Upload](./csv-file-upload.md)
- [Coverage Period Tracking](./coverage-period.md)

## Technical Notes
- Bank name is used for:
  - Import coverage tracking
  - Filtering existing coverages in calendar view
  - Transaction identification
- Bank name is stored in `bankAccount` field of transactions
