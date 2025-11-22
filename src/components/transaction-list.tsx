"use client";

import { useState } from "react";
import { Transaction, Category } from "@prisma/client";
import { useTranslations } from "next-intl";
import { CategoryPicker } from "./category-picker";
import { WantedSelector } from "./wanted-selector";
import { updateTransactionCategory } from "@/app/actions/transactions";
import { updateTransactionDescription } from "@/app/actions/update-description";
import { deleteTransaction } from "@/app/actions/delete-transaction";
import { Input } from "./ui/input";
import { Check, X, Trash2 } from "lucide-react";

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

interface TransactionListProps {
    initialTransactions: Transaction[];
    categories: Category[];
}

export function TransactionList({ initialTransactions, categories: initialCategories }: TransactionListProps) {
    const t = useTranslations('HomePage');
    const [transactions, setTransactions] = useState(initialTransactions);
    const [categories, setCategories] = useState(initialCategories);

    const handleCategorySelect = async (transactionId: string, categoryId: string) => {
        // Optimistic update
        setTransactions(prev => prev.map(tx =>
            tx.id === transactionId ? { ...tx, categoryId } : tx
        ));

        await updateTransactionCategory(transactionId, categoryId);
    };

    const handleCategoryCreated = (newCategory: Category) => {
        // Add new category to the list so it's available for all pickers
        setCategories(prev => [...prev, newCategory]);
    };

    const handleDelete = async (transactionId: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        // Optimistic update
        setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
        await deleteTransaction(transactionId);
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3">Bank</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">I Wanted It</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
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
                            <td className="p-3">{tx.bankAccount}</td>
                            <td className="p-3">
                                <CategoryPicker
                                    categoryId={tx.categoryId}
                                    categories={categories}
                                    onSelect={(catId) => handleCategorySelect(tx.id, catId)}
                                    onCategoryCreated={handleCategoryCreated}
                                />
                            </td>
                            <td className="p-3">
                                <WantedSelector
                                    transactionId={tx.id}
                                    wantedLevel={tx.wantedLevel}
                                />
                            </td>
                            <td className="p-3">
                                <button
                                    onClick={() => handleDelete(tx.id)}
                                    className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                                    title="Delete transaction"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-500">
                                No transactions found. Upload a CSV to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
