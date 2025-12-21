# Subcategory System

## Overview
Hierarchical categorization system allowing one level of subcategories under main categories.

## Status
✅ **IMPLEMENTED**

## Location
- Model: `Subcategory` in `prisma/schema.prisma`
- Components: `category-picker.tsx`, `category-manager.tsx`
- Actions: `src/app/actions/manage-subcategories.ts`

## Functionality

### Database Model
```prisma
model Subcategory {
  id          String   @id @default(uuid())
  name        String
  categoryId  String
  category    Category @relation(onDelete: Cascade)
  transactions Transaction[]
  
  @@unique([name, categoryId])
}
```

### Key Features
- **1-Level Depth**: Category → Subcategory only (no deeper nesting)
- **Optional**: Subcategory selection is optional after choosing category
- **Unique Per Parent**: Same subcategory name allowed across different categories
- **Cascade Delete**: Deleting category removes all subcategories
- **Display Format**: Shows as "Category → Subcategory"

### Use Cases
- **Food** → Groceries, Restaurants, Takeout
- **Transport** → Fuel, Public Transit, Parking
- **Shopping** → Clothes, Electronics, Home

### Creation Methods

**In Category Manager (Admin):**
1. Click + button on category
2. Type subcategory name
3. Press Enter or click Add

**In Category Picker (Staging):**
1. Select category
2. Click "→ + Add new"
3. Type name in inline input
4. Press Enter to create

### Selection in Transactions
1. Select category (required)
2. Subcategory dropdown appears below
3. Select subcategory or leave as "None"
4. Display shows "Category → Subcategory"

## User Experience
- Intuitive parent-child relationship
- Visual hierarchy with → indicator
- Inline creation without modals
- Optional selection (not required)
- Clear display format

## Related Features
- [Category Management](./category-management.md)
- [Category Assignment](../../import-screen/staging-view/category-assignment.md)

## Technical Notes
- Self-referential relation in database
- Unique constraint: [name, categoryId]
- Cascade delete on parent removal
- Server actions: create, update, delete
- Optimistic UI updates
