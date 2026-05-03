"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
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

// Helper function to format date relative to today
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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InvitationsClient() {
    const router = useRouter();
    const { data, error, isLoading } = useSWR("/api/candidate/invitations", fetcher);
    const [filter, setFilter] = useState<string>("all");

    const invitations: Invitation[] = data?.success ? data.data : [];

    const handleCardClick = (invitationId: string) => {
        router.push(`/candidate/invitations/${invitationId}`);
    };


    const filteredInvitations = invitations.filter(inv => {
        if (filter === "all") return true;
        if (filter === "cancelled") return inv.invitation_canceled;
        return inv.status === filter;
    });

    const statusCounts = {
        all: invitations.length,
        pending: invitations.filter(i => i.status === 'pending').length,
        accepted: invitations.filter(i => i.status === 'accepted').length,
        declined: invitations.filter(i => i.status === 'declined').length,
        cancelled: invitations.filter(i => i.invitation_canceled).length,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (invitations.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Mail className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Invitations Yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                        You haven&apos;t received any interview invitations yet. Keep your profile updated and apply to jobs to increase your chances!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Your Invitations</h2>
                    <p className="text-muted-foreground">
                        {invitations.length} interview {invitations.length === 1 ? 'invitation' : 'invitations'}
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'declined', label: 'Declined' },
                    { key: 'cancelled', label: 'Cancelled' },
                ].map(status => (
                    <button
                        key={status.key}
                        onClick={() => setFilter(status.key)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === status.key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        {status.label} ({statusCounts[status.key as keyof typeof statusCounts]})
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                            candidate_reschedule_requested: (invitation as any).candidate_reschedule_requested,
                        },
                        offer
                    );
                    const badgeClass = journeyVariantToCandidateClasses(journey.variant);

                    return (
                        <Card
                            key={invitation.id}
                            className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                            onClick={() => handleCardClick(invitation.id)}
                        >
                            <CardContent className="px-3 py-1">
                                <div className="flex gap-3 items-start">
                                    <div className="h-12 w-12 rounded bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {invitation.company.logo_url ? (
                                            <img
                                                src={invitation.company.logo_url}
                                                alt={invitation.company.company_name}
                                                className="h-12 w-12 object-contain"
                                            />
                                        ) : (
                                            <Mail className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm text-primary line-clamp-1">
                                                    {invitation.job_designation}
                                                </h3>
                                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                    {invitation.company.company_name}
                                                </p>
                                            </div>
                                            <Badge className={cn("text-[10px] px-2 py-0.5 w-fit", badgeClass)}>
                                                {journey.label}
                                            </Badge>
                                        </div>
                                    {invitation.company.headoffice_location && (
                                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                                            {invitation.company.headoffice_location}
                                        </p>
                                    )}

                                    <p className="text-[10px] text-muted-foreground ">
                                        {formatInvitationDate(invitation.sent_at)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
