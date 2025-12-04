'use server';

import db from '@/lib/db';
import { doc } from '@/lib/google-sheets';
import { format } from 'date-fns';

export async function syncSheets() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        await doc.loadInfo();

        // 1. FEED TAB - Incremental Sync (only new transactions)
        const feedTitle = `Feed ${currentYear}`;
        const feedHeader = ['Date', 'Amount', 'Category', 'Subcategory', 'Description', 'Bank', 'Want Level', 'Account'];

        let feedSheet = doc.sheetsByTitle[feedTitle];
        if (!feedSheet) {
            // Create new sheet with headers
            feedSheet = await doc.addSheet({ title: feedTitle, headerValues: feedHeader });
        }

        // Fetch only unsynced transactions for the current year
        const unsyncedTransactions = await db.transaction.findMany({
            where: {
                date: {
                    gte: startOfYear,
                    lte: endOfYear,
                },
                syncedToSheets: null, // Only unsynced transactions
            },
            include: {
                category: true,
                subcategory: true,
                account: true,
            },
            orderBy: {
                date: 'asc',
            },
        });

        if (unsyncedTransactions.length > 0) {
            // Append new transactions
            const feedRows = unsyncedTransactions.map(t => ({
                Date: format(t.date, 'yyyy-MM-dd'),
                Amount: t.amount / 100,
                Category: t.category?.name || 'Uncategorized',
                Subcategory: t.subcategory?.name || '',
                Description: t.userDescription || t.originalDescription,
                Bank: t.bankAccount,
                'Want Level': t.wantedLevel || '',
                Account: t.account?.name || '',
            }));

            await feedSheet.addRows(feedRows);

            // Mark transactions as synced
            await db.transaction.updateMany({
                where: {
                    id: { in: unsyncedTransactions.map(t => t.id) },
                },
                data: {
                    syncedToSheets: now,
                },
            });
        }

        // 2. MONTHLY OVERVIEW TABS - Formula-Based (one-time setup)
        // Get unique months from all transactions
        const allTransactions = await db.transaction.findMany({
            where: {
                date: {
                    gte: startOfYear,
                    lte: endOfYear,
                },
            },
            select: { date: true },
        });

        const uniqueMonths = [...new Set(allTransactions.map(t => format(t.date, 'MMM yyyy')))];

        for (const monthKey of uniqueMonths) {
            const overviewTitle = `Overview ${monthKey}`;
            let overviewSheet = doc.sheetsByTitle[overviewTitle];

            if (!overviewSheet) {
                // Create new sheet for this month
                overviewSheet = await doc.addSheet({ title: overviewTitle });

                // Set up formula-based structure
                const monthDate = new Date(monthKey);
                const monthStart = format(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1), 'yyyy-MM-dd');
                const monthEnd = format(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0), 'yyyy-MM-dd');

                // Use Google Sheets QUERY function to pull and group data from Feed
                const formulas = [
                    ['MONTHLY OVERVIEW', monthKey],
                    [''],
                    ['Category', 'Total Amount', 'Transaction Count'],
                    [`=QUERY('${feedTitle}'!A:H, "SELECT C, SUM(B), COUNT(B) WHERE A >= date '${monthStart}' AND A <= date '${monthEnd}' GROUP BY C ORDER BY SUM(B) DESC LABEL SUM(B) '', COUNT(B) ''", 0)`],
                    [''],
                    [''],
                    ['WANT LEVEL BREAKDOWN'],
                    ['Want Level', 'Total Amount'],
                    [`=QUERY('${feedTitle}'!A:H, "SELECT G, SUM(B) WHERE A >= date '${monthStart}' AND A <= date '${monthEnd}' GROUP BY G ORDER BY SUM(B) DESC LABEL SUM(B) ''", 0)`],
                ];

                // Add formulas using updateCells (raw API)
                await overviewSheet.loadCells();
                formulas.forEach((row, rowIndex) => {
                    row.forEach((value, colIndex) => {
                        const cell = overviewSheet.getCell(rowIndex, colIndex);
                        if (typeof value === 'string' && value.startsWith('=')) {
                            cell.formula = value;
                        } else {
                            cell.value = value;
                        }
                    });
                });
                await overviewSheet.saveUpdatedCells();
            }
        }

        // 3. AGGREGATED VIEW - Formula-Based (one-time setup)
        const aggTitle = 'Aggregated View';
        let aggSheet = doc.sheetsByTitle[aggTitle];

        if (!aggSheet) {
            aggSheet = await doc.addSheet({ title: aggTitle });

            // Set up formula-based aggregated view
            const formulas = [
                ['=== MONTHLY CATEGORY BREAKDOWN ==='],
                ['Month', 'Category', 'Total Amount'],
                [`=QUERY('${feedTitle}'!A:H, "SELECT YEAR(A) & '-' & TEXT(MONTH(A), '00'), C, SUM(B) WHERE A IS NOT NULL GROUP BY YEAR(A) & '-' & TEXT(MONTH(A), '00'), C ORDER BY YEAR(A) & '-' & TEXT(MONTH(A), '00'), SUM(B) DESC LABEL YEAR(A) & '-' & TEXT(MONTH(A), '00') '', C '', SUM(B) ''", 0)`],
                [''],
                [''],
                ['=== MONTHLY WANT LEVEL BREAKDOWN ==='],
                ['Month', 'Want Level', 'Total Amount'],
                [`=QUERY('${feedTitle}'!A:H, "SELECT YEAR(A) & '-' & TEXT(MONTH(A), '00'), G, SUM(B) WHERE A IS NOT NULL GROUP BY YEAR(A) & '-' & TEXT(MONTH(A), '00'), G ORDER BY YEAR(A) & '-' & TEXT(MONTH(A), '00'), SUM(B) DESC LABEL YEAR(A) & '-' & TEXT(MONTH(A), '00') '', G '', SUM(B) ''", 0)`],
            ];

            await aggSheet.loadCells();
            formulas.forEach((row, rowIndex) => {
                row.forEach((value, colIndex) => {
                    const cell = aggSheet.getCell(rowIndex, colIndex);
                    if (typeof value === 'string' && value.startsWith('=')) {
                        cell.formula = value;
                    } else {
                        cell.value = value;
                    }
                });
            });
            await aggSheet.saveUpdatedCells();
        }

        return {
            success: true,
            syncedCount: unsyncedTransactions.length,
            message: `Synced ${unsyncedTransactions.length} new transactions`
        };
    } catch (error) {
        console.error('Sync failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
    }
}
