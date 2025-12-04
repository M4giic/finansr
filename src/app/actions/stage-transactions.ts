'use server';

import db from "@/lib/db";
import { BankTransaction } from "@/lib/banks/types";
import { revalidatePath } from "next/cache";
import { updateCoverage } from "./coverage";

export async function stageTransactions(
    transactions: BankTransaction[],
    accountId: string,
    bankName: string,
    dateRangeStart?: Date,
    dateRangeEnd?: Date
) {
    try {
        let count = 0;
        for (const tx of transactions) {
            // Check if transaction already exists (optional, but good practice)
            // For now, we just create new ones as per requirement to "stage" them

            await db.transaction.create({
                data: {
                    date: new Date(tx.date),
                    amount: tx.amount,
                    currency: tx.currency,
                    originalDescription: tx.description,
                    bankAccount: bankName, // Use the selected bank name
                    externalId: tx.externalId || crypto.randomUUID(),
                    accountId: accountId,
                    status: 'STAGED'
                }
            });
            count++;
        }

        // Update coverage if date range provided
        if (dateRangeStart && dateRangeEnd) {
            await updateCoverage(accountId, bankName, dateRangeStart, dateRangeEnd);
        }

        revalidatePath('/');
        return { success: true, count };
    } catch (error) {
        console.error("Stage Transactions Error:", error);
        return { success: false, error: (error as Error).message };
    }
}
