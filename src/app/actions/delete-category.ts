"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteCategory(id: string) {
    try {
        await db.category.delete({
            where: { id }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, error: "Failed to delete category" };
    }
}
