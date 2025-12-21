# Submit Validation

## Overview
Validates staged transactions before allowing submission to permanent storage.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/submit-button.tsx`
- Action: `src/app/actions/submit-transactions.ts`

## Functionality

### Validation Rules
1. **Category Required**: All transactions must have a category assigned
2. **Wanted Level Required**: All transactions must have wanted level set
3. **Account Required**: All transactions must have account selected

### Validation Display
- Shows count: "X of Y transactions complete"
- Progress indicator
- Disabled button until all valid
- Clear messaging about what's missing

### Submit Process
1. Validate all transactions
2. Update status from STAGED to SUBMITTED
3. Set submittedAt timestamp
4. Create import coverage record
5. Optionally sync to Google Sheets
6. Redirect to success view

## User Experience
- Clear validation feedback
- Can't submit incomplete data
- Progress tracking
- Success confirmation

## Related Features
- [Transaction Table](./transaction-table.md)
- [Category Assignment](./category-assignment.md)
- Google Sheets Sync (if enabled)

## Technical Notes
- Client-side validation before submission
- Server-side validation in action
- Atomic transaction updates
- Coverage record creation
