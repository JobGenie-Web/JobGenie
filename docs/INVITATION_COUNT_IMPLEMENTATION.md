# Invitation Count Real-Time Update Implementation

## Overview

This document describes the industry-standard implementation of real-time invitation count updates using **SWR (Stale-While-Revalidate)** pattern, which is used by major companies like Vercel, Netflix, and others.

## Technology Stack

- **SWR**: Data fetching library for React
- **Next.js 14+**: App Router with Server Components
- **TypeScript**: Type-safe implementation

## Architecture

### 1. Custom Hooks (`src/hooks/useInvitationCount.ts`)

Two custom hooks provide automatic data fetching and revalidation:

#### `useUnopenedInvitationCount()` - For Candidates
Fetches count of unopened invitations (where `viewed_at` is null).

#### `usePendingInvitationCount()` - For Employers
Fetches count of pending invitations (where candidate accepted but employer hasn't confirmed).

**Features:**
- ✅ Auto-refresh every 30 seconds
- ✅ Revalidates on window focus
- ✅ Revalidates on network reconnection
- ✅ Request deduplication (5-second window)
- ✅ Smart caching
- ✅ Error handling without retry spam

### 2. API Endpoints

#### Candidate Endpoint
```
GET /api/candidate/invitations/unopened-count
Response: { success: true, count: number }
```

#### Employer Endpoint
```
GET /api/employer/invitations/pending-count
Response: { success: true, count: number }
```

### 3. Global SWR Configuration (`src/components/providers/SWRProvider.tsx`)

Provides app-wide SWR configuration:
- Revalidation on focus
- Revalidation on reconnect
- Request deduplication
- Error retry with exponential backoff
- Cache management
- Optimistic updates

### 4. Integration in Root Layout

The `SWRProvider` is added to the root layout (`src/app/layout.tsx`) to enable SWR functionality across the entire application.

## How It Works

### Automatic Updates

1. **Initial Load**: Data fetched immediately when component mounts
2. **Background Polling**: Automatically refetches every 30 seconds
3. **Focus Revalidation**: Refetches when user returns to the tab
4. **Network Revalidation**: Refetches when internet connection is restored
5. **Manual Revalidation**: Can be triggered programmatically using `mutate()`

### Request Optimization

```typescript
// Only one request is made even if multiple components use the hook
const { count } = useUnopenedInvitationCount();

// Requests within 5 seconds are deduplicated
dedupingInterval: 5000
```

### Cache Strategy

```
1. First Request  → Fetch from API → Cache response
2. Second Request → Return cached data → Fetch in background → Update cache
3. User Focus     → Fetch fresh data → Update cache
4. Network Back   → Fetch fresh data → Update cache
```

## Performance Benefits

### 1. No Manual Polling
- No `setInterval` needed
- Automatic cleanup on unmount
- Pauses when tab is not visible

### 2. Efficient Network Usage
- Request deduplication prevents redundant API calls
- Stale-while-revalidate pattern shows cached data instantly
- Background revalidation ensures data freshness

### 3. Better UX
- Instant data display from cache
- Seamless updates without loading states
- Consistent data across multiple components

### 4. Developer Experience
- Simple hook API: `const { count } = useUnopenedInvitationCount();`
- TypeScript support out of the box
- Built-in error handling

## Usage Examples

### Basic Usage
```tsx
import { useUnopenedInvitationCount } from '@/hooks/useInvitationCount';

function MyComponent() {
    const { count, isLoading, isError, mutate } = useUnopenedInvitationCount();
    
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading count</div>;
    
    return (
        <Badge>
            {count}
        </Badge>
    );
}
```

### Manual Refresh
```tsx
const { count, mutate } = useUnopenedInvitationCount();

// Manually trigger a refresh
const handleRefresh = () => {
    mutate();
};
```

### Optimistic Updates
```tsx
const { count, mutate } = useUnopenedInvitationCount();

// After marking an invitation as read
const markAsRead = async () => {
    // Optimistic update (immediate UI change)
    mutate({ success: true, count: count - 1 }, false);
    
    // Actual API call
    await fetch('/api/mark-as-read', { method: 'POST' });
    
    // Revalidate to ensure sync
    mutate();
};
```

## Configuration Options

You can customize the hook behavior:

```typescript
useSWR('/api/endpoint', fetcher, {
    refreshInterval: 30000,        // Auto-refresh interval (ms)
    revalidateOnFocus: true,       // Refresh on window focus
    revalidateOnReconnect: true,   // Refresh on reconnect
    dedupingInterval: 5000,        // Dedupe window (ms)
    shouldRetryOnError: false,     // Retry on error
})
```

## Comparison with Previous Implementation

### Before (useEffect + fetch)
```tsx
// ❌ Manual polling
// ❌ No deduplication
// ❌ No caching
// ❌ Runs even when tab is not visible
// ❌ Doesn't handle focus/reconnect
// ❌ More code to maintain

const [count, setCount] = useState(0);

useEffect(() => {
    const fetchCount = async () => {
        const res = await fetch('/api/count');
        const data = await res.json();
        setCount(data.count);
    };
    
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    
    return () => clearInterval(interval);
}, []);
```

### After (SWR)
```tsx
// ✅ Automatic polling with smart pausing
// ✅ Built-in deduplication
// ✅ Automatic caching
// ✅ Pauses when tab is not visible
// ✅ Handles focus/reconnect automatically
// ✅ Less code, more features

const { count } = useUnopenedInvitationCount();
```

## Best Practices

1. **Use the custom hooks**: Don't fetch invitation counts manually
2. **Trust the cache**: SWR handles data freshness automatically
3. **Leverage mutate**: For optimistic updates after actions
4. **Monitor network**: SWR automatically handles reconnection
5. **Don't over-configure**: Default settings work for most use cases

## Troubleshooting

### Count not updating?
- Check network tab for API errors
- Verify the API endpoint is returning correct format
- Check browser console for SWR errors

### Too many requests?
- Increase `dedupingInterval`
- Increase `refreshInterval`
- Set `revalidateOnFocus: false` if needed

### Stale data?
- Decrease `refreshInterval`
- Call `mutate()` after data-changing actions
- Check cache configuration

## References

- [SWR Documentation](https://swr.vercel.app/)
- [SWR Best Practices](https://swr.vercel.app/docs/advanced/understanding)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

## Future Enhancements

Consider these improvements:

1. **WebSocket Integration**: For instant updates without polling
2. **Server-Sent Events (SSE)**: Real-time push notifications
3. **Optimistic UI**: Show updates before server confirmation
4. **Pagination Support**: For large invitation lists
5. **Filter/Sort Support**: With persistent cache

---

**Last Updated**: April 29, 2026
**Author**: Development Team
**Version**: 1.0.0
