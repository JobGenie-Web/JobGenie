"use client";

import { useMemo, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import useSWR from "swr";
import {
    buildCalendarEvents,
    getEventColor,
    isEventClickable,
    type CalendarEvent,
    type CalendarInvitation,
} from "@/lib/calendar-utils";
import {
    Loader2, Video, MapPin, CheckCircle2, Clock4, Ban, ExternalLink, X,
    Calendar as CalendarIcon, Clock, User, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getInvitationJourneyDisplay, normalizeEmbeddedOffer } from "@/lib/invitation-journey-status";

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales: { "en-US": enUS },
});

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface EventDetailModalProps {
    event: CalendarEvent;
    onClose: () => void;
}

function EventDetailModal({ event, onClose }: EventDetailModalProps) {
    const r = event.resource;

    const offer = normalizeEmbeddedOffer(r.jobOffers);
    const journey = getInvitationJourneyDisplay({
        status: r.status,
        invitation_canceled: r.isCanceled,
        interview_confirmed: r.isConfirmed,
        mis_rescheduled: r.misRescheduled,
        pipeline_status: r.pipelineStatus,
        current_round_number: r.roundNumber ?? null,
        candidate_reschedule_requested: false,
    }, offer);

    let BadgeIcon = Clock4;
    if (journey.variant === 'success') BadgeIcon = CheckCircle2;
    else if (journey.variant === 'danger') BadgeIcon = Ban;
    else if (journey.variant === 'warning') BadgeIcon = AlertCircle;
    else if (journey.variant === 'muted') BadgeIcon = Ban;
    else if (journey.variant === 'info') BadgeIcon = CheckCircle2;
    else if (journey.variant === 'pending') BadgeIcon = Clock4;

    const colorClasses = {
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        muted: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    }[journey.variant] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-start justify-between px-5 py-4 border-b border-border gap-3">
                        <div className="min-w-0">
                            {r.roundLabel && (
                                <span className="text-[10px] uppercase tracking-wide font-semibold text-primary mb-1 block">
                                    {r.roundLabel}
                                </span>
                            )}
                            <h3 className="text-base font-bold text-foreground leading-snug">{r.jobDesignation}</h3>
                            {r.candidateName && (
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                                    <User className="h-3.5 w-3.5 flex-shrink-0" />
                                    {r.candidateName}
                                    {r.candidateEmail && (
                                        <span className="text-xs text-muted-foreground/70">({r.candidateEmail})</span>
                                    )}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0 mt-0.5"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 space-y-3">
                        {/* Status badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", colorClasses)}>
                                <BadgeIcon className="h-3 w-3" /> {journey.label}
                            </span>

                            {r.interviewMode && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {r.interviewMode === "online"
                                        ? <Video className="h-3 w-3" />
                                        : <MapPin className="h-3 w-3" />}
                                    {r.interviewMode === "online" ? "Online" : "In-Person"}
                                </span>
                            )}

                            {r.misRescheduled && (
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                    Rescheduled by MIS
                                </span>
                            )}
                        </div>

                        {/* Date & time */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{format(event.start, "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{format(event.start, "h:mm a")} – {format(event.end, "h:mm a")}</span>
                        </div>

                        {/* Meeting link (online) */}
                        {r.interviewMode === "online" && r.meetingLink && (
                            <a
                                href={r.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                            >
                                <Video className="h-4 w-4 flex-shrink-0" />
                                Join Meeting
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}

                        {/* Address (in-person) */}
                        {r.interviewMode === "physical" && r.interviewAddress && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                                <div>
                                    <p>{r.interviewAddress}</p>
                                    {r.mapLink && (
                                        <a
                                            href={r.mapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-xs font-medium mt-0.5 inline-flex items-center gap-1"
                                        >
                                            View on map <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pipeline status */}
                        {r.pipelineStatus && journey.variant !== 'success' && journey.variant !== 'danger' && journey.variant !== 'warning' && (
                            <div className="text-xs text-muted-foreground">
                                Pipeline: <span className="font-medium capitalize">{r.pipelineStatus}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-border bg-muted/20">
                        <Link
                            href={`/employer/invitations`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                            onClick={onClose}
                        >
                            View in invitations
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function CalendarLegend() {
    return (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" /> Confirmed
            </span>
            <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-blue-500 inline-block" /> Accepted
            </span>
            <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-amber-500 inline-block" /> Pending
            </span>
            <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-red-500 inline-block" /> Declined
            </span>
            <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-gray-400 inline-block" /> Canceled
            </span>
        </div>
    );
}

export default function EmployerCalendarClient() {
    const { data, isLoading } = useSWR("/api/employer/calendar", fetcher);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const invitations: CalendarInvitation[] = data?.success ? data.data : [];

    const events = useMemo(() => buildCalendarEvents(invitations, 'employer'), [invitations]);

    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const color = getEventColor(event.resource);
        const clickable = isEventClickable(event.resource);
        return {
            style: {
                backgroundColor: color,
                borderColor: color,
                color: '#ffffff',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 500,
                opacity: event.resource.isCanceled ? 0.55 : 1,
                cursor: clickable ? 'pointer' : 'default',
            },
        };
    }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        if (!isEventClickable(event.resource)) return;
        setSelectedEvent(event);
    }, []);

    const handleNavigate = useCallback((newDate: Date) => setDate(newDate), []);
    const handleViewChange = useCallback((newView: View) => setView(newView), []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const confirmedCount = events.filter(e => e.resource.isConfirmed && !e.resource.isCanceled).length;
    const upcomingCount = events.filter(e => !e.resource.isCanceled && e.start >= new Date()).length;
    const totalCandidates = new Set(invitations.map(i => i.candidate?.id).filter(Boolean)).size;

    return (
        <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border bg-card px-4 py-3">
                    <p className="text-xs text-muted-foreground">Total Interviews</p>
                    <p className="text-2xl font-bold text-foreground">{events.length}</p>
                </div>
                <div className="rounded-xl border bg-card px-4 py-3">
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold text-primary">{upcomingCount}</p>
                </div>
                <div className="rounded-xl border bg-card px-4 py-3">
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                    <p className="text-2xl font-bold text-emerald-600">{confirmedCount}</p>
                </div>
                <div className="rounded-xl border bg-card px-4 py-3">
                    <p className="text-xs text-muted-foreground">Candidates</p>
                    <p className="text-2xl font-bold text-foreground">{totalCandidates}</p>
                </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl border bg-card px-4 py-3">
                <CalendarLegend />
            </div>

            {/* Calendar */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="p-4" style={{ height: 680 }}>
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                            <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center">
                                <CalendarIcon className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-foreground">No interviews scheduled</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                    Interviews you schedule with candidates will appear here.
                                </p>
                            </div>
                            <Link
                                href="/employer/invitations"
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                View all invitations →
                            </Link>
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            view={view}
                            date={date}
                            onNavigate={handleNavigate}
                            onView={handleViewChange}
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventStyleGetter}
                            style={{ height: "100%" }}
                            popup
                            showMultiDayTimes
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            messages={{
                                today: "Today",
                                previous: "Back",
                                next: "Next",
                                month: "Month",
                                week: "Week",
                                day: "Day",
                                agenda: "Agenda",
                                noEventsInRange: "No interviews in this range.",
                                showMore: (count) => `+${count} more`,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Event detail modal */}
            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
}
