"use client";

import { useState } from "react";
import { submitTransactions } from "@/app/actions/submit-transactions";
import { clearStagedTransactions } from "@/app/actions/clear-staged";
import { Button } from "./ui/button";
import { CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

interface SubmitButtonProps {
    totalCount: number;
    completeCount: number;
}

export function SubmitButton({ totalCount, completeCount }: SubmitButtonProps) {
    const [submitting, setSubmitting] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [message, setMessage] = useState("");

    const isReady = totalCount > 0 && completeCount === totalCount;

    const handleSubmit = async () => {
        setSubmitting(true);
        setMessage("");

        const result = await submitTransactions();

        setSubmitting(false);
        if (result.success) {
            setMessage(result.message || "Success!");
        } else {
            setMessage(result.error || "Failed to submit");
        }
    };

    const handleClear = async () => {
        if (!confirm(`Are you sure you want to clear all ${totalCount} staged transactions? This cannot be undone.`)) {
            return;
        }

        setClearing(true);
        setMessage("");

        const result = await clearStagedTransactions();

        setClearing(false);
        if (result.success) {
            setMessage(result.message || "Cleared!");
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg">Ready to Submit?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {completeCount} of {totalCount} transactions complete
                    </p>
                    {!isReady && totalCount > 0 && (
                        <p className="text-sm text-orange-600 mt-1">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            All transactions need category and "I Wanted It" level
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleClear}
                        disabled={totalCount === 0 || clearing || submitting}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {clearing ? "Clearing..." : "Clear All"}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isReady || submitting || clearing}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {submitting ? "Submitting..." : "Submit Transactions"}
                    </Button>
                </div>
            </div>
            {message && (
                <p className={`mt-2 text-sm ${message.includes("Success") || message.includes("Cleared") ? "text-green-600" : "text-red-600"}`}>
                    {(message.includes("Success") || message.includes("Cleared")) && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                    {message}
                </p>
            )}
        </div>
    );
}
