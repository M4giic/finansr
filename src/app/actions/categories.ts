"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCategories(accountId?: string) {
    if (accountId) {
        // Fetch Global (accountId is null) AND Account-specific categories
        return await db.category.findMany({
            where: {
                OR: [
                    { accountId: null },
                    { accountId: accountId }
                ]
            },
            orderBy: { name: 'asc' }
        });
    }

    // If no accountId provided (e.g. Admin view), fetch ALL categories
    return await db.category.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createCategory(name: string, accountId?: string | null) {
    try {
        // Normalize name to Title Case
        const normalizedName = name.trim().replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );

        // Check if category already exists for this account (or globally if accountId is null)
        // We check case-insensitively by checking the normalized name (assuming all names are normalized on creation)
        // But since we can't trust existing data is normalized, we might need a raw query or just rely on the unique constraint if we enforce normalization.
        // However, the unique constraint is on [name, accountId]. If we normalize before saving, we are good for new categories.
        // To be safe against "transport" vs "Transport" if "Transport" already exists:

        const existing = await db.category.findFirst({
            where: {
                name: normalizedName,
                accountId: accountId || null
            }
        });

        if (existing) {
            return { success: true, category: existing };
        }

        const category = await db.category.create({
            data: {
                name: normalizedName,
                accountId: accountId || null
            }
        });
        try {
            revalidatePath('/');
        } catch (e) {
            // Ignore revalidation error (e.g. when running in script)
        }
        return { success: true, category };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { success: false, error: "Failed to create category" };
    }
}
