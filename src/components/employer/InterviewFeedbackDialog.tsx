"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InterviewFeedbackDialogProps {
    roundId: string;
    roundNumber: number;
    candidateName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Outcome = 'advance' | 'reject' | 'offer' | 'no_decision';

export function InterviewFeedbackDialog({
    roundId,
    roundNumber,
    candidateName,
    isOpen,
    onClose,
    onSuccess
}: InterviewFeedbackDialogProps) {
    const [outcome, setOutcome] = useState<Outcome>('no_decision');
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (outcome === 'no_decision') {
            toast.error("Please select an outcome");
            return;
        }

        if (!notes.trim() && outcome !== 'advance') {
            toast.error("Please provide feedback notes");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/employer/interview-rounds/${roundId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    outcome: outcome,
                    outcome_notes: notes.trim() || null
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Interview feedback saved successfully!");
                onSuccess();
                handleClose();
            } else {
                toast.error(data.error || "Failed to save feedback");
            }
        } catch (error) {
            console.error("Error saving feedback:", error);
            toast.error("An error occurred while saving feedback");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setOutcome('no_decision');
        setNotes("");
        onClose();
    };

    const outcomes = [
        {
            value: 'advance',
            label: 'Advance to Next Round',
            description: 'Candidate passed this round and will proceed to the next interview',
            icon: ArrowRight,
            color: 'text-green-600',
            bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
            selectedBg: 'bg-green-100 border-green-500'
        },
        {
            value: 'reject',
            label: 'Reject Candidate',
            description: 'Candidate did not meet the requirements for this position',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
            selectedBg: 'bg-red-100 border-red-500'
        },
        {
            value: 'offer',
            label: 'Offer Job',
            description: 'Candidate passed all rounds and is ready to receive a job offer',
            icon: Briefcase,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
            selectedBg: 'bg-blue-100 border-blue-500'
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Interview Feedback - Round {roundNumber}</DialogTitle>
                    <DialogDescription>
                        Provide feedback for {candidateName}'s interview performance
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Outcome Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Interview Outcome *</Label>
                        <RadioGroup value={outcome} onValueChange={(value) => setOutcome(value as Outcome)}>
                            {outcomes.map((option) => {
                                const Icon = option.icon;
                                const isSelected = outcome === option.value;
                                return (
                                    <div key={option.value} className="relative">
                                        <RadioGroupItem
                                            value={option.value}
                                            id={option.value}
                                            className="sr-only"
                                        />
                                        <label
                                            htmlFor={option.value}
                                            className={cn(
                                                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                                option.bgColor,
                                                isSelected && option.selectedBg
                                            )}
                                        >
                                            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", option.color)} />
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{option.label}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {option.description}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className={cn("h-5 w-5", option.color)} />
                                            )}
                                        </label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    {/* Feedback Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            Feedback Notes {outcome !== 'advance' && <span className="text-red-500">*</span>}
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Provide detailed feedback about the candidate's performance, strengths, areas for improvement..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={6}
                            maxLength={2000}
                            disabled={submitting}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {notes.length}/2000 characters
                        </p>
                    </div>

                    {/* Action-specific hints */}
                    {outcome === 'advance' && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <p className="text-sm text-green-800">
                                After saving, you'll be able to schedule the next interview round for this candidate.
                            </p>
                        </div>
                    )}
                    {outcome === 'reject' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-800">
                                This candidate will be marked as rejected. The candidate will be notified about the decision.
                            </p>
                        </div>
                    )}
                    {outcome === 'offer' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <p className="text-sm text-blue-800">
                                After saving, you'll be able to create and send a formal job offer to this candidate.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || outcome === 'no_decision'}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Save Feedback
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
