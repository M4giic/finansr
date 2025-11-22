import { BankTransaction } from "../banks/types";
import { PdfParser } from "./types";

export class CitiPdfParser implements PdfParser {
    name = "Citi Handlowy (PDF)";

    async detect(buffer: Buffer): Promise<boolean> {
        try {
            // @ts-ignore - pdf-parse is a CommonJS module
            const pdf = (await import('pdf-parse')).default;
            const data = await pdf(buffer);
            // Accept any PDF that has text content
            return data.text && data.text.length > 0;
        } catch (error) {
            console.error("PDF detection error:", error);
            return false;
        }
    }

    async parse(buffer: Buffer): Promise<BankTransaction[]> {
        // @ts-ignore - pdf-parse is a CommonJS module
        const pdf = (await import('pdf-parse')).default;
        const data = await pdf(buffer);
        const text = data.text;
        const lines = text.split('\n');

        console.log("PDF Text Preview (first 500 chars):", text.substring(0, 500));
        console.log("Total lines:", lines.length);

        const transactions: BankTransaction[] = [];

        // Citi PDF format typically has transactions in a table format
        // Looking for patterns like: DD.MM.YYYY Description Amount PLN
        // Example: "01.10.2025 PAYMENT -123.45 PLN"

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Match date pattern DD.MM.YYYY or DD/MM/YYYY
            const dateMatch = line.match(/(\d{2}[\.\/]\d{2}[\.\/]\d{4})/);
            if (!dateMatch) continue;

            // Try to extract amount (look for number with optional minus, comma/dot separator)
            const amountMatch = line.match(/(-?\d+[,\.]\d{2})\s*(PLN|USD|EUR|zł)?/);
            if (!amountMatch) continue;

            const dateStr = dateMatch[1];
            const amountStr = amountMatch[1];

            // Extract description (text between date and amount)
            const dateIndex = line.indexOf(dateStr);
            const amountIndex = line.indexOf(amountStr);
            const description = line.substring(dateIndex + dateStr.length, amountIndex).trim();

            if (!description) continue;

            // Parse date DD.MM.YYYY or DD/MM/YYYY
            const dateParts = dateStr.split(/[\.\/]/);
            const day = dateParts[0];
            const month = dateParts[1];
            const year = dateParts[2];
            const isoDate = `${year}-${month}-${day}`;

            // Parse amount (convert comma to dot, multiply by 100 for cents)
            const amount = parseFloat(amountStr.replace(',', '.')) * 100;

            console.log("Found transaction:", { date: isoDate, description, amount });

            transactions.push({
                id: crypto.randomUUID(),
                externalId: `${isoDate}-${description.substring(0, 20)}`,
                date: isoDate,
                amount: Math.round(amount),
                currency: amountMatch[2] || 'PLN',
                description: description,
                bankAccount: 'CITI',
            });
        }

        console.log(`Extracted ${transactions.length} transactions from PDF`);
        return transactions;
    }
}
