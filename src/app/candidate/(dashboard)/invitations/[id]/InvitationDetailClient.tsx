"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Building2, MapPin, Loader2, User, Phone, Globe, Briefcase, Check, Mail, Video, MapPinned, Copy, ExternalLink, X, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

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
}

export default function InvitationDetailClient({ invitationId }: { invitationId: string }) {
    const router = useRouter();
    const [invitation, setInvitation] = useState<InvitationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedMode, setSelectedMode] = useState<'online' | 'physical' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    useEffect(() => {
        fetchInvitation();
    }, [invitationId]);

    const fetchInvitation = async () => {
        try {
            const response = await fetch(`/api/candidate/invitations/${invitationId}`);
            const data = await response.json();

            if (data.success) {
                setInvitation(data.data);
            } else {
                toast.error("Failed to load invitation");
                router.push("/candidate/invitations");
            }
        } catch (error) {
            console.error("Error fetching invitation:", error);
            toast.error("An error occurred while loading invitation");
            router.push("/candidate/invitations");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!selectedSlot) {
            toast.error("Please select a time slot before accepting");
            return;
        }

        if (!selectedMode) {
            toast.error("Please select an interview mode before accepting");
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
                    interview_mode: selectedMode
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
                    action: 'decline'
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
                fetchInvitation();
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
                fetchInvitation();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!invitation) {
        return null;
    }

    const isPending = invitation.status === 'pending' || invitation.status === 'viewed';
    const isConfirmed = invitation.status === 'accepted' && invitation.interview_confirmed;
    const isPendingConfirmation = invitation.status === 'accepted' && !invitation.interview_confirmed;

    // Get status configuration
    const getStatusConfig = () => {
        if (invitation.invitation_canceled) {
            return { color: 'bg-gray-500', text: 'Canceled', icon: X };
        }
        if (isConfirmed) {
            return { color: 'bg-green-500', text: 'Confirmed', icon: Check };
        }
        if (isPendingConfirmation) {
            return { color: 'bg-orange-500', text: 'Pending Confirmation', icon: Clock };
        }
        if (invitation.status === 'declined') {
            return { color: 'bg-red-500', text: 'Declined', icon: X };
        }
        return { color: 'bg-blue-500', text: 'Pending Response', icon: AlertCircle };
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    // Check if steps are complete
    const isModeSelected = selectedMode !== null;
    const isSlotSelected = selectedSlot !== null;
    const canProceed = isModeSelected && isSlotSelected;

    return (
        <div className="max-w-5xl mx-auto ">
            {/* Hero Section - Company & Job */}
            <Card className="overflow-hidden">
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
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{invitation.job_designation}</h1>
                                    <p className="text-xl text-muted-foreground mb-3">{invitation.company.company_name}</p>
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4" />
                                            {invitation.industry}
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
                            {invitation.employer.profile_image_url ? (
                                <img
                                    src={invitation.employer.profile_image_url}
                                    alt={`${invitation.employer.first_name} ${invitation.employer.last_name}`}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                            )}
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
                                            {invitation.employer.phone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Employer Message */}
            {invitation.message && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Message from Employer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg bg-muted/50 p-4 border">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{invitation.message}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                        Declined on {format(new Date(invitation.responded_at + (invitation.responded_at.endsWith('Z') ? '' : 'Z')), "MMMM d, yyyy 'at' h:mm a")}
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

            {/* CONFIRMED STATUS */}
            {isConfirmed && invitation.selected_time_slot && (
                <Card className={invitation.invitation_canceled ? "border-gray-200 bg-gray-50/50 dark:bg-gray-950/20" : "border-green-200 bg-green-50/50 dark:bg-green-950/20"}>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`h-10 w-10 rounded-full ${invitation.invitation_canceled ? 'bg-gray-100 dark:bg-gray-900' : 'bg-green-100 dark:bg-green-900'} flex items-center justify-center flex-shrink-0`}>
                                {invitation.invitation_canceled ? (
                                    <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold mb-1 ${invitation.invitation_canceled ? 'text-gray-900 dark:text-gray-100' : 'text-green-900 dark:text-green-100'}`}>
                                    {invitation.invitation_canceled ? 'Interview Canceled' : 'Interview Confirmed!'}
                                </h3>
                                <p className={`text-sm ${invitation.invitation_canceled ? 'text-gray-600 dark:text-gray-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {invitation.invitation_canceled ? 'This interview has been canceled.' : 'Your interview has been scheduled as follows:'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 bg-white dark:bg-gray-900 rounded-lg p-4 border">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="font-semibold">{format(new Date(invitation.selected_time_slot.date), "EEEE, MMMM d, yyyy")}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Time</p>
                                    <p className="font-semibold">{invitation.selected_time_slot.time}</p>
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
                                    <p className="font-semibold">{format(new Date(invitation.selected_time_slot.date), "EEEE, MMMM d, yyyy")}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Selected Time</p>
                                    <p className="font-semibold">{invitation.selected_time_slot.time}</p>
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

            {/* SELECTION FLOW - STEP BY STEP */}
            {isPending && (
                <div className="space-y-6 py-6">
                    {/* Progress Indicator */}
                    <Card>
                        <CardContent className="">
                            <h3 className="font-semibold mb-4">Complete the following steps to accept this invitation</h3>
                            <div className="flex items-center gap-2">
                                {/* Step 1 */}
                                <div className="flex items-center gap-2 flex-1">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isModeSelected ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {isModeSelected ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-semibold">1</span>}
                                    </div>
                                    <span className={`text-sm font-medium ${isModeSelected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                        Interview Mode
                                    </span>
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                                {/* Step 2 */}
                                <div className="flex items-center gap-2 flex-1">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSlotSelected ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {isSlotSelected ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-semibold">2</span>}
                                    </div>
                                    <span className={`text-sm font-medium ${isSlotSelected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                        Time Slot
                                    </span>
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                                {/* Step 3 */}
                                <div className="flex items-center gap-2 flex-1">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${canProceed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <span className="text-sm font-semibold">3</span>
                                    </div>
                                    <span className={`text-sm font-medium ${canProceed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                        Confirm
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* STEP 1: Interview Mode Selection */}
                    <Card className={isModeSelected ? 'border-green-200' : ''}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isModeSelected ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'
                                    }`}>
                                    {isModeSelected ? <Check className="h-4 w-4" /> : '1'}
                                </div>
                                <CardTitle className="text-lg">Select Interview Mode</CardTitle>
                            </div>
                            <CardDescription>Choose how you'd like to attend this interview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                <button
                                    onClick={() => setSelectedMode('online')}
                                    className={`relative p-5 rounded-lg border-2 transition-all text-left ${selectedMode === 'online'
                                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm'
                                        : 'border-border hover:border-green-300 hover:bg-green-50/20'
                                        }`}
                                >
                                    {selectedMode === 'online' && (
                                        <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${selectedMode === 'online' ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                                            }`}>
                                            <Video className={`h-7 w-7 ${selectedMode === 'online' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base">Online Interview</p>
                                            <p className="text-sm text-muted-foreground">Via video call platform</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedMode('physical')}
                                    className={`relative p-5 rounded-lg border-2 transition-all text-left ${selectedMode === 'physical'
                                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm'
                                        : 'border-border hover:border-green-300 hover:bg-green-50/20'
                                        }`}
                                >
                                    {selectedMode === 'physical' && (
                                        <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${selectedMode === 'physical' ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                                            }`}>
                                            <MapPinned className={`h-7 w-7 ${selectedMode === 'physical' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base">Physical Interview</p>
                                            <p className="text-sm text-muted-foreground">In-person at company</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* STEP 2: Time Slot Selection */}
                    <Card className={isSlotSelected ? 'border-green-200' : !isModeSelected ? 'opacity-60 pointer-events-none' : ''}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isSlotSelected ? 'bg-green-500 text-white' : isModeSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {isSlotSelected ? <Check className="h-4 w-4" /> : '2'}
                                </div>
                                <CardTitle className="text-lg">Select Time Slot</CardTitle>
                            </div>
                            <CardDescription>
                                {isModeSelected ? 'Choose your preferred interview time' : 'Complete step 1 to continue'}
                            </CardDescription>
                        </CardHeader>
                        {isModeSelected && (
                            <CardContent className="space-y-6">
                                {/* Proposed Time Slots */}
                                {invitation.given_time_slots && invitation.given_time_slots.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm mb-3">Proposed Time Slots</h4>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {invitation.given_time_slots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && !selectedSlot?.is_alternative
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                                        }`}
                                                >
                                                    {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && !selectedSlot?.is_alternative && (
                                                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Calendar className="h-4 w-4 text-primary" />
                                                        <Badge variant="outline" className="text-xs">Option {slot.order}</Badge>
                                                    </div>
                                                    <p className="font-semibold text-sm mb-1">
                                                        {format(new Date(slot.date), "EEE, MMM d, yyyy")}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {slot.time}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Alternative Dates */}
                                {invitation.alternative_dates && invitation.alternative_dates.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <h4 className="font-medium text-sm">Alternative Dates</h4>
                                            <Badge variant="secondary" className="text-xs">If proposed times don't work</Badge>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {invitation.alternative_dates.map((slot, index) => {
                                                const altSlot = { ...slot, is_alternative: true };
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedSlot(altSlot)}
                                                        className={`relative p-4 rounded-lg border-2 transition-all text-left ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && selectedSlot?.is_alternative
                                                            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm'
                                                            : 'border-border hover:border-green-300 hover:bg-green-50/20'
                                                            }`}
                                                    >
                                                        {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && selectedSlot?.is_alternative && (
                                                            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                            <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">Alternative</Badge>
                                                        </div>
                                                        <p className="font-semibold text-sm mb-1">
                                                            {format(new Date(slot.date), "EEE, MMM d, yyyy")}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {slot.time}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>

                    {/* STEP 3: Confirm and Submit */}
                    <Card className={canProceed ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' : 'opacity-60'}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${canProceed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    3
                                </div>
                                <CardTitle className="text-lg">Review & Confirm</CardTitle>
                            </div>
                            {canProceed && (
                                <CardDescription>You're all set! Review your selection and confirm.</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {canProceed && (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Interview Mode:</span>
                                            <span className="font-semibold flex items-center gap-2">
                                                {selectedMode === 'online' ? (
                                                    <><Video className="h-4 w-4 text-blue-600" /> Online</>
                                                ) : (
                                                    <><MapPinned className="h-4 w-4 text-green-600" /> Physical</>
                                                )}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Selected Date:</span>
                                            <span className="font-semibold">{selectedSlot && format(new Date(selectedSlot.date), "MMM d, yyyy")}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Selected Time:</span>
                                            <span className="font-semibold">{selectedSlot?.time}</span>
                                        </div>
                                        {selectedSlot?.is_alternative && (
                                            <>
                                                <Separator />
                                                <div className="flex items-center justify-center">
                                                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-300">
                                                        Alternative Date Selected
                                                    </Badge>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            className="flex-1"
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
                                            className="sm:w-auto border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            onClick={handleDecline}
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!canProceed && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Complete steps 1 and 2 to proceed
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* CANCELED STATUS */}
            {invitation.invitation_canceled && invitation.cancellation_reason && (
                <Card className="border-gray-200 bg-gray-50/50 dark:bg-gray-950/20">
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
                                        {invitation.canceled_at && ` on ${format(new Date(invitation.canceled_at + (invitation.canceled_at.endsWith('Z') ? '' : 'Z')), "MMMM d, yyyy 'at' h:mm a")}`}
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
                Invitation received on {format(new Date(invitation.sent_at), "MMMM d, yyyy 'at' h:mm a")}
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
