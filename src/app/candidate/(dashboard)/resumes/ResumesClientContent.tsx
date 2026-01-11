"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResumeData {
    resume_url: string | null;
    updated_at: string;
}

export function ResumesClientContent() {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchResume() {
            try {
                const response = await fetch("/api/candidate/profile", { cache: "no-store" });
                if (!response.ok) throw new Error("Failed to fetch profile");

                const result = await response.json();
                if (result.success && result.data) {
                    setResumeData({
                        resume_url: result.data.resume_url,
                        updated_at: result.data.updated_at
                    });
                }
            } catch (err) {
                console.error("Error fetching resume:", err);
                setError("Failed to load resume information");
            } finally {
                setIsLoading(false);
            }
        }

        fetchResume();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Current Resume</CardTitle>
                    <CardDescription>
                        The resume currently associated with your profile application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-md">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    ) : !resumeData?.resume_url ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-medium">No Resume Uploaded</h3>
                            <p className="text-muted-foreground mb-4">
                                You haven&apos;t uploaded a resume yet.
                                <br />Please go to your profile to upload one.
                            </p>
                            <Button asChild>
                                <a href="/candidate/profile">Go to Profile</a>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">Candidate Resume</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Last Updated: {new Date(resumeData.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={resumeData.resume_url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View
                                        </a>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <a href={resumeData.resume_url} download>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* PDF Preview Iframe */}
                            <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-muted/50">
                                <iframe
                                    src={`${resumeData.resume_url}#toolbar=0`}
                                    className="w-full h-full"
                                    title="Resume Preview"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
