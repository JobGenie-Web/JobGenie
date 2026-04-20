"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Briefcase,
    ChevronDown,
    Loader2,
    MessageSquare,
    Video,
    MapPinned
} from "lucide-react";
import { toast } from "sonner";
import { formatUTCDate, formatUTCTime, formatTimestamp } from "@/lib/date-utils";
import { InterviewFeedbackDialog } from "./InterviewFeedbackDialog";
import { NextRoundDialog } from "./NextRoundDialog";
import { JobOfferDialog } from "./JobOfferDialog";

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
    selected_time_slot: any;
    interview_mode: string | null;
    confirmed_time: any;
    meeting_link: string | null;
    interview_address: string | null;
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
        if (onUpdate) onUpdate();
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
                    label: 'Job Offer Extended',
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
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Interview Rounds ({rounds.length})</h3>
                </div>

                {rounds.map((round) => {
                    const isExpanded = expandedRounds.has(round.id);
                    const outcomeInfo = getOutcomeInfo(round.outcome);
                    const canAddFeedback = round.status === 'confirmed' && !round.outcome;

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
                                        {/* Interview Details */}
                                        {round.selected_time_slot && (
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
                                        <div className="flex gap-2 pt-2">
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

                                            {round.outcome === 'advance' && (
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

                                            {round.outcome === 'offer' && (
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
        </>
    );
}
