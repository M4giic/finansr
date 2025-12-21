# Global vs Account-Specific Categories

## Overview
Categories can be either Global (available to all accounts) or Account-specific (scoped to a single account).

## Status
✅ **IMPLEMENTED** (December 2024)

## Location
- Component: `src/components/category-manager.tsx`
- Actions: `src/app/actions/categories.ts`
- Seed Script: `scripts/seed-categories.ts`

## Functionality

### Category Scoping

**Global Categories** (`accountId: null`):
- Available to all accounts
- Created once, used everywhere
- Default categories are Global
- Displayed in CategoryManager under "Global" section

**Account-Specific Categories** (`accountId: <uuid>`):
- Only available to the specific account
- Useful for unique categorization needs per account
- Displayed in CategoryManager under account name

### How It Works

1. **Database Schema**:
```prisma
model Category {
  id        String   @id @default(uuid())
  name      String
  accountId String?  // null = Global, uuid = Account-specific
  account   Account? @relation(...)
  
  @@unique([name, accountId])
}
```

2. **Fetching Categories**:
```typescript
// Get Global + Account-specific categories
const categories = await getCategories(accountId);
// Returns: Global categories + categories for specified account
```

3. **Creating Categories**:
```typescript
// Global category
await createCategory("Food", null);

// Account-specific category
await createCategory("Personal Expenses", accountId);
```

### User Experience

**In CategoryManager**:
- Categories grouped by account
- "Global" section shows accountId=null categories
- Each account section shows its specific categories
- Add button allows choosing scope (Global or Account)

**In CategoryPicker** (Transaction List):
- Shows Global categories + categories for transaction's account
- Can create new categories scoped to transaction's account
- Filtering: `!c.accountId || c.accountId === tx.accountId`

## Implementation Details

### Default Categories Seeding
- Default categories created as Global via seed script
- Run: `npx tsx scripts/seed-categories.ts`
- Categories: Zakupy, Rachunki, Samochód, Mieszkanie, etc.

### Migration from Old System
**Previous Behavior** (removed):
- Default categories copied to each new account
- Created duplicates across accounts
- Harder to maintain consistency

**New Behavior**:
- Default categories are Global
- New accounts automatically see Global categories
- No duplication needed

### Category Fetching Logic
```typescript
export async function getCategories(accountId?: string) {
  if (!accountId) {
    // Return all categories
    return await db.category.findMany({
      include: { subcategories: true },
      orderBy: { name: 'asc' }
    });
  }
  
  // Return Global + Account-specific
  return await db.category.findMany({
    where: {
      OR: [
        { accountId: null },           // Global
        { accountId: accountId }       // Account-specific
      ]
    },
    include: { subcategories: true },
    orderBy: { name: 'asc' }
  });
}
```

## Related Features
- [Category Management](./category-management.md)
- [Account Management](../accounts/account-management.md)
- [Category Assignment](../../import-screen/staging-view/category-assignment.md)

## Technical Notes
- Unique constraint: `[name, accountId]` allows same name across different scopes
- Cascade delete: Deleting account deletes its categories
- Global categories cannot be deleted if they have transactions
- Account-specific categories useful for personal vs joint account separation

## Future Enhancements
- UI to convert Account-specific → Global
- Bulk category management
- Category templates for new accounts
