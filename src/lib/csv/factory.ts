import { CsvParser } from "./types";
import { MbankCsvParser } from "./mbank";
import { CitiCsvParser } from "./citi";

export class CsvParserFactory {
    private parsers: CsvParser[] = [
        new MbankCsvParser(),
        new CitiCsvParser(),
    ];

    getParser(content: string): CsvParser {
        const parser = this.parsers.find(p => p.detect(content));
        if (!parser) {
            throw new Error("Could not detect bank format from CSV content");
        }
        return parser;
    }
}
