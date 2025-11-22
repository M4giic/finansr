'use server';

import { CitiPdfParser } from "@/lib/csv/citi-pdf";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadPdf(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: "No file provided" };
    }

    try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Try Citi PDF parser
        const parser = new CitiPdfParser();
        const canParse = await parser.detect(buffer);

        if (!canParse) {
            return { success: false, error: "PDF format not recognized. Only Citi Handlowy PDFs are supported." };
        }

        const transactions = await parser.parse(buffer);

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
        return { success: true, message: `Imported ${transactions.length} transactions from PDF successfully!` };

    } catch (error) {
        console.error("PDF Parse Error:", error);
        return { success: false, error: (error as Error).message };
    }
}
