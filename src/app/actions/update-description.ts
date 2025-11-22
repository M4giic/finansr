'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateTransactionDescription(transactionId: string, userDescription: string) {
    await db.transaction.update({
        where: { id: transactionId },
        data: { userDescription: userDescription || null }
    });
    revalidatePath('/');
}
