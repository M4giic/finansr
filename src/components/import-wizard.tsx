'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadCsv } from '@/app/actions/upload-csv';
import { stageTransactions } from '@/app/actions/stage-transactions';
import { Button } from '@/components/ui/button';
import { BankTransaction } from '@/lib/banks/types';
import { format } from 'date-fns';

interface Account {
    id: string;
    name: string;
    type: string;
}

interface ImportWizardProps {
    accounts: Account[];
}

export function ImportWizard({ accounts }: ImportWizardProps) {
    const [step, setStep] = useState<'UPLOAD' | 'CONFIG'>('UPLOAD');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [bankName, setBankName] = useState('');

    const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.id || '');
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const router = useRouter();

    async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadCsv(formData);

        setUploading(false);
        if (result.success && result.transactions) {
            setTransactions(result.transactions);
            setBankName(result.bankName || '');
            setSelectedBank(result.bankName || 'MBANK'); // Default or detected

            // Calculate date range
            const dates = result.transactions.map(t => new Date(t.date).getTime());
            const min = new Date(Math.min(...dates));
            const max = new Date(Math.max(...dates));

            setStartDate(min.toISOString().split('T')[0]);
            setEndDate(max.toISOString().split('T')[0]);

            setStep('CONFIG');
        } else {
            setMessage(`Error: ${result.error}`);
        }
    }

    async function handleStage() {
        if (!selectedAccount) {
            setMessage("Please select an account");
            return;
        }

        setUploading(true);

        // Filter transactions by date
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);

        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });

        const result = await stageTransactions(filtered, selectedAccount, selectedBank);

        setUploading(false);

        if (result.success) {
            setMessage(`Successfully staged ${result.count} transactions!`);
            setStep('UPLOAD');
            setTransactions([]);
            router.refresh();
        } else {
            setMessage(`Error: ${result.error}`);
        }
    }

    if (step === 'UPLOAD') {
        return (
            <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-2">Import Transactions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Upload CSV (Citi or mBank)
                </p>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100
              "
                    />
                    {uploading && <span className="text-sm text-gray-500">Processing...</span>}
                </div>
                {message && (
                    <p className={`mt-2 text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 space-y-4">
            <h3 className="text-lg font-semibold">Configure Import</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Account</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedAccount}
                        onChange={e => setSelectedAccount(e.target.value)}
                    >
                        <option value="" disabled>Select Account</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Bank</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={selectedBank}
                        onChange={e => setSelectedBank(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">From Date</label>
                    <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">To Date</label>
                    <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Detected:</strong> {transactions.length} transactions</p>
                <p><strong>Date Range:</strong> {startDate} to {endDate}</p>
            </div>

            <div className="flex gap-2">
                <Button onClick={handleStage} disabled={uploading}>
                    {uploading ? 'Staging...' : 'Stage Transactions'}
                </Button>
                <Button variant="outline" onClick={() => setStep('UPLOAD')} disabled={uploading}>
                    Cancel
                </Button>
            </div>
            {message && (
                <p className={`mt-2 text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
