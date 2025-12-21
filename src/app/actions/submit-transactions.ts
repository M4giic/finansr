'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { updateCoverage } from "./coverage";

export async function submitTransactions() {
    // Get all staged transactions
    const stagedTransactions = await db.transaction.findMany({
        where: { status: "STAGED" }
    });

    // Validate all have category and wantedLevel
    const incomplete = stagedTransactions.filter(tx => !tx.categoryId || !tx.wantedLevel);

    if (incomplete.length > 0) {
        return {
            success: false,
            error: `${incomplete.length} transaction(s) missing category or "I Wanted It" level`
        };
    }

    // Group transactions by account and bank to update coverage
    const coverageGroups = new Map<string, { accountId: string, bankAccount: string, dates: number[] }>();

    for (const tx of stagedTransactions) {
        if (!tx.accountId) continue;
        const key = `${tx.accountId}_${tx.bankAccount}`;
        if (!coverageGroups.has(key)) {
            coverageGroups.set(key, {
                accountId: tx.accountId,
                bankAccount: tx.bankAccount,
                dates: []
            });
        }
        coverageGroups.get(key)!.dates.push(tx.date.getTime());
    }

    // Update all transactions to SUBMITTED
    await db.transaction.updateMany({
        where: { status: "STAGED" },
        data: {
            status: "SUBMITTED",
            submittedAt: new Date()
        }
    });

    // Update all staged categories to SUBMITTED
    await db.category.updateMany({
        where: { status: "STAGED" },
        data: { status: "SUBMITTED" }
    });

    // Update coverage for each group
    for (const group of coverageGroups.values()) {
        const minDate = new Date(Math.min(...group.dates));
        const maxDate = new Date(Math.max(...group.dates));
        await updateCoverage(group.accountId, group.bankAccount, minDate, maxDate);
    }

    revalidatePath('/');

    return {
        success: true,
        message: `Successfully submitted ${stagedTransactions.length} transactions!`
    };
}
