import useSWR from 'swr';

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
};

export function usePendingPaymentCount() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/employer/payments/pending-count',
        fetcher,
        {
            refreshInterval: 120000,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            shouldRetryOnError: false,
        }
    );

    return {
        count: data?.count ?? 0,
        isLoading,
        isError: error,
        mutate,
    };
}
