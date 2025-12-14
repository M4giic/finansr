'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadCsv } from '@/app/actions/upload-csv';
import { stageTransactions } from '@/app/actions/stage-transactions';
import { checkCoverageForRange, getConflictingTransactions } from '@/app/actions/coverage';
import { Button } from '@/components/ui/button';
import { BankTransaction } from '@/lib/banks/types';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ImportCoverage {
    id: string;
    bankAccount: string;
    startDate: Date;
    endDate: Date;
}

interface Account {
    id: string;
    name: string;
    type: string;
    importCoverages?: ImportCoverage[];
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

    // New state for coverage and conflicts
    const [autoAdjustDates, setAutoAdjustDates] = useState(true);
    const [hasConflicts, setHasConflicts] = useState(false);
    const [userConsent, setUserConsent] = useState(false);
    const [conflictMap, setConflictMap] = useState<Record<string, string[]>>({});
    const [coverageWarning, setCoverageWarning] = useState('');

    const router = useRouter();

    // Check for coverage conflicts when account, bank, or date range changes
    useEffect(() => {
        if (selectedAccount && selectedBank && startDate && endDate) {
            checkCoverage();
        }
    }, [selectedAccount, selectedBank, startDate, endDate]);

    // Check for transaction conflicts when moving to CONFIG step
    useEffect(() => {
        if (step === 'CONFIG' && selectedAccount && selectedBank && startDate && endDate) {
            checkConflicts();
        }
    }, [step]);

    async function checkCoverage() {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const result = await checkCoverageForRange(selectedAccount, selectedBank, start, end);

        if (result.success && result.hasConflict) {
            const periods = result.conflictingPeriods.map(p =>
                `${new Date(p.startDate).toLocaleDateString()} - ${new Date(p.endDate).toLocaleDateString()}`
            ).join(', ');
            setCoverageWarning(`⚠️ This date range overlaps with existing coverage: ${periods}`);
        } else {
            setCoverageWarning('');
        }
    }

    async function checkConflicts() {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const result = await getConflictingTransactions(selectedAccount, selectedBank, start, end);

        if (result.success && Object.keys(result.conflictMap).length > 0) {
            setConflictMap(result.conflictMap);
            setHasConflicts(true);
        } else {
            setConflictMap({});
            setHasConflicts(false);
        }
    }

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
            setSelectedBank(result.bankName || 'MBANK');

            // Calculate date range
            const dates = result.transactions.map(t => new Date(t.date).getTime());
            const min = new Date(Math.min(...dates));
            const max = new Date(Math.max(...dates));

            setStartDate(min.toISOString().split('T')[0]);
            setEndDate(max.toISOString().split('T')[0]);
            setAutoAdjustDates(true); // Reset auto-adjust

            setStep('CONFIG');
        } else {
            setMessage(`Error: ${result.error}`);
        }
    }

    function handleDateChange(type: 'start' | 'end', value: string) {
        if (type === 'start') {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
        // Disable auto-adjust when user manually changes dates
        setAutoAdjustDates(false);
    }

    // Auto-adjust end date based on filtered transactions
    useEffect(() => {
        if (autoAdjustDates && transactions.length > 0 && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const filtered = transactions.filter(t => {
                const d = new Date(t.date);
                return d >= start && d <= end;
            });

            if (filtered.length > 0) {
                const maxDate = new Date(Math.max(...filtered.map(t => new Date(t.date).getTime())));
                const newEndDate = maxDate.toISOString().split('T')[0];

                // Only update if different to avoid infinite loop
                if (newEndDate !== endDate) {
                    setEndDate(newEndDate);
                }
            }
        }
    }, [transactions, startDate, autoAdjustDates]);

    async function handleStage() {
        if (!selectedAccount) {
            setMessage("Please select an account");
            return;
        }

        if (hasConflicts && !userConsent) {
            setMessage("Please consent to importing with potential duplicates");
            return;
        }

        setUploading(true);

        // Filter transactions by date
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });

        const result = await stageTransactions(
            filtered,
            selectedAccount,
            selectedBank,
            start,
            end
        );

        setUploading(false);

        if (result.success) {
            setMessage(`Successfully staged ${result.count} transactions!`);
            setStep('UPLOAD');
            setTransactions([]);
            setUserConsent(false);
            setHasConflicts(false);
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

    // Calculate filtered transaction count
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const filteredCount = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
    }).length;

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

                <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium mb-1">From Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(new Date(startDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate ? new Date(startDate) : undefined}
                                defaultMonth={startDate ? new Date(startDate) : undefined}
                                onSelect={(date) => date && handleDateChange('start', format(date, 'yyyy-MM-dd'))}
                                initialFocus
                                modifiers={{
                                    covered: (date) => {
                                        if (!selectedAccount) return false;
                                        const coverages = accounts.find(a => a.id === selectedAccount)?.importCoverages || [];
                                        return coverages.some(c => {
                                            const start = new Date(c.startDate);
                                            const end = new Date(c.endDate);
                                            // Check if date is within range (inclusive)
                                            // Reset hours to compare dates only
                                            const d = new Date(date);
                                            d.setHours(0, 0, 0, 0);
                                            start.setHours(0, 0, 0, 0);
                                            end.setHours(0, 0, 0, 0);
                                            return d >= start && d <= end && (!selectedBank || c.bankAccount === selectedBank);
                                        });
                                    }
                                }}
                                modifiersStyles={{
                                    covered: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' } // green-100 bg, green-800 text
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium mb-1">To Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(new Date(endDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate ? new Date(endDate) : undefined}
                                defaultMonth={endDate ? new Date(endDate) : undefined}
                                onSelect={(date) => date && handleDateChange('end', format(date, 'yyyy-MM-dd'))}
                                initialFocus
                                modifiers={{
                                    covered: (date) => {
                                        if (!selectedAccount) return false;
                                        const coverages = accounts.find(a => a.id === selectedAccount)?.importCoverages || [];
                                        return coverages.some(c => {
                                            const start = new Date(c.startDate);
                                            const end = new Date(c.endDate);
                                            const d = new Date(date);
                                            d.setHours(0, 0, 0, 0);
                                            start.setHours(0, 0, 0, 0);
                                            end.setHours(0, 0, 0, 0);
                                            return d >= start && d <= end && (!selectedBank || c.bankAccount === selectedBank);
                                        });
                                    }
                                }}
                                modifiersStyles={{
                                    covered: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Existing Coverage Display */}
            {selectedAccount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Existing Coverage
                    </h4>
                    {accounts.find(a => a.id === selectedAccount)?.importCoverages?.length ? (
                        <div className="space-y-1">
                            {accounts.find(a => a.id === selectedAccount)?.importCoverages
                                ?.filter(c => !selectedBank || c.bankAccount === selectedBank) // Filter by bank if selected
                                .map(coverage => (
                                    <div key={coverage.id} className="text-xs text-blue-700 flex justify-between">
                                        <span>
                                            {new Date(coverage.startDate).toLocaleDateString()} - {new Date(coverage.endDate).toLocaleDateString()}
                                        </span>
                                        <span className="font-medium opacity-75">{coverage.bankAccount}</span>
                                    </div>
                                ))}
                            {(!selectedBank && accounts.find(a => a.id === selectedAccount)?.importCoverages?.length === 0) && (
                                <p className="text-xs text-blue-600 italic">No coverage recorded yet.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-blue-600 italic">No coverage recorded yet.</p>
                    )}
                </div>
            )}

            {/* Auto-adjust checkbox */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="auto-adjust"
                    checked={autoAdjustDates}
                    onCheckedChange={(checked) => setAutoAdjustDates(checked as boolean)}
                />
                <label
                    htmlFor="auto-adjust"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Adjust end date automatically based on transactions
                </label>
            </div>

            {/* Coverage warning */}
            {coverageWarning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <CalendarIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">{coverageWarning}</p>
                </div>
            )}

            {/* Conflict warning */}
            {hasConflicts && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-800">Potential Duplicates Detected</p>
                            <p className="text-sm text-orange-700 mt-1">
                                Some transactions in this import match existing transactions (same date and amount).
                                They may be duplicates.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-7">
                        <Checkbox
                            id="consent"
                            checked={userConsent}
                            onCheckedChange={(checked) => setUserConsent(checked as boolean)}
                        />
                        <label
                            htmlFor="consent"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I understand and want to import anyway
                        </label>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Total in file:</strong> {transactions.length} transactions</p>
                <p><strong>Will be imported:</strong> {filteredCount} transactions</p>
                <p><strong>Date Range:</strong> {startDate} to {endDate}</p>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={handleStage}
                    disabled={uploading || (hasConflicts && !userConsent)}
                >
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
