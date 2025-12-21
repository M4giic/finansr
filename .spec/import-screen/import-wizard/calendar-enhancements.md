# Calendar Component Enhancements

## Overview
Improvements to the calendar component used in Import Wizard for better usability and visual consistency.

## Status
✅ **IMPLEMENTED** (December 2024)

## Location
- Component: `src/components/ui/calendar.tsx`
- Used in: `src/components/import-wizard.tsx`

## Enhancements

### 1. Week Starts on Monday

**Implementation**:
```typescript
<DayPicker
  weekStartsOn={1}  // 1 = Monday, 0 = Sunday
  // ... other props
/>
```

**Rationale**:
- European convention (Poland, most of Europe)
- Matches user expectations
- Consistent with banking calendars

### 2. Weekday Headers Hidden

**Implementation**:
```typescript
<DayPicker
  hideWeekdays={true}  // react-day-picker v9 feature
  // ... other props
/>
```

**Rationale**:
- Cleaner visual appearance
- More space for date numbers
- Reduces visual clutter
- Users understand calendar layout without headers

**Previous Attempts** (unsuccessful):
- CSS classes: `hidden`, `sr-only`, `!hidden h-0`
- Custom styling on `head_row`
- All failed due to react-day-picker v9 structure

**Final Solution**:
- Used built-in `hideWeekdays` prop
- Clean, reliable, library-supported

### 3. Opens on Selected Date Month

**Implementation**:
```typescript
// In ImportWizard
<Calendar
  selected={startDate}
  defaultMonth={startDate}  // Opens to this month
  onSelect={setStartDate}
/>

<Calendar
  selected={endDate}
  defaultMonth={endDate}  // Opens to this month
  onSelect={setEndDate}
/>
```

**Behavior**:
- When user clicks "From Date" picker, opens to `startDate` month
- When user clicks "To Date" picker, opens to `endDate` month
- No need to navigate to current selection
- Immediate context

**User Experience**:
- Faster date selection
- Less clicking/navigation
- Intuitive behavior

### 4. Styling Fixes

**Grid Alignment**:
- Removed `flex` from table rows
- Used standard table layout
- Proper column alignment
- Consistent cell sizing

**Header Spacing**:
- Removed sticky positioning (not needed without weekday headers)
- Simplified CSS classes
- Clean, minimal styling

**Final CSS**:
```typescript
classNames={{
  table: "w-full text-left text-sm",
  head_row: "bg-gray-100 dark:bg-gray-800",
  row: "border-t",
  cell: "p-3",
  // ... other classes
}}
```

## react-day-picker Version

**Current**: v9.x
- `hideWeekdays` prop available
- No `IconLeft`/`IconRight` components
- Different internal structure
- Modern API

**Migration Notes**:
- v8 → v9 breaking changes handled
- Deprecated props removed
- New props adopted

## User Experience

### Before Enhancements
- Week started on Sunday (confusing for European users)
- Weekday headers (Mo Tu We...) took up space
- Calendar opened to current month (not selected date)
- Styling inconsistencies (misaligned grid)

### After Enhancements
- Week starts on Monday (familiar)
- Clean calendar without headers
- Opens to relevant month immediately
- Consistent, aligned grid

## Related Features
- [Coverage Visualization](./coverage-visualization.md)
- [Date Range Detection](./date-range-detection.md)
- [Coverage Period Tracking](./coverage-period.md)

## Technical Notes

### CSS Approach
- Tailwind utility classes
- Dark mode support
- Responsive design
- Minimal custom CSS

### Library Integration
- Uses `react-day-picker` v9
- Radix UI compatible
- TypeScript typed
- Accessible (ARIA)

### Props Used
```typescript
interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  defaultMonth?: Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hideWeekdays?: boolean;
  coverages?: ImportCoverage[];
  // ... other props
}
```

## Implementation History

### Iteration 1: Basic Calendar
- Standard react-day-picker setup
- Default configuration
- Week started Sunday

### Iteration 2: Styling Attempts
- Tried to fix grid alignment with flex
- Attempted to hide headers with CSS
- Inconsistent results

### Iteration 3: Library Props
- Discovered `hideWeekdays` prop
- Used `weekStartsOn={1}`
- Added `defaultMonth`
- Clean, working solution

### Iteration 4: Final Polish
- Removed all CSS hacks
- Simplified classNames
- Tested dark mode
- Verified accessibility

## Future Enhancements
- Keyboard navigation improvements
- Date range selection (click-drag)
- Quick date presets (Last 30 days, etc.)
- Multi-month view option
