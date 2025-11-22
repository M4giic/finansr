import { BankTransaction } from "../banks/types";

export interface CsvParser {
    name: string;
    detect(content: string): boolean;
    parse(content: string): Promise<BankTransaction[]>;
}

export interface PdfParser {
    name: string;
    detect(buffer: Buffer): Promise<boolean>;
    parse(buffer: Buffer): Promise<BankTransaction[]>;
}

export interface ParseResult {
    transactions: BankTransaction[];
    errors: string[];
}
