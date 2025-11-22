'use server';

import { CsvParserFactory } from "@/lib/csv/factory";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadCsv(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    const content = await file.text();
    const factory = new CsvParserFactory();

    try {
        const parser = factory.getParser(content);
        const transactions = await parser.parse(content);

        // Import all transactions - user can delete duplicates manually
        for (const tx of transactions) {
            await db.transaction.create({
                data: {
                    date: new Date(tx.date),
                    amount: tx.amount,
                    currency: tx.currency,
                    originalDescription: tx.description,
                    bankAccount: tx.bankAccount,
                    externalId: tx.externalId || crypto.randomUUID(),
                }
            });
        }

        revalidatePath('/');
        return { success: true, message: `Imported ${transactions.length} transactions successfully!` };

    } catch (error) {
        console.error("CSV Parse Error:", error);
        return { success: false, error: (error as Error).message };
    }
}
