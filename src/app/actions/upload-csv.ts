'use server';

import { CsvParserFactory } from "@/lib/csv/factory";

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

        return {
            success: true,
            transactions: transactions,
            bankName: parser.name
        };

    } catch (error) {
        console.error("CSV Parse Error:", error);
        return { success: false, error: (error as Error).message };
    }
}
