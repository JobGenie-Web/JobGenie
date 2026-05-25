import { parseISO, isValid } from "date-fns";
import { getInvitationJourneyDisplay, normalizeEmbeddedOffer } from "./invitation-journey-status";

export interface TimeSlot {
    date: string;
    time: string;
    order: number;
    is_alternative?: boolean;
}

export interface InterviewRound {
    id: string;
    round_number: number;
    round_label: string | null;
    status: string;
    outcome: string | null;
    interview_mode: string | null;
    interview_confirmed?: boolean;
    given_time_slots: TimeSlot[] | null;
    selected_time_slot: TimeSlot | null;
    confirmed_time: unknown;
    meeting_link: string | null;
    interview_address: string | null;
    map_link: string | null;
    confirmed_at: string | null;
    sent_at: string | null;
    round_canceled?: boolean;
    mis_rescheduled?: boolean;
    mis_reschedule_data?: { date?: string; time?: string } | null;
}

export interface CalendarInvitation {
    id: string;
    job_designation: string;
    industry: string;
    interview_mode: string | null;
    given_time_slots: TimeSlot[] | null;
    selected_time_slot: TimeSlot | null;
    confirmed_time: unknown;
    meeting_link: string | null;
    interview_address: string | null;
    map_link: string | null;
    confirmed_at: string | null;
    interview_confirmed: boolean;
    invitation_canceled: boolean;
    canceled_at: string | null;
    status: string;
    pipeline_status: string | null;
    current_round_number: number | null;
    mis_rescheduled: boolean;
    mis_reschedule_data?: unknown;
    // candidate view
    company?: { company_name: string; logo_url: string | null };
    // employer view
    candidate?: { id: string; first_name: string; last_name: string; profile_image_url: string | null; email: string } | null;
    interview_rounds: InterviewRound[] | null;
    job_offers?: unknown;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: EventResource;
}

export interface EventResource {
    invitationId: string;
    roundId?: string;
    roundNumber?: number;
    roundLabel?: string;
    jobDesignation: string;
    industry: string;
    interviewMode: string | null;
    isConfirmed: boolean;
    isCanceled: boolean;
    status: string;
    pipelineStatus: string | null;
    meetingLink: string | null;
    interviewAddress: string | null;
    mapLink: string | null;
    confirmedAt: string | null;
    // candidate view
    companyName?: string;
    companyLogo?: string | null;
    // employer view
    candidateName?: string;
    candidateImage?: string | null;
    candidateEmail?: string;
    candidateId?: string;
    eventType: 'invitation' | 'round';
    misRescheduled: boolean;
    jobOffers?: unknown;
}

function parseTimeString(time: string): { hours: number; minutes: number } {
    // Handle "HH:MM" or "HH:MM:SS" formats
    const m = time.match(/^(\d{1,2}):(\d{2})/);
    if (m) return { hours: parseInt(m[1], 10), minutes: parseInt(m[2], 10) };
    return { hours: 9, minutes: 0 };
}

function buildEventDate(dateStr: string, timeStr: string): Date {
    try {
        const base = parseISO(dateStr);
        if (!isValid(base)) return new Date();
        const { hours, minutes } = parseTimeString(timeStr);
        base.setHours(hours, minutes, 0, 0);
        return base;
    } catch {
        return new Date();
    }
}

function confirmedTimeToRawString(value: unknown): string | null {
    if (value == null || value === "") return null;
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "number" && Number.isFinite(value)) {
        return new Date(value).toISOString();
    }
    return null;
}

// Determine the confirmed/relevant time slot for an invitation's initial round
export function resolveInvitationSlot(inv: CalendarInvitation): TimeSlot | null {
    // If employer confirmed a specific time from alternatives
    if (inv.confirmed_time != null && inv.confirmed_time !== "") {
        const raw = confirmedTimeToRawString(inv.confirmed_time);
        if (!raw) return null;
        const parts = raw.split(/[ T]/);
        if (parts.length >= 2) {
            return { date: parts[0], time: parts[1].substring(0, 5), order: 1 };
        }
    }
    // Candidate selected a slot
    if (inv.selected_time_slot) return inv.selected_time_slot;
    // Fall back to first given slot (for pending invitations)
    if (inv.given_time_slots && inv.given_time_slots.length > 0) {
        return inv.given_time_slots[0];
    }
    return null;
}

export function resolveRoundSlot(round: InterviewRound): TimeSlot | null {
    if (round.confirmed_time != null && round.confirmed_time !== "") {
        let raw: string | null = null;
        if (typeof round.confirmed_time === "string") {
            raw = round.confirmed_time;
        } else if (typeof round.confirmed_time === "object" && round.confirmed_time !== null) {
            const maybeTime = (round.confirmed_time as { time?: unknown }).time;
            if (typeof maybeTime === "string") {
                const baseDate = round.selected_time_slot?.date ?? "";
                if (baseDate) {
                    return { date: baseDate, time: maybeTime.substring(0, 5), order: 1 };
                }
                return null;
            }
            raw = confirmedTimeToRawString(round.confirmed_time);
        } else {
            raw = confirmedTimeToRawString(round.confirmed_time);
        }
        if (!raw) return null;
        const parts = raw.split(/[ T]/);
        if (parts.length >= 2) {
            return { date: parts[0], time: parts[1].substring(0, 5), order: 1 };
        }
    }
    if (round.selected_time_slot) return round.selected_time_slot;
    if (round.given_time_slots && round.given_time_slots.length > 0) {
        return round.given_time_slots[0];
    }
    return null;
}

export function buildCalendarEvents(invitations: CalendarInvitation[], role: 'candidate' | 'employer'): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    for (const inv of invitations) {
        const rounds = inv.interview_rounds ?? [];
        const hasRounds = rounds.length > 0;

        const offer = normalizeEmbeddedOffer(inv.job_offers);
        const journey = getInvitationJourneyDisplay({
            status: inv.status,
            invitation_canceled: inv.invitation_canceled,
            interview_confirmed: inv.interview_confirmed,
            mis_rescheduled: inv.mis_rescheduled,
            pipeline_status: inv.pipeline_status,
            current_round_number: inv.current_round_number,
            candidate_reschedule_requested: false,
        }, offer);
        const statusLabel = `[${journey.label}]`;

        // If there are no rounds, show the invitation itself
        if (!hasRounds) {
            const slot = resolveInvitationSlot(inv);
            if (!slot) continue;

            const start = buildEventDate(slot.date, slot.time);
            const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default

            const title = role === 'candidate'
                ? `${statusLabel} ${inv.job_designation}${inv.company ? ` @ ${inv.company.company_name}` : ''}`
                : `${statusLabel} ${inv.job_designation}${inv.candidate ? ` - ${inv.candidate.first_name} ${inv.candidate.last_name}` : ''}`;

            events.push({
                id: `inv-${inv.id}`,
                title,
                start,
                end,
                resource: {
                    invitationId: inv.id,
                    jobDesignation: inv.job_designation,
                    industry: inv.industry,
                    interviewMode: inv.interview_mode,
                    isConfirmed: inv.interview_confirmed,
                    isCanceled: inv.invitation_canceled,
                    status: inv.status,
                    pipelineStatus: inv.pipeline_status,
                    meetingLink: inv.meeting_link,
                    interviewAddress: inv.interview_address,
                    mapLink: inv.map_link,
                    confirmedAt: inv.confirmed_at,
                    companyName: inv.company?.company_name,
                    companyLogo: inv.company?.logo_url,
                    candidateName: inv.candidate ? `${inv.candidate.first_name} ${inv.candidate.last_name}` : undefined,
                    candidateImage: inv.candidate?.profile_image_url,
                    candidateEmail: inv.candidate?.email,
                    candidateId: inv.candidate?.id,
                    eventType: 'invitation',
                    misRescheduled: inv.mis_rescheduled,
                    jobOffers: inv.job_offers,
                },
            });
        } else {
            // Show each round as a separate event
            for (const round of rounds) {
                // Skip rounds that weren't sent yet (no time slots)
                const slot = resolveRoundSlot(round);
                if (!slot) continue;

                const start = buildEventDate(slot.date, slot.time);
                const end = new Date(start.getTime() + 60 * 60 * 1000);

                const roundLabel = round.round_label || `Round ${round.round_number}`;
                const title = role === 'candidate'
                    ? `${statusLabel} ${inv.job_designation} (${roundLabel})${inv.company ? ` @ ${inv.company.company_name}` : ''}`
                    : `${statusLabel} ${inv.job_designation} (${roundLabel})${inv.candidate ? ` - ${inv.candidate.first_name} ${inv.candidate.last_name}` : ''}`;

                const isCanceled = inv.invitation_canceled || round.status === 'canceled';
                const isConfirmed = round.status === 'confirmed' || round.confirmed_at !== null;

                events.push({
                    id: `round-${round.id}`,
                    title,
                    start,
                    end,
                    resource: {
                        invitationId: inv.id,
                        roundId: round.id,
                        roundNumber: round.round_number,
                        roundLabel,
                        jobDesignation: inv.job_designation,
                        industry: inv.industry,
                        interviewMode: round.interview_mode ?? inv.interview_mode,
                        isConfirmed,
                        isCanceled,
                        status: round.status,
                        pipelineStatus: inv.pipeline_status,
                        meetingLink: round.meeting_link,
                        interviewAddress: round.interview_address,
                        mapLink: round.map_link,
                        confirmedAt: round.confirmed_at,
                        companyName: inv.company?.company_name,
                        companyLogo: inv.company?.logo_url,
                        candidateName: inv.candidate ? `${inv.candidate.first_name} ${inv.candidate.last_name}` : undefined,
                        candidateImage: inv.candidate?.profile_image_url,
                        candidateEmail: inv.candidate?.email,
                        candidateId: inv.candidate?.id,
                        eventType: 'round',
                        misRescheduled: inv.mis_rescheduled,
                        jobOffers: inv.job_offers,
                    },
                });
            }
        }
    }

    return events;
}

export function getEventColor(resource: EventResource): string {
    const offer = normalizeEmbeddedOffer(resource.jobOffers);
    const journey = getInvitationJourneyDisplay({
        status: resource.status,
        invitation_canceled: resource.isCanceled,
        interview_confirmed: resource.isConfirmed,
        mis_rescheduled: resource.misRescheduled,
        pipeline_status: resource.pipelineStatus,
        current_round_number: resource.roundNumber ?? null,
        candidate_reschedule_requested: false,
    }, offer);

    switch (journey.variant) {
        case "success":   return "#10b981"; // emerald  – confirmed / rescheduled / accepted
        case "info":      return "#6366f1"; // indigo   – active round
        case "warning":   return "#f59e0b"; // amber    – needs action / reschedule requested / offered
        case "pending":   return "#3b82f6"; // blue     – pending / viewed
        case "danger":    return "#ef4444"; // red      – declined / rejected / job rejected
        case "muted":     return "#64748b"; // slate    – canceled / expired / withdrawn
        default:          return "#6366f1";
    }
}

export function isEventClickable(resource: EventResource): boolean {
    const offer = normalizeEmbeddedOffer(resource.jobOffers);
    const journey = getInvitationJourneyDisplay({
        status: resource.status,
        invitation_canceled: resource.isCanceled,
        interview_confirmed: resource.isConfirmed,
        mis_rescheduled: resource.misRescheduled,
        pipeline_status: resource.pipelineStatus,
        current_round_number: resource.roundNumber ?? null,
        candidate_reschedule_requested: false,
    }, offer);

    if (journey.variant === 'success' || journey.variant === 'danger' || journey.variant === 'muted') {
        return false;
    }
    return true;
}
