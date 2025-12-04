"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

interface Split {
    amount: number;
    description: string;
}

export async function splitTransaction(originalTransactionId: string, splits: Split[]) {
    const originalTransaction = await db.transaction.findUnique({
        where: { id: originalTransactionId },
    });

    if (!originalTransaction) {
        throw new Error("Transaction not found");
    }

    const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);

    // Allow for small floating point errors if any, though we work with integers (cents)
    if (totalSplitAmount !== originalTransaction.amount) {
        throw new Error(`Split amounts total (${totalSplitAmount}) does not match original amount (${originalTransaction.amount})`);
    }

    await db.$transaction(async (tx) => {
        // Create new transactions
        for (const split of splits) {
            await tx.transaction.create({
                data: {
                    date: originalTransaction.date,
                    amount: split.amount,
                    currency: originalTransaction.currency,
                    originalDescription: originalTransaction.originalDescription,
                    userDescription: split.description || originalTransaction.userDescription,
                    accountId: originalTransaction.accountId,
                    bankAccount: originalTransaction.bankAccount,
                    status: originalTransaction.status,
                    // Reset category/subcategory/wanted level for new splits as they might differ
                    // or keep them? User requirement says "split 1 transaction into 2 categories or regret levels"
                    // so it implies we should probably reset them or let user choose later.
                    // For now, let's copy them to be safe, user can change them.
                    categoryId: originalTransaction.categoryId,
                    subcategoryId: originalTransaction.subcategoryId,
                    wantedLevel: originalTransaction.wantedLevel,
                },
            });
        }

        // Delete original transaction
        await tx.transaction.delete({
            where: { id: originalTransactionId },
        });
    });

    revalidatePath("/");
}
