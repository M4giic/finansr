"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteAccount(id: string) {
    try {
        await db.account.delete({
            where: { id }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}
