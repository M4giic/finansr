
import "dotenv/config";
import db from "../src/lib/db";

async function main() {
    console.log("Seeding Staged Transactions and Coverage...");

    // 1. Get or create an account
    let account = await db.account.findFirst({ where: { name: "Browser Test Account" } });
    if (!account) {
        account = await db.account.create({
            data: {
                name: "Browser Test Account",
                type: "PERSONAL",
                currency: "PLN"
            }
        });
    }

    // 2. Clear existing staged transactions for this account
    await db.transaction.deleteMany({
        where: {
            accountId: account.id,
            status: "STAGED"
        }
    });

    // 3. Create staged transactions
    // Date 1: 2024-01-01
    await db.transaction.create({
        data: {
            date: new Date("2024-01-01"),
            amount: -10000,
            currency: "PLN",
            originalDescription: "Test Transaction 1",
            accountId: account.id,
            bankAccount: "MBANK",
            status: "STAGED"
        }
    });

    // Date 2: 2024-01-31
    await db.transaction.create({
        data: {
            date: new Date("2024-01-31"),
            amount: -5000,
            currency: "PLN",
            originalDescription: "Test Transaction 2",
            accountId: account.id,
            bankAccount: "MBANK",
            status: "STAGED"
        }
    });

    // 4. Create Import Coverage
    // Range: 2023-12-01 to 2023-12-31
    await db.importCoverage.create({
        data: {
            accountId: account.id,
            bankAccount: "MBANK",
            startDate: new Date("2023-12-01"),
            endDate: new Date("2023-12-31")
        }
    });

    console.log("Seeding complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
