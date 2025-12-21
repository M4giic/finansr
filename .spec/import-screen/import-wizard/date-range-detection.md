# Date Range Detection

## Overview
Automatically detects the date range of transactions in uploaded CSV file and pre-fills the date range inputs.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/import-wizard.tsx` (lines 115-130)
- Logic: Calculated from parsed transactions

## Functionality

### How It Works
1. After CSV is parsed, system analyzes all transaction dates
2. Finds earliest date (min) and latest date (max)
3. Auto-fills start and end date inputs
4. User can manually adjust if needed

### Code Implementation
```typescript
// In handleUpload()
const dates = result.transactions.map(t => new Date(t.date));
const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

setStartDate(minDate.toISOString().split('T')[0]);
setEndDate(maxDate.toISOString().split('T')[0]);
```

## User Experience
- Date fields automatically populated after upload
- User can override detected dates
- Provides sensible defaults for coverage tracking
- Reduces manual data entry

## Related Features
- [CSV File Upload](./csv-file-upload.md)
- [Coverage Period Tracking](./coverage-period.md)

## Technical Notes
- Uses JavaScript Date.parse() for date comparison
- Formats dates as YYYY-MM-DD for input fields
- Works with all supported CSV formats
