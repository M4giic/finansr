"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateTransactionSubcategory(transactionId: string, subcategoryId: string | null) {
    try {
        await db.transaction.update({
            where: { id: transactionId },
            data: { subcategoryId }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating transaction subcategory:", error);
        return { success: false, error: "Failed to update subcategory" };
    }
}
