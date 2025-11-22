"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCategories() {
    return await db.category.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createCategory(name: string) {
    try {
        const category = await db.category.create({
            data: { name }
        });
        revalidatePath('/');
        return { success: true, category };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { success: false, error: "Failed to create category" };
    }
}
