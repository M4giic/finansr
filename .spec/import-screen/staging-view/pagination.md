# Transaction List Pagination

## Overview
Pagination system for transaction lists to handle large datasets efficiently without scrolling.

## Status
✅ **IMPLEMENTED** (December 2024)

## Location
- Component: `src/components/transaction-list.tsx`
- Used in: Staging Area (Import & Staging tab)

## Functionality

### Pagination Logic

**Configuration**:
- **Items per page**: 50 transactions
- **Navigation**: Previous/Next buttons
- **Display**: "Page X of Y" indicator

**Implementation**:
```typescript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 50;

const totalPages = Math.ceil(transactions.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentTransactions = transactions.slice(startIndex, endIndex);
```

### Navigation Controls

**UI**:
```tsx
{totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-4">
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="p-2 border rounded disabled:opacity-50 hover:bg-gray-50"
    >
      Previous
    </button>
    <span className="text-sm">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="p-2 border rounded disabled:opacity-50 hover:bg-gray-50"
    >
      Next
    </button>
  </div>
)}
```

**Behavior**:
- Previous button disabled on page 1
- Next button disabled on last page
- Page indicator shows current/total
- Pagination hidden if only 1 page

### Page Change Handling

```typescript
const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**Features**:
- Updates current page state
- Scrolls to top of page smoothly
- Immediate UI update
- No page reload

## User Experience

### Before (Scrolling)
- Max height: 600px
- Vertical scrolling
- Sticky header
- All transactions loaded at once
- Hard to navigate large lists

### After (Pagination)
- 50 transactions per page
- No scrolling needed
- Clean page navigation
- Better performance
- Easier to track position

### Benefits
1. **Performance**: Only render 50 items at a time
2. **Usability**: Easier to navigate discrete pages
3. **Context**: Clear page position (X of Y)
4. **Accessibility**: Keyboard navigation to buttons
5. **Mobile**: Better on small screens

## Technical Details

### State Management
```typescript
const [currentPage, setCurrentPage] = useState(1);
```
- Resets to page 1 when transactions change
- Persists during edits on same page
- Simple, local state

### Array Slicing
```typescript
const currentTransactions = transactions.slice(startIndex, endIndex);
```
- Efficient for moderate datasets
- No database pagination needed
- All data in memory

### Conditional Rendering
- Pagination controls only show if `totalPages > 1`
- Prevents UI clutter for small lists
- Automatic hide/show

## Related Features
- [Transaction Table](./transaction-table.md)
- [Category Assignment](./category-assignment.md)
- [Editable Descriptions](./editable-descriptions.md)

## Implementation History

### Phase 1: Scrolling (Removed)
- Fixed height container (600px)
- Overflow-y-auto
- Sticky header
- User feedback: preferred pagination

### Phase 2: Pagination (Current)
- 50 items per page
- Previous/Next navigation
- Page indicator
- Smooth scroll to top

## Performance Considerations

### Current Approach (Client-side)
- All transactions loaded from database
- Slicing done in browser
- Works well for <10,000 transactions
- Simple implementation

### Future Optimization (if needed)
- Server-side pagination
- Load only current page from database
- Cursor-based pagination
- Better for >10,000 transactions

## Styling

### Pagination Controls
```css
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pagination-button {
  padding: 0.5rem;
  border: 1px solid;
  border-radius: 0.25rem;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
}
```

### Dark Mode Support
- Hover states adjust for dark mode
- Border colors theme-aware
- Text contrast maintained

## Future Enhancements
- Jump to page number input
- Page size selector (25/50/100)
- Keyboard shortcuts (arrow keys)
- URL-based pagination (shareable links)
- "Show all" option for small datasets
- First/Last page buttons
- Infinite scroll option
