import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.warn('Google Sheets credentials missing from environment variables.');
}

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: SCOPES,
});

export const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', jwt);

export async function getSheetByTitle(title: string) {
    await doc.loadInfo();
    return doc.sheetsByTitle[title];
}

export async function createSheet(title: string, headerValues?: string[]) {
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle[title];
    if (!sheet) {
        sheet = await doc.addSheet({ title, headerValues });
    }
    return sheet;
}

export async function appendRows(sheetTitle: string, rows: Record<string, string | number | boolean>[]) {
    const sheet = await getSheetByTitle(sheetTitle);
    if (!sheet) throw new Error(`Sheet ${sheetTitle} not found`);
    await sheet.addRows(rows);
}
