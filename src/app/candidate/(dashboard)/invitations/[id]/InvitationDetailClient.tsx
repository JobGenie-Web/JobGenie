"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Building2, MapPin, Loader2, ArrowLeft, User, Phone, Globe, Briefcase, Check, Mail, Video, MapPinned, Copy, ExternalLink } from "lucide-react";
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
                // Refresh the invitation data
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
                // Refresh the invitation data
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

    return (
        <div className="space-y-6">
            {/* Back Button */}
            {/* <Link href="/candidate/invitations">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Invitations
                </Button>
            </Link> */}

            {/* Company & Contact Information */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Company Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            {invitation.company.logo_url && (
                                <div className="h-16 w-16 rounded-lg bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <img
                                        src={invitation.company.logo_url}
                                        alt={invitation.company.company_name}
                                        className="h-14 w-14 object-contain"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-xl mb-1">{invitation.company.company_name}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">{invitation.company.industry}</span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {invitation.company.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{invitation.company.bio}</p>
                        )}
                        {invitation.company.headoffice_location && (
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{invitation.company.headoffice_location}</span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm pt-2 border-t">
                            {invitation.company.website && (
                                <a
                                    href={invitation.company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-primary hover:underline"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span>Website</span>
                                </a>
                            )}
                            {invitation.company.phone && (
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{invitation.company.phone}</span>
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Person Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Contact Person</CardTitle>
                        <CardDescription>Your point of contact for this opportunity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            {invitation.employer.profile_image_url ? (
                                <img
                                    src={invitation.employer.profile_image_url}
                                    alt={`${invitation.employer.first_name} ${invitation.employer.last_name}`}
                                    className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-lg">
                                    {invitation.employer.first_name} {invitation.employer.last_name}
                                </p>
                                {invitation.employer.designation && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">{invitation.employer.designation}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            {invitation.employer.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <a
                                        href={`mailto:${invitation.employer.email}`}
                                        className="text-primary hover:underline truncate"
                                    >
                                        {invitation.employer.email}
                                    </a>
                                </div>
                            )}
                            {invitation.employer.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <a
                                        href={`tel:${invitation.employer.phone}`}
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        {invitation.employer.phone}
                                    </a>
                                </div>
                            )}
                            {invitation.employer.job_title && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-muted-foreground truncate">{invitation.employer.job_title}</span>
                                </div>
                            )}
                            {invitation.employer.department && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-muted-foreground truncate">{invitation.employer.department}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Job Position & Message */}
            <Card>
                <CardHeader className="bg-primary/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl mb-2">{invitation.job_designation}</CardTitle>
                            <CardDescription className="text-base">{invitation.industry}</CardDescription>
                        </div>
                        <Badge variant={isPending ? "default" : invitation.status === 'accepted' ? "default" : "destructive"} className="text-sm">
                            {invitation.status}
                        </Badge>
                    </div>
                </CardHeader>
                {invitation.message && (
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-3">Message from Employer</h3>
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{invitation.message}</p>
                        </div>
                    </CardContent>
                )}
            </Card>



            {/* Declined Status - Shown when declined */}
            {invitation.status === 'declined' && (
                <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                                <span className="text-white text-2xl">✕</span>
                            </div>
                            <div>
                                <CardTitle className="text-xl text-red-900 dark:text-red-100">Invitation Declined</CardTitle>
                                <CardDescription className="text-red-700 dark:text-red-300">
                                    {invitation.responded_at && (
                                        <>You declined this invitation on {format(new Date(invitation.responded_at + (invitation.responded_at.endsWith('Z') ? '' : 'Z')), "MMMM d, yyyy 'at' h:mm a")}</>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-500">
                            <p className="text-sm text-muted-foreground mb-4">
                                You have declined this interview invitation. If you've changed your mind, you can cancel this decline and reconsider the invitation.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full border-orange-500 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                onClick={handleCancelAcceptance}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Cancel Decline & Reconsider"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Time Slots Selection */}
            {isPending && (
                <>
                    {/* Interview Mode Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Mode Preference</CardTitle>
                            <CardDescription>How would you prefer to attend this interview?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Online Option */}
                                <div
                                    onClick={() => setSelectedMode('online')}
                                    className={`relative flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-blue-500/50 ${selectedMode === 'online'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                        : 'border-border bg-card'
                                        }`}
                                >
                                    {selectedMode === 'online' && (
                                        <div className="absolute top-3 right-3">
                                            <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${selectedMode === 'online'
                                        ? 'bg-blue-100 dark:bg-blue-800'
                                        : 'bg-muted'
                                        }`}>
                                        <Video className={`h-8 w-8 ${selectedMode === 'online'
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-muted-foreground'
                                            }`} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">Online Interview</h3>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Video call using Zoom, Google Meet, or similar platform
                                    </p>
                                </div>

                                {/* Physical Option */}
                                <div
                                    onClick={() => setSelectedMode('physical')}
                                    className={`relative flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-green-500/50 ${selectedMode === 'physical'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                                        : 'border-border bg-card'
                                        }`}
                                >
                                    {selectedMode === 'physical' && (
                                        <div className="absolute top-3 right-3">
                                            <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${selectedMode === 'physical'
                                        ? 'bg-green-100 dark:bg-green-800'
                                        : 'bg-muted'
                                        }`}>
                                        <MapPinned className={`h-8 w-8 ${selectedMode === 'physical'
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-muted-foreground'
                                            }`} />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">Physical Interview</h3>
                                    <p className="text-sm text-muted-foreground text-center">
                                        In-person interview at company location
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Proposed Time Slots */}
                    {invitation.given_time_slots && invitation.given_time_slots.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Proposed Interview Times</CardTitle>
                                <CardDescription>Select one of the suggested time slots for your interview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {invitation.given_time_slots.map((slot, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && !selectedSlot?.is_alternative
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-border bg-card'
                                                }`}
                                        >
                                            {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && !selectedSlot?.is_alternative && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="h-5 w-5 text-primary" />
                                                <Badge variant="outline" className="text-xs">Option {slot.order}</Badge>
                                            </div>
                                            <p className="font-semibold mb-1">
                                                {format(new Date(slot.date), "EEEE, MMM d")}
                                            </p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {slot.time}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Alternative Dates */}
                    {invitation.alternative_dates && invitation.alternative_dates.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Alternative Dates</CardTitle>
                                <CardDescription>If the proposed times don't work, select from these alternative dates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {invitation.alternative_dates.map((slot, index) => {
                                        const altSlot = { ...slot, is_alternative: true };
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedSlot(altSlot)}
                                                className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-green-500/50 ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && selectedSlot?.is_alternative
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                                                    : 'border-border bg-card'
                                                    }`}
                                            >
                                                {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time && selectedSlot?.is_alternative && (
                                                    <div className="absolute top-2 right-2">
                                                        <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">Alternative</Badge>
                                                </div>
                                                <p className="font-semibold mb-1">
                                                    {format(new Date(slot.date), "EEEE, MMM d")}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {slot.time}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Confirmed Status - Shown when accepted and confirmed */}
            {invitation.status === 'accepted' && invitation.interview_confirmed && invitation.selected_time_slot && (
                <Card className={invitation.invitation_canceled ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-green-500 bg-green-50 dark:bg-green-900/10"}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className={`h-10 w-10 rounded-full ${invitation.invitation_canceled ? 'bg-red-500' : 'bg-green-500'} flex items-center justify-center`}>
                                <span className="text-white text-2xl">{invitation.invitation_canceled ? '✕' : '✓'}</span>
                            </div>
                            <div>
                                <CardTitle className={`text-xl ${invitation.invitation_canceled ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'}`}>
                                    {invitation.invitation_canceled ? 'Interview Canceled' : 'Interview Confirmed!'}
                                </CardTitle>
                                <CardDescription className={invitation.invitation_canceled ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}>
                                    {invitation.invitation_canceled
                                        ? 'This interview has been canceled.'
                                        : 'Your interview has been confirmed by the employer.'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 ${invitation.invitation_canceled ? 'border-red-500' : 'border-green-500'}`}>
                            <p className="text-sm text-muted-foreground mb-4">
                                Your interview is scheduled for:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className={`h-5 w-5 ${invitation.invitation_canceled ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                                    <p className="font-semibold">
                                        {format(new Date(invitation.selected_time_slot.date), "EEEE, MMMM d, yyyy")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className={`h-5 w-5 ${invitation.invitation_canceled ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                                    <p className="font-semibold">
                                        {invitation.selected_time_slot.time}
                                    </p>
                                </div>
                                {invitation.interview_mode && (
                                    <div className="flex items-center gap-2">
                                        {invitation.interview_mode === 'online' ? (
                                            <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        ) : (
                                            <MapPinned className={`h-5 w-5 ${invitation.invitation_canceled ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                                        )}
                                        <p className="font-semibold">
                                            {invitation.interview_mode === 'online' ? 'Online Interview' : 'Physical Interview'}
                                        </p>
                                    </div>
                                )}

                                {/* Confirmed Interview Details from Employer */}
                                {invitation.interview_confirmed && (
                                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Interview Details</p>

                                        {/* Alternative Date - Show Confirmed Time */}
                                        {invitation.selected_time_slot.is_alternative && invitation.confirmed_time && (
                                            <div className="mb-2">
                                                <p className="text-xs text-muted-foreground">Confirmed Time</p>
                                                <p className="text-base font-semibold text-green-700 dark:text-green-300">
                                                    {invitation.confirmed_time}
                                                </p>
                                            </div>
                                        )}

                                        {/* Online - Meeting Link */}
                                        {invitation.interview_mode === 'online' && invitation.meeting_link && (
                                            <div className="space-y-2">
                                                <p className="text-xs text-muted-foreground">Meeting Link</p>
                                                <div className="flex items-center gap-2">
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
                                                        <Button size="sm" variant="default" disabled={invitation.invitation_canceled}>
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            Join
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        {/* Physical - Address & Map */}
                                        {invitation.interview_mode === 'physical' && invitation.interview_address && (
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Interview Address</p>
                                                    <p className="text-sm font-semibold">{invitation.interview_address}</p>
                                                </div>
                                                {invitation.map_link && (
                                                    <Link href={invitation.map_link} target="_blank">
                                                        <Button size="sm" variant="outline">
                                                            <MapPinned className="h-4 w-4 mr-2" />
                                                            Open in Maps
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {invitation.confirmed_at && (
                                            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-green-100 dark:border-green-900">
                                                Confirmed on {format(new Date(invitation.confirmed_at), "MMM d, yyyy 'at' h:mm a")}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cancel Interview Button */}
                            {!invitation.invitation_canceled && (
                                <div className="mt-4 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        className="w-full h-8 border-red-500 text-red-700 hover:bg-red-500 hover:text-white dark:bg-red-500 dark:text-red-100 dark:hover:bg-red-300 dark:hover:text-red-500"
                                        onClick={() => setShowCancelDialog(true)}
                                    >
                                        Cancel Interview
                                    </Button>
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>
            )}

            {/* Pending Status - Shown when accepted but not confirmed */}
            {invitation.status === 'accepted' && !invitation.interview_confirmed && invitation.selected_time_slot && (
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                                <span className="text-white text-2xl">!</span>
                            </div>
                            <div>
                                <CardTitle className="text-xl text-orange-900 dark:text-orange-100">Acceptance Pending Confirmation</CardTitle>
                                <CardDescription className="text-orange-700 dark:text-orange-300">
                                    {invitation.responded_at && (
                                        <>You accepted this invitation on {format(new Date(invitation.responded_at + (invitation.responded_at.endsWith('Z') ? '' : 'Z')), "MMMM d, yyyy 'at' h:mm a")}.</>
                                    )}
                                    The employer will confirm the final interview details shortly.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-orange-500">
                            <p className="text-sm text-muted-foreground mb-4">
                                Your selected interview time is:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    <p className="font-semibold">
                                        {format(new Date(invitation.selected_time_slot.date), "EEEE, MMMM d, yyyy")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    <p className="font-semibold">
                                        {invitation.selected_time_slot.time}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {invitation.interview_mode === 'online' ? (
                                        <Video className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    ) : (
                                        <MapPinned className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    )}
                                    <p className="font-semibold capitalize">
                                        {invitation.interview_mode} Interview
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full border-red-500 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Received Date */}
            <div className="text-center text-sm text-muted-foreground">
                Invitation received on {format(new Date(invitation.sent_at), "MMMM d, yyyy 'at' h:mm a")}
            </div>

            {/* Action Buttons */}
            {isPending && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                className="flex-1"
                                size="lg"
                                onClick={handleAccept}
                                disabled={!selectedSlot || !selectedMode || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Accept Invitation
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="destructive"
                                size="lg"
                                className="sm:w-auto"
                                onClick={handleDecline}
                                disabled={isSubmitting}
                            >
                                Decline
                            </Button>
                        </div>
                        {(!selectedSlot || !selectedMode) && (
                            <p className="text-sm text-muted-foreground text-center mt-3">
                                Please select both interview mode and time slot before accepting
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Canceled Status - Shown when interview is canceled */}
            {invitation.invitation_canceled && (
                <Card className="border-red-500 bg-red-50 dark:bg-gray-900/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center">
                                <span className="text-white text-2xl">✕</span>
                            </div>
                            <div>
                                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Interview Canceled</CardTitle>
                                <CardDescription className="text-gray-700 dark:text-gray-300">
                                    {invitation.canceled_by === 'candidate' && 'You canceled this interview'}
                                    {invitation.canceled_by === 'employer' && 'The employer canceled this interview'}
                                    {invitation.canceled_at && ` on ${format(new Date(invitation.canceled_at + (invitation.canceled_at.endsWith('Z') ? '' : 'Z')), "MMMM d, yyyy 'at' h:mm a")}`}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-500">
                            <p className="text-sm font-medium mb-2">Cancellation Reason:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {invitation.cancellation_reason}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                            // variant="destructive"
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
