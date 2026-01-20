"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RescheduleModalProps {
    interviewId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Generate time slots from 9 AM to 5 PM in 30-min intervals
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
        for (let minute of [0, 30]) {
            if (hour === 17 && minute === 30) break; // Stop at 5:00 PM
            const period = hour >= 12 ? "PM" : "AM";
            const displayHour = hour > 12 ? hour - 12 : hour;
            const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
            slots.push(timeString);
        }
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function RescheduleModal({ interviewId, isOpen, onClose, onSuccess }: RescheduleModalProps) {
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<string>("");
    const [interviewMode, setInterviewMode] = useState<"online" | "physical">("online");
    const [meetingLink, setMeetingLink] = useState("");
    const [interviewAddress, setInterviewAddress] = useState("");
    const [mapLink, setMapLink] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = () => {
        setDate(undefined);
        setTime("");
        setInterviewMode("online");
        setMeetingLink("");
        setInterviewAddress("");
        setMapLink("");
        setNotes("");
        setError(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!date) {
            setError("Please select an interview date");
            return;
        }

        if (!time) {
            setError("Please select an interview time");
            return;
        }

        if (interviewMode === "online" && !meetingLink.trim()) {
            setError("Meeting link is required for online interviews");
            return;
        }

        if (interviewMode === "physical" && !interviewAddress.trim()) {
            setError("Interview address is required for physical interviews");
            return;
        }

        // URL validation for meeting link
        if (interviewMode === "online") {
            try {
                new URL(meetingLink);
            } catch {
                setError("Please enter a valid meeting link URL");
                return;
            }
        }

        // URL validation for map link (optional)
        if (mapLink.trim()) {
            try {
                new URL(mapLink);
            } catch {
                setError("Please enter a valid map link URL");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/mis/interviews/${interviewId}/reschedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: format(date, "yyyy-MM-dd"),
                    time,
                    interview_mode: interviewMode,
                    ...(interviewMode === "online" && { meeting_link: meetingLink }),
                    ...(interviewMode === "physical" && {
                        interview_address: interviewAddress,
                        ...(mapLink.trim() && { map_link: mapLink })
                    }),
                    ...(notes.trim() && { notes: notes.trim() })
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reschedule interview");
            }

            // Success
            handleReset();
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reschedule interview");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Reschedule Interview</DialogTitle>
                    <DialogDescription>
                        Provide new interview details to reschedule this cancelled interview.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Interview Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Time Slot Selector */}
                    <div className="space-y-2">
                        <Label htmlFor="time">Interview Time *</Label>
                        <Select value={time} onValueChange={setTime}>
                            <SelectTrigger id="time">
                                <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIME_SLOTS.map((slot) => (
                                    <SelectItem key={slot} value={slot}>
                                        {slot}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Interview Mode */}
                    <div className="space-y-2">
                        <Label>Interview Mode *</Label>
                        <RadioGroup value={interviewMode} onValueChange={(value) => setInterviewMode(value as "online" | "physical")}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="online" />
                                <Label htmlFor="online" className="font-normal cursor-pointer">Online</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="physical" id="physical" />
                                <Label htmlFor="physical" className="font-normal cursor-pointer">Physical</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Conditional Fields - Online */}
                    {interviewMode === "online" && (
                        <div className="space-y-2">
                            <Label htmlFor="meeting-link">Meeting Link *</Label>
                            <Input
                                id="meeting-link"
                                type="url"
                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Conditional Fields - Physical */}
                    {interviewMode === "physical" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="address">Interview Address *</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Enter the physical interview location"
                                    rows={3}
                                    value={interviewAddress}
                                    onChange={(e) => setInterviewAddress(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="map-link">Map Link (Optional)</Label>
                                <Input
                                    id="map-link"
                                    type="url"
                                    placeholder="https://maps.google.com/?q=..."
                                    value={mapLink}
                                    onChange={(e) => setMapLink(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any additional information about the rescheduled interview"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reschedule Interview
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
