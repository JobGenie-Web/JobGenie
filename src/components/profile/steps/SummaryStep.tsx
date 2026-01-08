"use client";

import { useState } from "react";
import { FileCheck2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormSection } from "../shared/FormSection";
import { StepNavigation } from "../shared/StepNavigation";
import { generateProfessionalSummary } from "@/app/actions/extract-cv";
import { INDUSTRY_OPTIONS } from "@/lib/validations/profile-schema";
import type {
    BasicInfoData,
    WorkExperienceData,
    EducationData,
    AwardData,
    ProjectData,
    CertificateData,
    FinanceAcademicEducationData,
    FinanceProfessionalEducationData,
    BankingAcademicEducationData,
    BankingProfessionalEducationData,
    BankingSpecializedTrainingData,
} from "@/lib/validations/profile-schema";

interface SummaryStepProps {
    industry: string;
    basicInfo: BasicInfoData;
    professionalSummary: string;
    onSummaryChange: (summary: string) => void;
    workExperiences: WorkExperienceData[];
    educations: EducationData[];
    awards: AwardData[];
    projects?: ProjectData[];
    certificates?: CertificateData[];
    financeAcademicEducation?: FinanceAcademicEducationData[];
    financeProfessionalEducation?: FinanceProfessionalEducationData[];
    bankingAcademicEducation?: BankingAcademicEducationData[];
    bankingProfessionalEducation?: BankingProfessionalEducationData[];
    bankingSpecializedTraining?: BankingSpecializedTrainingData[];
    onSubmit: () => void;
    onPrevious: () => void;
    isLoading: boolean;
}

export function SummaryStep({
    industry,
    basicInfo,
    professionalSummary,
    onSummaryChange,
    workExperiences,
    educations,
    awards,
    projects,
    certificates,
    financeAcademicEducation,
    financeProfessionalEducation,
    bankingAcademicEducation,
    bankingProfessionalEducation,
    bankingSpecializedTraining,
    onSubmit,
    onPrevious,
    isLoading,
}: SummaryStepProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const industryLabel = INDUSTRY_OPTIONS.find((i) => i.value === industry)?.label || industry;

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setGenerationError(null);

        try {
            // No banking skills anymore - removed

            const result = await generateProfessionalSummary(
                workExperiences.map((exp) => ({
                    jobTitle: exp.jobTitle,
                    company: exp.company,
                    description: exp.description,
                })),
                [], // skills array - empty now
                basicInfo.currentPosition,
                basicInfo.yearsOfExperience,
                industryLabel
            );

            if (result.success && result.summary) {
                onSummaryChange(result.summary);
            } else {
                setGenerationError(result.error || "Failed to generate summary");
            }
        } catch (error) {
            setGenerationError("An error occurred while generating summary");
            console.error("Summary generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const canSubmit = professionalSummary.length >= 50;

    return (
        <div className="space-y-6">
            {/* Profile Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck2 className="h-5 w-5" />
                        Profile Summary
                    </CardTitle>
                    <CardDescription>
                        Review your profile information before submitting
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Info Summary */}
                    <div>
                        <h4 className="font-medium mb-2">Personal Information</h4>
                        <div className="grid gap-2 text-sm text-muted-foreground">
                            <p><span className="font-medium text-foreground">{basicInfo.firstName} {basicInfo.lastName}</span></p>
                            <p>{basicInfo.email} • {basicInfo.phone}</p>
                            <p>{basicInfo.currentPosition} • {basicInfo.yearsOfExperience} years experience</p>
                            <p>Industry: <Badge variant="secondary">{industryLabel}</Badge></p>
                        </div>
                    </div>

                    {/* Experience Summary */}
                    {workExperiences.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Experience ({workExperiences.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {workExperiences.slice(0, 3).map((exp, i) => (
                                    <li key={i}>• {exp.jobTitle} at {exp.company}</li>
                                ))}
                                {workExperiences.length > 3 && (
                                    <li className="text-xs">...and {workExperiences.length - 3} more</li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Education Summary */}
                    {educations.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Education ({educations.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {educations.slice(0, 2).map((edu, i) => (
                                    <li key={i}>• {edu.degreeDiploma} - {edu.institution}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Awards */}
                    {awards.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Awards ({awards.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {awards.slice(0, 2).map((award, i) => (
                                    <li key={i}>• {award.natureOfAward}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* IT Specific */}
                    {projects && projects.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Projects ({projects.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {projects.slice(0, 2).map((proj, i) => (
                                    <li key={i}>• {proj.projectName}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {certificates && certificates.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Certificates ({certificates.length})</h4>
                            <div className="flex flex-wrap gap-1">
                                {certificates.slice(0, 4).map((cert, i) => (
                                    <Badge key={i} variant="outline">{cert.certificateName}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Finance Education */}
                    {financeAcademicEducation && financeAcademicEducation.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Finance Academic Education ({financeAcademicEducation.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {financeAcademicEducation.slice(0, 2).map((edu, i) => (
                                    <li key={i}>• {edu.degreeDiploma} - {edu.institution}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {financeProfessionalEducation && financeProfessionalEducation.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Finance Professional Education ({financeProfessionalEducation.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {financeProfessionalEducation.slice(0, 2).map((edu, i) => (
                                    <li key={i}>• {edu.professionalQualification} - {edu.institution}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Banking Education */}
                    {bankingAcademicEducation && bankingAcademicEducation.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Banking Academic Education ({bankingAcademicEducation.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {bankingAcademicEducation.slice(0, 2).map((edu, i) => (
                                    <li key={i}>• {edu.degreeDiploma} - {edu.institution}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {bankingProfessionalEducation && bankingProfessionalEducation.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Banking Professional Education ({bankingProfessionalEducation.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {bankingProfessionalEducation.slice(0, 2).map((edu, i) => (
                                    <li key={i}>• {edu.professionalQualification} - {edu.institution}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {bankingSpecializedTraining && bankingSpecializedTraining.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Banking Specialized Training ({bankingSpecializedTraining.length})</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {bankingSpecializedTraining.slice(0, 2).map((training, i) => (
                                    <li key={i}>• {training.certificateName} - {training.issuingAuthority}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Professional Summary */}
            <FormSection
                title="Professional Summary"
                description="Write a compelling summary or let AI generate one based on your profile"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="professionalSummary">
                                Summary <span className="text-destructive">*</span>
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateSummary}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate with AI
                                    </>
                                )}
                            </Button>
                        </div>
                        <Textarea
                            id="professionalSummary"
                            value={professionalSummary}
                            onChange={(e) => onSummaryChange(e.target.value)}
                            placeholder="Write a compelling professional summary (minimum 50 characters)..."
                            rows={5}
                        />
                        <p className="text-xs text-muted-foreground">
                            {professionalSummary.length}/1000 characters (minimum 50)
                        </p>
                        {generationError && (
                            <p className="text-sm text-destructive">{generationError}</p>
                        )}
                    </div>
                </div>
            </FormSection>

            <StepNavigation
                currentStep={11}
                totalSteps={11}
                onPrevious={onPrevious}
                onNext={onSubmit}
                isLastStep
                isLoading={isLoading}
                canProceed={canSubmit}
            />
        </div>
    );
}
