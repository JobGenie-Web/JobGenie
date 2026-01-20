"use client";

import { useState } from "react";
import { InterviewStatsCards } from "./InterviewStatsCards";
import { InterviewTable } from "./InterviewTable";
import { InterviewDetailView } from "./InterviewDetailView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InterviewsClientProps {
    initialInterviews: any[];
    initialStats: any;
    error: string | null;
}

export function InterviewsClient({ initialInterviews, initialStats, error }: InterviewsClientProps) {
    const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

    const handleViewDetails = (id: string) => {
        setSelectedInterviewId(id);
    };

    const handleCloseDetails = () => {
        setSelectedInterviewId(null);
    };

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {initialStats && (
                <>
                    {/* Statistics Cards */}
                    <InterviewStatsCards stats={initialStats} />

                    {/* Interviews Table */}
                    <InterviewTable
                        interviews={initialInterviews}
                        onViewDetails={handleViewDetails}
                    />

                    {/* Interview Detail View Dialog */}
                    <InterviewDetailView
                        interviewId={selectedInterviewId}
                        onClose={handleCloseDetails}
                    />
                </>
            )}
        </div>
    );
}
