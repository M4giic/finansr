# Coverage Period Tracking

## Overview
Tracks which date ranges have been imported for each account/bank combination to prevent duplicate imports and identify gaps in transaction history.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/import-wizard.tsx` (lines 57-100)
- Actions: `src/app/actions/coverage.ts`
- Model: `ImportCoverage` in `prisma/schema.prisma`

## Functionality

### How It Works
1. When configuring import, system checks for existing coverage
2. Displays calendar view showing already-imported periods
3. Warns if selected date range overlaps with existing imports
4. Optionally auto-adjusts dates to avoid overlaps
5. Stores coverage record after successful import

### Database Model
```prisma
model ImportCoverage {
  id          String   @id @default(uuid())
  accountId   String
  account     Account  @relation(...)
  bankAccount String   // MBANK, CITI, etc.
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([accountId, bankAccount])
}
```

### Coverage Detection
- **Overlap Detection**: Checks if new range overlaps existing coverage
- **Gap Detection**: Identifies missing periods between imports
- **Visual Indicators**: Calendar shows covered periods in green

### Auto-Adjust Feature
- When enabled, automatically adjusts start/end dates to avoid overlaps
- Finds the nearest uncovered date range
- User can disable and manually override

## User Experience

### Visual Feedback
- ✅ Green highlighting on calendar for covered periods
- ⚠️ Warning message: "This date range overlaps with existing coverage: [periods]"
- 📅 Calendar shows all existing coverages for selected account/bank

### Conflict Resolution
1. **Overlap Detected**: System warns user
2. **Auto-Adjust Option**: Checkbox to automatically adjust dates
3. **Manual Override**: User can proceed anyway with consent checkbox

## Related Features
- [Auto Bank Selection](./auto-bank-selection.md)
- [Duplicate Detection](./duplicate-detection.md)

## Technical Notes
- Coverage is account + bank specific
- Prevents accidental re-imports
- Helps identify missing transaction periods
- Coverage records created after successful staging
