import { BankTransaction } from "../banks/types";
import { CsvParser } from "./types";
import { parse } from 'csv-parse/sync';

export class CitiNewCsvParser implements CsvParser {
    name = "Citi Handlowy (New)";

    detect(content: string): boolean {
        // New Citi format doesn't have headers. 
        // We check the first few lines to see if they match the structure:
        // "DD/MM/YYYY","Description","Amount","Balance","Account","Type"
        try {
            const lines = content.trim().split('\n').slice(0, 5);
            if (lines.length === 0) return false;

            // Check first line
            const records = parse(lines[0], {
                skip_empty_lines: true,
                relax_column_count: true
            });

            if (records.length === 0) return false;
            const row = records[0];

            // Check column count (should be around 6)
            if (row.length < 5) return false;

            // Check date format in first column (DD/MM/YYYY)
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(row[0])) return false;

            // Check if 3rd and 4th columns are numbers (with comma or dot)
            const amountRegex = /^-?[\d\s]+([.,]\d{2})?$/;
            if (!amountRegex.test(row[2]) || !amountRegex.test(row[3])) return false;

            return true;
        } catch (e) {
            return false;
        }
    }

    async parse(content: string): Promise<BankTransaction[]> {
        const records = parse(content, {
            skip_empty_lines: true,
            relax_column_count: true,
            from_line: 1 // No headers
        });

        return records.map((record: any) => {
            // Columns:
            // 0: Date
            // 1: Description
            // 2: Amount
            // 3: Balance
            // 4: Account Number
            // 5: Type

            const dateStr = record[0];
            const description = record[1];
            const amountStr = record[2];

            // Parse amount: remove spaces, replace comma with dot
            const amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.')) * 100;

            // Parse date: DD/MM/YYYY -> YYYY-MM-DD
            const [day, month, year] = dateStr.split('/');
            const date = `${year}-${month}-${day}`;

            return {
                id: crypto.randomUUID(),
                externalId: crypto.randomUUID(), // Citi CSV doesn't have unique ID, generate one
                date: date,
                amount: Math.round(amount),
                currency: 'PLN',
                description: description,
                bankAccount: 'CITI', // Will be overridden by user selection in UI, but good default
            };
        });
    }
}
