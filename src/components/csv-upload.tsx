'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadCsv } from '@/app/actions/upload-csv';
import { uploadPdf } from '@/app/actions/upload-pdf';
import { Button } from '@/components/ui/button';

export function CsvUpload() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        // Check file extension to determine which parser to use
        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        const result = isPdf ? await uploadPdf(formData) : await uploadCsv(formData);

        setUploading(false);
        if (result.success) {
            setMessage(result.message || 'Success');
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            // Auto-refresh to show new transactions
            router.refresh();
        } else {
            setMessage(`Error: ${result.error}`);
        }
    }

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2">Import Transactions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Upload CSV (mBank) or PDF (Citi Handlowy)
            </p>
            <div className="flex items-center gap-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.pdf"
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
