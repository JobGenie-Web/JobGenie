"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, AlertCircle, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ResumeData {
    resume_url: string | null;
    updated_at: string;
}

export function ResumesClientContent() {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== "application/pdf") {
            toast({
                title: "Invalid File Type",
                description: "Please upload a PDF file only.",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: "File Too Large",
                description: "File size must not exceed 5MB.",
                variant: "destructive",
            });
            return;
        }

        // Upload the file
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/candidate/upload-resume", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Upload failed");
            }

            toast({
                title: "Success",
                description: "Your resume has been updated successfully.",
            });

            // Refresh resume data
            const profileResponse = await fetch("/api/candidate/profile", { cache: "no-store" });
            if (profileResponse.ok) {
                const profileResult = await profileResponse.json();
                if (profileResult.success && profileResult.data) {
                    setResumeData({
                        resume_url: profileResult.data.resume_url,
                        updated_at: profileResult.data.updated_at
                    });
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast({
                title: "Upload Failed",
                description: err instanceof Error ? err.message : "Failed to upload resume. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

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
                                Upload your resume to get started.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {isUploading ? "Uploading..." : "Upload Resume"}
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
                                        PDF Document
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
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {isUploading ? "Uploading..." : "Update Resume"}
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
