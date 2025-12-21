# Category Assignment

## Overview
Hierarchical category and subcategory selection for transactions using a searchable dropdown with inline creation.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/category-picker.tsx`
- Used in: Transaction List (staging and all transactions)

## Functionality

### Hierarchical Display
- Categories shown first (bold)
- When category selected, subcategories appear below with → indicator
- Subcategories indented for visual hierarchy
- "Add new" option to create subcategories inline
- "None" option to clear subcategory selection

### Visual Structure
```
Category 1 ✓
  → Subcategory A ✓
  → Subcategory B
  → + Add new
  → None
Category 2
Category 3
```

### Features
- **Type-to-Search**: Filter categories and subcategories by typing
- **Inline Creation**: Press Enter to create new category/subcategory
- **Add New Button**: Click "→ + Add new" to add subcategory
- **Account Filtering**: Only shows categories for selected account
- **Display Format**: Shows "Category → Subcategory" or just "Category"

### User Flow

**Creating Category:**
1. Click category dropdown
2. Type category name
3. Press Enter or click "Create category"

**Creating Subcategory:**
1. Select a category
2. Click "→ + Add new"
3. Type subcategory name in inline input
4. Press Enter to create

**Selecting:**
1. Click dropdown
2. Select category (required)
3. Optionally select subcategory from list below
4. Or click "None" to clear subcategory

## User Experience
- Single dropdown with hierarchical view
- Intuitive parent-child relationship
- Quick inline creation without modals
- Keyboard-friendly (Enter to create, Escape to cancel)

## Related Features
- [Subcategory System](../../admin-screen/categories/subcategories.md)
- [Transaction Table](./transaction-table.md)

## Technical Notes
- Uses Radix UI Command component for search
- Auto-loads subcategories when category selected
- Optimistic UI updates for smooth experience
- Account-scoped category filtering
