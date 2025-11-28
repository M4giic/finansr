import { CsvParser } from "./types";
import { MbankCsvParser } from "./mbank";
import { CitiCsvParser } from "./citi";
import { CitiNewCsvParser } from "./citi-new";

export class CsvParserFactory {
    private parsers: CsvParser[] = [
        new MbankCsvParser(),
        new CitiCsvParser(),
        new CitiNewCsvParser(),
    ];

    getParser(content: string): CsvParser {
        const parser = this.parsers.find(p => p.detect(content));
        if (!parser) {
            throw new Error("Could not detect bank format from CSV content");
        }
        return parser;
    }
}
