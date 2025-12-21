# Account Management

## Overview
Interface for creating, viewing, and managing financial accounts.

## Status
✅ **IMPLEMENTED** (UI only, server actions pending)

## Location
- Component: `src/components/account-manager.tsx`
- Used in: Admin tab

## Functionality

### Features
- **View Accounts**: Table showing all accounts with name, type, currency
- **Add Account**: Form to create new account
- **Delete Account**: Remove account (with confirmation)

### Account Types
- **PERSONAL** - Individual account
- **JOINT** - Shared/joint account

### Account Fields
- **Name**: Display name (e.g., "Personal Checking")
- **Type**: PERSONAL or JOINT
- **Currency**: Default PLN

### UI Layout
```
Accounts                    [Add Account]

Name              Type        Currency    Actions
Personal Account  Personal    PLN         [Delete]
Joint Savings     Joint       PLN         [Delete]
```

## User Experience
- Simple table view
- Click "Add Account" to show form
- Fill name, type, currency
- Save to create
- Delete with confirmation dialog

## Related Features
- [Category Management](../categories/category-management.md)
- Account-scoped categories

## Technical Notes
- Server actions are placeholders (console.log)
- Need to implement:
  - `createAccount()`
  - `deleteAccount()`
- Account deletion should handle related data

## Future Enhancements
- Edit account details
- Account balance tracking
- Account archiving instead of deletion
