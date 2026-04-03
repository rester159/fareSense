'use client';

import { useState, useCallback } from 'react';
import type { SearchResult } from '@/types/flight';

export function useSearch() {
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
      });
      if (params.returnDate) {
        searchParams.set('returnDate', params.returnDate);
      }

      const res = await fetch(`/api/search?${searchParams}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Search failed' }));
        throw new Error(err.error || 'Search failed');
      }

      const result: SearchResult = await res.json();
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}
