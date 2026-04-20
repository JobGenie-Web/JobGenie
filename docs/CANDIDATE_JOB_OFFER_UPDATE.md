# Candidate Job Offer Real-Time Updates

## Overview

This update ensures that when an employer creates a job offer, the candidate side automatically updates to display the offer details without requiring a manual page refresh.

## Problem Solved

Previously, after an employer created a job offer:
- ❌ Candidate had to manually refresh to see the offer
- ❌ No prominent visual display of the offer details
- ❌ Offer information was buried in the interview timeline

## Solution Implemented

### 1. New JobOfferCard Component

**Location**: `src/components/candidate/JobOfferCard.tsx`

A beautiful, prominent card that displays:
- 🎉 Eye-catching "Job Offer Received!" header with briefcase icon
- 💼 Position title
- 💰 Salary information (if provided)
- 📅 Proposed start date
- ⏰ Offer expiration date with expired indicator
- 📝 Additional details/benefits
- 📄 Link to formal offer letter (if provided)
- ✅ Action buttons (Accept/Decline) for pending offers
- 🔔 Status indicators (Pending/Accepted/Declined)

**Visual Features**:
- Gradient background with status-based colors
- Large icons for better visibility
- Full dark mode support
- Responsive design
- Clear status badges

### 2. Auto-Refresh Mechanism

**Implementation**: Polling every 10 seconds

```typescript
useEffect(() => {
    fetchJobOffer();
    
    // Auto-refresh to check for new offers every 10 seconds
    const interval = setInterval(() => {
        fetchJobOffer();
    }, 10000);
    
    return () => clearInterval(interval);
}, [invitationId]);
```

**Benefits**:
- ✅ Real-time updates (within 10 seconds)
- ✅ No manual refresh needed
- ✅ Clean interval cleanup on unmount
- ✅ Runs automatically in background

### 3. New Candidate API Endpoint

**Endpoint**: `GET /api/candidate/invitations/[id]/offer`

**Purpose**: Fetch job offer details for a specific invitation

**Response**:
```json
{
  "success": true,
  "offer": {
    "id": "uuid",
    "job_title": "Senior Software Engineer",
    "salary_amount": 150000,
    "salary_currency": "LKR",
    "salary_period": "monthly",
    "start_date": "2026-05-01",
    "expiry_date": "2026-04-30",
    "offer_letter_url": "https://...",
    "description": "Benefits and details...",
    "status": "pending",
    "created_at": "2026-04-19T10:30:00Z",
    "responded_at": null
  }
}
```

**Security**:
- Requires authentication
- Verifies candidate ownership of invitation
- Only returns offers for authorized candidates

### 4. Enhanced InterviewRoadmap

**Location**: `src/components/shared/InterviewRoadmap.tsx`

**Update**: Added auto-refresh for interview rounds

```typescript
useEffect(() => {
    fetchRounds();
    
    // Auto-refresh every 10 seconds to check for updates (like new offers)
    const interval = setInterval(() => {
        fetchRounds();
    }, 10000);
    
    return () => clearInterval(interval);
}, [invitationId]);
```

**Impact**:
- Updates offer status in timeline automatically
- Shows "Offer Extended" badge when employer creates offer
- Syncs with JobOfferCard for consistent display

## User Experience Flow

### Employer Creates Offer

1. Employer marks interview outcome as "offer"
2. Employer clicks "Create Job Offer" button
3. Employer fills out offer details (salary, dates, etc.)
4. Employer submits offer
5. ✅ Banner appears: "Job Offer Extended - awaiting candidate response"
6. ✅ "Create Job Offer" button is hidden
7. ✅ Confirmation message replaces button

### Candidate Receives Offer (Automatic)

**Timeline**:
- **0-10 seconds**: Candidate's page auto-refreshes
- **Result**: Large, prominent JobOfferCard appears at top of page

**What Candidate Sees**:

```
┌─────────────────────────────────────────────────────────────┐
│  💼  Job Offer Received! 🎉                                  │
│  [Pending Response Badge]                                    │
│                                                              │
│  TechCorp has extended a formal offer for the position      │
│  of Senior Software Engineer                                │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 💼 Position: Senior Software Engineer                 │  │
│  │ 💰 Compensation: LKR 150,000 / monthly               │  │
│  │ 📅 Start Date: May 1, 2026                           │  │
│  │ ⏰ Valid Until: April 30, 2026                       │  │
│  │ 📄 [View Offer Letter] button                        │  │
│  │                                                       │  │
│  │ Additional Details:                                  │  │
│  │ • Health insurance                                   │  │
│  │ • 20 days annual leave                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ⏰ Action Required: Please review the offer and respond    │
│  [✅ Accept Offer]  [❌ Decline Offer]                       │
└─────────────────────────────────────────────────────────────┘

Interview Roadmap (below JobOfferCard)
- Round 1: Initial Interview - Completed ✅
- Round 2: Technical Round - Completed ✅
- Decision: Offer Extended 🎊
```

## Technical Implementation

### Component Integration

**InvitationDetailClient.tsx**:
```typescript
// 1. State management
const [jobOffer, setJobOffer] = useState<any>(null);

// 2. Fetch function
const fetchJobOffer = async () => {
    const response = await fetch(`/api/candidate/invitations/${invitationId}/offer`);
    const data = await response.json();
    if (data.success && data.offer) {
        setJobOffer(data.offer);
    }
};

// 3. Auto-refresh effect
useEffect(() => {
    fetchJobOffer();
    const interval = setInterval(fetchJobOffer, 10000);
    return () => clearInterval(interval);
}, [invitationId]);

// 4. Conditional rendering
{jobOffer && (
    <JobOfferCard
        offer={jobOffer}
        companyName={invitation.company.company_name}
        jobDesignation={invitation.job_designation}
    />
)}
```

### API Authorization Flow

```
Candidate Request
     │
     ▼
Verify Authentication (Supabase Auth)
     │
     ▼
Get Candidate Profile (candidates table)
     │
     ▼
Verify Invitation Ownership (job_invitations table)
     │
     ▼
Fetch Job Offer (job_offers table)
     │
     ▼
Return Offer Data
```

## Benefits

### For Candidates:
- ✅ **Immediate Awareness**: See offers within 10 seconds without refreshing
- ✅ **Clear Presentation**: All offer details in one prominent card
- ✅ **Easy Action**: Accept/Decline buttons readily available
- ✅ **No Confusion**: Clear status indicators (Pending/Accepted/Declined)
- ✅ **Deadline Visibility**: Expiration date prominently displayed

### For Employers:
- ✅ **Confidence**: Visual confirmation that offer was created
- ✅ **Status Tracking**: Banner shows offer is awaiting response
- ✅ **No Duplicates**: Cannot create multiple offers for same candidate

### For System:
- ✅ **Reduced Support**: No "I didn't see the offer" complaints
- ✅ **Better UX**: Seamless, real-time experience
- ✅ **Data Integrity**: Prevents duplicate offers
- ✅ **Scalable**: Polling is efficient (10s interval)

## Performance Considerations

### Polling Frequency
- **Current**: 10 seconds
- **Impact**: Minimal (lightweight API call)
- **Network**: ~6 requests per minute per active user
- **Adjustable**: Can be changed if needed

### Optimization Opportunities (Future)
- WebSocket connections for instant updates
- Server-Sent Events (SSE) for push notifications
- Reduce polling frequency after first offer fetch

## Testing Scenarios

### Scenario 1: Fresh Offer Creation
1. Employer creates offer
2. Wait max 10 seconds on candidate side
3. ✅ JobOfferCard appears automatically
4. ✅ InterviewRoadmap shows "Offer Extended"

### Scenario 2: Page Already Open
1. Candidate has invitation page open
2. Employer creates offer in another session
3. Candidate waits (no refresh needed)
4. ✅ Offer appears within 10 seconds

### Scenario 3: Expired Offer
1. Job offer with past expiry_date
2. ✅ Red "Expired" badge shows
3. ✅ Action buttons are disabled
4. ✅ Message suggests contacting employer

### Scenario 4: Multiple Invitations
1. Candidate has multiple invitations
2. Employer creates offer for Invitation A
3. ✅ Only Invitation A shows the offer
4. ✅ Other invitations remain unaffected

## Configuration

### Adjust Auto-Refresh Interval

To change the refresh frequency, modify both:

**InvitationDetailClient.tsx**:
```typescript
const interval = setInterval(() => {
    fetchJobOffer();
}, 10000); // Change 10000 to desired milliseconds
```

**InterviewRoadmap.tsx**:
```typescript
const interval = setInterval(() => {
    fetchRounds();
}, 10000); // Change 10000 to desired milliseconds
```

**Recommended Values**:
- Fast updates: 5000ms (5 seconds)
- Current: 10000ms (10 seconds)
- Conservative: 30000ms (30 seconds)

## Files Created/Modified

### New Files:
1. `src/components/candidate/JobOfferCard.tsx`
2. `src/app/api/candidate/invitations/[id]/offer/route.ts`

### Modified Files:
1. `src/app/candidate/(dashboard)/invitations/[id]/InvitationDetailClient.tsx`
2. `src/components/shared/InterviewRoadmap.tsx`

## Database Queries

### Candidate Offer Fetch Query:
```sql
SELECT 
    id,
    job_title,
    salary_amount,
    salary_currency,
    salary_period,
    start_date,
    expiry_date,
    offer_letter_url,
    description,
    status,
    created_at,
    responded_at
FROM job_offers
WHERE invitation_id = $1
LIMIT 1;
```

**Performance**: Fast (indexed on invitation_id)

## Security

### Authorization Checks:
1. ✅ User authentication required
2. ✅ Candidate profile verification
3. ✅ Invitation ownership validation
4. ✅ RLS policies enforced at database level

### Data Protection:
- Only returns offers for authenticated candidate's invitations
- No cross-candidate data leakage
- Proper error handling for unauthorized access

## Future Enhancements

### Potential Improvements:
1. **Push Notifications**: Browser notifications when offer is created
2. **Email Alerts**: Immediate email to candidate
3. **SMS Notifications**: Text message for urgent offers
4. **WebSocket**: Real-time updates instead of polling
5. **Offer Response**: Integrated accept/decline functionality in JobOfferCard
6. **Offer History**: Track all offers received by candidate
7. **Offer Comparison**: Side-by-side comparison of multiple offers

## Support & Troubleshooting

### Common Issues:

**Q: Offer not showing up on candidate side?**
- Check network tab for API errors
- Verify auto-refresh is running (no console errors)
- Confirm offer was actually created (check employer side banner)
- Wait full 10 seconds for next poll

**Q: Multiple offers appearing?**
- This is prevented by the duplicate check
- If occurring, check database constraints
- Verify check-offer API is working

**Q: Performance concerns with polling?**
- Current implementation is lightweight
- 10-second interval is conservative
- Can increase interval if needed
- Consider WebSocket upgrade for high-traffic scenarios

## Conclusion

This update provides a seamless, real-time experience for candidates receiving job offers. The combination of auto-refresh, prominent visual design, and clear action items ensures candidates never miss an offer and can respond quickly.

**Key Achievement**: Reduced time-to-awareness from "whenever candidate checks" to "maximum 10 seconds".
