# Transaction Table Display

## Overview
Main table component showing all staged transactions with horizontal scrolling support.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/transaction-list.tsx`
- Used in: Import & Staging tab, All Transactions tab

## Functionality

### Column Structure
Columns displayed in order:
1. **Date** - Transaction date (formatted)
2. **Description** - Original/user description (editable)
3. **Amount** - Amount with currency (color-coded: red=expense, green=income)
4. **Category** - Category and subcategory picker
5. **I Wanted It** - Wanted level selector
6. **Account** - Account dropdown
7. **Bank** - Bank dropdown
8. **Actions** - Delete button

### Features
- **Horizontal Scrolling**: Table scrolls horizontally on smaller screens
- **Color Coding**: Negative amounts in red, positive in green
- **Responsive Design**: Adapts to screen size
- **Empty State**: Shows message when no transactions

### Code Implementation
```typescript
<div className="border rounded-lg overflow-x-auto">
  <table className="w-full text-left text-sm">
    {/* Headers and rows */}
  </table>
</div>
```

## User Experience
- Clean, scannable table layout
- Horizontal scroll prevents column crushing
- Visual distinction between income/expenses
- Consistent with modern web design patterns

## Related Features
- [Category Assignment](./category-assignment.md)
- [Editable Descriptions](./editable-descriptions.md)

## Technical Notes
- Uses `overflow-x-auto` for horizontal scrolling
- Amounts stored in cents, displayed with 2 decimals
- Date formatting uses browser locale
