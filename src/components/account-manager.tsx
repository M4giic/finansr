"use client";

import { useState } from "react";
import { Account, ImportCoverage } from "@prisma/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2, Calendar } from "lucide-react";

interface AccountWithCoverage extends Account {
    importCoverages: ImportCoverage[];
}

interface AccountManagerProps {
    initialAccounts: AccountWithCoverage[];
}

export function AccountManager({ initialAccounts }: AccountManagerProps) {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [isAdding, setIsAdding] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: "", type: "PERSONAL", currency: "PLN" });

    const handleAdd = async () => {
        // TODO: Implement server action
        console.log("Add account:", newAccount);
        setIsAdding(false);
        setNewAccount({ name: "", type: "PERSONAL", currency: "PLN" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this account?")) return;
        // TODO: Implement server action
        console.log("Delete account:", id);
    };

    // Format coverage periods grouped by bank
    function formatCoverage(coverages: ImportCoverage[]) {
        if (coverages.length === 0) {
            return <span className="text-gray-400 text-xs">No imports yet</span>;
        }

        // Group by bank
        const byBank = coverages.reduce((acc, cov) => {
            if (!acc[cov.bankAccount]) {
                acc[cov.bankAccount] = [];
            }
            acc[cov.bankAccount].push(cov);
            return acc;
        }, {} as Record<string, ImportCoverage[]>);

        return (
            <div className="space-y-1">
                {Object.entries(byBank).map(([bank, periods]) => (
                    <div key={bank} className="text-xs">
                        <span className="font-semibold text-violet-700">{bank}:</span>{' '}
                        {periods.map((p, idx) => (
                            <span key={p.id}>
                                {new Date(p.startDate).toLocaleDateString('en-GB')} - {new Date(p.endDate).toLocaleDateString('en-GB')}
                                {idx < periods.length - 1 && ', '}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Accounts</h3>
                <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
                    Add Account
                </Button>
            </div>

            {isAdding && (
                <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input
                            value={newAccount.name}
                            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                            placeholder="Account name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={newAccount.type}
                            onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                        >
                            <option value="PERSONAL">Personal</option>
                            <option value="JOINT">Joint</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Currency</label>
                        <Input
                            value={newAccount.currency}
                            onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                            placeholder="PLN"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleAdd}>Save</Button>
                        <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                    </div>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Currency</th>
                            <th className="p-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Coverage Periods
                                </div>
                            </th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account.id} className="border-t hover:bg-gray-50">
                                <td className="p-3">{account.name}</td>
                                <td className="p-3">{account.type}</td>
                                <td className="p-3">{account.currency}</td>
                                <td className="p-3">
                                    {formatCoverage(account.importCoverages)}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        className="p-1 hover:bg-red-50 rounded text-red-600"
                                        title="Delete account"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
