'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateTransactionCategory(transactionId: string, categoryId: string) {
    await db.transaction.update({
        where: { id: transactionId },
        data: { categoryId }
    });
    revalidatePath('/');
}

export async function updateTransactionWanted(transactionId: string, wantedLevel: string) {
    await db.transaction.update({
        where: { id: transactionId },
        data: { wantedLevel }
    });
    revalidatePath('/');
}
