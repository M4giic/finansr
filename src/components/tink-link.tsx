"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TinkLink() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get Tink Link URL from backend
            const response = await fetch('/api/tink/create-link', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            // Redirect to Tink Link
            window.location.href = data.url;
        } catch (err) {
            console.error('Error connecting to Tink:', err);
            setError('Failed to connect to bank');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <Button onClick={handleConnect} disabled={loading}>
            {loading ? 'Loading...' : 'Connect Bank'}
        </Button>
    );
}
