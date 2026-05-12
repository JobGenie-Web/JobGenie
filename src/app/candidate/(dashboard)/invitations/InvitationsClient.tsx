"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, Mail, MapPin, Sparkles } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    getInvitationJourneyDisplay,
    normalizeEmbeddedOffer,
    journeyVariantToCandidateClasses,
} from "@/lib/invitation-journey-status";
import useSWR from "swr";

interface TimeSlot {
    date: string;
    time: string;
    order: number;
    is_alternative?: boolean;
}

interface Invitation {
    id: string;
    industry: string;
    job_designation: string;
    message: string | null;
    given_time_slots: TimeSlot[];
    alternative_dates: TimeSlot[];
    status: string;
    sent_at: string;
    viewed_at: string | null;
    invitation_canceled: boolean;
    canceled_by: string | null;
    cancellation_reason: string | null;
    canceled_at: string | null;
    interview_confirmed?: boolean;
    pipeline_status?: string | null;
    current_round_number?: number | null;
    mis_rescheduled?: boolean;
    job_offers?: { id: string; status: string } | { id: string; status: string }[] | null;
    company: {
        company_name: string;
        logo_url: string | null;
        industry: string;
        headoffice_location: string | null;
    };
}

function formatInvitationDate(sentAt: string): string {
    const sentDate = new Date(sentAt);
    const today = new Date();
    const daysAgo = differenceInDays(today, sentDate);

    if (daysAgo < 7) {
        if (daysAgo === 0) return "Today";
        if (daysAgo === 1) return "1 day ago";
        return `${daysAgo} days ago`;
    }

    return format(sentDate, "MMM d, yyyy");
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "declined", label: "Declined" },
    { key: "cancelled", label: "Cancelled" },
] as const;

export default function InvitationsClient() {
    const router = useRouter();
    const { data, isLoading } = useSWR("/api/candidate/invitations", fetcher);
    const [filter, setFilter] = useState<string>("all");

    const invitations: Invitation[] = data?.success ? data.data : [];

    const handleCardClick = (invitationId: string) => {
        router.push(`/candidate/invitations/${invitationId}`);
    };

    const filteredInvitations = invitations.filter((inv) => {
        if (filter === "all") return true;
        if (filter === "cancelled") return inv.invitation_canceled;
        return inv.status === filter;
    });

    const statusCounts = {
        all: invitations.length,
        pending: invitations.filter((i) => i.status === "pending").length,
        accepted: invitations.filter((i) => i.status === "accepted").length,
        declined: invitations.filter((i) => i.status === "declined").length,
        cancelled: invitations.filter((i) => i.invitation_canceled).length,
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-primary/20 bg-primary/[0.03]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading invitations…</p>
            </div>
        );
    }

    if (invitations.length === 0) {
        return (
            <Card variant="glass" className="overflow-hidden border-primary/15">
                <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 ring-1 ring-primary/20">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">No invitations yet</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            When employers shortlist you, interview requests land here with a clear timeline and next
                            steps.
                        </p>
                    </div>
                    <Button variant="gradient" asChild className="mt-2">
                        <Link href="/candidate/jobs">Browse open roles</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm ring-1 ring-border/40 md:p-6">
                <div
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.09]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-accent/[0.05] blur-3xl dark:bg-accent/[0.07]"
                    aria-hidden
                />
                <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-primary/70" aria-hidden />
                            Inbox
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Interview invitations</h2>
                        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                            {invitations.length} live{" "}
                            {invitations.length === 1 ? "thread" : "threads"} with employers — open a card to respond,
                            pick slots, and track outcomes in one place.
                        </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center backdrop-blur-sm md:text-left dark:bg-muted/25">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Awaiting action
                        </p>
                        <p className="text-2xl font-bold tabular-nums text-foreground">{statusCounts.pending}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/20 p-1 dark:bg-muted/10">
                {FILTERS.map((status) => {
                    const active = filter === status.key;
                    return (
                        <button
                            key={status.key}
                            type="button"
                            onClick={() => setFilter(status.key)}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                                active
                                    ? "border border-primary/35 bg-primary/15 text-foreground shadow-none dark:bg-primary/20"
                                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                            )}
                        >
                            {status.label}{" "}
                            <span className={cn("tabular-nums", active ? "opacity-95" : "opacity-70")}>
                                ({statusCounts[status.key as keyof typeof statusCounts]})
                            </span>
                        </button>
                    );
                })}
            </div>

            {filteredInvitations.length === 0 ? (
                <Card variant="glass" className="border-dashed">
                    <CardContent className="py-14 text-center text-sm text-muted-foreground">
                        No invitations in this filter. Try another tab.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {filteredInvitations.map((invitation) => {
                        const offer = normalizeEmbeddedOffer(invitation.job_offers);
                        const journey = getInvitationJourneyDisplay(
                            {
                                status: invitation.status,
                                invitation_canceled: invitation.invitation_canceled,
                                interview_confirmed: invitation.interview_confirmed ?? false,
                                mis_rescheduled: invitation.mis_rescheduled,
                                pipeline_status: invitation.pipeline_status ?? null,
                                current_round_number: invitation.current_round_number ?? null,
                                candidate_reschedule_requested: (
                                    invitation as { candidate_reschedule_requested?: boolean }
                                ).candidate_reschedule_requested,
                            },
                            offer
                        );
                        const badgeClass = journeyVariantToCandidateClasses(journey.variant);

                        return (
                            <Card
                                key={invitation.id}
                                variant="glass"
                                className={cn(
                                    "gap-0 py-0 rounded-lg",
                                    "group cursor-pointer overflow-hidden border-border/60",
                                    "hover:border-border hover:shadow-sm hover:shadow-black/5 dark:hover:shadow-black/15"
                                )}
                                onClick={() => handleCardClick(invitation.id)}
                            >
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/35 to-transparent dark:via-primary/30" />
                                <CardContent className="flex flex-col gap-0 space-y-0 p-0 px-3 pb-2.5 pt-2">
                                    <div className="flex gap-2">
                                        <div className="relative shrink-0">
                                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/30 dark:bg-muted/20">
                                                {invitation.company.logo_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={invitation.company.logo_url}
                                                        alt=""
                                                        className="h-full w-full object-contain p-1"
                                                    />
                                                ) : (
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-1.5">
                                                <h3 className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground">
                                                    {invitation.job_designation}
                                                </h3>
                                                <Badge
                                                    className={cn(
                                                        "max-w-[5.5rem] shrink-0 truncate px-1.5 py-0 text-[9px] font-semibold leading-none",
                                                        badgeClass
                                                    )}
                                                >
                                                    {journey.label}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                                                {invitation.company.company_name}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] leading-none text-muted-foreground">
                                                {invitation.company.headoffice_location ? (
                                                    <span className="inline-flex min-w-0 items-center gap-0.5">
                                                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                                                        <span className="truncate">{invitation.company.headoffice_location}</span>
                                                    </span>
                                                ) : null}
                                                <span className="tabular-nums opacity-90">
                                                    {invitation.company.headoffice_location ? " · " : "Sent "}
                                                    {formatInvitationDate(invitation.sent_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1.5 text-[10px] font-medium text-muted-foreground">
                                        <span>Open details</span>
                                        <span aria-hidden>
                                            →
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
