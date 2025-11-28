"use client";

import { useState } from "react";
import { Transaction, Category, Account } from "@prisma/client";
import { TransactionList } from "./transaction-list";

type TransactionWithAccount = Transaction & { account?: Account | null };

interface AllTransactionsProps {
    initialTransactions: TransactionWithAccount[];
    categories: Category[];
    accounts: Account[];
}

export function AllTransactions({ initialTransactions, categories, accounts }: AllTransactionsProps) {
    const [page, setPage] = useState(1);
    const pageSize = 50;

    // Simple pagination (will be enhanced with server-side pagination later)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTransactions = initialTransactions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(initialTransactions.length / pageSize);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    All Transactions ({initialTransactions.length})
                </h3>
                {/* TODO: Add filters and sorting controls */}
            </div>

            <TransactionList
                initialTransactions={paginatedTransactions}
                categories={categories}
                accounts={accounts}
            />

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 items-center">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
