'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteTransaction(transactionId: string) {
    await db.transaction.delete({
        where: { id: transactionId }
    });
    revalidatePath('/');
}
