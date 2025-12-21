# Category and Account Delete Functionality

## Overview
Ability to delete categories, subcategories, and accounts with proper confirmation and cascade behavior.

## Status
✅ **IMPLEMENTED** (December 2024)

## Location
- Actions: 
  - `src/app/actions/delete-category.ts`
  - `src/app/actions/delete-account.ts`
  - `src/app/actions/manage-subcategories.ts`
- Components:
  - `src/components/category-manager.tsx`
  - `src/components/account-manager.tsx`

## Functionality

### Delete Category

**Server Action**:
```typescript
// src/app/actions/delete-category.ts
export async function deleteCategory(id: string) {
  try {
    await db.category.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**UI Flow**:
1. User clicks delete button (trash icon) on category
2. Confirmation dialog: "Are you sure you want to delete this category?"
3. If confirmed, calls `deleteCategory(id)`
4. Category removed from UI optimistically
5. Page revalidated to sync with database

**Cascade Behavior**:
- Deletes all subcategories (Prisma cascade)
- Transactions referencing category: `categoryId` set to null
- No orphaned data

### Delete Account

**Server Action**:
```typescript
// src/app/actions/delete-account.ts
export async function deleteAccount(id: string) {
  try {
    await db.account.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**UI Flow**:
1. User clicks delete button on account
2. Confirmation: "Are you sure you want to delete this account?"
3. If confirmed, calls `deleteAccount(id)`
4. Account removed from UI
5. Page revalidated

**Cascade Behavior** (Prisma schema):
- Deletes all account-specific categories
- Deletes all import coverages
- Transactions: `accountId` set to null (or deleted, depending on schema)

### Delete Subcategory

**Server Action**:
```typescript
// src/app/actions/manage-subcategories.ts
export async function deleteSubcategory(id: string) {
  try {
    await db.subcategory.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**UI Flow**:
- Delete button in subcategory list
- Confirmation dialog
- Removes subcategory
- Transactions: `subcategoryId` set to null

## Implementation History

### Before (Bug)
- Delete buttons existed in UI
- Handlers had `// TODO: Implement server action`
- Clicking delete only logged to console
- No actual deletion occurred

### After (Fixed)
- Server actions created and implemented
- Handlers call actual server actions
- Optimistic UI updates
- Proper error handling
- Page revalidation

## User Experience

### Visual Feedback
- Trash icon button (red on hover)
- Confirmation dialog prevents accidental deletion
- Immediate UI update (optimistic)
- Page refresh on error to sync state

### Safety Measures
1. **Confirmation Dialog**: Prevents accidental clicks
2. **Cascade Delete**: Cleans up related data
3. **Error Handling**: Shows error if deletion fails
4. **Revalidation**: Ensures UI matches database

## Related Features
- [Category Management](./category-management.md)
- [Account Management](../accounts/account-management.md)
- [Subcategory System](./subcategories.md)

## Technical Notes

### Database Constraints
```prisma
model Category {
  // ...
  subcategories Subcategory[] @relation(onDelete: Cascade)
}

model Account {
  // ...
  categories Category[] @relation(onDelete: Cascade)
  importCoverages ImportCoverage[] @relation(onDelete: Cascade)
}
```

### Error Scenarios
- **Foreign Key Constraint**: If transactions reference category
- **Not Found**: If category/account already deleted
- **Database Error**: Connection issues

### Future Improvements
- Soft delete (mark as deleted instead of removing)
- Bulk delete operations
- Undo functionality
- Warning if category has transactions
- Archive instead of delete option
