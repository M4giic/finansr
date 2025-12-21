"use client";

import { useState } from "react";
import { Transaction, Category, Account } from "@prisma/client";
import { useTranslations } from "next-intl";
import { CategoryPicker } from "./category-picker";
import { WantedSelector } from "./wanted-selector";
import { updateTransactionCategory } from "@/app/actions/transactions";
import { updateTransactionDescription } from "@/app/actions/update-description";
import { updateTransactionAccount } from "@/app/actions/update-account";
import { updateTransactionBank } from "@/app/actions/update-bank";
import { updateTransactionSubcategory } from "@/app/actions/update-subcategory";
import { deleteTransaction } from "@/app/actions/delete-transaction";
import { Input } from "./ui/input";
import { Check, X, Trash2, Split } from "lucide-react";
import { TransactionSplitDialog } from "./transaction-split-dialog";

interface EditableDescriptionProps {
    transactionId: string;
    userDescription: string | null;
    originalDescription: string;
}

function EditableDescription({ transactionId, userDescription, originalDescription }: EditableDescriptionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(userDescription || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await updateTransactionDescription(transactionId, value);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setValue(userDescription || "");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                    className="h-8 text-sm"
                    autoFocus
                    disabled={isSaving}
                />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <Check className="w-4 h-4 text-green-600" />
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <X className="w-4 h-4 text-red-600" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setIsEditing(true)}
                className="flex-1 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
            >
                <div className="font-medium">{userDescription || originalDescription}</div>
                {userDescription && (
                    <div className="text-xs text-gray-500">{originalDescription}</div>
                )}
            </button>
        </div>
    );
}

type TransactionWithAccount = Transaction & { account?: Account | null };

interface TransactionListProps {
    initialTransactions: TransactionWithAccount[];
    categories: Category[];
    accounts: Account[];
    existingBanks: string[];
}

export function TransactionList({ initialTransactions, categories: initialCategories, accounts, existingBanks }: TransactionListProps) {
    const t = useTranslations('HomePage');
    const [transactions, setTransactions] = useState(initialTransactions);
    const [categories, setCategories] = useState(initialCategories);
    const [splittingTransaction, setSplittingTransaction] = useState<Transaction | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = transactions.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategorySelect = async (transactionId: string, categoryId: string) => {
        await updateTransactionCategory(transactionId, categoryId);
        // Clear subcategory when category changes
        await updateTransactionSubcategory(transactionId, null);
        setTransactions(transactions.map(tx =>
            tx.id === transactionId ? { ...tx, categoryId, subcategoryId: null } : tx
        ));
    };

    const handleSubcategorySelect = async (transactionId: string, subcategoryId: string | null) => {
        await updateTransactionSubcategory(transactionId, subcategoryId);
        setTransactions(transactions.map(tx =>
            tx.id === transactionId ? { ...tx, subcategoryId } : tx
        ));
    };

    const handleAccountSelect = async (transactionId: string, accountId: string) => {
        setTransactions(prev => prev.map(tx =>
            tx.id === transactionId ? { ...tx, accountId, categoryId: null, subcategoryId: null } : tx
        ));

        await updateTransactionAccount(transactionId, accountId);
        await updateTransactionCategory(transactionId, "");
        await updateTransactionSubcategory(transactionId, null);
    };

    const handleBankSelect = async (transactionId: string, bankName: string) => {
        setTransactions(prev => prev.map(tx =>
            tx.id === transactionId ? { ...tx, bankAccount: bankName } : tx
        ));

        await updateTransactionBank(transactionId, bankName);
    };

    const handleCategoryCreated = (newCategory: Category) => {
        setCategories(prev => [...prev, newCategory]);
    };

    const handleDelete = async (transactionId: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
        await deleteTransaction(transactionId);
    };

    return (
        <>
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">I Wanted It</th>
                                <th className="p-3">Account</th>
                                <th className="p-3">Bank</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTransactions.map((tx) => {
                                const availableCategories = categories.filter(c =>
                                    !c.accountId || c.accountId === tx.accountId
                                );

                                return (
                                    <tr key={tx.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <td className="p-3">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <EditableDescription
                                                transactionId={tx.id}
                                                userDescription={tx.userDescription}
                                                originalDescription={tx.originalDescription}
                                            />
                                        </td>
                                        <td className={`p-3 text-right ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {(tx.amount / 100).toFixed(2)} {tx.currency}
                                        </td>
                                        <td className="p-3">
                                            <CategoryPicker
                                                categoryId={tx.categoryId}
                                                subcategoryId={tx.subcategoryId}
                                                categories={availableCategories}
                                                onCategorySelect={(catId) => handleCategorySelect(tx.id, catId)}
                                                onSubcategorySelect={(subId) => handleSubcategorySelect(tx.id, subId)}
                                                onCategoryCreated={handleCategoryCreated}
                                                accountId={tx.accountId}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <WantedSelector
                                                transactionId={tx.id}
                                                wantedLevel={tx.wantedLevel}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <select
                                                className="p-1 border rounded text-xs"
                                                value={tx.accountId || ""}
                                                onChange={(e) => handleAccountSelect(tx.id, e.target.value)}
                                            >
                                                <option value="" disabled>Select</option>
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            {(() => {
                                                const matchedBank = existingBanks.find(b => b.toLowerCase() === tx.bankAccount.toLowerCase());
                                                return (
                                                    <select
                                                        className="p-1 border rounded text-xs"
                                                        value={matchedBank || tx.bankAccount}
                                                        onChange={(e) => handleBankSelect(tx.id, e.target.value)}
                                                    >
                                                        {/* Include the current value if it doesn't match standard options (case-insensitive) */}
                                                        {!existingBanks.some(b => b.toLowerCase() === tx.bankAccount.toLowerCase()) && (
                                                            <option value={tx.bankAccount}>{tx.bankAccount}</option>
                                                        )}
                                                        {existingBanks.map(bank => (
                                                            <option key={bank} value={bank}>{bank}</option>
                                                        ))}
                                                    </select>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => setSplittingTransaction(tx)}
                                                className="p-1 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-700 mr-1"
                                                title="Split transaction"
                                            >
                                                <Split className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                                                title="Delete transaction"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        No transactions found. Upload a CSV to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Previous
                    </button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Next
                    </button>
                </div>
            )}

            {splittingTransaction && (
                <TransactionSplitDialog
                    transaction={splittingTransaction}
                    open={!!splittingTransaction}
                    onOpenChange={(open) => !open && setSplittingTransaction(null)}
                />
            )}
        </>
    );
}
