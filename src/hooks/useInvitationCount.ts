import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch');
    }
    const data = await response.json();
    return data;
};

/**
 * Hook to fetch count of invitations not yet opened by the candidate (viewed_at is null).
 * - Auto-refreshes every 120 seconds (safety net; realtime also refreshes)
 * - Revalidates on window focus
 * - Revalidates on network reconnection
 * - Caches data to prevent unnecessary requests
 */
export function useUnopenedInvitationCount() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/candidate/invitations/unopened-count',
        fetcher,
        {
            // Realtime invalidates this key; interval is a safety net only
            refreshInterval: 120000,
            revalidateOnFocus: true, // Revalidate when window gains focus
            revalidateOnReconnect: true, // Revalidate when network reconnects
            dedupingInterval: 5000, // Dedupe requests within 5 seconds
            shouldRetryOnError: false, // Don't retry on error (avoid spam)
        }
    );

    return {
        count: data?.success ? data.count : 0,
        isLoading,
        isError: error,
        mutate, // Allows manual revalidation
    };
}

/**
 * Hook to fetch count of invitation updates the employer has not opened yet
 * (employer_last_seen_at is null — candidate activity or first candidate view).
 * - Auto-refreshes every 120 seconds (safety net; realtime also refreshes)
 * - Revalidates on window focus
 * - Revalidates on network reconnection
 * - Caches data to prevent unnecessary requests
 */
export function usePendingInvitationCount() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/employer/invitations/pending-count',
        fetcher,
        {
            // Realtime invalidates this key; interval is a safety net only
            refreshInterval: 120000,
            revalidateOnFocus: true, // Revalidate when window gains focus
            revalidateOnReconnect: true, // Revalidate when network reconnects
            dedupingInterval: 5000, // Dedupe requests within 5 seconds
            shouldRetryOnError: false, // Don't retry on error (avoid spam)
        }
    );

    return {
        count: data?.success ? data.count : 0,
        isLoading,
        isError: error,
        mutate, // Allows manual revalidation
    };
}
