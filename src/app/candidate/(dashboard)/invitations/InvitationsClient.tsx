"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

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

export default function InvitationsClient() {
    const router = useRouter();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const response = await fetch("/api/candidate/invitations");
            const data = await response.json();

            if (data.success) {
                setInvitations(data.data);
            } else {
                toast.error("Failed to load invitations");
            }
        } catch (error) {
            console.error("Error fetching invitations:", error);
            toast.error("An error occurred while loading invitations");
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
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
                        You haven't received any interview invitations yet. Keep your profile updated and apply to jobs to increase your chances!
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
                {filteredInvitations.map((invitation) => (
                    <Card
                        key={invitation.id}
                        className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                        onClick={() => handleCardClick(invitation.id)}
                    >
                        <CardContent className="px-3">
                            <div className="flex gap-2 flex items-center">
                                {/* Company Logo */}
                                <div className="h-12 w-12 rounded bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {invitation.company.logo_url ? (
                                        <img
                                            src={invitation.company.logo_url}
                                            alt={invitation.company.company_name}
                                            className="h-12 w-12 object-contain"
                                        />
                                    ) : (
                                        <Mail className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    {/* Job Position */}
                                    <h3 className="font-semibold text-base text-primary line-clamp-1">
                                        {invitation.job_designation}
                                    </h3>

                                    {/* Company Name */}
                                    <p className="text-xs text-foreground line-clamp-1">
                                        {invitation.company.company_name}
                                    </p>

                                    {/* Location */}
                                    {invitation.company.headoffice_location && (
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {invitation.company.headoffice_location}
                                        </p>
                                    )}

                                    {/* Invited Date */}
                                    <p className="text-xs text-muted-foreground">
                                        {formatInvitationDate(invitation.sent_at)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
