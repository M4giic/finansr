import db from '../src/lib/db';

async function testDb() {
    try {
        console.log("Testing DB connection...");
        const count = await db.transaction.count();
        console.log(`Connection successful. Transaction count: ${count}`);
    } catch (e) {
        console.error("DB Connection Failed:", e);
    } finally {
        await db.$disconnect();
    }
}

testDb();
