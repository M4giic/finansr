export interface BankTransaction {
    id: string;
    amount: number; // In cents/grosze
    currency: string;
    date: string; // ISO date string YYYY-MM-DD
    description: string; // Original description
    bankAccount: 'MBANK' | 'CITI';
    externalId: string; // ID from the bank
}

export interface BankAdapter {
    getTransactions(startDate: string, endDate: string): Promise<BankTransaction[]>;
    getBalance(): Promise<number>;
}
