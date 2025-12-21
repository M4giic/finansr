# Wanted Level Selector

## Overview
Classification system for transactions based on necessity/desire level.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/wanted-selector.tsx`
- Used in: Transaction List

## Functionality

### Levels
- **HAD_TO** - Necessary expenses (bills, groceries)
- **WANTED** - Desired but not essential
- **DIDNT_NEED** - Impulse purchases
- **REGRET** - Regretted purchases

### UI
- Dropdown selector
- Color-coded options (future enhancement)
- Optional field (can be left unset)

### Purpose
Helps users:
- Analyze spending patterns
- Identify unnecessary expenses
- Track impulse buying
- Make better financial decisions

## User Experience
- Simple dropdown selection
- Clear, relatable labels
- Optional (not required for submission)

## Related Features
- [Transaction Table](./transaction-table.md)
- Analytics (future)

## Technical Notes
- Stored in `wantedLevel` field
- String enum values
- Used for future analytics/reporting
