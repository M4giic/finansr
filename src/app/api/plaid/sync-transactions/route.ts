import { plaidClient } from "@/lib/plaid";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RemovedTransaction, Transaction } from "plaid";

export async function POST(request: Request) {
    try {
        // In a real app, we would iterate over all connections or a specific one passed in the request
        const connections = await db.bankConnection.findMany();

        let addedCount = 0;

        for (const connection of connections) {
            const { accessToken } = connection;

            // Simple sync: fetch last 30 days. 
            // In production, use cursor-based sync (transactions/sync endpoint)
            const response = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
            });

            const transactions = response.data.transactions;

            for (const plaidTx of transactions) {
                const existing = await db.transaction.findUnique({
                    where: { externalId: plaidTx.transaction_id }
                });

                if (!existing) {
                    await db.transaction.create({
                        data: {
                            externalId: plaidTx.transaction_id,
                            date: new Date(plaidTx.date),
                            amount: Math.round(plaidTx.amount * -100), // Plaid positive = expense, we use negative for expense
                            currency: plaidTx.iso_currency_code || 'PLN',
                            originalDescription: plaidTx.name,
                            bankAccount: 'PLAID_' + (plaidTx.account_id.slice(-4)), // Tag with last 4 digits of account
                        }
                    });
                    addedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, added: addedCount });
    } catch (error) {
        console.error("Error syncing transactions:", error);
        return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 });
    }
}
