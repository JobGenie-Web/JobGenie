"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Loader2, Mail, User, Video, MapPinned, Phone, Briefcase, ExternalLink, Copy, CheckCircle2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    candidate: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        current_position: string;
        profile_image_url: string | null;
    };
    employer: {
        id: string;
        first_name: string;
        last_name: string;
    };
}

export default function InvitationsClient() {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmedTime, setConfirmedTime] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [interviewAddress, setInterviewAddress] = useState("");
    const [mapLink, setMapLink] = useState("");
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState("");
    const [isCanceling, setIsCanceling] = useState(false);

    useEffect(() => {
        fetchInvitations();
    }, []);

    useEffect(() => {
        // Auto-select first invitation when list changes
        const filtered = filteredInvitations;
        if (filtered.length > 0 && !selectedInvitation) {
            setSelectedInvitation(filtered[0]);
        }
    }, [invitations, filter]);

    const fetchInvitations = async () => {
        try {
            const response = await fetch('/api/employer/invitations');
            const data = await response.json();

            if (data.success) {
                setInvitations(data.data);
                if (data.data.length > 0) {
                    setSelectedInvitation(data.data[0]);
                }
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

    const filteredInvitations = invitations.filter(inv => {
        if (filter === "all") return true;
        if (filter === "cancelled") return inv.invitation_canceled;
        return inv.status === filter;
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; className: string }> = {
            pending: { variant: "secondary" as any, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
            viewed: { variant: "secondary" as any, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
            accepted: { variant: "default" as any, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
            declined: { variant: "destructive" as any, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
        };
        return variants[status] || variants.pending;
    };

    const statusCounts = {
        all: invitations.length,
        pending: invitations.filter(i => i.status === 'pending').length,
        viewed: invitations.filter(i => i.status === 'viewed').length,
        accepted: invitations.filter(i => i.status === 'accepted').length,
        declined: invitations.filter(i => i.status === 'declined').length,
        cancelled: invitations.filter(i => i.invitation_canceled).length,
    };

    const handleConfirmInterview = async () => {
        if (!selectedInvitation) return;

        const selectedSlot = selectedInvitation.selected_time_slot as any;
        const isAlternative = selectedSlot?.is_alternative;

        // Validation
        if (isAlternative && !confirmedTime) {
            toast.error("Please provide a time slot for the alternative date");
            return;
        }

        if (selectedInvitation.interview_mode === 'online' && !meetingLink) {
            toast.error("Please provide a meeting link for online interview");
            return;
        }

        if (selectedInvitation.interview_mode === 'physical' && !interviewAddress) {
            toast.error("Please provide an address for physical interview");
            return;
        }

        setIsConfirming(true);
        try {
            const response = await fetch(`/api/employer/invitations/${selectedInvitation.id}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmed_time: confirmedTime || null,
                    meeting_link: meetingLink || null,
                    interview_address: interviewAddress || null,
                    map_link: mapLink || null
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Interview confirmed successfully!");
                // Reset form
                setConfirmedTime("");
                setMeetingLink("");
                setInterviewAddress("");
                setMapLink("");
                // Refresh invitations
                fetchInvitations();
            } else {
                toast.error(data.error || "Failed to confirm interview");
            }
        } catch (error) {
            console.error("Error confirming interview:", error);
            toast.error("An error occurred while confirming interview");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancelInterview = async () => {
        if (!selectedInvitation) return;

        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        setIsCanceling(true);
        try {
            const response = await fetch(`/api/employer/invitations/${selectedInvitation.id}/cancel-interview`, {
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
                // Refresh invitations
                fetchInvitations();
            } else {
                toast.error(data.error || 'Failed to cancel interview');
            }
        } catch (error) {
            console.error('Error canceling interview:', error);
            toast.error('An error occurred while canceling interview');
        } finally {
            setIsCanceling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
            {/* Status Filter Tabs - Compact */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'viewed', label: 'Viewed' },
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

            {/* Split View Layout */}
            {filteredInvitations.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No invitations found</h3>
                        <p className="text-muted-foreground">
                            {filter === 'all'
                                ? "You haven't sent any interview invitations yet."
                                : `No ${filter} invitations found.`}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
                    {/* Left Side - Compact Cards List */}
                    <div className="lg:col-span-1 space-y-2 overflow-y-auto p-1 scrollbar-hide">
                        {filteredInvitations.map((invitation) => (
                            <Card
                                key={invitation.id}
                                className={cn(
                                    "cursor-pointer transition-all hover:shadow-md",
                                    selectedInvitation?.id === invitation.id && "ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedInvitation(invitation)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-start gap-2.5">
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                            <AvatarImage src={invitation.candidate.profile_image_url || undefined} />
                                            <AvatarFallback className="text-xs">
                                                {invitation.candidate.first_name[0]}{invitation.candidate.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate">
                                                {invitation.candidate.first_name} {invitation.candidate.last_name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {invitation.job_designation}
                                            </p>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(invitation.sent_at), "MMM d")}
                                                </p>
                                                <Badge {...getStatusBadge(invitation.status)} className="text-xs px-2 py-0">
                                                    {invitation.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Right Side - Detailed View */}
                    <div className="lg:col-span-2 overflow-hidden">
                        {selectedInvitation ? (
                            <div className="h-full overflow-y-auto scrollbar-hide">
                                <Card className="overflow-hidden">
                                    <CardHeader className="bg-muted/50 py-3 px-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-14 w-14 flex-shrink-0">
                                                    <AvatarImage src={selectedInvitation.candidate.profile_image_url || undefined} />
                                                    <AvatarFallback>
                                                        {selectedInvitation.candidate.first_name[0]}{selectedInvitation.candidate.last_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg mb-1">
                                                        {selectedInvitation.candidate.first_name} {selectedInvitation.candidate.last_name}
                                                    </CardTitle>
                                                    <CardDescription className="space-y-0.5 text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <Briefcase className="h-3 w-3" />
                                                            {selectedInvitation.candidate.current_position}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="h-3 w-3" />
                                                            {selectedInvitation.candidate.email}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3" />
                                                            {selectedInvitation.candidate.phone}
                                                        </div>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge {...getStatusBadge(selectedInvitation.status)} className="flex-shrink-0">
                                                {selectedInvitation.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 space-y-3">
                                        {/* Position Details */}
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">Position</p>
                                                <p className="text-base font-semibold">{selectedInvitation.job_designation}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">Industry</p>
                                                <p className="text-base">{selectedInvitation.industry}</p>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        {selectedInvitation.message && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Your Message</p>
                                                <div className="bg-muted/50 rounded-md p-2.5 text-sm">
                                                    {selectedInvitation.message}
                                                </div>
                                            </div>
                                        )}

                                        {/* Accepted - Show Selected Time and Mode */}
                                        {selectedInvitation.status === 'accepted' && selectedInvitation.selected_time_slot && (
                                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md p-3">
                                                <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2">
                                                    Interview Scheduled
                                                </h4>
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Date</p>
                                                            <p className="font-semibold text-sm text-green-700 dark:text-green-300">
                                                                {format(new Date(selectedInvitation.selected_time_slot.date), "MMM d, yyyy")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Time</p>
                                                            <p className="font-semibold text-sm text-green-700 dark:text-green-300">
                                                                {selectedInvitation.selected_time_slot.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {selectedInvitation.interview_mode && (
                                                        <div className="flex items-center gap-2 md:col-span-2">
                                                            {selectedInvitation.interview_mode === 'online' ? (
                                                                <Video className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                            ) : (
                                                                <MapPinned className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                            )}
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Interview Mode</p>
                                                                <p className="font-semibold text-sm">
                                                                    {selectedInvitation.interview_mode === 'online' ? 'Online Interview' : 'Physical Interview'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Confirmation Section - Only for Accepted Invitations */}
                                        {selectedInvitation.status === 'accepted' && selectedInvitation.selected_time_slot && (
                                            <div>
                                                {!selectedInvitation.interview_confirmed ? (
                                                    /* Confirmation Form */
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                                                        <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Confirm Interview Details
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {/* Alternative Date - Time Slot Selection */}
                                                            {(selectedInvitation.selected_time_slot as any)?.is_alternative && (
                                                                <div>
                                                                    <label className="text-xs font-medium mb-2 block">Select Time Slot *</label>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {[
                                                                            "09:00", "10:00", "11:00",
                                                                            "12:00", "13:00", "14:00",
                                                                            "15:00", "16:00", "17:00"
                                                                        ].map((time) => (
                                                                            <button
                                                                                key={time}
                                                                                type="button"
                                                                                onClick={() => setConfirmedTime(time)}
                                                                                className={`px-3 py-2 rounded-md text-xs font-medium transition-all border ${confirmedTime === time
                                                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                                                    : 'bg-background border-border hover:border-primary/50'
                                                                                    }`}
                                                                            >
                                                                                {time}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    {confirmedTime && (
                                                                        <p className="text-xs text-muted-foreground mt-2">
                                                                            Selected: <span className="font-semibold">{confirmedTime}</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Online - Meeting Link */}
                                                            {selectedInvitation.interview_mode === 'online' && (
                                                                <div>
                                                                    <label className="text-xs font-medium mb-1.5 block">Meeting Link *</label>
                                                                    <Input
                                                                        type="url"
                                                                        value={meetingLink}
                                                                        onChange={(e) => setMeetingLink(e.target.value)}
                                                                        className="h-9 text-sm"
                                                                        placeholder="https://zoom.us/j/... or Google Meet link"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Physical - Address & Map Link */}
                                                            {selectedInvitation.interview_mode === 'physical' && (
                                                                <>
                                                                    <div>
                                                                        <label className="text-xs font-medium mb-1.5 block">Interview Address *</label>
                                                                        <Input
                                                                            type="text"
                                                                            value={interviewAddress}
                                                                            onChange={(e) => setInterviewAddress(e.target.value)}
                                                                            className="h-9 text-sm"
                                                                            placeholder="Full address with city and postal code"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs font-medium mb-1.5 block">Map Link (Optional)</label>
                                                                        <Input
                                                                            type="url"
                                                                            value={mapLink}
                                                                            onChange={(e) => setMapLink(e.target.value)}
                                                                            className="h-9 text-sm"
                                                                            placeholder="https://maps.google.com/..."
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            <Button
                                                                onClick={handleConfirmInterview}
                                                                disabled={isConfirming}
                                                                className="w-full h-9"
                                                                size="sm"
                                                            >
                                                                {isConfirming ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                        Confirming...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                        Confirm Interview
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Confirmed Details Display */
                                                    <div className={selectedInvitation.invitation_canceled ? "bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md p-3" : "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md p-3"}>
                                                        <h4 className={`font-semibold text-sm ${selectedInvitation.invitation_canceled ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'} mb-2 flex items-center gap-2`}>
                                                            {selectedInvitation.invitation_canceled ? (
                                                                <X className="h-4 w-4" />
                                                            ) : (
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            )}
                                                            {selectedInvitation.invitation_canceled ? 'Interview Canceled' : 'Interview Confirmed'}
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            {/* Alternative Date - Show Confirmed Time */}
                                                            {(selectedInvitation.selected_time_slot as any)?.is_alternative && selectedInvitation.confirmed_time && (
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Confirmed Time</p>
                                                                    <p className="font-semibold">{selectedInvitation.confirmed_time}</p>
                                                                </div>
                                                            )}

                                                            {/* Online - Show Meeting Link */}
                                                            {selectedInvitation.interview_mode === 'online' && selectedInvitation.meeting_link && (
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground mb-1">Meeting Link</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            value={selectedInvitation.meeting_link}
                                                                            readOnly
                                                                            className="h-8 text-xs flex-1"
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 px-2"
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(selectedInvitation.meeting_link!);
                                                                                toast.success("Link copied!");
                                                                            }}
                                                                        >
                                                                            <Copy className="h-3 w-3" />
                                                                        </Button>
                                                                        <Link href={selectedInvitation.meeting_link} target="_blank">
                                                                            <Button size="sm" variant="outline" className="h-8 px-2">
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Physical - Show Address & Map Link */}
                                                            {selectedInvitation.interview_mode === 'physical' && selectedInvitation.interview_address && (
                                                                <>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Interview Address</p>
                                                                        <p className="font-semibold">{selectedInvitation.interview_address}</p>
                                                                    </div>
                                                                    {selectedInvitation.map_link && (
                                                                        <div>
                                                                            <Link href={selectedInvitation.map_link} target="_blank">
                                                                                <Button size="sm" variant="outline" className="h-8 text-xs">
                                                                                    <MapPinned className="h-3 w-3 mr-1.5" />
                                                                                    Open Map
                                                                                </Button>
                                                                            </Link>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {selectedInvitation.confirmed_at && (
                                                                <p className="text-xs text-muted-foreground pt-2 border-t">
                                                                    Confirmed on {format(new Date(selectedInvitation.confirmed_at), "MMM d, yyyy 'at' h:mm a")}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Cancel Interview Button */}
                                                        {!selectedInvitation.invitation_canceled && (
                                                            <div className="mt-3 pt-3 border-t">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full h-8 border-red-500 text-red-700 hover:bg-red-500 hover:text-white dark:bg-red-500 dark:text-red-100 dark:hover:bg-red-300 dark:hover:text-red-500"
                                                                    onClick={() => setShowCancelDialog(true)}
                                                                >
                                                                    <X className="h-3 w-3 mr-2" />
                                                                    Cancel Interview
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Canceled Interview Status */}
                                        {selectedInvitation.invitation_canceled && (
                                            <div className="bg-gray-50 dark:bg-gray-900/10 border border-red-500 rounded-md p-3">
                                                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                                    <X className="h-4 w-4 text-red-700 dark:text-red-300" />
                                                    Interview Canceled
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Canceled By</p>
                                                        <p className="font-semibold">
                                                            {selectedInvitation.canceled_by === 'employer' ? 'You' : 'Candidate'}
                                                        </p>
                                                    </div>
                                                    {selectedInvitation.canceled_at && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Canceled On</p>
                                                            <p className="font-semibold">
                                                                {format(new Date(selectedInvitation.canceled_at + (selectedInvitation.canceled_at.endsWith('Z') ? '' : 'Z')), "MMM d, yyyy 'at' h:mm a")}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {selectedInvitation.cancellation_reason && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Reason</p>
                                                            <p className="text-sm whitespace-pre-wrap">{selectedInvitation.cancellation_reason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Proposed Time Slots */}
                                        {selectedInvitation.given_time_slots && selectedInvitation.given_time_slots.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Proposed Time Slots</p>
                                                <div className="grid gap-1.5 md:grid-cols-2">
                                                    {selectedInvitation.given_time_slots.map((slot, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-xs">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span>{format(new Date(slot.date), "MMM d, yyyy")} at {slot.time}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="pt-3 border-t text-xs text-muted-foreground space-y-0.5 items-end flex flex-col justify-end">
                                            <p>Sent by: {selectedInvitation.employer.first_name} {selectedInvitation.employer.last_name}</p>
                                            <p>Sent: {format(new Date(selectedInvitation.sent_at), "MMM d, yyyy 'at' h:mm a")}</p>
                                            {selectedInvitation.viewed_at && (
                                                <p>Viewed: {format(new Date(selectedInvitation.viewed_at), "MMM d, yyyy 'at' h:mm a")}</p>
                                            )}
                                            {selectedInvitation.responded_at && (
                                                <p>Responded: {format(new Date(selectedInvitation.responded_at), "MMM d, yyyy 'at' h:mm a")}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Select an invitation to view details</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Cancellation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Interview</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for canceling this interview. This will be shared with the candidate.
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
                            disabled={isCanceling}
                        >
                            Keep Interview
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelInterview}
                            disabled={isCanceling || !cancellationReason.trim()}
                        >
                            {isCanceling ? (
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

            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
