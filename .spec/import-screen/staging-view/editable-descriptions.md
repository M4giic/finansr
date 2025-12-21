# Editable Descriptions

## Overview
Allows users to add custom descriptions to transactions while preserving the original bank description.

## Status
✅ **IMPLEMENTED**

## Location
- Component: `src/components/transaction-list.tsx` (EditableDescription component)
- Action: `src/app/actions/update-description.ts`

## Functionality

### How It Works
1. Click on transaction description to enter edit mode
2. Type custom description
3. Press Enter to save or Escape to cancel
4. Custom description shown prominently, original shown below in gray

### Display Logic
- **No custom description**: Shows original description only
- **With custom description**: 
  - Primary: User description (bold)
  - Secondary: Original description (small, gray)

### Code Implementation
```typescript
<div className="font-medium">{userDescription || originalDescription}</div>
{userDescription && (
  <div className="text-xs text-gray-500">{originalDescription}</div>
)}
```

## User Experience
- Click-to-edit interface
- Visual feedback (edit mode vs view mode)
- Keyboard shortcuts (Enter/Escape)
- Preserves original for reference
- Loading state during save

## Related Features
- [Transaction Table](./transaction-table.md)

## Technical Notes
- Stores in `userDescription` field
- Original in `originalDescription` field
- Optimistic UI update
- Server action for persistence
