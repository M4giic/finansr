'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function clearStagedTransactions() {
    // Delete all staged transactions
    await db.transaction.deleteMany({
        where: { status: "STAGED" }
    });

    // Delete all staged categories
    await db.category.deleteMany({
        where: { status: "STAGED" }
    });

    revalidatePath('/');

    return {
        success: true,
        message: "Cleared all staged transactions and categories"
    };
}
