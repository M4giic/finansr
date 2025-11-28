'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateTransactionAccount(transactionId: string, accountId: string) {
    try {
        // When changing account, we might need to clear the category if it doesn't belong to the new account
        // But for now, let's just update the account. The UI should handle category clearing/re-selection.

        await db.transaction.update({
            where: { id: transactionId },
            data: {
                accountId: accountId,
                // Optional: Clear category if we want to be strict
                // categoryId: null 
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Update Transaction Account Error:", error);
        return { success: false, error: (error as Error).message };
    }
}
