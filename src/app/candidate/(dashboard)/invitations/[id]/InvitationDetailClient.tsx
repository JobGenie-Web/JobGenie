"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Building2, MapPin, Loader2, ArrowLeft, User, Phone, Globe, Briefcase, Check, Mail } from "lucide-react";
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
    status: string;
    sent_at: string;
    viewed_at: string | null;
    responded_at: string | null;
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
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/candidate/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'accept',
                    selected_time_slot: selectedSlot
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
            <Link href="/candidate/invitations">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Invitations
                </Button>
            </Link>

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

            {/* Selected Time Slot - Shown when accepted */}
            {invitation.status === 'accepted' && invitation.selected_time_slot && (
                <Card className="border-green-500 bg-green-50 dark:bg-green-900/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl text-green-900 dark:text-green-100">Interview Scheduled</CardTitle>
                                <CardDescription className="text-green-700 dark:text-green-300">
                                    You accepted this invitation on {format(new Date(invitation.responded_at!), "MMMM d, yyyy 'at' h:mm a")}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-green-500">
                            <div className="flex items-start gap-4">
                                <Calendar className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {invitation.selected_time_slot.is_alternative ? 'Selected Alternative Date' : 'Selected Interview Time'}
                                    </p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                                        {format(new Date(invitation.selected_time_slot.date), "EEEE, MMMM d, yyyy")}
                                    </p>
                                    <p className="text-lg font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        {invitation.selected_time_slot.time}
                                    </p>
                                </div>
                                {invitation.selected_time_slot.is_alternative && (
                                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-300">
                                        Alternative
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Time Slots Selection */}
            {isPending && (
                <>
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
                                disabled={!selectedSlot || isSubmitting}
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
                        {!selectedSlot && (
                            <p className="text-sm text-muted-foreground text-center mt-3">
                                Please select a time slot before accepting the invitation
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
