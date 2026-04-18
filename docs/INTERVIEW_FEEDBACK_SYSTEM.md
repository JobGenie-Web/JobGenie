# Interview Feedback & Multi-Round Interview System

## Overview

This document describes the enterprise-grade interview feedback and multi-round interview management system implemented in JobGenie.

## Features

### 1. Multi-Round Interview Support
- Support for unlimited interview rounds per candidate
- Each round is independently scheduled and managed
- Automatic round tracking and status management

### 2. Interview Feedback
After each confirmed interview, employers can provide feedback with three possible outcomes:
- **Advance**: Candidate passes and proceeds to next interview round
- **Reject**: Candidate did not meet requirements
- **Offer**: Candidate passed all rounds and is ready for a job offer

### 3. Automated Workflow
- First interview round is automatically created when employer confirms the initial interview
- Pipeline status is automatically updated based on round outcomes
- Email notifications sent to candidates for each round

## Database Schema

### InterviewRound Table
```sql
- id: UUID (Primary Key)
- invitation_id: UUID (Foreign Key to job_invitations)
- round_number: Integer (1, 2, 3, ...)
- round_label: String (e.g., "Technical Interview", "Culture Fit")
- status: Enum (pending, viewed, accepted, declined, expired, confirmed, completed, canceled)
- outcome: Enum (advance, reject, offer, no_decision)
- outcome_notes: Text (Employer feedback)
- outcome_at: Timestamp
- outcome_by: UUID (Employer user ID)
- [scheduling fields: time slots, mode, address, etc.]
```

### Updated JobInvitation Fields
```sql
- current_round_number: Integer (Tracks active round)
- pipeline_status: Enum (active, rejected, offered, hired, withdrawn, expired)
```

## API Endpoints

### 1. Add Interview Feedback
```
POST /api/employer/interview-rounds/[roundId]/feedback
```
**Body:**
```json
{
  "outcome": "advance" | "reject" | "offer" | "no_decision",
  "outcome_notes": "Detailed feedback..."
}
```

### 2. Create Next Interview Round
```
POST /api/employer/interview-rounds/next-round
```
**Body:**
```json
{
  "previous_round_id": "uuid",
  "round_label": "Technical Interview",
  "time_slots": [
    { "date": "2024-01-15", "time": "09:00", "order": 1 }
  ],
  "message": "Optional message to candidate"
}
```

### 3. Create Job Offer
```
POST /api/employer/interview-rounds/[roundId]/offer
```
**Body:**
```json
{
  "job_title": "Senior Software Engineer",
  "salary_amount": 100000,
  "salary_currency": "LKR",
  "salary_period": "monthly",
  "start_date": "2024-02-01",
  "expiry_date": "2024-01-25",
  "offer_letter_url": "https://...",
  "description": "Benefits and terms..."
}
```

### 4. Get Interview Rounds
```
GET /api/employer/invitations/[id]/rounds
```
Returns all interview rounds for a specific invitation.

## UI Components

### 1. InterviewFeedbackDialog
Modal for adding feedback and outcome after an interview.

**Features:**
- Visual outcome selection (Advance, Reject, Offer)
- Rich text feedback editor
- Validation and error handling
- Action-specific hints

### 2. NextRoundDialog
Modal for scheduling the next interview round.

**Features:**
- Round label customization
- Time slot selection (up to 3 slots)
- Automatic alternative dates calculation
- Optional message to candidate

### 3. JobOfferDialog
Modal for creating a formal job offer.

**Features:**
- Job title and salary details
- Start date and offer expiry
- Benefits and terms description
- Offer letter document link

### 4. InterviewRoundsDisplay
Main component displaying all interview rounds with their status and outcomes.

**Features:**
- Collapsible round cards
- Status badges and outcome indicators
- Inline action buttons
- Real-time updates

## Workflow

### Standard Interview Process

1. **Initial Invitation**
   - Employer sends invitation with time slots
   - Candidate accepts and selects time slot
   - Employer confirms interview details
   - **→ Round 1 is automatically created**

2. **After First Interview**
   - Employer adds feedback via "Add Feedback" button
   - Selects outcome:
     - **Advance** → Can schedule Round 2
     - **Reject** → Pipeline closed, candidate notified
     - **Offer** → Can create job offer

3. **Multiple Rounds**
   - If "Advance" selected, employer schedules next round
   - Candidate receives notification and accepts/declines
   - Process repeats for each round

4. **Job Offer**
   - After final round with "Offer" outcome
   - Employer creates formal job offer
   - Candidate can accept or decline

## Database Triggers

### 1. Auto-Create First Round
Automatically creates Round 1 when employer confirms the initial interview.

```sql
CREATE TRIGGER trg_create_first_interview_round
  BEFORE UPDATE ON job_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_first_interview_round();
```

### 2. Update Pipeline Status
Automatically updates invitation pipeline status based on round outcomes.

```sql
CREATE TRIGGER trg_update_pipeline_status
  BEFORE UPDATE ON interview_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_status_from_outcome();
```

## Pipeline Status Flow

```
active (default)
  ↓
  ├─ advance → active (next round)
  ├─ reject → rejected (closed)
  ├─ offer → offered (awaiting response)
  └─ accepted offer → hired
```

## Security & Permissions

- All endpoints verify employer authentication
- Company-level access control
- Only employers from the invitation's company can:
  - Add feedback
  - Create next rounds
  - Create job offers
- Candidates can only view their own interview details

## Email Notifications

Candidates receive email notifications for:
- New interview round invitations
- Interview confirmations
- Job offers

## Best Practices

### For Employers

1. **Provide Detailed Feedback**
   - Be specific about strengths and weaknesses
   - Include constructive criticism
   - Document decision reasoning

2. **Label Rounds Clearly**
   - Use descriptive labels (e.g., "Technical Interview", "Culture Fit")
   - Help candidates understand the process

3. **Timely Decisions**
   - Add feedback soon after interviews
   - Don't leave candidates waiting
   - Set realistic offer expiry dates

### For Developers

1. **Always Use Transactions**
   - Round creation and status updates should be atomic
   - Use database triggers for automatic updates

2. **Validate State Transitions**
   - Check round status before allowing feedback
   - Verify previous round outcome before creating next round
   - Ensure only one offer per invitation

3. **Handle Edge Cases**
   - Round cancellations
   - MIS rescheduling
   - Candidate withdrawals

## Future Enhancements

Potential improvements for future versions:

1. **Round Templates**
   - Predefined round types with standard time slots
   - Feedback templates for common positions

2. **Interview Scorecards**
   - Structured evaluation criteria
   - Numeric scoring system
   - Multiple interviewer feedback

3. **Calendar Integration**
   - Sync with Google Calendar / Outlook
   - Automatic reminders
   - Meeting room booking

4. **Analytics Dashboard**
   - Round completion rates
   - Average time per round
   - Rejection reasons analysis

5. **Collaborative Hiring**
   - Multiple interviewers per round
   - Panel interviews
   - Consensus-based decisions

## Troubleshooting

### Issue: First round not created automatically
**Solution:** Check that:
- Interview is confirmed (`interview_confirmed = true`)
- Invitation status is 'accepted'
- No existing rounds for the invitation

### Issue: Cannot add feedback
**Solution:** Verify:
- Round status is 'confirmed' or 'completed'
- No existing feedback (outcome is null or 'no_decision')
- User has permission (employer from same company)

### Issue: Cannot create next round
**Solution:** Ensure:
- Previous round outcome is 'advance'
- No existing round with the next round number
- All required fields are provided (time slots)

## Migration Notes

When migrating this feature:

1. Run the SQL migration: `20260418130000_interview_rounds_system.sql`
2. Update Prisma schema
3. Generate Prisma client: `npx prisma generate`
4. Restart the application

## Testing Checklist

- [ ] Create invitation and confirm first interview
- [ ] Verify Round 1 is auto-created
- [ ] Add feedback with "Advance" outcome
- [ ] Schedule Round 2
- [ ] Candidate accepts Round 2
- [ ] Add feedback with "Offer" outcome
- [ ] Create job offer
- [ ] Verify pipeline status updates
- [ ] Test rejection flow
- [ ] Test multiple rounds (3+)
- [ ] Check email notifications
- [ ] Verify permissions and security

## Support

For issues or questions about the interview feedback system, contact the development team or refer to the main documentation.
