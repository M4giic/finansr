"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createAccount(data: {
    name: string;
    type: string;
    currency: string;
}) {
    try {
        const account = await db.account.create({
            data: {
                name: data.name,
                type: data.type,
                currency: data.currency
            }
        });

        revalidatePath('/');
        return { success: true, account };
    } catch (error) {
        console.error("Failed to create account:", error);
        return { success: false, error: "Failed to create account" };
    }
}
