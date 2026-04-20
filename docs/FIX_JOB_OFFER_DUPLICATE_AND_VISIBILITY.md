# Fix: Job Offer Duplicate Prevention & Visibility

## Problem

After creating a job offer, the system had two issues:

1. **Duplicate Offers**: The "Create Job Offer" button remained active even after an offer was created, allowing multiple job offers for the same invitation
2. **No Visual Indicator**: There was no clear visual indication that a job offer had been extended to the candidate

## Solution

### 1. Check Offer Existence

**New API Endpoint**: `GET /api/employer/invitations/[id]/check-offer`

```typescript
// Returns whether a job offer exists for the invitation
{
  success: true,
  exists: boolean,
  offer: {
    id: string,
    status: string,
    job_title: string,
    created_at: string
  } | null
}
```

**Purpose**:
- Verify if a job offer already exists for a specific invitation
- Prevent duplicate offer creation
- Provide offer details if it exists

**Security**:
- Requires authentication
- Verifies the invitation belongs to the employer's company
- Only accessible by the employer who owns the invitation

### 2. State Management

**Added to `InterviewRoundsDisplay.tsx`**:

```typescript
const [offerExists, setOfferExists] = useState(false);

const checkOfferExists = async () => {
    try {
        const response = await fetch(`/api/employer/invitations/${invitationId}/check-offer`);
        const data = await response.json();
        if (data.success) {
            setOfferExists(data.exists);
        }
    } catch (error) {
        console.error("Error checking offer:", error);
    }
};

useEffect(() => {
    checkOfferExists();
}, [invitationId]);
```

**Updates**:
- Checks offer existence on component mount
- Updates `offerExists` state after creating an offer
- Uses state to control UI rendering

### 3. UI Updates

#### A. Conditional Button/Message Display

**Before** (Always showed button):
```tsx
{round.outcome === 'offer' && (
    <Button onClick={...}>Create Job Offer</Button>
)}
```

**After** (Conditional based on offer existence):
```tsx
{/* Show button only if no offer exists */}
{round.outcome === 'offer' && !offerExists && (
    <Button onClick={...}>
        <Briefcase className="h-3.5 w-3.5 mr-1.5" />
        Create Job Offer
    </Button>
)}

{/* Show confirmation message if offer exists */}
{round.outcome === 'offer' && offerExists && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
        <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Job offer has been sent to candidate
        </p>
    </div>
)}
```

#### B. Job Offer Status Banner

**Added at the top of `InterviewRoundsDisplay`**:

```tsx
{offerExists && (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Job Offer Extended</h4>
                <p className="text-sm text-blue-800 mt-0.5">
                    A formal job offer has been sent to {candidateName}. Awaiting candidate response.
                </p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
        </div>
    </div>
)}
```

**Features**:
- Prominent banner with gradient background
- Icon-based visual design
- Clear messaging about offer status
- Includes candidate name for context
- Dark mode support

### 4. Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Employer marks interview round with 'offer' outcome     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Check if offer already exists │
        │  (checkOfferExists API call)   │
        └───────────┬───────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
┌───────────────┐      ┌──────────────────┐
│ Offer Exists  │      │ No Offer Exists  │
│ (offerExists  │      │ (offerExists =   │
│ = true)       │      │ false)           │
└───────┬───────┘      └────────┬─────────┘
        │                       │
        ▼                       ▼
┌─────────────────────┐  ┌───────────────────────┐
│ Show Banner at Top  │  │ Show "Create Job      │
│ + Confirmation      │  │ Offer" Button         │
│ Message (no button) │  └───────────┬───────────┘
└─────────────────────┘              │
                                     ▼
                            ┌─────────────────────┐
                            │ User clicks button  │
                            │ → JobOfferDialog    │
                            │ → Create offer      │
                            │ → Update UI         │
                            └─────────────────────┘
```

## Testing

### Test Case 1: Create First Offer
1. Complete an interview round
2. Add feedback with outcome = "offer"
3. Verify "Create Job Offer" button appears
4. Click button and create job offer
5. Verify banner appears at top
6. Verify button changes to confirmation message

### Test Case 2: Prevent Duplicate
1. With existing job offer (from Test Case 1)
2. Verify "Create Job Offer" button is NOT visible
3. Verify confirmation message shows: "Job offer has been sent to candidate"
4. Verify banner is displayed at top

### Test Case 3: Multiple Invitations
1. Create job offers for 2 different candidates
2. Verify each invitation correctly shows/hides offer controls
3. Verify banner only shows on invitations with offers

### Test Case 4: Page Refresh
1. Create a job offer
2. Refresh the page
3. Verify banner persists
4. Verify button remains hidden
5. Verify confirmation message still shows

## Files Modified

### Employer Side

1. **`src/components/employer/InterviewRoundsDisplay.tsx`**
   - Added `offerExists` state
   - Added `checkOfferExists` function
   - Updated `handleOfferSuccess` to refresh offer status
   - Added conditional rendering for button/message
   - Added job offer status banner

2. **`src/app/api/employer/invitations/[id]/check-offer/route.ts`** (NEW)
   - Created GET endpoint to check offer existence
   - Returns offer details if exists
   - Includes proper authorization checks

### Candidate Side

3. **`src/components/candidate/JobOfferCard.tsx`** (NEW)
   - Created prominent job offer display card
   - Shows all offer details (salary, dates, description)
   - Displays offer status (pending/accepted/rejected)
   - Handles expired offers
   - Provides action buttons for pending offers
   - Full dark mode support

4. **`src/app/candidate/(dashboard)/invitations/[id]/InvitationDetailClient.tsx`**
   - Added `jobOffer` state
   - Added `fetchJobOffer` function
   - Integrated auto-refresh (10-second interval)
   - Displays `JobOfferCard` when offer exists
   - Shows offer above InterviewRoadmap for prominence

5. **`src/app/api/candidate/invitations/[id]/offer/route.ts`** (NEW)
   - Created GET endpoint for candidates to fetch their offer
   - Verifies candidate authorization
   - Returns full offer details

6. **`src/components/shared/InterviewRoadmap.tsx`**
   - Added auto-refresh mechanism (10-second interval)
   - Automatically updates when new offers are created
   - Shows offer status in timeline

## API Reference

### GET `/api/employer/invitations/[id]/check-offer`

**Purpose**: Check if a job offer exists for an invitation

**Authorization**: Requires employer authentication and ownership

**Response**:
```typescript
{
  success: true,
  exists: boolean,
  offer: {
    id: string,
    status: string,
    job_title: string,
    created_at: string
  } | null
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Invitation not found or not authorized
- `500 Internal Server Error`: Server error

## User Experience Improvements

### Before Fix:
❌ Could create multiple job offers for same candidate  
❌ No visual confirmation that offer was sent  
❌ Button remained clickable after offer creation  
❌ Had to check database to verify offer status

### After Fix:
✅ Prevents duplicate job offers  
✅ Clear banner showing offer status  
✅ Button replaced with confirmation message  
✅ Visual feedback with icons and styling  
✅ Dark mode support for all new elements

## Database Considerations

**No Schema Changes Required**: This fix uses existing `job_offers` table structure.

**Query Performance**: The check-offer endpoint uses indexed columns:
- `invitation_id` (used in WHERE clause)
- Primary key `id` (returned in SELECT)

**Data Integrity**: The system still relies on application-level checks. For additional safety, consider adding a unique constraint:

```sql
-- Optional: Add unique constraint to prevent duplicates at DB level
ALTER TABLE job_offers 
ADD CONSTRAINT unique_invitation_offer 
UNIQUE (invitation_id);
```

## Real-Time Updates

Both employer and candidate sides now have auto-refresh mechanisms:

### Employer Side:
- Checks offer existence on component mount
- Updates immediately after creating an offer
- Banner appears instantly

### Candidate Side:
- Auto-refreshes every 10 seconds to check for new offers
- Polls both the offer API and InterviewRoadmap
- Displays prominent `JobOfferCard` when offer is created
- Shows real-time updates without page refresh

### Flow Diagram: Employer Creates Offer → Candidate Sees Update

```
Employer Side                          Database                    Candidate Side
     │                                      │                             │
     │  1. Create Job Offer                 │                             │
     ├──────────────────────────────────────>                             │
     │                                      │                             │
     │  2. Insert into job_offers table     │                             │
     │                                      ├─────────────────────────────┤
     │                                      │                             │
     │  3. Update UI (banner appears)       │    4. Auto-refresh (10s)    │
     │     - Hide "Create Offer" button     │    ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
     │     - Show confirmation message      │                             │
     │                                      │    5. Fetch offer data      │
     │                                      ├<────────────────────────────┤
     │                                      │                             │
     │                                      │    6. Return offer          │
     │                                      ├─────────────────────────────>
     │                                      │                             │
     │                                      │    7. Display JobOfferCard  │
     │                                      │       + InterviewRoadmap    │
     │                                      │       updates               │
```

## Notes

- The banner appears immediately after offer creation (employer side)
- The offer card appears within 10 seconds on candidate side (auto-refresh)
- The offer status persists across page refreshes
- The system checks offer existence on component mount
- Multiple rounds can have 'offer' outcome, but only one actual offer is created
- Auto-refresh intervals can be adjusted if needed (currently 10 seconds)
- The fix is backward compatible with existing data
