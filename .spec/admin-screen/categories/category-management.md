# Category Management

## Overview
Interface for viewing, editing, and managing categories with hierarchical subcategory display.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/category-manager.tsx`
- Used in: Admin tab

## Functionality

### Features
- **View Categories**: Grouped by account, hierarchical display
- **Edit Category**: Inline editing of category names
- **Delete Category**: Remove category (with confirmation)
- **Manage Subcategories**: Add, delete subcategories below each category

### Display Structure
```
Personal Account
Name                Status      Actions
Food                SUBMITTED   [Edit] [+] [Delete]
  → Groceries       Subcategory [Delete]
  → Restaurants     Subcategory [Delete]
  → + Add new       [inline input]
Transport           STAGED      [Edit] [+] [Delete]
```

### Category Grouping
- Categories grouped by account name
- "Global" group for account-less categories
- Hierarchical indentation for subcategories

### Inline Editing
1. Click Edit button
2. Name field becomes editable
3. Check/X buttons to save/cancel
4. Updates immediately

### Subcategory Management
1. Click + button on category
2. Inline input appears with → indicator
3. Type name and press Enter or click Add
4. Subcategory appears below parent
5. Delete button for each subcategory

## User Experience
- Clean hierarchical view
- Visual parent-child relationship (→ indicator)
- Inline editing without modals
- Keyboard-friendly (Enter/Escape)
- Color-coded status badges

## Related Features
- [Subcategory System](./subcategories.md)
- [Account Management](../accounts/account-management.md)

## Technical Notes
- Server actions implemented for subcategories
- Category edit/delete are placeholders
- Subcategories cascade delete with parent
- Status field shows STAGED vs SUBMITTED
