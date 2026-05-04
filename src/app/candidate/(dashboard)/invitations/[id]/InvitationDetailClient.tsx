"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Building2, MapPin, Loader2, User, Phone, Globe, Briefcase, Check, Mail, Video, MapPinned, Copy, ExternalLink, X, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatUTCTime, formatUTCDate, formatTimestamp } from "@/lib/date-utils";
import { formatIndustry, formatPhoneNumber } from "@/lib/utils";
import { InterviewOutcomeDisplay } from "@/components/candidate/InterviewOutcomeDisplay";
import { InterviewRoadmap } from "@/components/shared/InterviewRoadmap";
import { JobOfferCard } from "@/components/candidate/JobOfferCard";
import { createClient } from "@/lib/supabase/client";
import {
    getInvitationJourneyDisplay,
    normalizeEmbeddedOffer,
} from "@/lib/invitation-journey-status";

interface TimeSlot {
    date: string;
    time: string;
    order: number;
    is_alternative?: boolean;
}

interface InvitationDetail {
    id: string;
    industry: string;
    job_designation: string;
    message: string | null;
    given_time_slots: TimeSlot[];
    alternative_dates: TimeSlot[];
    selected_time_slot: TimeSlot | null;
    interview_mode: string | null;
    status: string;
    sent_at: string;
    viewed_at: string | null;
    responded_at: string | null;
    interview_confirmed: boolean;
    confirmed_time: string | null;
    meeting_link: string | null;
    interview_address: string | null;
    map_link: string | null;
    confirmed_at: string | null;
    invitation_canceled: boolean;
    canceled_by: string | null;
    cancellation_reason: string | null;
    canceled_at: string | null;
    mis_rescheduled?: boolean;
    mis_rescheduled_at?: string;
    mis_reschedule_data?: {
        date: string;
        time: string;
        interview_mode: 'online' | 'physical';
        meeting_link?: string;
        interview_address?: string;
        map_link?: string;
        notes?: string;
    };
    company: {
        company_name: string;
        logo_url: string | null;
        industry: string;
        headoffice_location: string | null;
        bio: string | null;
        website: string | null;
        phone: string | null;
    };
    employer: {
        first_name: string;
        last_name: string;
        designation: string | null;
        email: string;
        phone: string | null;
        job_title: string | null;
        department: string | null;
        profile_image_url: string | null;
    };
    pipeline_status?: string | null;
    current_round_number?: number | null;
    candidate_reschedule_requested?: boolean;
    reschedule_request_reason?: string | null;
    job_offers?: { id: string; status: string } | { id: string; status: string }[] | null;
}

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InvitationDetailClient({ invitationId }: { invitationId: string }) {
    const router = useRouter();
    const { data: invitationData, error: invitationError, isLoading: invitationLoading, mutate: mutateInvitation } = useSWR(`/api/candidate/invitations/${invitationId}`, fetcher);
    const { data: offerData, mutate: mutateOffer } = useSWR(`/api/candidate/invitations/${invitationId}/offer`, fetcher);
    
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedMode, setSelectedMode] = useState<'online' | 'physical' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestReschedule, setRequestReschedule] = useState(false);
    const [rescheduleReason, setRescheduleReason] = useState("");
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [hasInterviewOutcome, setHasInterviewOutcome] = useState(false);

    const invitation: InvitationDetail | null = invitationData?.success ? invitationData.data : null;
    const jobOffer = offerData?.success ? offerData.offer : null;

    useEffect(() => {
        if (invitation) {
            const embeddedOffer = normalizeEmbeddedOffer(invitation.job_offers);
            const hasOffer = !!jobOffer || !!embeddedOffer;
            setHasInterviewOutcome((!!invitation.pipeline_status && invitation.pipeline_status !== 'active') || hasOffer);
        }
    }, [invitation, jobOffer]);

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel(`invitation-detail-${invitationId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "job_invitations",
                    filter: `id=eq.${invitationId}`,
                },
                () => {
                    mutateInvitation();
                    mutateOffer();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "job_offers",
                    filter: `invitation_id=eq.${invitationId}`,
                },
                () => {
                    mutateOffer();
                    mutateInvitation();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [invitationId, mutateInvitation, mutateOffer]);


    const handleAccept = async () => {
        if (!selectedSlot) {
            toast.error("Please select a time slot before accepting");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/candidate/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'accept',
                    selected_time_slot: selectedSlot,
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Invitation accepted successfully!");
                router.push("/candidate/invitations");
            } else {
                toast.error(data.error || "Failed to accept invitation");
            }
        } catch (error) {
            console.error("Error accepting invitation:", error);
            toast.error("An error occurred while accepting invitation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDecline = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/candidate/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'decline',
                    request_reschedule: requestReschedule,
                    reschedule_reason: rescheduleReason
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Invitation declined");
                router.push("/candidate/invitations");
            } else {
                toast.error(data.error || "Failed to decline invitation");
            }
        } catch (error) {
            console.error("Error declining invitation:", error);
            toast.error("An error occurred while declining invitation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelAcceptance = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/candidate/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'cancel'
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Acceptance cancelled. You can select a new time slot.");
                mutateInvitation();
            } else {
                toast.error(data.error || "Failed to cancel acceptance");
            }
        } catch (error) {
            console.error("Error cancelling acceptance:", error);
            toast.error("An error occurred while cancelling acceptance");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelInterview = async () => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/candidate/invitations/${invitationId}/cancel-interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cancellation_reason: cancellationReason
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Interview canceled successfully');
                setShowCancelDialog(false);
                setCancellationReason('');
                mutateInvitation();
            } else {
                toast.error(data.error || 'Failed to cancel interview');
            }
        } catch (error) {
            console.error('Error canceling interview:', error);
            toast.error('An error occurred while canceling interview');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (invitationLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="flex items-center justify-center py-12">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Invitation not found</CardTitle>
                        <CardDescription>The invitation you are looking for does not exist or you don't have access to it.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => router.push("/candidate/invitations")} className="w-full">
                            Back to Invitations
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }


    const isPending = invitation.status === 'pending' || invitation.status === 'viewed';
    const isConfirmed = invitation.status === 'accepted' && invitation.interview_confirmed;
    const isPendingConfirmation = invitation.status === 'accepted' && !invitation.interview_confirmed;

    const embeddedOffer = normalizeEmbeddedOffer(invitation.job_offers);
    const offerForJourney = jobOffer ? { status: jobOffer.status } : embeddedOffer;

    const journey = getInvitationJourneyDisplay(
        {
            status: invitation.status,
            invitation_canceled: invitation.invitation_canceled,
            interview_confirmed: invitation.interview_confirmed,
            mis_rescheduled: invitation.mis_rescheduled,
            pipeline_status: invitation.pipeline_status ?? null,
            current_round_number: invitation.current_round_number ?? null,
            candidate_reschedule_requested: invitation.candidate_reschedule_requested,
        },
        offerForJourney
    );

    const heroVariantClass: Record<typeof journey.variant, string> = {
        pending: "bg-amber-500",
        info: "bg-sky-500",
        success: "bg-green-500",
        warning: "bg-orange-500",
        danger: "bg-red-500",
        muted: "bg-gray-500",
    };

    let StatusIcon = AlertCircle;
    if (journey.variant === "success") StatusIcon = CheckCircle2;
    else if (journey.variant === "danger") StatusIcon = X;
    else if (journey.variant === "warning") StatusIcon = Briefcase;
    else if (journey.variant === "info") StatusIcon = Clock;
    else if (journey.variant === "muted") StatusIcon = Calendar;

    const statusConfig = {
        color: heroVariantClass[journey.variant],
        text: journey.label,
        icon: StatusIcon,
    };

    // Check if steps are complete
    const isModeSelected = !!invitation?.interview_mode;
    const isSlotSelected = selectedSlot !== null;
    const canProceed = isSlotSelected;

    return (
        <div className="max-w-5xl mx-auto ">
            {/* Hero Section - Company & Job */}
            <Card className="overflow-hidden mb-6">
                <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
                    <div className="flex items-start gap-6">
                        {/* Company Logo */}
                        {invitation.company.logo_url && (
                            <div className="h-24 w-24 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 border">
                                <img
                                    src={invitation.company.logo_url}
                                    alt={invitation.company.company_name}
                                    className="h-20 w-20 object-contain"
                                />
                            </div>
                        )}

                        {/* Company & Job Info */}
                        <div className="flex-1 min-w-0 ">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{invitation.job_designation}</h1>
                                    <p className="text-xl text-muted-foreground mb-3">{invitation.company.company_name}</p>
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4" />
                                            {formatIndustry(invitation.industry)}
                                        </span>
                                        {invitation.company.headoffice_location && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {invitation.company.headoffice_location}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <Badge className={`${statusConfig.color} text-white border-none px-3 py-1.5 flex items-center gap-1.5`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {statusConfig.text}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className=" space-y-2">
                    {/* Company Bio */}
                    {invitation.company.bio && (
                        <div>
                            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">About the Company</h3>
                            <p className="text-sm leading-relaxed mb-3">{invitation.company.bio}</p>

                            <div className="flex flex-wrap gap-4">
                                {invitation.company.website && (
                                    <a
                                        href={invitation.company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span>Visit Website</span>
                                    </a>
                                )}
                                {invitation.company.phone && (
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        {invitation.company.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Separator */}
                    {invitation.company.bio && <Separator />}

                    {/* Compact Contact Person */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Contact Person</h3>
                        <div className="flex justify-center items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base leading-tight mb-1">
                                    {invitation.employer.first_name} {invitation.employer.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground leading-tight mb-2">
                                    {[
                                        invitation.employer.designation,
                                        invitation.employer.job_title,
                                        invitation.employer.department
                                    ].filter(Boolean).join(' | ')}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {invitation.employer.email && (
                                        <a
                                            href={`mailto:${invitation.employer.email}`}
                                            className="text-xs text-primary hover:underline flex items-center gap-1.5"
                                        >
                                            <Mail className="h-3.5 w-3.5" />
                                            {invitation.employer.email}
                                        </a>
                                    )}
                                    {invitation.employer.phone && (
                                        <a
                                            href={`tel:${invitation.employer.phone}`}
                                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
                                        >
                                            <Phone className="h-3.5 w-3.5" />
                                            {formatPhoneNumber(invitation.employer.phone)}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Status-Specific Sections */}

            {/* DECLINED STATUS */}
            {invitation.status === 'declined' && (
                <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                                <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">You declined this invitation</h3>
                                {invitation.responded_at && (
                                    <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                                        Declined on {formatTimestamp(invitation.responded_at, "MMMM d, yyyy 'at' HH:mm")}
                                    </p>
                                )}
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                    Changed your mind? You can reconsider this invitation.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    onClick={handleCancelAcceptance}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Reconsider Invitation"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Job Offer Card - Shows prominent offer details */}
            {jobOffer && (
                <JobOfferCard
                    invitationId={invitationId}
                    offer={jobOffer}
                    companyName={invitation.company.company_name}
                    jobDesignation={invitation.job_designation}
                    onRefresh={() => {
                        void mutateOffer();
                        void mutateInvitation();
                    }}
                />
            )}

            {/* Interview Roadmap - Shows all rounds and progress */}
            {isConfirmed && !invitation.invitation_canceled && (
                <InterviewRoadmap
                    invitationId={invitation.id}
                    userRole="candidate"
                    onOutcomeFound={setHasInterviewOutcome}
                    className="mb-6"
                />
            )}

            {/* CONFIRMED STATUS - Only show if no outcome yet */}
            {isConfirmed && invitation.selected_time_slot && !hasInterviewOutcome && (
                <Card className={invitation.invitation_canceled && !invitation.mis_rescheduled ? "border-gray-200 " : "border-green-200 bg-green-50/50 dark:bg-green-950/20"}>
                    <CardContent className="p-6">
                        {!invitation.mis_rescheduled && (
                            <>
                                <div className="flex items-start gap-3 mb-4">
                                    <div className={`h-10 w-10 rounded-full ${invitation.invitation_canceled ? 'border-gray-200 dark:border-gray-900 border-2' : 'border-green-200 dark:border-green-900 border-2'} flex items-center justify-center flex-shrink-0`}>
                                        {invitation.invitation_canceled ? (
                                            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        ) : (
                                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold mb-1 ${invitation.invitation_canceled ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'}`}>
                                            {invitation.invitation_canceled ? 'Interview Canceled' : 'Interview Confirmed!'}
                                        </h3>
                                        <p className={`text-sm ${invitation.invitation_canceled ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {invitation.invitation_canceled ? 'This interview has been canceled.' : 'Your interview has been scheduled as follows:'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-white dark:bg-gray-900 rounded-lg p-4 border">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date</p>
                                            <p className="font-semibold">{formatUTCDate(invitation.selected_time_slot.date, "EEEE, MMMM d, yyyy")}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Time</p>
                                            <p className="font-semibold">
                                                {formatUTCTime(
                                                    invitation.selected_time_slot.date,
                                                    invitation.confirmed_time || invitation.selected_time_slot.time
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {invitation.interview_mode && (
                                        <>
                                            <Separator />
                                            <div className="flex items-center gap-3">
                                                {invitation.interview_mode === 'online' ? (
                                                    <Video className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                ) : (
                                                    <MapPinned className="h-5 w-5 text-primary flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Mode</p>
                                                    <p className="font-semibold capitalize">{invitation.interview_mode} Interview</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Meeting Link for Online */}
                                    {invitation.interview_mode === 'online' && invitation.meeting_link && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Meeting Link</p>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={invitation.meeting_link}
                                                        readOnly
                                                        className="flex-1 text-sm"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={invitation.invitation_canceled}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(invitation.meeting_link!);
                                                            toast.success("Link copied!");
                                                        }}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Link href={invitation.meeting_link} target="_blank" className={invitation.invitation_canceled ? 'pointer-events-none' : ''}>
                                                        <Button size="sm" disabled={invitation.invitation_canceled}>
                                                            <ExternalLink className="h-4 w-4 mr-1.5" />
                                                            Join
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Address for Physical */}
                                    {invitation.interview_mode === 'physical' && invitation.interview_address && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Interview Address</p>
                                                <p className="text-sm font-medium mb-2">{invitation.interview_address}</p>
                                                {invitation.map_link && (
                                                    <Link href={invitation.map_link} target="_blank">
                                                        <Button size="sm" variant="outline">
                                                            <MapPinned className="h-4 w-4 mr-2" />
                                                            Open in Maps
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Employer Message */}
                        {invitation.message && (
                            <>
                                <Separator className="my-4" />
                                <div>
                                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Message from Employer</h4>
                                    <div className="rounded-lg bg-muted/50 p-4 border">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{invitation.message}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* MIS Reschedule Section */}
                        {invitation.mis_rescheduled && invitation.mis_reschedule_data && (
                            <>
                                {!invitation.mis_rescheduled && <Separator className="my-4" />}
                                <div className={!invitation.mis_rescheduled ? "bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800 space-y-3" : "space-y-3"}>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-600 text-white">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Rescheduled by MIS
                                        </Badge>
                                        {invitation.mis_rescheduled_at && (
                                            <span className="text-xs text-muted-foreground">
                                                on {formatTimestamp(invitation.mis_rescheduled_at, "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                                        {invitation.mis_rescheduled ? "Interview Details" : "New Interview Schedule"}
                                    </h4>

                                    <div className="space-y-2 bg-white dark:bg-gray-900 rounded p-3 border">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-green-700 dark:text-green-300">New Date</p>
                                                <p className="font-semibold">{formatUTCDate(invitation.mis_reschedule_data.date, "EEEE, MMMM d, yyyy")}</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-green-700 dark:text-green-300">New Time</p>
                                                <p className="font-semibold">{formatUTCTime(invitation.mis_reschedule_data.date, invitation.mis_reschedule_data.time)}</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex items-center gap-3">
                                            {invitation.mis_reschedule_data.interview_mode === 'online' ? (
                                                <Video className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            ) : (
                                                <MapPinned className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            )}
                                            <div>
                                                <p className="text-xs text-green-700 dark:text-green-300">Mode</p>
                                                <p className="font-semibold capitalize">{invitation.mis_reschedule_data.interview_mode} Interview</p>
                                            </div>
                                        </div>

                                        {invitation.mis_reschedule_data.meeting_link && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <p className="text-xs text-green-700 dark:text-green-300 mb-2">Meeting Link</p>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={invitation.mis_reschedule_data.meeting_link}
                                                            readOnly
                                                            className="flex-1 text-sm"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(invitation.mis_reschedule_data!.meeting_link!);
                                                                toast.success("Link copied!");
                                                            }}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Link href={invitation.mis_reschedule_data.meeting_link} target="_blank">
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                                <ExternalLink className="h-4 w-4 mr-1.5" />
                                                                Join
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {invitation.mis_reschedule_data.interview_address && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <p className="text-xs text-green-700 dark:text-green-300 mb-1">Interview Address</p>
                                                    <p className="text-sm font-medium mb-2">{invitation.mis_reschedule_data.interview_address}</p>
                                                    {invitation.mis_reschedule_data.map_link && (
                                                        <Link href={invitation.mis_reschedule_data.map_link} target="_blank">
                                                            <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                                                <MapPinned className="h-4 w-4 mr-2" />
                                                                Open in Maps
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {invitation.mis_reschedule_data.notes && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <p className="text-xs text-green-700 dark:text-green-300 mb-1">Notes</p>
                                                    <p className="text-sm">{invitation.mis_reschedule_data.notes}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {!invitation.invitation_canceled && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => setShowCancelDialog(true)}
                            >
                                Cancel Interview
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* PENDING CONFIRMATION STATUS */}
            {isPendingConfirmation && invitation.selected_time_slot && (
                <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Awaiting Employer Confirmation</h3>
                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                    You've accepted this invitation. The employer will confirm the final details shortly.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Selected Date</p>
                                    <p className="font-semibold">{formatUTCDate(invitation.selected_time_slot.date, "EEEE, MMMM d, yyyy")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Selected Time</p>
                                    <p className="font-semibold">{formatUTCTime(invitation.selected_time_slot.date, invitation.selected_time_slot.time)}</p>
                                </div>
                            </div>

                            {invitation.interview_mode && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        {invitation.interview_mode === 'online' ? (
                                            <Video className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                        ) : (
                                            <MapPinned className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className="text-sm text-muted-foreground">Preferred Mode</p>
                                            <p className="font-semibold capitalize">{invitation.interview_mode} Interview</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4 border-orange-200 hover:bg-orange-100 dark:hover:bg-orange-950/30"
                            onClick={handleCancelAcceptance}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Cancel Acceptance"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* SELECTION FLOW */}
            {isPending && (
                <div className="space-y-4 py-4">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Action required</p>
                                    <h3 className="text-lg font-semibold mt-2">Review and confirm your interview</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        The employer has requested a <span className="font-semibold text-primary capitalize">{invitation.interview_mode}</span> interview. Please pick a time slot to confirm.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-xl bg-white p-2 text-center shadow-sm">
                                        <div className="text-sm font-semibold text-primary">1</div>
                                        <div className="mt-1 text-muted-foreground">Pick Time</div>
                                    </div>
                                    <div className="rounded-xl bg-white p-2 text-center shadow-sm">
                                        <div className="text-sm font-semibold text-primary">2</div>
                                        <div className="mt-1 text-muted-foreground">Confirm</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                        <Card className="border-primary/10">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-500 text-white">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-lg">Interview Mode</CardTitle>
                                </div>
                                <CardDescription>The employer has pre-selected the following mode:</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10">
                                            {invitation.interview_mode === 'online' ? (
                                                <Video className="h-6 w-6 text-primary" />
                                            ) : (
                                                <MapPinned className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base capitalize">{invitation.interview_mode} Interview</p>
                                            <p className="text-sm text-muted-foreground">
                                                {invitation.interview_mode === 'online' 
                                                    ? "Meeting link will be provided after time slot confirmation." 
                                                    : "Please attend in-person at the specified location."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {invitation.interview_mode === 'physical' && invitation.interview_address && (
                                    <div className="mt-4 p-4 rounded-xl border bg-muted/30 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold">Location</p>
                                                <p className="text-sm text-muted-foreground">{invitation.interview_address}</p>
                                            </div>
                                        </div>
                                        {invitation.map_link && (
                                            <Button variant="outline" size="sm" asChild className="w-full">
                                                <a href={invitation.map_link} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Open in Maps
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className={isSlotSelected ? 'border-green-200' : !isModeSelected ? 'opacity-60 pointer-events-none' : ''}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isSlotSelected ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}`}>
                                        {isSlotSelected ? <Check className="h-4 w-4" /> : '1'}
                                    </div>
                                    <CardTitle className="text-lg">Choose a time slot</CardTitle>
                                </div>
                                <CardDescription>Pick one of the employer proposed times below.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                    {(invitation.given_time_slots || []).length > 0 ? (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm">Available times</h4>
                                            <div className="grid gap-2">
                                                {(invitation.given_time_slots || []).map((slot, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && !selectedSlot?.is_alternative
                                                            ? 'border-primary bg-primary/5 shadow-sm'
                                                            : 'border-border hover:border-primary hover:bg-primary/5'
                                                            }`}>
                                                        {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && !selectedSlot?.is_alternative && (
                                                            <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            <Badge variant="outline" className="text-xs">Option {slot.order}</Badge>
                                                        </div>
                                                        <p className="font-semibold">{formatUTCDate(slot.date, "EEE, MMM d, yyyy")}</p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Clock className="h-3 w-3" />{formatUTCTime(slot.date, slot.time)}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
                                            No proposed time slots were provided. Please contact the employer for alternatives.
                                        </div>
                                    )}
                                    {(invitation.alternative_dates || []).length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-sm">Alternative dates</h4>
                                                <Badge variant="secondary" className="text-xs">If the above times don’t work</Badge>
                                            </div>
                                            <div className="grid gap-2">
                                                {(invitation.alternative_dates || []).map((slot, index) => {
                                                    const altSlot = { ...slot, is_alternative: true };
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedSlot(altSlot)}
                                                            className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && selectedSlot?.is_alternative
                                                                ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm'
                                                                : 'border-border hover:border-green-300 hover:bg-green-50/20'
                                                                }`}>
                                                            {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && selectedSlot?.is_alternative && (
                                                                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                                    <Check className="h-3 w-3" />
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                                                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">Alternative</Badge>
                                                            </div>
                                                            <p className="font-semibold">{formatUTCDate(slot.date, "EEE, MMM d, yyyy")}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">Time is set by the employer</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                        </Card>
                    </div>

                    <Card className={canProceed ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' : 'opacity-60'}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${canProceed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                    3
                                </div>
                                <CardTitle className="text-lg">Review and confirm</CardTitle>
                            </div>
                            {canProceed && (
                                <CardDescription>Confirm your selection or decline if you aren’t available.</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {canProceed ? (
                                <div className="space-y-4">
                                    <div className="rounded-xl bg-white dark:bg-gray-900 border p-3 space-y-3">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Interview Mode</span>
                                            <span className="font-semibold text-foreground flex items-center gap-2">
                                                {selectedMode === 'online' ? (
                                                    <><Video className="h-4 w-4 text-blue-600" /> Online</>
                                                ) : (
                                                    <><MapPinned className="h-4 w-4 text-green-600" /> Physical</>
                                                )}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Interview Date</span>
                                            <span className="font-semibold">{selectedSlot && formatUTCDate(selectedSlot.date)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>Interview Time</span>
                                            <span className="font-semibold">
                                                {selectedSlot ? (
                                                    selectedSlot?.is_alternative ? "Employer will set the time" : (selectedSlot?.time ? formatUTCTime(selectedSlot.date, selectedSlot.time) : "-")
                                                ) : "-"}
                                            </span>
                                        </div>
                                        {selectedSlot?.is_alternative && (
                                            <>
                                                <Separator />
                                                <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-300">
                                                    Alternative Date Selected - Time will be set by employer upon confirmation
                                                </Badge>
                                            </>
                                        )}
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={handleAccept}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-5 w-5 mr-2" />
                                                    Accept Invitation
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            onClick={handleDecline}
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            Decline Invitation
                                        </Button>
                                    </div>
                                    <div className="pt-2 border-t mt-2">
                                        <div className="flex items-start space-x-3 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10">
                                            <Checkbox
                                                id="reschedule"
                                                checked={requestReschedule}
                                                onCheckedChange={(checked) => setRequestReschedule(!!checked)}
                                                className="mt-1"
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor="reschedule"
                                                    className="text-sm font-semibold leading-none cursor-pointer text-primary"
                                                >
                                                    Request another date & time
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    If none of these slots work, check this to ask the employer for new options.
                                                </p>
                                                {requestReschedule && (
                                                    <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                                                        <Label htmlFor="rescheduleReason" className="text-xs mb-1.5 block">Optional: Suggest your availability</Label>
                                                        <Textarea
                                                            id="rescheduleReason"
                                                            placeholder="e.g., I'm available on Monday afternoons next week..."
                                                            value={rescheduleReason}
                                                            onChange={(e) => setRescheduleReason(e.target.value)}
                                                            className="text-sm min-h-[80px] bg-white dark:bg-gray-900"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                                    Select an interview mode and a time slot to enable confirmation.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* CANCELED STATUS */}
            {/* CANCELED STATUS */}
            {invitation.invitation_canceled && invitation.cancellation_reason && !invitation.mis_rescheduled && (
                <Card className="border-red-700 bg-red-50/50 dark:bg-red-950/20 mt-6">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Cancellation Reason</h3>
                                {invitation.canceled_by && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Canceled by {invitation.canceled_by}
                                        {invitation.canceled_at && ` on ${formatTimestamp(invitation.canceled_at, "MMMM d, yyyy 'at' HH:mm")}`}
                                    </p>
                                )}
                                <div className="rounded-lg bg-white dark:bg-gray-900 p-3 border text-sm">
                                    {invitation.cancellation_reason}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Footer - Received Date */}
            <div className="text-center text-xs text-muted-foreground pb-4">
                Invitation received on {formatTimestamp(invitation.sent_at, "MMMM d, yyyy 'at' HH:mm")}
            </div>

            {/* Cancellation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Interview</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for canceling this interview. This will be shared with the employer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="Enter your reason for cancellation..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCancelDialog(false);
                                setCancellationReason('');
                            }}
                            disabled={isSubmitting}
                        >
                            Keep Interview
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleCancelInterview}
                            disabled={isSubmitting || !cancellationReason.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Canceling...
                                </>
                            ) : (
                                'Confirm Cancellation'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
