'use client';

import { useState } from 'react';
import { syncSheets } from '@/app/actions/sync-sheets';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export function SyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncSheets();
            if (result.success) {
                alert('Synced successfully!');
            } else {
                alert('Sync failed. Check console for details.');
            }
        } catch (error) {
            console.error('Sync error:', error);
            alert('Sync failed.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-2"
        >
            {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="h-4 w-4" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync to Sheets'}
        </Button>
    );
}
