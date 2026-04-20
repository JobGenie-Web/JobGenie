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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RoundConfirmDialogProps {
    roundId: string;
    roundNumber: number;
    roundLabel: string | null;
    candidateName: string;
    interviewMode: string | null;
    selectedTimeSlot: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function RoundConfirmDialog({
    roundId,
    roundNumber,
    roundLabel,
    candidateName,
    interviewMode,
    selectedTimeSlot,
    isOpen,
    onClose,
    onSuccess
}: RoundConfirmDialogProps) {
    const [confirmedTime, setConfirmedTime] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [interviewAddress, setInterviewAddress] = useState("");
    const [mapLink, setMapLink] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const isAlternative = selectedTimeSlot?.is_alternative;

    const handleSubmit = async () => {
        // Validation
        if (isAlternative && !confirmedTime) {
            toast.error("Please provide a time slot for the alternative date");
            return;
        }

        if (interviewMode === 'online' && !meetingLink) {
            toast.error("Please provide a meeting link for online interview");
            return;
        }

        if (interviewMode === 'physical' && !interviewAddress) {
            toast.error("Please provide an address for physical interview");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/employer/interview-rounds/${roundId}/confirm`, {
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
                toast.success("Interview round confirmed successfully!");
                onSuccess();
                handleClose();
            } else {
                toast.error(data.error || "Failed to confirm interview round");
            }
        } catch (error) {
            console.error("Error confirming round:", error);
            toast.error("An error occurred while confirming the round");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setConfirmedTime("");
        setMeetingLink("");
        setInterviewAddress("");
        setMapLink("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Confirm Interview Round {roundNumber}</DialogTitle>
                    <DialogDescription>
                        Confirm {roundLabel || `Round ${roundNumber}`} details for {candidateName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Alternative Date Time */}
                    {isAlternative && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmedTime">
                                Confirmed Time Slot *
                            </Label>
                            <Input
                                id="confirmedTime"
                                type="time"
                                value={confirmedTime}
                                onChange={(e) => setConfirmedTime(e.target.value)}
                                placeholder="HH:MM"
                                disabled={submitting}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide a specific time for the alternative date selected by the candidate
                            </p>
                        </div>
                    )}

                    {/* Online Interview - Meeting Link */}
                    {interviewMode === 'online' && (
                        <div className="space-y-2">
                            <Label htmlFor="meetingLink">
                                Meeting Link *
                            </Label>
                            <Input
                                id="meetingLink"
                                type="url"
                                placeholder="https://meet.google.com/abc-defg-hij"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                disabled={submitting}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Google Meet, Zoom, or other video call link
                            </p>
                        </div>
                    )}

                    {/* Physical Interview - Address */}
                    {interviewMode === 'physical' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="interviewAddress">
                                    Interview Address *
                                </Label>
                                <Textarea
                                    id="interviewAddress"
                                    placeholder="Company office address..."
                                    value={interviewAddress}
                                    onChange={(e) => setInterviewAddress(e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    disabled={submitting}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mapLink">
                                    Map Link (Optional)
                                </Label>
                                <Input
                                    id="mapLink"
                                    type="url"
                                    placeholder="https://maps.google.com/..."
                                    value={mapLink}
                                    onChange={(e) => setMapLink(e.target.value)}
                                    disabled={submitting}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Google Maps link to help the candidate find the location
                                </p>
                            </div>
                        </>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 dark:bg-blue-950/20 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            The candidate will receive an email confirmation with these details.
                        </p>
                    </div>
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
                        disabled={submitting}
                    >
                        {submitting ? (
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
