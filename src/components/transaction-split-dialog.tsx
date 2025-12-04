"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Split } from "lucide-react";
import { splitTransaction } from "@/app/actions/split-transaction";

interface TransactionSplitDialogProps {
    transaction: Transaction;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TransactionSplitDialog({ transaction, open, onOpenChange }: TransactionSplitDialogProps) {
    const [splits, setSplits] = useState<{ amount: string; description: string }[]>([
        { amount: "", description: transaction.userDescription || transaction.originalDescription },
        { amount: "", description: transaction.userDescription || transaction.originalDescription }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize splits when dialog opens
    useEffect(() => {
        if (open) {
            // Default split: 50/50 roughly, or just 0 and total?
            // User request: "I put 20 pln for 1 value and the other will automatically change to 80"
            // So let's start with full amount in first, 0 in second? Or 50/50?
            // Let's do: First = Total, Second = 0.
            const total = transaction.amount / 100;
            setSplits([
                { amount: total.toFixed(2), description: transaction.userDescription || transaction.originalDescription },
                { amount: "0.00", description: transaction.userDescription || transaction.originalDescription }
            ]);
            setError(null);
        }
    }, [open, transaction]);

    const handleAmountChange = (index: number, value: string) => {
        const newSplits = [...splits];
        newSplits[index].amount = value;

        // Auto-balance if only 2 splits
        if (splits.length === 2) {
            const otherIndex = index === 0 ? 1 : 0;
            const currentAmount = parseFloat(value) || 0;
            const total = transaction.amount / 100;
            const remaining = total - currentAmount;
            newSplits[otherIndex].amount = remaining.toFixed(2);
        }

        setSplits(newSplits);
    };

    const handleDescriptionChange = (index: number, value: string) => {
        const newSplits = [...splits];
        newSplits[index].description = value;
        setSplits(newSplits);
    };

    const addSplit = () => {
        setSplits([...splits, { amount: "0.00", description: transaction.userDescription || transaction.originalDescription }]);
    };

    const removeSplit = (index: number) => {
        if (splits.length <= 2) return;
        const newSplits = splits.filter((_, i) => i !== index);
        setSplits(newSplits);
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const totalAmount = transaction.amount; // in cents
            const splitAmounts = splits.map(s => Math.round(parseFloat(s.amount) * 100));
            const currentSum = splitAmounts.reduce((a, b) => a + b, 0);

            if (currentSum !== totalAmount) {
                setError(`Total sum must be ${(totalAmount / 100).toFixed(2)}. Current: ${(currentSum / 100).toFixed(2)}`);
                setIsSubmitting(false);
                return;
            }

            await splitTransaction(transaction.id, splits.map((s, i) => ({
                amount: splitAmounts[i],
                description: s.description
            })));

            onOpenChange(false);
        } catch (e) {
            setError("Failed to split transaction");
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const total = transaction.amount / 100;
    const currentSum = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
    const isValid = Math.abs(currentSum - total) < 0.01;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Split Transaction</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="text-sm text-gray-500 mb-4">
                        Original Amount: <span className="font-bold text-gray-900">{total.toFixed(2)} {transaction.currency}</span>
                    </div>

                    {splits.map((split, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-1">
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={split.amount}
                                    onChange={(e) => handleAmountChange(index, e.target.value)}
                                    placeholder="Amount"
                                />
                            </div>
                            <div className="flex-[2] space-y-1">
                                <Input
                                    value={split.description}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    placeholder="Description"
                                />
                            </div>
                            {splits.length > 2 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSplit(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-between items-center pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSplit}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" /> Add Split
                        </Button>

                        <div className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                            Sum: {currentSum.toFixed(2)} / {total.toFixed(2)}
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
                        {isSubmitting ? "Splitting..." : "Split Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
