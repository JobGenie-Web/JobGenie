"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
    Calendar, 
    Clock, 
    Check,
    X,
    Loader2,
    Video,
    MapPin,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatUTCDate, formatUTCTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface TimeSlot {
    date: string;
    time: string;
    order: number;
    is_alternative?: boolean;
}

interface RoundResponseCardProps {
    roundId: string;
    roundNumber: number;
    roundLabel: string | null;
    givenTimeSlots: TimeSlot[];
    alternativeDates: TimeSlot[];
    onResponse: () => void;
}

export function RoundResponseCard({
    roundId,
    roundNumber,
    roundLabel,
    givenTimeSlots,
    alternativeDates,
    onResponse
}: RoundResponseCardProps) {
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedMode, setSelectedMode] = useState<'online' | 'physical' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allSlots = [...(givenTimeSlots || []), ...(alternativeDates || [])].sort((a, b) => a.order - b.order);

    const handleAccept = async () => {
        if (!selectedSlot) {
            toast.error("Please select a time slot");
            return;
        }
        if (!selectedMode) {
            toast.error("Please select interview mode (online or physical)");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/candidate/interview-rounds/${roundId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'accept',
                    selected_time_slot: selectedSlot,
                    interview_mode: selectedMode
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Interview round accepted successfully!");
                onResponse();
            } else {
                toast.error(data.error || "Failed to accept interview round");
            }
        } catch (error) {
            console.error("Error accepting round:", error);
            toast.error("An error occurred while accepting the round");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDecline = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/candidate/interview-rounds/${roundId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'decline'
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Interview round declined");
                onResponse();
            } else {
                toast.error(data.error || "Failed to decline interview round");
            }
        } catch (error) {
            console.error("Error declining round:", error);
            toast.error("An error occurred while declining the round");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isModeSelected = selectedMode !== null;
    const isSlotSelected = selectedSlot !== null;
    const canProceed = isModeSelected && isSlotSelected;

    return (
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">
                                {roundLabel || `Round ${roundNumber}`}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Action Required: Please respond to this interview invitation
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">
                        Awaiting Response
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Step 1: Select Interview Mode */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                            isModeSelected ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                        )}>
                            {isModeSelected ? <Check className="h-4 w-4" /> : "1"}
                        </div>
                        <Label className="text-base font-semibold">Choose Interview Mode</Label>
                    </div>
                    <RadioGroup
                        value={selectedMode || ""}
                        onValueChange={(value) => setSelectedMode(value as 'online' | 'physical')}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                        <div>
                            <RadioGroupItem value="online" id="online" className="peer sr-only" />
                            <Label
                                htmlFor="online"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <Video className="h-6 w-6 mb-2" />
                                <span className="text-sm font-medium">Online Interview</span>
                                <span className="text-xs text-muted-foreground text-center mt-1">
                                    Video call (Google Meet, Zoom, etc.)
                                </span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="physical" id="physical" className="peer sr-only" />
                            <Label
                                htmlFor="physical"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <MapPin className="h-6 w-6 mb-2" />
                                <span className="text-sm font-medium">Physical Interview</span>
                                <span className="text-xs text-muted-foreground text-center mt-1">
                                    In-person at company office
                                </span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <Separator />

                {/* Step 2: Select Time Slot */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                            isSlotSelected ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                        )}>
                            {isSlotSelected ? <Check className="h-4 w-4" /> : "2"}
                        </div>
                        <Label className="text-base font-semibold">Select Preferred Time Slot</Label>
                    </div>
                    {allSlots.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center dark:bg-yellow-950/20 dark:border-yellow-800">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                No time slots available. Please contact the employer.
                            </p>
                        </div>
                    ) : (
                        <RadioGroup
                            value={selectedSlot ? JSON.stringify(selectedSlot) : ""}
                            onValueChange={(value) => setSelectedSlot(JSON.parse(value))}
                            className="grid grid-cols-1 gap-2"
                        >
                            {allSlots.map((slot, index) => {
                            const slotValue = JSON.stringify(slot);
                            return (
                                <div key={index}>
                                    <RadioGroupItem value={slotValue} id={`slot-${index}`} className="peer sr-only" />
                                    <Label
                                        htmlFor={`slot-${index}`}
                                        className="flex items-center justify-between rounded-lg border-2 border-muted bg-white p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{formatUTCDate(slot.date)}</p>
                                                {slot.time ? (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatUTCTime(slot.date, slot.time)}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">
                                                        Time to be confirmed by employer
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {slot.is_alternative && (
                                            <Badge variant="outline" className="text-xs">
                                                Alternative
                                            </Badge>
                                        )}
                                    </Label>
                                </div>
                            );
                        })}
                        </RadioGroup>
                    )}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleAccept}
                        disabled={!canProceed || isSubmitting}
                        className="flex-1"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Accept Interview
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleDecline}
                        disabled={isSubmitting}
                        variant="outline"
                        size="lg"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <X className="h-4 w-4 mr-2" />
                        )}
                        Decline
                    </Button>
                </div>

                {!canProceed && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">Complete both steps to proceed:</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                            {!isModeSelected && <li>Select your preferred interview mode</li>}
                            {!isSlotSelected && <li>Choose a time slot</li>}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
