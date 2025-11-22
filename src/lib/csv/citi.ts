import { BankTransaction } from "../banks/types";
import { CsvParser } from "./types";
import { parse } from 'csv-parse/sync';

export class CitiCsvParser implements CsvParser {
    name = "Citi Handlowy";

    detect(content: string): boolean {
        // Citi exports often don't have a specific marker, but we can look for column names
        return content.includes("Data transakcji") && content.includes("Saldo");
    }

    async parse(content: string): Promise<BankTransaction[]> {
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            delimiter: ',', // Citi often uses comma, but need to verify
            relax_column_count: true
        });

        return records.map((record: any) => {
            const amountStr = record['Kwota'] || '0';
            const amount = parseFloat(amountStr.replace(/\s/g, '').replace(',', '.')) * 100;

            return {
                id: crypto.randomUUID(),
                externalId: '', // Citi CSV might not have ID
                date: record['Data transakcji'],
                amount: Math.round(amount),
                currency: 'PLN',
                description: record['Opis'] || '',
                bankAccount: 'CITI',
            };
        });
    }
}
