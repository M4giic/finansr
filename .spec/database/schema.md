# Database Schema

## Overview
SQLite database schema using Prisma ORM for managing accounts, transactions, categories, and import tracking.

## Status
✅ **IMPLEMENTED**

## Location
- Schema: `prisma/schema.prisma`
- Database: `prisma/dev.db`

## Models

### Account
Represents financial accounts (personal, joint).

```prisma
model Account {
  id        String   @id @default(uuid())
  name      String
  type      String   @default("PERSONAL") // PERSONAL, JOINT
  currency  String   @default("PLN")
  
  transactions Transaction[]
  categories   Category[]
  importCoverages ImportCoverage[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Purpose**: Multi-account support for different financial contexts

---

### Transaction
Core transaction data with categorization and metadata.

```prisma
model Transaction {
  id                  String   @id @default(uuid())
  externalId          String?  @unique // Bank's transaction ID
  date                DateTime
  amount              Int      // In cents/grosze
  currency            String   @default("PLN")
  originalDescription String
  userDescription     String?
  
  categoryId          String?
  category            Category? @relation(...)
  
  subcategoryId       String?
  subcategory         Subcategory? @relation(...)
  
  accountId           String?
  account             Account?  @relation(...)
  
  wantedLevel         String?  // HAD_TO, WANTED, DIDNT_NEED, REGRET
  bankAccount         String   // MBANK, CITI
  
  status              String   @default("STAGED") // STAGED, SUBMITTED
  submittedAt         DateTime?
  
  syncedToSheets      DateTime? // Google Sheets sync timestamp
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Key Fields:**
- `externalId`: Unique bank identifier for duplicate detection
- `amount`: Stored in cents for precision
- `status`: STAGED (pre-submission) or SUBMITTED (permanent)
- `wantedLevel`: Spending necessity classification

---

### Category
Main categorization with account scoping.

```prisma
model Category {
  id           String   @id @default(uuid())
  name         String
  status       String   @default("STAGED")
  
  accountId    String?
  account      Account? @relation(...)
  
  transactions Transaction[]
  subcategories Subcategory[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([name, accountId]) // Unique per account
}
```

**Features:**
- Account-scoped (can be global if accountId null)
- Unique name per account
- Has many subcategories

---

### Subcategory
One level of sub-categorization under categories.

```prisma
model Subcategory {
  id          String   @id @default(uuid())
  name        String
  categoryId  String
  category    Category @relation(onDelete: Cascade)
  
  transactions Transaction[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([name, categoryId]) // Same name OK across categories
}
```

**Features:**
- Cascade delete with parent category
- Unique name per parent category
- 1-level depth only

---

### ImportCoverage
Tracks which date ranges have been imported to prevent duplicates.

```prisma
model ImportCoverage {
  id          String   @id @default(uuid())
  accountId   String
  account     Account  @relation(onDelete: Cascade)
  bankAccount String   // MBANK, CITI
  startDate   DateTime
  endDate     DateTime
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([accountId, bankAccount])
}
```

**Purpose**: Prevent duplicate imports, identify gaps

---

### BankConnection
Stores bank API connection credentials (Plaid/Tink).

```prisma
model BankConnection {
  id           String   @id @default(uuid())
  itemId       String   @unique
  accessToken  String
  institutionId String?
  institutionName String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Status**: Infrastructure exists but not actively used

## Relationships

```
Account (1) ----< (M) Transaction
Account (1) ----< (M) Category
Account (1) ----< (M) ImportCoverage

Category (1) ----< (M) Transaction
Category (1) ----< (M) Subcategory

Subcategory (1) ----< (M) Transaction
```

## Technical Notes
- **Database**: SQLite for simplicity
- **ORM**: Prisma for type safety
- **Migrations**: `prisma db push` for development
- **Client**: Auto-generated TypeScript types

## Related Features
- All features depend on this schema
- See individual feature docs for usage details
