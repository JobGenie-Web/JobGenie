"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Plus, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface TimeSlot {
    id: string;
    date: string;
    time: string;
}

interface InviteCandidateButtonProps {
    candidateId: string;
    suggestedIndustry?: string;
    suggestedDesignation?: string;
    isInvited?: boolean;
    onInvitationChange?: () => void;  // Callback to refresh data
}

// Generate time options from 9 AM to 4:30 PM in 30-minute intervals
function generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let hour = 9; hour <= 16; hour++) {
        for (let min = 0; min < 60; min += 30) {
            if (hour === 16 && min > 30) break;  // Stop at 4:30 PM
            const h = hour.toString().padStart(2, '0');
            const m = min.toString().padStart(2, '0');
            times.push(`${h}:${m}`);
        }
    }
    return times;
}

// Calculate 3 working days from a date (excluding weekends). Uses UTC methods
// so the result is identical regardless of the browser's timezone — must match
// the server-side calc in src/app/api/employer/invitations/route.ts.
function calculateAlternativeDate(date: Date): Date {
    let workingDaysAdded = 0;
    const currentDate = new Date(date);

    while (workingDaysAdded < 3) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        const dayOfWeek = currentDate.getUTCDay();

        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDaysAdded++;
        }
    }

    return currentDate;
}

export function InviteCandidateButton({
    candidateId,
    suggestedIndustry,
    suggestedDesignation,
    isInvited = false,
    onInvitationChange
}: InviteCandidateButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [message, setMessage] = useState("");
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [sending, setSending] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [alternativeDate, setAlternativeDate] = useState<Date | null>(null);

    // Initialize with one empty time slot when dialog opens
    useEffect(() => {
        if (isOpen && timeSlots.length === 0 && !isInvited) {
            addTimeSlot();
        }
    }, [isOpen, isInvited]);

    // Calculate alternative date when slots change
    useEffect(() => {
        if (timeSlots.length > 0) {
            const validSlots = timeSlots.filter(s => s.date && s.time);
            if (validSlots.length > 0) {
                const latestDate = new Date(Math.max(...validSlots.map(s => new Date(s.date).getTime())));
                const altDate = calculateAlternativeDate(latestDate);
                setAlternativeDate(altDate);
            } else {
                setAlternativeDate(null);
            }
        } else {
            setAlternativeDate(null);
        }
    }, [timeSlots]);

    const addTimeSlot = () => {
        if (timeSlots.length < 3) {
            setTimeSlots([...timeSlots, {
                id: crypto.randomUUID(),
                date: "",
                time: ""
            }]);
        }
    };

    const removeTimeSlot = (id: string) => {
        setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    };

    const updateSlotDate = (id: string, date: string) => {
        setTimeSlots(timeSlots.map(slot =>
            slot.id === id ? { ...slot, date } : slot
        ));
    };

    const updateSlotTime = (id: string, time: string) => {
        setTimeSlots(timeSlots.map(slot =>
            slot.id === id ? { ...slot, time } : slot
        ));
    };

    const handleSendInvitation = async () => {
        // Validation
        if (timeSlots.length === 0) {
            toast.error("Please add at least one time slot");
            return;
        }

        const incompleteSlots = timeSlots.filter(s => !s.date || !s.time);
        if (incompleteSlots.length > 0) {
            toast.error("Please complete all time slots");
            return;
        }

        if (!suggestedIndustry || !suggestedDesignation) {
            toast.error("Missing job position information");
            return;
        }

        setSending(true);
        try {
            const response = await fetch("/api/employer/invitations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    candidateId,
                    industry: suggestedIndustry,
                    jobDesignation: suggestedDesignation,
                    message: message.trim() || undefined,
                    timeSlots: timeSlots.map((slot, index) => ({
                        date: slot.date,
                        time: slot.time,
                        order: index + 1
                    }))
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Invitation sent successfully!");
                setIsOpen(false);
                setTimeSlots([]);
                setMessage("");
                // Trigger refresh
                if (onInvitationChange) {
                    onInvitationChange();
                } else {
                    // Fallback: reload page
                    window.location.reload();
                }
            } else {
                toast.error(data.error || "Failed to send invitation");
            }
        } catch (error) {
            console.error("Error sending invitation:", error);
            toast.error("An error occurred while sending invitation");
        } finally {
            setSending(false);
        }
    };

    const handleCancelInvitation = async () => {
        setCancelling(true);
        try {
            const response = await fetch(`/api/employer/invitations/cancel?candidateId=${candidateId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Invitation cancelled successfully!");
                setShowCancelDialog(false);
                // Trigger refresh
                if (onInvitationChange) {
                    onInvitationChange();
                } else {
                    // Fallback: reload page
                    window.location.reload();
                }
            } else {
                toast.error(data.error || "Failed to cancel invitation");
            }
        } catch (error) {
            console.error("Error cancelling invitation:", error);
            toast.error("An error occurred while cancelling invitation");
        } finally {
            setCancelling(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const timeOptions = generateTimeOptions();
    const isFormValid = timeSlots.length > 0 && timeSlots.every(s => s.date && s.time);

    // If already invited, show cancel button
    if (isInvited) {
        return (
            <>
                <Button
                    className="w-full cursor-pointer"
                    size="lg"
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelling}
                >
                    {cancelling ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Invitation
                        </>
                    )}
                </Button>

                <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to cancel this interview invitation? The candidate will no longer see this invitation as active. You can send a new invitation later if needed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={cancelling}>No, Keep It</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleCancelInvitation}
                                disabled={cancelling}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {cancelling ? "Cancelling..." : "Yes, Cancel Invitation"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    // Otherwise show normal invite button
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Invite for an Interview
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Invite Candidate for Interview</DialogTitle>
                    <DialogDescription>
                        Position: {suggestedIndustry} - {suggestedDesignation}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Time Slots Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Available Time Slots *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTimeSlot}
                                disabled={timeSlots.length >= 3 || sending}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Time Slot
                            </Button>
                        </div>

                        {timeSlots.map((slot, index) => (
                            <Card key={slot.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <Label className="font-medium">Time Slot {index + 1}</Label>
                                    {timeSlots.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTimeSlot(slot.id)}
                                            disabled={sending}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Date *</Label>
                                        <Input
                                            type="date"
                                            value={slot.date}
                                            onChange={(e) => updateSlotDate(slot.id, e.target.value)}
                                            min={today}
                                            disabled={sending}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Time Slot *</Label>
                                        <Select
                                            value={slot.time}
                                            onValueChange={(v) => updateSlotTime(slot.id, v)}
                                            disabled={sending}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeOptions.map(time => (
                                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <p className="text-xs text-muted-foreground">
                            {timeSlots.length} of 3 time slots added
                        </p>

                        {/* Alternative Date Info */}
                        {alternativeDate && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-900/20">
                                <p className="text-green-900 dark:text-green-200">
                                    Up to 3 working days from the last selected date ({alternativeDate.toLocaleDateString()}) will be selected as alternative dates.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Optional Message */}
                    <div className="space-y-2">
                        <Label>Personal Message (Optional)</Label>
                        <Textarea
                            placeholder="Add a personal message to make your invitation more appealing..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            rows={3}
                            disabled={sending}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {message.length}/500 characters
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={sending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSendInvitation}
                        disabled={!isFormValid || sending}
                    >
                        {sending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Invitation
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
