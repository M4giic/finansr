'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateTransactionBank(transactionId: string, bankName: string) {
    try {
        await db.transaction.update({
            where: { id: transactionId },
            data: {
                bankAccount: bankName
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Update Transaction Bank Error:", error);
        return { success: false, error: (error as Error).message };
    }
}
