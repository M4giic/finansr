# CSV File Upload

## Overview
Allows users to upload CSV files from supported banks (mBank, Citi Handlowy) to import transaction data.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/import-wizard.tsx` (lines 102-133, step 'UPLOAD')
- Action: `src/app/actions/upload-csv.ts`
- Parsers: `src/lib/csv/`

## Functionality

### User Flow
1. User clicks file input to select a CSV file
2. File is uploaded and parsed
3. System automatically detects bank format (mBank or Citi)
4. Transactions are extracted and validated
5. User proceeds to configuration step

### Supported Banks
- **mBank** - Parser: `src/lib/csv/mbank.ts`
- **Citi Handlowy (New Format)** - Parser: `src/lib/csv/citi-new.ts`
- **Citi Handlowy (Legacy)** - Parser: `src/lib/csv/citi.ts`

### Technical Details

**Parser Detection Logic** (`src/lib/csv/factory.ts`):
```typescript
- Tries each parser's detect() method
- Returns first parser that successfully detects format
- Falls back to error if no parser matches
```

**Data Extracted**:
- Transaction date
- Amount (in cents/grosze)
- Currency
- Description
- Bank account identifier

### UI Elements
- File input (accepts `.csv` files only)
- Loading state during processing
- Success/error messages

### Error Handling
- Invalid file format
- Unsupported bank format
- Parsing errors
- Empty files

## Related Features
- [Auto Bank Selection](./auto-bank-selection.md)
- [Date Range Detection](./date-range-detection.md)

## Future Enhancements
- Support for additional bank formats
- Drag-and-drop file upload
- Preview of raw CSV data before parsing
