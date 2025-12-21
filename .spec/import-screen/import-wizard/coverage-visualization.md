# Coverage Period Visualization

## Overview
Visual display of imported date ranges in the calendar and staging area to help users understand what data has been imported.

## Status
✅ **IMPLEMENTED** (December 2024)

## Location
- Component: `src/components/import-wizard.tsx`
- Page: `src/app/[locale]/page.tsx`
- Calendar: `src/components/ui/calendar.tsx`

## Functionality

### Staging Area Date Range

**Display Location**: Staging Area header

**Format**:
```
Staging Area (170 transactions - Covering: 11/1/2024 - 12/14/2024)
```

**Implementation**:
```typescript
// Calculate date range for staged transactions
let dateRangeString = "";
if (stagedTransactions.length > 0) {
    const dates = stagedTransactions.map(tx => new Date(tx.date).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    dateRangeString = ` - Covering: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
}
```

**Purpose**:
- Shows user the date range of transactions currently staged
- Helps identify gaps or overlaps
- Provides context for import decisions

### Calendar Coverage Highlighting

**Visual Indicators**:
- **Green highlight**: Dates with existing import coverage
- **Normal**: Dates without coverage (gaps)

**How It Works**:
1. User selects account and bank in Import Wizard
2. Calendar fetches import coverages for that account+bank combination
3. Dates within coverage periods highlighted in green
4. User can see at a glance what's been imported

**Implementation**:
```typescript
// In ImportWizard
const existingCoverages = accounts
  .find(a => a.id === selectedAccount)
  ?.importCoverages
  .filter(c => c.bankAccount === selectedBank) || [];

// Pass to Calendar component
<Calendar
  coverages={existingCoverages}
  // ... other props
/>
```

**Calendar Rendering**:
```typescript
// Calendar checks if date is covered
const isCovered = coverages.some(coverage => {
  const start = new Date(coverage.startDate);
  const end = new Date(coverage.endDate);
  return date >= start && date <= end;
});

// Apply green styling if covered
className={cn(
  isCovered && "bg-green-100 dark:bg-green-900"
)}
```

## User Experience

### Benefits
1. **Gap Identification**: Easily spot missing date ranges
2. **Overlap Prevention**: See what's already imported before uploading
3. **Context Awareness**: Understand coverage at a glance
4. **Informed Decisions**: Choose date ranges based on visual feedback

### Visual Design
- **Staging Header**: Text-based date range display
- **Calendar**: Color-coded coverage periods
  - Green = Covered
  - Normal = Not covered
  - Selected date = Highlighted border

## Related Features
- [Coverage Period Tracking](./coverage-period.md)
- [Date Range Detection](./date-range-detection.md)
- [Duplicate Detection](./duplicate-detection.md)

## Technical Notes

### Data Flow
1. `HomePage` fetches accounts with `importCoverages`
2. Passes accounts to `ImportWizard`
3. `ImportWizard` filters coverages by selected account+bank
4. `Calendar` receives filtered coverages
5. Calendar highlights covered dates

### Performance
- Coverage filtering done in memory (fast)
- No additional database queries
- Coverages loaded once with accounts

### Calendar Enhancements
- Week starts on Monday (`weekStartsOn={1}`)
- Weekday headers hidden (`hideWeekdays`)
- Opens on selected date month (`defaultMonth`)
- Responsive grid layout

## Implementation History

### Phase 1: Staging Area Date Range
- Added calculation of min/max dates
- Displayed in header text
- Simple, informative

### Phase 2: Calendar Visualization
- Added coverage highlighting
- Green background for covered dates
- Dynamic filtering by account+bank

### Phase 3: Calendar Refinements
- Fixed styling issues (grid alignment)
- Removed weekday headers
- Set week start to Monday
- Fixed initial month display

## Future Enhancements
- Different colors for different banks
- Hover tooltip showing coverage details
- Click to view transactions in coverage period
- Visual gap warnings
- Coverage period editing in calendar
