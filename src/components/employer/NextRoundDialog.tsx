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
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
    id: string;
    date: string;
    time: string;
}

interface NextRoundDialogProps {
    previousRoundId: string;
    nextRoundNumber: number;
    candidateName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Generate time options from 9 AM to 4:30 PM in 30-minute intervals
function generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let hour = 9; hour <= 16; hour++) {
        for (let min = 0; min < 60; min += 30) {
            if (hour === 16 && min > 30) break;
            const h = hour.toString().padStart(2, '0');
            const m = min.toString().padStart(2, '0');
            times.push(`${h}:${m}`);
        }
    }
    return times;
}

export function NextRoundDialog({
    previousRoundId,
    nextRoundNumber,
    candidateName,
    isOpen,
    onClose,
    onSuccess
}: NextRoundDialogProps) {
    const [roundLabel, setRoundLabel] = useState(`Round ${nextRoundNumber}`);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const timeOptions = generateTimeOptions();

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

    const handleSubmit = async () => {
        if (timeSlots.length === 0) {
            toast.error("Please add at least one time slot");
            return;
        }

        const incompleteSlots = timeSlots.filter(s => !s.date || !s.time);
        if (incompleteSlots.length > 0) {
            toast.error("Please complete all time slots");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/employer/interview-rounds/next-round', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    previous_round_id: previousRoundId,
                    round_label: roundLabel,
                    time_slots: timeSlots.map((slot, index) => ({
                        date: slot.date,
                        time: slot.time,
                        order: index + 1
                    })),
                    message: message.trim() || undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Next interview round created successfully!");
                onSuccess();
                handleClose();
            } else {
                toast.error(data.error || "Failed to create next round");
            }
        } catch (error) {
            console.error("Error creating next round:", error);
            toast.error("An error occurred while creating next round");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setRoundLabel(`Round ${nextRoundNumber}`);
        setTimeSlots([]);
        setMessage("");
        onClose();
    };

    // Auto-add first slot when dialog opens
    useState(() => {
        if (isOpen && timeSlots.length === 0) {
            addTimeSlot();
        }
    });

    const isFormValid = timeSlots.length > 0 && timeSlots.every(s => s.date && s.time);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Schedule Next Interview Round</DialogTitle>
                    <DialogDescription>
                        Schedule round {nextRoundNumber} for {candidateName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Round Label */}
                    <div className="space-y-2">
                        <Label htmlFor="roundLabel">Round Label</Label>
                        <Input
                            id="roundLabel"
                            value={roundLabel}
                            onChange={(e) => setRoundLabel(e.target.value)}
                            placeholder="e.g., Technical Interview, Culture Fit, Final Round"
                            maxLength={100}
                            disabled={submitting}
                        />
                        <p className="text-xs text-muted-foreground">
                            Give this round a descriptive name (optional)
                        </p>
                    </div>

                    {/* Time Slots Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Available Time Slots *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTimeSlot}
                                disabled={timeSlots.length >= 3 || submitting}
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
                                            disabled={submitting}
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
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Time Slot *</Label>
                                        <Select
                                            value={slot.time}
                                            onValueChange={(v) => updateSlotTime(slot.id, v)}
                                            disabled={submitting}
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

                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-900/20">
                            <p className="text-green-900 dark:text-green-200">
                                Alternative dates will be automatically calculated based on your selected time slots
                            </p>
                        </div>
                    </div>

                    {/* Optional Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Personal Message (Optional)</Label>
                        <Textarea
                            id="message"
                            placeholder="Congratulations! You've been selected for the next round..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={500}
                            rows={3}
                            disabled={submitting}
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
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isFormValid || submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Next Round
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
