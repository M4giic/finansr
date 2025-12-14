"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createSubcategory(name: string, categoryId: string) {
    try {
        // Normalize name to Title Case
        const normalizedName = name.trim().replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );

        const existing = await db.subcategory.findFirst({
            where: {
                name: normalizedName,
                categoryId
            }
        });

        if (existing) {
            return { success: true, subcategory: existing };
        }

        const subcategory = await db.subcategory.create({
            data: {
                name: normalizedName,
                categoryId
            }
        });
        try {
            revalidatePath("/");
        } catch (e) {
            // Ignore revalidation error
        }
        return { success: true, subcategory };
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return { success: false, error: "Failed to create subcategory" };
    }
}

export async function getSubcategoriesByCategory(categoryId: string) {
    try {
        const subcategories = await db.subcategory.findMany({
            where: { categoryId },
            orderBy: { name: 'asc' }
        });
        return { success: true, subcategories };
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return { success: false, error: "Failed to fetch subcategories", subcategories: [] };
    }
}

export async function updateSubcategory(id: string, name: string) {
    try {
        const subcategory = await db.subcategory.update({
            where: { id },
            data: { name }
        });
        try {
            revalidatePath("/");
        } catch (e) {
            // Ignore revalidation error
        }
        return { success: true, subcategory };
    } catch (error) {
        console.error("Error updating subcategory:", error);
        return { success: false, error: "Failed to update subcategory" };
    }
}

export async function deleteSubcategory(id: string) {
    try {
        await db.subcategory.delete({
            where: { id }
        });
        try {
            revalidatePath("/");
        } catch (e) {
            // Ignore revalidation error
        }
        return { success: true };
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        return { success: false, error: "Failed to delete subcategory" };
    }
}
