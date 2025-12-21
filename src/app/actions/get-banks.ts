'use server';

import db from "@/lib/db";

export async function getExistingBanks() {
    try {
        // Get unique bank names from Transactions
        const transactionsBanks = await db.transaction.findMany({
            select: { bankAccount: true },
            distinct: ['bankAccount'],
        });

        // Get unique bank names from ImportCoverage
        const coverageBanks = await db.importCoverage.findMany({
            select: { bankAccount: true },
            distinct: ['bankAccount'],
        });

        // Combine and filter unique values case-insensitively
        const bankMap = new Map<string, string>();

        // Helper to add banks while preserving "good" casing (preferring existing or first encountered)
        const addBanks = (names: string[]) => {
            for (const name of names) {
                if (!name) continue;
                const lower = name.toLowerCase();
                if (!bankMap.has(lower)) {
                    bankMap.set(lower, name);
                }
            }
        };

        addBanks(['MBANK', 'CITI']); // Standard defaults first
        addBanks(transactionsBanks.map(t => t.bankAccount));
        addBanks(coverageBanks.map(c => c.bankAccount));

        return {
            success: true,
            banks: Array.from(bankMap.values()).sort()
        };
    } catch (error) {
        console.error("Get Existing Banks Error:", error);
        return { success: false, error: (error as Error).message, banks: ['MBANK', 'CITI'] };
    }
}
