"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Briefcase,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Loader2,
    MessageSquare,
    Video,
    MapPinned
} from "lucide-react";
import { toast } from "sonner";
import { formatUTCDate, formatUTCTime, formatTimestamp } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { InterviewFeedbackDialog } from "./InterviewFeedbackDialog";
import { NextRoundDialog } from "./NextRoundDialog";
import { JobOfferDialog } from "./JobOfferDialog";
import { RoundConfirmDialog } from "./RoundConfirmDialog";

interface JobOffer {
    id: string;
    job_title: string;
    salary_amount: number | null;
    salary_currency: string | null;
    salary_period: string | null;
    start_date: string | null;
    expiry_date: string | null;
    offer_letter_url: string | null;
    description: string | null;
    status: string;
    created_at: string;
}

interface InterviewRound {
    id: string;
    round_number: number;
    round_label: string | null;
    status: string;
    outcome: string | null;
    outcome_notes: string | null;
    outcome_at: string | null;
    outcome_by: string | null;
    confirmed_at: string | null;
    interview_confirmed?: boolean;
    selected_time_slot: any;
    interview_mode: string | null;
    confirmed_time: any;
    meeting_link: string | null;
    interview_address: string | null;
    round_canceled?: boolean;
    canceled_by?: string | null;
    cancellation_reason?: string | null;
    canceled_at?: string | null;
    mis_rescheduled?: boolean;
    mis_reschedule_data?: any;
}

interface InterviewRoundsDisplayProps {
    invitationId: string;
    candidateName: string;
    jobTitle: string;
    onUpdate?: () => void;
    onOutcomeFound?: (hasOutcome: boolean) => void;
}

export function InterviewRoundsDisplay({
    invitationId,
    candidateName,
    jobTitle,
    onUpdate,
    onOutcomeFound
}: InterviewRoundsDisplayProps) {
    const [rounds, setRounds] = useState<InterviewRound[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());
    const [offerExists, setOfferExists] = useState(false);
    const [offerDetails, setOfferDetails] = useState<JobOffer | null>(null);
    const [showOfferDetails, setShowOfferDetails] = useState(false);
    
    // Dialog states
    const [feedbackDialog, setFeedbackDialog] = useState<{
        isOpen: boolean;
        roundId: string;
        roundNumber: number;
    }>({ isOpen: false, roundId: "", roundNumber: 0 });
    
    const [nextRoundDialog, setNextRoundDialog] = useState<{
        isOpen: boolean;
        previousRoundId: string;
        nextRoundNumber: number;
    }>({ isOpen: false, previousRoundId: "", nextRoundNumber: 0 });
    
    const [offerDialog, setOfferDialog] = useState<{
        isOpen: boolean;
        roundId: string;
    }>({ isOpen: false, roundId: "" });
    
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        roundId: string;
        roundNumber: number;
        roundLabel: string | null;
        interviewMode: string | null;
        selectedTimeSlot: any;
    }>({
        isOpen: false,
        roundId: "",
        roundNumber: 0,
        roundLabel: null,
        interviewMode: null,
        selectedTimeSlot: null
    });

    const [cancelRoundDialog, setCancelRoundDialog] = useState<{
        isOpen: boolean;
        roundId: string;
        roundLabel: string;
    }>({ isOpen: false, roundId: "", roundLabel: "" });
    const [cancelRoundReason, setCancelRoundReason] = useState("");
    const [isCancelingRound, setIsCancelingRound] = useState(false);

    useEffect(() => {
        fetchRounds();
    }, [invitationId]);

    const fetchRounds = async () => {
        try {
            const response = await fetch(`/api/employer/invitations/${invitationId}/rounds`);
            const data = await response.json();

            if (data.success) {
                setRounds(data.data);
                // Auto-expand the latest round
                if (data.data.length > 0) {
                    setExpandedRounds(new Set([data.data[data.data.length - 1].id]));
                }
                
                // Check if any round has an outcome
                const hasOutcome = data.data.some((r: InterviewRound) => r.outcome);
                if (onOutcomeFound) {
                    onOutcomeFound(hasOutcome);
                }
            } else {
                toast.error("Failed to load interview rounds");
                if (onOutcomeFound) {
                    onOutcomeFound(false);
                }
            }
        } catch (error) {
            console.error("Error fetching rounds:", error);
            toast.error("An error occurred while loading interview rounds");
            if (onOutcomeFound) {
                onOutcomeFound(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const checkOfferExists = async () => {
        try {
            const response = await fetch(`/api/employer/invitations/${invitationId}/check-offer`);
            const data = await response.json();
            if (data.success) {
                setOfferExists(data.exists);
                setOfferDetails(data.offer);
            }
        } catch (error) {
            console.error("Error checking offer:", error);
        }
    };

    useEffect(() => {
        checkOfferExists();
    }, [invitationId]);

    const toggleRound = (roundId: string) => {
        const newExpanded = new Set(expandedRounds);
        if (newExpanded.has(roundId)) {
            newExpanded.delete(roundId);
        } else {
            newExpanded.add(roundId);
        }
        setExpandedRounds(newExpanded);
    };

    const handleFeedbackSuccess = () => {
        fetchRounds();
        if (onUpdate) onUpdate();
    };

    const handleNextRoundSuccess = () => {
        fetchRounds();
        if (onUpdate) onUpdate();
    };

    const handleOfferSuccess = () => {
        fetchRounds();
        checkOfferExists();
        if (onUpdate) onUpdate();
    };

    const handleConfirmSuccess = () => {
        fetchRounds();
        if (onUpdate) onUpdate();
    };

    const handleCancelRound = async () => {
        if (!cancelRoundReason.trim()) { toast.error("Please provide a reason"); return; }
        setIsCancelingRound(true);
        try {
            const res = await fetch(`/api/employer/interview-rounds/${cancelRoundDialog.roundId}/cancel-round`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cancellation_reason: cancelRoundReason })
            });
            const d = await res.json();
            if (d.success) {
                toast.success("Round canceled successfully");
                setCancelRoundDialog({ isOpen: false, roundId: "", roundLabel: "" });
                setCancelRoundReason("");
                fetchRounds();
                if (onUpdate) onUpdate();
            } else {
                toast.error(d.error || "Failed to cancel round");
            }
        } catch { toast.error("An error occurred"); } finally { setIsCancelingRound(false); }
    };

    const getOutcomeInfo = (outcome: string | null) => {
        switch (outcome) {
            case 'advance':
                return {
                    label: 'Advanced to Next Round',
                    icon: ArrowRight,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200'
                };
            case 'reject':
                return {
                    label: 'Rejected',
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                };
            case 'offer':
                return {
                    label: 'Job Offer Sent',
                    icon: Briefcase,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200'
                };
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (rounds.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Action Required:</strong> Run the database migration to enable automatic interview round creation.
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                        After running the migration, interview rounds will be created automatically when you confirm interviews.
                    </p>
                    <code className="block mt-3 text-xs bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                        npx supabase db push
                    </code>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Job Offer Status Banner */}
            {offerExists && offerDetails && (
                <div className={cn(
                    "border-2 rounded-lg p-4 mb-4",
                    offerDetails.status === 'accepted' 
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-green-300 dark:from-green-950/60 dark:to-green-900/40 dark:border-green-700"
                        : offerDetails.status === 'declined'
                            ? "bg-gradient-to-r from-red-50 to-red-100 border-red-300 dark:from-red-950/60 dark:to-red-900/40 dark:border-red-700"
                            : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 dark:from-blue-950/60 dark:to-blue-900/40 dark:border-blue-700"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0",
                            offerDetails.status === 'accepted' ? "bg-green-500" : offerDetails.status === 'declined' ? "bg-red-500" : "bg-blue-500"
                        )}>
                            {offerDetails.status === 'accepted' ? (
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            ) : offerDetails.status === 'declined' ? (
                                <XCircle className="h-6 w-6 text-white" />
                            ) : (
                                <Briefcase className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className={cn(
                                    "font-semibold",
                                    offerDetails.status === 'accepted' ? "text-green-900 dark:text-green-50" : offerDetails.status === 'declined' ? "text-red-900 dark:text-red-50" : "text-blue-900 dark:text-blue-50"
                                )}>
                                    {offerDetails.status === 'accepted' ? "Job Offer Accepted" : offerDetails.status === 'declined' ? "Job Offer Declined" : "Job Offer Sent"}
                                </h4>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn(
                                        "h-7 text-xs",
                                        offerDetails.status === 'accepted' ? "text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-900/40" : offerDetails.status === 'declined' ? "text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-900/40" : "text-blue-700 hover:bg-blue-200 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                    )}
                                    onClick={() => setShowOfferDetails(!showOfferDetails)}
                                >
                                    {showOfferDetails ? "Hide Details" : "View Offer Details"}
                                    {showOfferDetails ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                                </Button>
                            </div>
                            <p className={cn(
                                "text-sm mt-0.5",
                                offerDetails.status === 'accepted' ? "text-green-800 dark:text-green-200" : offerDetails.status === 'declined' ? "text-red-800 dark:text-red-200" : "text-blue-800 dark:text-blue-200"
                            )}>
                                {offerDetails.status === 'accepted' 
                                    ? `🎊 Great news! ${candidateName} has accepted the job offer.` 
                                    : offerDetails.status === 'declined'
                                        ? `${candidateName} has declined the job offer.`
                                        : `A formal job offer has been sent to ${candidateName}. Awaiting candidate response.`
                                }
                            </p>
                        </div>
                        {offerDetails.status === 'accepted' ? (
                            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        ) : offerDetails.status === 'declined' ? (
                            <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        ) : (
                            <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                    </div>

                    {showOfferDetails && offerDetails && (
                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Position</p>
                                        <p className="font-semibold text-blue-900 dark:text-blue-100">{offerDetails.job_title}</p>
                                    </div>
                                    {offerDetails.salary_amount && (
                                        <div>
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Salary</p>
                                            <p className="font-semibold text-blue-900 dark:text-blue-100">
                                                {offerDetails.salary_currency} {offerDetails.salary_amount.toLocaleString()} / {offerDetails.salary_period}
                                            </p>
                                        </div>
                                    )}
                                    {offerDetails.start_date && (
                                        <div>
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Proposed Start Date</p>
                                            <p className="font-semibold text-blue-900 dark:text-blue-100">
                                                {formatTimestamp(offerDetails.start_date, "MMMM d, yyyy")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {offerDetails.expiry_date && (
                                        <div>
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Offer Expiry</p>
                                            <p className="font-semibold text-blue-900 dark:text-blue-100">
                                                {formatTimestamp(offerDetails.expiry_date, "MMMM d, yyyy")}
                                            </p>
                                        </div>
                                    )}
                                    {offerDetails.offer_letter_url && (
                                        <div>
                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Offer Letter</p>
                                            <a 
                                                href={offerDetails.offer_letter_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline mt-1"
                                            >
                                                View Document <ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {offerDetails.description && (
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">Additional Details</p>
                                    <p className="text-sm text-blue-900 dark:text-blue-100 bg-blue-200/30 dark:bg-blue-900/20 p-3 rounded-md whitespace-pre-wrap">
                                        {offerDetails.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Interview Rounds ({rounds.length})</h3>
                </div>

                {rounds.map((round, index) => {
                    const isExpanded = expandedRounds.has(round.id);
                    const outcomeInfo = getOutcomeInfo(round.outcome);
                    const isCanceled = !!round.round_canceled;
                    const canAddFeedback = round.status === 'confirmed' && !round.outcome && !isCanceled;
                    const needsConfirmation = round.status === 'accepted' && !round.confirmed_at && !isCanceled;
                    const canCancelRound = (round.status === 'confirmed' || !!round.interview_confirmed) && !round.outcome && !isCanceled;
                    
                    // Check if next round exists (to hide "Schedule Next Round" button)
                    const nextRoundExists = rounds.some(r => r.round_number === round.round_number + 1);
                    
                    // Hide interview details if this round was advanced (outcome = 'advance')
                    const shouldShowInterviewDetails = round.outcome !== 'advance';

                    return (
                        <Card key={round.id} className="overflow-hidden">
                            <div
                                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleRound(round.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm">
                                                Round {round.round_number}
                                                {round.round_label && ` - ${round.round_label}`}
                                            </h4>
                                            <Badge variant="outline" className="text-xs">
                                                {round.status}
                                            </Badge>
                                        </div>
                                        {round.confirmed_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Confirmed: {formatTimestamp(round.confirmed_at, "MMM d, yyyy")}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                                            isExpanded ? 'rotate-180' : ''
                                        }`}
                                    />
                                </div>

                                {outcomeInfo && (
                                    <div className={`mt-2 p-2 rounded-md ${outcomeInfo.bgColor} border ${outcomeInfo.borderColor}`}>
                                        <div className="flex items-center gap-2">
                                            <outcomeInfo.icon className={`h-4 w-4 ${outcomeInfo.color}`} />
                                            <span className={`text-xs font-medium ${outcomeInfo.color}`}>
                                                {outcomeInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Collapsible open={isExpanded}>
                                <CollapsibleContent>
                                    <Separator />
                                    <div className="p-3 space-y-3">
                                        {/* Cancelled state */}
                                        {isCanceled && (
                                            <div className="rounded-md bg-red-50 border border-red-200 p-3 space-y-1 dark:bg-red-950/20 dark:border-red-800">
                                                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                                                    Round canceled by {round.canceled_by === "candidate" ? "Candidate" : "Employer"}
                                                    {round.canceled_at && (
                                                        <span className="font-normal ml-1">· {formatTimestamp(round.canceled_at, "MMM d, yyyy")}</span>
                                                    )}
                                                </p>
                                                {round.cancellation_reason && (
                                                    <p className="text-xs text-red-600 dark:text-red-400">{round.cancellation_reason}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* MIS rescheduled state */}
                                        {round.mis_rescheduled && round.mis_reschedule_data && (
                                            <div className="rounded-md bg-green-50 border border-green-200 p-3 space-y-1 dark:bg-green-950/20 dark:border-green-800">
                                                <p className="text-xs font-medium text-green-700 dark:text-green-300">Rescheduled by MIS</p>
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    {formatUTCTime(round.mis_reschedule_data.date, round.mis_reschedule_data.time)}
                                                    {" · "}
                                                    {round.mis_reschedule_data.interview_mode === "online" ? "Online" : "Physical"}
                                                </p>
                                            </div>
                                        )}

                                        {/* Interview Details - Hide if round was advanced to next round */}
                                        {shouldShowInterviewDetails && round.selected_time_slot && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground">Interview Details</p>
                                                <div className="grid gap-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>
                                                            {formatUTCDate(round.selected_time_slot.date)}
                                                        </span>
                                                    </div>
                                                    {round.selected_time_slot.time && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span>
                                                                {formatUTCTime(round.selected_time_slot.date, round.selected_time_slot.time)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {round.interview_mode && (
                                                        <div className="flex items-center gap-2">
                                                            {round.interview_mode === 'online' ? (
                                                                <Video className="h-3.5 w-3.5 text-muted-foreground" />
                                                            ) : (
                                                                <MapPinned className="h-3.5 w-3.5 text-muted-foreground" />
                                                            )}
                                                            <span className="capitalize">{round.interview_mode} Interview</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Feedback/Outcome */}
                                        {round.outcome_notes && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    Interview Feedback
                                                </p>
                                                <div className="bg-muted/50 rounded p-2.5 text-sm">
                                                    <p className="whitespace-pre-wrap">{round.outcome_notes}</p>
                                                    {round.outcome_at && (
                                                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                                            {formatTimestamp(round.outcome_at, "MMM d, yyyy 'at' h:mm a")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {needsConfirmation && (
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmDialog({
                                                            isOpen: true,
                                                            roundId: round.id,
                                                            roundNumber: round.round_number,
                                                            roundLabel: round.round_label,
                                                            interviewMode: round.interview_mode,
                                                            selectedTimeSlot: round.selected_time_slot
                                                        });
                                                    }}
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                                    Confirm Interview
                                                </Button>
                                            )}

                                            {canAddFeedback && (
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFeedbackDialog({
                                                            isOpen: true,
                                                            roundId: round.id,
                                                            roundNumber: round.round_number
                                                        });
                                                    }}
                                                    className="flex-1"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                                    Add Feedback
                                                </Button>
                                            )}

                                            {round.outcome === 'advance' && !nextRoundExists && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNextRoundDialog({
                                                            isOpen: true,
                                                            previousRoundId: round.id,
                                                            nextRoundNumber: round.round_number + 1
                                                        });
                                                    }}
                                                    className="flex-1"
                                                >
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                    Schedule Next Round
                                                </Button>
                                            )}
                                            
                                            {round.outcome === 'advance' && nextRoundExists && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center dark:bg-green-950/20 dark:border-green-800">
                                                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center justify-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Next round has been scheduled
                                                    </p>
                                                </div>
                                            )}

                                            {round.outcome === 'offer' && !offerExists && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOfferDialog({
                                                            isOpen: true,
                                                            roundId: round.id
                                                        });
                                                    }}
                                                    className="flex-1"
                                                >
                                                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                                                    Create Job Offer
                                                </Button>
                                            )}

                                            {round.outcome === 'offer' && offerExists && offerDetails && (
                                                <div className={cn(
                                                    "rounded-lg p-3 text-center border",
                                                    offerDetails.status === 'accepted' ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" :
                                                    offerDetails.status === 'declined' ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" :
                                                    "bg-blue-50 border-blue-200 dark:bg-blue-950/45 dark:border-blue-800"
                                                )}>
                                                    <p className={cn(
                                                        "text-sm flex items-center justify-center gap-2 mb-2",
                                                        offerDetails.status === 'accepted' ? "text-green-800 dark:text-green-200" :
                                                        offerDetails.status === 'declined' ? "text-red-800 dark:text-red-200" :
                                                        "text-blue-800 dark:text-blue-100"
                                                    )}>
                                                        {offerDetails.status === 'accepted' ? (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Candidate has accepted the job offer
                                                            </>
                                                        ) : offerDetails.status === 'declined' ? (
                                                            <>
                                                                <XCircle className="h-4 w-4" />
                                                                Candidate has declined the job offer
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Job offer has been sent to candidate
                                                            </>
                                                        )}
                                                    </p>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-7 text-xs bg-white dark:bg-gray-900"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowOfferDetails(!showOfferDetails);
                                                            // Scroll to top where the banner is
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                    >
                                                        {showOfferDetails ? "Hide Details" : "View Offer Details"}
                                                    </Button>
                                                </div>
                                            )}
                                            {canCancelRound && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCancelRoundDialog({
                                                            isOpen: true,
                                                            roundId: round.id,
                                                            roundLabel: round.round_label || `Round ${round.round_number}`
                                                        });
                                                    }}
                                                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors underline-offset-2 hover:underline mt-1"
                                                >
                                                    Cancel this round
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    );
                })}
            </div>

            {/* Dialogs */}
            <InterviewFeedbackDialog
                roundId={feedbackDialog.roundId}
                roundNumber={feedbackDialog.roundNumber}
                candidateName={candidateName}
                isOpen={feedbackDialog.isOpen}
                onClose={() => setFeedbackDialog({ isOpen: false, roundId: "", roundNumber: 0 })}
                onSuccess={handleFeedbackSuccess}
            />

            <NextRoundDialog
                previousRoundId={nextRoundDialog.previousRoundId}
                nextRoundNumber={nextRoundDialog.nextRoundNumber}
                candidateName={candidateName}
                isOpen={nextRoundDialog.isOpen}
                onClose={() => setNextRoundDialog({ isOpen: false, previousRoundId: "", nextRoundNumber: 0 })}
                onSuccess={handleNextRoundSuccess}
            />

            <JobOfferDialog
                roundId={offerDialog.roundId}
                candidateName={candidateName}
                jobTitle={jobTitle}
                isOpen={offerDialog.isOpen}
                onClose={() => setOfferDialog({ isOpen: false, roundId: "" })}
                onSuccess={handleOfferSuccess}
            />

            <RoundConfirmDialog
                roundId={confirmDialog.roundId}
                roundNumber={confirmDialog.roundNumber}
                roundLabel={confirmDialog.roundLabel}
                candidateName={candidateName}
                interviewMode={confirmDialog.interviewMode}
                selectedTimeSlot={confirmDialog.selectedTimeSlot}
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({
                    isOpen: false,
                    roundId: "",
                    roundNumber: 0,
                    roundLabel: null,
                    interviewMode: null,
                    selectedTimeSlot: null
                })}
                onSuccess={handleConfirmSuccess}
            />

            {/* Cancel round dialog */}
            <Dialog open={cancelRoundDialog.isOpen} onOpenChange={(open) => { if (!open) { setCancelRoundDialog({ isOpen: false, roundId: "", roundLabel: "" }); setCancelRoundReason(""); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel {cancelRoundDialog.roundLabel}</DialogTitle>
                        <DialogDescription>Please provide a reason. This will be shared with the candidate.</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason for cancellation…"
                        value={cancelRoundReason}
                        onChange={e => setCancelRoundReason(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setCancelRoundDialog({ isOpen: false, roundId: "", roundLabel: "" }); setCancelRoundReason(""); }} disabled={isCancelingRound}>Keep Round</Button>
                        <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleCancelRound} disabled={isCancelingRound || !cancelRoundReason.trim()}>
                            {isCancelingRound ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Canceling…</> : "Confirm Cancellation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
