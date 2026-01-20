"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Video,
    MapPin,
    Mail,
    Phone,
    Building2,
    User,
    Briefcase,
    Link as LinkIcon,
    MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterviewDetailViewProps {
    interviewId: string | null;
    onClose: () => void;
}

export function InterviewDetailView({ interviewId, onClose }: InterviewDetailViewProps) {
    const [interview, setInterview] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch interview details when dialog opens or ID changes
    useEffect(() => {
        if (interviewId) {
            setLoading(true);
            setInterview(null);
            setError(null);

            fetch(`/api/mis/interviews/${interviewId}`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data.success) {
                        setInterview(data.interview);
                    } else {
                        setError(data.error || "Failed to fetch interview details");
                        console.error("Failed to fetch interview:", data.error);
                    }
                })
                .catch((error) => {
                    const msg = error instanceof Error ? error.message : "An unexpected error occurred";
                    setError(msg);
                    console.error("Error fetching interview:", error);
                })
                .finally(() => setLoading(false));
        }
    }, [interviewId]);

    const formatDateTime = (dateString: string, timeString?: string) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return timeString ? `${dateStr} at ${timeString}` : dateStr;
    };

    const getStatusInfo = (interview: any) => {
        if (interview.invitation_canceled) {
            return {
                icon: XCircle,
                label: "Cancelled",
                text_color: "text-red-600",
                color: "text-red-600",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
            };
        }
        if (interview.interview_confirmed) {
            return {
                icon: CheckCircle2,
                label: "Confirmed",
                text_color: "text-green-600",
                color: "text-green-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
            };
        }
        return {
            icon: Clock,
            label: "Pending",
            text_color: "text-amber-600",
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
        };
    };

    if (!interviewId) return null;

    return (
        <Dialog open={!!interviewId} onOpenChange={onClose}>
            <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-y-auto"
                style={{
                    maxWidth: '50rem',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                } as React.CSSProperties}
            >
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-2xl font-semibold">Interview Details</DialogTitle>
                    <DialogDescription className="text-base">
                        Comprehensive information about this interview engagement
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-muted-foreground">Loading interview details...</div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <XCircle className="h-12 w-12 text-destructive mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Details</h3>
                        <p className="text-muted-foreground text-sm">{error}</p>
                    </div>
                ) : interview ? (
                    <div className="space-y-6 pt-2">
                        {/* Status Header */}
                        {(() => {
                            const status = getStatusInfo(interview);
                            const StatusIcon = status.icon;
                            return (
                                <div className={`flex items-center justify-between p-4 rounded-lg border ${status.borderColor} ${status.bgColor}`}>
                                    <div className="flex items-center gap-3">
                                        <StatusIcon className={`h-5 w-5 ${status.color}`} />
                                        <div>
                                            <p className={`font-semibold ${status.text_color}`}>{status.label}</p>
                                            {interview.selected_time_slot && (
                                                <p className={`text-sm ${status.text_color}`}>
                                                    {formatDateTime(
                                                        interview.selected_time_slot.date,
                                                        interview.selected_time_slot.time
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`${status.color} border-current`}>
                                        {status.label}
                                    </Badge>
                                </div>
                            );
                        })()}

                        {/* Main Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Candidate Profile */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    <User className="h-4 w-4" />
                                    Candidate
                                </div>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16 border-2">
                                        <AvatarImage src={interview.candidate.profile_image_url || undefined} />
                                        <AvatarFallback className="text-lg">
                                            {interview.candidate.first_name[0]}{interview.candidate.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate">
                                            {interview.candidate.first_name} {interview.candidate.last_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{interview.candidate.current_position}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {interview.candidate.years_of_experience || 0} years experience · {interview.candidate.experience_level}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{interview.candidate.email}</span>
                                    </div>
                                    {interview.candidate.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{interview.candidate.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Company & Employer */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    <Building2 className="h-4 w-4" />
                                    Company
                                </div>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16 border-2">
                                        <AvatarImage src={interview.company.logo_url || undefined} />
                                        <AvatarFallback className="text-lg">
                                            {interview.company.company_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate">{interview.company.company_name}</h3>
                                        <p className="text-sm text-muted-foreground">{interview.company.industry}</p>
                                        {interview.company.headoffice_location && (
                                            <p className="text-xs text-muted-foreground mt-1">{interview.company.headoffice_location}</p>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Contact Person</p>
                                    <p className="font-medium text-sm">
                                        {interview.employer.first_name} {interview.employer.last_name}
                                    </p>
                                    {interview.employer.designation && (
                                        <p className="text-xs text-muted-foreground">{interview.employer.designation}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{interview.employer.email}</span>
                                    </div>
                                    {interview.employer.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{interview.employer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Interview Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                <Briefcase className="h-4 w-4" />
                                Interview Information
                            </div>
                            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Position</p>
                                    <p className="font-medium text-sm">{interview.job_designation}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Industry</p>
                                    <p className="font-medium text-sm">{interview.industry}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Mode</p>
                                    <div className="flex items-center gap-1.5">
                                        {interview.interview_mode === "online" ? (
                                            <>
                                                <Video className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm">Online</span>
                                            </>
                                        ) : interview.interview_mode === "physical" ? (
                                            <>
                                                <MapPin className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm">Physical</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Invitation Sent</p>
                                    <p className="font-medium text-sm">
                                        {new Date(interview.sent_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>



                        {/* Engagement Timeline */}
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                <Clock className="h-4 w-4" />
                                Engagement Timeline
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Invitation Sent</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(interview.sent_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {interview.viewed_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Invitation Viewed</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(interview.viewed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {interview.responded_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Candidate Responded</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(interview.responded_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {interview.confirmed_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Interview Confirmed</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(interview.confirmed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-muted-foreground">Interview not found</div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
