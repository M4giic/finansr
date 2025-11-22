'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

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

    revalidatePath('/');

    return {
        success: true,
        message: `Successfully submitted ${stagedTransactions.length} transactions!`
    };
}
