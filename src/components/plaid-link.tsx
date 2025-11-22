"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Button } from '@/components/ui/button';

export function PlaidLink() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        console.log('Fetching link token...');
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        console.log('Link token received:', data.link_token);
        setToken(data.link_token);
      } catch (err) {
        console.error('Error fetching link token:', err);
        setError('Failed to initialize Plaid Link');
      }
    };
    createLinkToken();
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token, metadata) => {
    try {
      console.log('Plaid Link success, exchanging token...');
      await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token }),
      });

      // Trigger initial sync
      console.log('Syncing transactions...');
      await fetch('/api/plaid/sync-transactions', { method: 'POST' });

      alert("Bank connected and transactions synced!");
      window.location.reload();
    } catch (err) {
      console.error('Error in onSuccess:', err);
      alert('Failed to connect bank. Please try again.');
    }
  }, []);

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    console.log('Plaid Link ready state:', ready);
    console.log('Token:', token);
  }, [ready, token]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Button onClick={() => open()} disabled={!ready}>
      {ready ? 'Connect Bank' : 'Loading...'}
    </Button>
  );
}
