# Multi-Round Interview Roadmap System

## Overview

This document describes the comprehensive multi-round interview management system with visual roadmap displays for both employers and candidates.

## Features Implemented

### 1. **Complete Interview Flow**

#### Initial Invitation
- Employer sends 1st interview invitation to candidate
- Candidate receives invitation with time slots
- Candidate can accept or decline
- If accepted, employer confirms with meeting details

#### Multi-Round Process
- After 1st round confirmation, employer can add feedback
- Based on feedback outcome, the system shows:
  - **Advance**: Next round scheduling becomes available
  - **Reject**: Rejection message displayed
  - **Offer**: Job offer creation becomes available

#### Subsequent Rounds
- Employer can schedule 2nd, 3rd, etc. rounds
- Candidate receives notification for each new round
- Candidate responds to each round (accept/decline + time slot selection)
- Employer confirms each accepted round
- Interview roadmap visible to both parties throughout the process

### 2. **Visual Components**

#### For Candidates
- **InterviewRoadmap** (`src/components/shared/InterviewRoadmap.tsx`)
  - Visual timeline of all interview rounds
  - Shows current status, past rounds, and upcoming rounds
  - Displays feedback from employer (if provided)
  - Auto-expands latest and rounds with outcomes
  - Hides previous interview details after advancement

- **RoundResponseCard** (`src/components/candidate/RoundResponseCard.tsx`)
  - Step-by-step response interface for pending rounds
  - Time slot selection with alternative dates
  - Interview mode selection (online/physical)
  - Clear action buttons (Accept/Decline)

#### For Employers
- **InterviewRoadmap** (shared component)
  - Same visual timeline as candidate view
  - Shows all rounds with management options

- **InterviewRoundsDisplay** (`src/components/employer/InterviewRoundsDisplay.tsx`)
  - Management interface with action buttons
  - Confirm button for accepted rounds
  - Add Feedback button for completed interviews
  - Schedule Next Round button after advancement
  - Create Job Offer button when offering position

- **RoundConfirmDialog** (`src/components/employer/RoundConfirmDialog.tsx`)
  - Confirmation dialog for individual rounds
  - Meeting link input for online interviews
  - Address input for physical interviews

- **InterviewFeedbackDialog** (existing)
  - Add feedback and outcome for completed interviews
  - Choose outcome: Advance, Reject, or Offer
  - Provide detailed feedback notes

- **NextRoundDialog** (existing)
  - Schedule next interview round
  - Set round label (e.g., "Technical Interview")
  - Provide time slots

### 3. **API Endpoints**

#### Candidate APIs
- `POST /api/candidate/interview-rounds/[roundId]/respond`
  - Respond to individual round invitations
  - Accept or decline with time slot selection

#### Employer APIs
- `POST /api/employer/interview-rounds/[roundId]/confirm`
  - Confirm individual rounds after candidate acceptance
  - Provide meeting details (link/address)

- `POST /api/employer/interview-rounds/[roundId]/feedback`
  - Add feedback and outcome for completed rounds
  - Triggers pipeline status updates via database trigger

- `POST /api/employer/interview-rounds/next-round`
  - Create next interview round
  - Sends notification to candidate

- `GET /api/employer/invitations/[id]/rounds`
  - Get all rounds for an invitation (employer view)

- `GET /api/candidate/invitations/[id]/rounds`
  - Get all rounds for an invitation (candidate view)

### 4. **Database Structure**

#### Tables
- **job_invitations**
  - `pipeline_status`: active, rejected, offered, hired, withdrawn, expired
  - `current_round_number`: Tracks which round is active
  - (Contains initial invitation data)

- **interview_rounds**
  - `round_number`: Sequential number (1, 2, 3...)
  - `round_label`: Optional descriptive name
  - `status`: pending, viewed, accepted, declined, confirmed, completed, canceled
  - `outcome`: advance, reject, offer, no_decision
  - `outcome_notes`: Employer feedback text
  - `given_time_slots`, `alternative_dates`: Available time slots
  - `selected_time_slot`: Candidate's choice
  - `interview_mode`: online or physical
  - `meeting_link`, `interview_address`, `map_link`: Confirmation details

#### Triggers
- **create_first_interview_round**: Auto-creates Round 1 when invitation is confirmed
- **update_pipeline_status_from_outcome**: Updates invitation pipeline based on round outcome

## User Flow

### Employer Workflow

1. **Send Initial Invitation**
   - Use `InviteCandidateButton` component
   - Provide time slots and job details
   - System creates job_invitation record

2. **Candidate Accepts**
   - Candidate selects time slot and mode
   - Employer sees "Confirm Interview" button

3. **Confirm 1st Round**
   - Click confirm button
   - Provide meeting link (online) or address (physical)
   - Database trigger creates Round 1 in interview_rounds table

4. **View Interview Roadmap**
   - See visual timeline in invitation details
   - Track candidate progress through rounds

5. **After Interview Completes**
   - Click "Add Feedback" button
   - Select outcome:
     - **Advance**: Proceed to schedule next round
     - **Reject**: End process, candidate notified
     - **Offer**: Create formal job offer

6. **If Advanced - Schedule Next Round**
   - Click "Schedule Next Round"
   - Set round label (e.g., "Culture Fit Interview")
   - Provide 1-3 time slots
   - Optional personal message
   - System creates new round and notifies candidate

7. **Confirm Subsequent Rounds**
   - When candidate accepts new round
   - Click "Confirm Interview" for that round
   - Provide meeting/location details

8. **Repeat Steps 5-7**
   - Continue for Round 3, 4, etc.
   - Process ends when outcome is "reject" or "offer"

### Candidate Workflow

1. **Receive Invitation**
   - View invitation details
   - See company info, job title, employer details

2. **Respond to 1st Round**
   - Select interview mode (online/physical)
   - Choose preferred time slot
   - Click Accept or Decline

3. **Wait for Confirmation**
   - Employer confirms with meeting details
   - Receive email notification

4. **View Interview Roadmap**
   - See visual timeline of all rounds
   - Track progress through interview stages

5. **Attend Interview**
   - Access meeting link (online) or location details (physical)
   - Complete the interview

6. **Await Feedback**
   - Employer adds feedback and outcome
   - Roadmap updates with decision

7. **If Advanced - New Round Appears**
   - Receive notification for next round
   - See "RoundResponseCard" for pending round
   - Repeat steps 2-7 for subsequent rounds

8. **Final Outcome**
   - **Passed All Rounds**: See offer notification
   - **Not Selected**: See rejection message with feedback
   - Roadmap shows complete interview journey

## Key Features

### Visual Roadmap Benefits
- **Clear Progress Tracking**: Both parties see where they are in the process
- **Transparency**: Candidates see all rounds and feedback
- **History**: Past rounds are visible but details hidden after advancement
- **Current Focus**: Latest pending/active round is highlighted

### Smart UI Behavior
- **Auto-hiding Details**: After advancement, previous round details collapse
- **Auto-expanding**: Latest round and rounds with outcomes auto-expand
- **Conditional Actions**: Buttons appear only when appropriate
  - Confirm: Only for accepted rounds
  - Add Feedback: Only for confirmed rounds without outcome
  - Schedule Next: Only after "advance" outcome
  - Create Offer: Only after "offer" outcome

### Email Notifications
- Candidate receives email for:
  - New round invitations
  - Interview confirmations
  - (Integration with existing email system)

## Testing the System

### Setup
1. Ensure database migrations are applied:
   ```bash
   npx supabase db push
   ```

2. Verify these migrations exist:
   - `20260418130000_interview_rounds_system.sql`
   - Related RLS policies

### Test Scenario 1: Basic Flow
1. As Employer:
   - Send invitation to candidate
   - Wait for acceptance
   - Confirm 1st round with meeting link

2. As Candidate:
   - View invitation
   - Accept with time slot selection
   - View confirmed interview in roadmap

3. As Employer:
   - Add feedback with "advance" outcome
   - Schedule 2nd round (e.g., "Technical Interview")

4. As Candidate:
   - See 2nd round invitation in roadmap
   - Respond to new round
   - See updated roadmap with both rounds

5. As Employer:
   - Confirm 2nd round
   - Add feedback with "offer" outcome
   - Create job offer

6. As Candidate:
   - See offer notification in roadmap
   - View complete interview journey

### Test Scenario 2: Rejection Flow
1. Follow steps 1-3 from Scenario 1
2. As Employer:
   - Add feedback with "reject" outcome
   - Provide feedback notes

3. As Candidate:
   - See rejection message in roadmap
   - View employer feedback
   - Process is concluded

### Test Scenario 3: Multiple Rounds
1. Test advancing through 3-4 rounds
2. Verify roadmap shows all rounds correctly
3. Verify previous details hide after advancement
4. Verify outcomes display properly

## File Structure

```
src/
├── components/
│   ├── shared/
│   │   └── InterviewRoadmap.tsx          # Main roadmap component (both roles)
│   ├── candidate/
│   │   ├── RoundResponseCard.tsx         # Round response interface
│   │   └── InterviewOutcomeDisplay.tsx   # Outcome display (legacy)
│   └── employer/
│       ├── InterviewRoundsDisplay.tsx    # Management interface
│       ├── RoundConfirmDialog.tsx        # Confirm round dialog
│       ├── InterviewFeedbackDialog.tsx   # Feedback dialog
│       ├── NextRoundDialog.tsx           # Next round scheduling
│       └── JobOfferDialog.tsx            # Job offer creation
├── app/
│   ├── api/
│   │   ├── candidate/
│   │   │   └── interview-rounds/
│   │   │       └── [roundId]/
│   │   │           └── respond/
│   │   │               └── route.ts      # Candidate respond to round
│   │   └── employer/
│   │       ├── interview-rounds/
│   │       │   ├── [roundId]/
│   │       │   │   ├── confirm/
│   │       │   │   │   └── route.ts     # Confirm round
│   │       │   │   └── feedback/
│   │       │   │       └── route.ts     # Add feedback
│   │       │   └── next-round/
│   │       │       └── route.ts         # Create next round
│   │       └── invitations/
│   │           └── [id]/
│   │               └── rounds/
│   │                   └── route.ts     # Get all rounds
│   ├── candidate/
│   │   └── (dashboard)/
│   │       └── invitations/
│   │           └── [id]/
│   │               └── InvitationDetailClient.tsx  # Uses InterviewRoadmap
│   └── employer/
│       └── (dashboard)/
│           └── invitations/
│               └── InvitationsClient.tsx           # Uses both components
└── prisma/
    └── schema.prisma                     # Database models

supabase/
└── migrations/
    └── 20260418130000_interview_rounds_system.sql  # Rounds & triggers
```

## Configuration

### Environment Variables
- No additional env vars needed
- Uses existing Supabase configuration

### Feature Flags
- System is always enabled once migrations are applied
- No feature toggles required

## Troubleshooting

### Issue: First round not created automatically
**Solution**: Run database migrations
```bash
npx supabase db push
```

### Issue: Candidate can't respond to new rounds
**Solution**: Verify API endpoint exists at:
`/api/candidate/interview-rounds/[roundId]/respond`

### Issue: Roadmap not showing all rounds
**Solution**: Check API response from:
- Employer: `/api/employer/invitations/[id]/rounds`
- Candidate: `/api/candidate/invitations/[id]/rounds`

### Issue: Feedback not updating pipeline
**Solution**: Verify database trigger exists:
`update_pipeline_status_from_outcome()`

## Future Enhancements

Potential improvements:
- Real-time notifications using Supabase subscriptions
- Calendar integration (Google Calendar, Outlook)
- Video interview recording integration
- AI-powered interview feedback suggestions
- Candidate interview preparation resources
- Interview scheduling conflict detection
- Mobile app support
- Interview notes templates
- Bulk interview scheduling

## Support

For issues or questions:
1. Check this documentation
2. Review database migrations
3. Check API logs for errors
4. Verify RLS policies are correct
