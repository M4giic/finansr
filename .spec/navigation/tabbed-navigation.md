# Tabbed Navigation

## Overview
Main navigation system organizing the application into 4 functional tabs.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/app/[locale]/page.tsx`
- UI: Radix UI Tabs (`src/components/ui/tabs.tsx`)

## Functionality

### Tab Structure
1. **Import & Staging** - CSV upload and transaction staging
2. **Admin** - Account and category management
3. **Analytics** - Future analytics features (placeholder)
4. **All Transactions** - Complete transaction history with pagination

### Features
- **Persistent State**: Tab selection maintained during session
- **Keyboard Navigation**: Arrow keys to switch tabs
- **Visual Indicators**: Active tab highlighted
- **Responsive**: Adapts to screen size

### Tab Contents

**Import & Staging:**
- TinkLink integration
- ImportWizard component
- Staging area with transaction list
- Submit button

**Admin:**
- AccountManager component
- CategoryManager component

**Analytics:**
- Placeholder message
- Future: Charts, spending insights, trends

**All Transactions:**
- AllTransactions component
- Pagination (50 per page)
- Future: Sorting, filtering

## User Experience
- Clean, organized interface
- Clear separation of concerns
- Easy navigation between functions
- Consistent layout across tabs

## Related Features
- [Import Screen](../import-screen/README.md)
- [Admin Screen](../admin-screen/README.md)

## Technical Notes
- Uses Radix UI Tabs for accessibility
- Server-side data fetching per tab
- Default tab: "import"
- Grid layout for tab triggers
