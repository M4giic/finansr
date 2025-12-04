import 'dotenv/config';
import { doc } from '../src/lib/google-sheets';

async function testConnection() {
    console.log('Testing Google Sheets connection...');

    try {
        // 1. Test Read Access
        await doc.loadInfo();
        console.log(`✅ Connected successfully!`);
        console.log(`📄 Sheet Title: ${doc.title}`);
        console.log(`🆔 Sheet ID: ${doc.spreadsheetId}`);

        // 2. Test Write Access
        console.log('Testing write permissions...');
        const testSheetTitle = `Test Connection ${Date.now()}`;
        const sheet = await doc.addSheet({ title: testSheetTitle });
        console.log(`✅ Created test sheet: ${testSheetTitle}`);

        await sheet.delete();
        console.log(`✅ Deleted test sheet`);

        console.log('🎉 Verification complete! Read and Write permissions are working.');
    } catch (error: any) {
        console.error('❌ Connection failed:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
        console.log('\nTroubleshooting tips:');
        console.log('1. Check if GOOGLE_SERVICE_ACCOUNT_EMAIL is added as Editor in the Sheet.');
        console.log('2. Check if GOOGLE_PRIVATE_KEY in .env is correct (newlines handled).');
        console.log('3. Check if GOOGLE_SHEET_ID is correct.');
        process.exit(1);
    }
}

testConnection();
