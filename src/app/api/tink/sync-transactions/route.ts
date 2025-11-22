import { NextResponse } from "next/server";
import { tinkClient } from "@/lib/tink";
import db from "@/lib/db";

export async function POST() {
    try {
        const connections = await db.bankConnection.findMany({
            where: { institutionName: 'Tink' }
        });

        let addedCount = 0;

        for (const connection of connections) {
            const { accessToken } = connection;

            // Fetch accounts
            const accountsResponse = await tinkClient.get('/data/v2/accounts', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const accounts = accountsResponse.data.accounts;

            // Fetch transactions for each account
            for (const account of accounts) {
                const transactionsResponse = await tinkClient.get('/data/v2/transactions', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        accountIdIn: account.id,
                    },
                });

                const transactions = transactionsResponse.data.transactions;

                for (const tinkTx of transactions) {
                    const existing = await db.transaction.findUnique({
                        where: { externalId: tinkTx.id }
                    });

                    if (!existing) {
                        await db.transaction.create({
                            data: {
                                externalId: tinkTx.id,
                                date: new Date(tinkTx.dates.booked),
                                amount: Math.round(tinkTx.amount.value.unscaledValue * (tinkTx.types.type === 'DEBIT' ? -1 : 1)),
                                currency: tinkTx.amount.currencyCode,
                                originalDescription: tinkTx.descriptions.display || tinkTx.descriptions.original,
                                bankAccount: `TINK_${account.name}`,
                            }
                        });
                        addedCount++;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, added: addedCount });
    } catch (error) {
        console.error("Error syncing Tink transactions:", error);
        return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 });
    }
}
