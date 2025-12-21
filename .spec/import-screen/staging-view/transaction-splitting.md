# Transaction Splitting

## Overview
Allows splitting a single transaction into multiple sub-transactions with different categories/subcategories.

## Status
⚠️ **PARTIALLY IMPLEMENTED** (UI exists, functionality incomplete)

## Location
- Component: `src/components/transaction-split-dialog.tsx`
- Model: Transaction (no split fields yet in schema)

## Planned Functionality

### Use Case
Split mixed purchases into separate categories:
- Grocery shopping: Food + Household items
- Department store: Clothes + Electronics
- Gas station: Fuel + Snacks

### Split Types

**2-Way Split:**
- Automatically divides amount equally
- Amount A = Amount B = Total / 2
- Always valid (sum matches)

**3+ Way Split:**
- Manual amount entry for each split
- Shows: Current Sum / Expected Sum
- Validation: Must match original amount
- Submit disabled until sums match

### Planned UI Flow
1. Click "Split" button on transaction
2. Select number of splits (2, 3, 4, etc.)
3. For each split:
   - Enter amount (or auto-calculated for 2-way)
   - Select category
   - Select subcategory (optional)
   - Set wanted level
4. Validate sum matches original
5. Create split transactions

### Database Changes Needed
```prisma
model Transaction {
  // ... existing fields
  
  parentTransactionId String?
  parentTransaction   Transaction?  @relation("Splits")
  splitTransactions   Transaction[] @relation("Splits")
  isSplit             Boolean       @default(false)
  splitIndex          Int?
}
```

### Display Format
```
Date       Description    Amount    Category    Actions
-----------------------------------------------------------
11/28/24   Grocery       -150.00   [SPLIT]     [Unsplit]
  →        Food           -100.00   Food        [Edit] [Delete]
  →        Household       -50.00   Household   [Edit] [Delete]
```

## Implementation Status

**Completed:**
- ✅ Dialog component created
- ✅ Basic UI structure

**Pending:**
- ❌ Database schema changes
- ❌ Split/unsplit server actions
- ❌ Sum validation logic
- ❌ Display of split transactions
- ❌ Submit validation for splits

## Related Features
- [Transaction Table](../import-screen/staging-view/transaction-table.md)
- [Category Assignment](../import-screen/staging-view/category-assignment.md)

## Technical Notes
- Self-referential relation needed in Transaction model
- Parent transaction should be read-only
- Child transactions inherit date, description, account, bank
- Validation: sum of splits must equal parent amount
