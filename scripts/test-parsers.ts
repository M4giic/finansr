import fs from 'fs';
import path from 'path';
import { CsvParserFactory } from '../src/lib/csv/factory';

async function testParsers() {
    const factory = new CsvParserFactory();

    // Test mBank
    console.log("Testing mBank Parser...");
    const mbankContent = fs.readFileSync(path.join(process.cwd(), 'test_mbank.csv'), 'utf-8');
    try {
        const parser = factory.getParser(mbankContent);
        console.log(`Detected Parser: ${parser.name}`);
        const transactions = await parser.parse(mbankContent);
        console.log(`Parsed ${transactions.length} transactions.`);
        console.log(transactions[0]);
        if (transactions[0].amount !== -50000) throw new Error("mBank amount mismatch");
    } catch (e) {
        console.error("mBank Test Failed:", e);
    }

    console.log("\nTesting Citi Parser...");
    const citiContent = fs.readFileSync(path.join(process.cwd(), 'test_citi.csv'), 'utf-8');
    try {
        const parser = factory.getParser(citiContent);
        console.log(`Detected Parser: ${parser.name}`);
        const transactions = await parser.parse(citiContent);
        console.log(`Parsed ${transactions.length} transactions.`);
        console.log(transactions[0]);
        if (transactions[0].amount !== -4599) throw new Error("Citi amount mismatch");
    } catch (e) {
        console.error("Citi Test Failed:", e);
    }
}

testParsers();
