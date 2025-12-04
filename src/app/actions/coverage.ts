'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Get all coverage periods for a specific account and bank
 */
export async function getCoverageForAccount(accountId: string, bankAccount: string) {
    try {
        const coverage = await db.importCoverage.findMany({
            where: {
                accountId,
                bankAccount
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        return { success: true, coverage };
    } catch (error) {
        console.error("Get Coverage Error:", error);
        return { success: false, error: (error as Error).message, coverage: [] };
    }
}

/**
 * Get all coverage periods for all accounts (for admin panel)
 */
export async function getAllCoverage() {
    try {
        const coverage = await db.importCoverage.findMany({
            include: {
                account: true
            },
            orderBy: [
                { accountId: 'asc' },
                { bankAccount: 'asc' },
                { startDate: 'asc' }
            ]
        });

        return { success: true, coverage };
    } catch (error) {
        console.error("Get All Coverage Error:", error);
        return { success: false, error: (error as Error).message, coverage: [] };
    }
}

/**
 * Update coverage period for an account+bank combination
 * Merges with existing coverage if overlapping or adjacent
 */
export async function updateCoverage(
    accountId: string,
    bankAccount: string,
    startDate: Date,
    endDate: Date
) {
    try {
        // Get existing coverage for this account+bank
        const existing = await db.importCoverage.findMany({
            where: {
                accountId,
                bankAccount
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        // Merge logic: find overlapping or adjacent periods
        let mergedStart = startDate;
        let mergedEnd = endDate;
        const toDelete: string[] = [];

        for (const period of existing) {
            const periodStart = new Date(period.startDate);
            const periodEnd = new Date(period.endDate);

            // Check if periods overlap or are adjacent (within 1 day)
            const isOverlapping =
                (periodStart <= mergedEnd && periodEnd >= mergedStart) ||
                (Math.abs(periodEnd.getTime() - mergedStart.getTime()) <= 86400000) || // 1 day in ms
                (Math.abs(mergedEnd.getTime() - periodStart.getTime()) <= 86400000);

            if (isOverlapping) {
                // Merge: extend the range
                mergedStart = periodStart < mergedStart ? periodStart : mergedStart;
                mergedEnd = periodEnd > mergedEnd ? periodEnd : mergedEnd;
                toDelete.push(period.id);
            }
        }

        // Delete old periods that were merged
        if (toDelete.length > 0) {
            await db.importCoverage.deleteMany({
                where: {
                    id: {
                        in: toDelete
                    }
                }
            });
        }

        // Create new merged period
        await db.importCoverage.create({
            data: {
                accountId,
                bankAccount,
                startDate: mergedStart,
                endDate: mergedEnd
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Update Coverage Error:", error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Get conflicting transactions (potential duplicates)
 * Returns transactions from DB that match date+amount+bank of staging transactions
 */
export async function getConflictingTransactions(
    accountId: string,
    bankAccount: string,
    startDate: Date,
    endDate: Date
) {
    try {
        // Get all submitted transactions in this date range for this bank
        const existingTransactions = await db.transaction.findMany({
            where: {
                bankAccount,
                status: 'SUBMITTED',
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                id: true,
                date: true,
                amount: true
            }
        });

        // Build a map of date_amount -> list of transaction IDs
        const conflictMap = new Map<string, string[]>();

        for (const tx of existingTransactions) {
            const key = `${tx.date.toISOString().split('T')[0]}_${tx.amount}`;
            if (!conflictMap.has(key)) {
                conflictMap.set(key, []);
            }
            conflictMap.get(key)!.push(tx.id);
        }

        return { success: true, conflictMap: Object.fromEntries(conflictMap) };
    } catch (error) {
        console.error("Get Conflicting Transactions Error:", error);
        return { success: false, error: (error as Error).message, conflictMap: {} };
    }
}

/**
 * Check if a specific date range has coverage
 */
export async function checkCoverageForRange(
    accountId: string,
    bankAccount: string,
    startDate: Date,
    endDate: Date
) {
    try {
        const coverage = await db.importCoverage.findMany({
            where: {
                accountId,
                bankAccount,
                OR: [
                    {
                        AND: [
                            { startDate: { lte: startDate } },
                            { endDate: { gte: startDate } }
                        ]
                    },
                    {
                        AND: [
                            { startDate: { lte: endDate } },
                            { endDate: { gte: endDate } }
                        ]
                    },
                    {
                        AND: [
                            { startDate: { gte: startDate } },
                            { endDate: { lte: endDate } }
                        ]
                    }
                ]
            }
        });

        return {
            success: true,
            hasConflict: coverage.length > 0,
            conflictingPeriods: coverage
        };
    } catch (error) {
        console.error("Check Coverage Error:", error);
        return {
            success: false,
            error: (error as Error).message,
            hasConflict: false,
            conflictingPeriods: []
        };
    }
}
