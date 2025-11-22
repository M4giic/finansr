import { BankTransaction } from "../banks/types";
import { CsvParser } from "./types";
import { parse } from 'csv-parse/sync';

export class MbankCsvParser implements CsvParser {
    name = "mBank";

    detect(content: string): boolean {
        return content.includes("#Numer rachunku;") || content.includes("mBank S.A.");
    }

    async parse(content: string): Promise<BankTransaction[]> {
        const lines = content.split('\n');
        // mBank often has metadata in the first few lines. 
        // We look for the header line starting with "Data operacji" or similar.
        const headerIndex = lines.findIndex(line => line.toLowerCase().includes('data operacji'));

        if (headerIndex === -1) {
            throw new Error("Could not find header row in mBank CSV");
        }

        // Extract relevant content starting from header
        const csvContent = lines.slice(headerIndex).join('\n');

        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            delimiter: ';',
            relax_column_count: true
        });

        return records.map((record: any) => {
            // Real mBank CSVs have # prefix in column names
            const amountStr = record['#Kwota'] || record['Kwota'] || record['Kwota operacji'] || '';

            if (!amountStr) {
                console.warn('No amount found for record:', record);
                return null;
            }

            const amount = parseFloat(amountStr.replace(/\s/g, '').replace(',', '.').replace('PLN', '')) * 100;

            return {
                id: crypto.randomUUID(),
                externalId: record['ID operacji'] || '',
                date: record['#Data operacji'] || record['Data operacji'],
                amount: Math.round(amount),
                currency: 'PLN',
                description: record['#Opis operacji'] || record['Opis operacji'] || record['Tytuł'] || '',
                bankAccount: 'MBANK',
            };
        }).filter((t): t is BankTransaction => t !== null); // Remove any null entries
    }
}
