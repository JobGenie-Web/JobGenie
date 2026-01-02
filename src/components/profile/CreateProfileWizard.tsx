"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CVUpload } from "./CVUpload";
import { IndustryStep } from "./steps/IndustryStep";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { EducationStep } from "./steps/EducationStep";
import { AwardsStep } from "./steps/AwardsStep";
import { ProjectsStep } from "./steps/ProjectsStep";
import { BankingSkillsStep } from "./steps/BankingSkillsStep";
import { ComplianceStep } from "./steps/ComplianceStep";
import { SummaryStep } from "./steps/SummaryStep";
import { completeFullProfile } from "@/app/actions/profile";
import { IT_INDUSTRIES, BANKING_FINANCE_INDUSTRIES } from "@/lib/validations/profile-schema";
import type {
    CompleteProfileData,
    WorkExperienceData,
    EducationData,
    AwardData,
    ProjectData,
    CertificateData,
    FinancialLicenseData,
    BankingSkillData,
    ComplianceTrainingData,
    CVExtractionResult,
    BasicInfoData,
} from "@/lib/validations/profile-schema";
import { CertificatesStep, LicensesStep } from "./steps";

interface CreateProfileWizardProps {
    userId: string;
    initialData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address?: string;
        country?: string;
        industry?: string;
    };
}

type Step = {
    id: string;
    title: string;
    visible: boolean;
};

export function CreateProfileWizard({ userId, initialData }: CreateProfileWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [industry, setIndustry] = useState<string>(initialData.industry || "");
    const [cvUploaded, setCvUploaded] = useState(false);
    const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        alternativePhone: "",
        address: initialData.address || "",
        country: initialData.country || "",
        currentPosition: "",
        yearsOfExperience: 0,
        experienceLevel: "entry",
        expectedMonthlySalary: 0,
        availabilityStatus: "available",
        noticePeriod: "immediate",
        employmentType: "full_time",
    });
    const [professionalSummary, setProfessionalSummary] = useState("");
    const [workExperiences, setWorkExperiences] = useState<WorkExperienceData[]>([]);
    const [educations, setEducations] = useState<EducationData[]>([]);
    const [awards, setAwards] = useState<AwardData[]>([]);
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [certificates, setCertificates] = useState<CertificateData[]>([]);
    const [financialLicenses, setFinancialLicenses] = useState<FinancialLicenseData[]>([]);
    const [bankingSkills, setBankingSkills] = useState<BankingSkillData[]>([]);
    const [complianceTrainings, setComplianceTrainings] = useState<ComplianceTrainingData[]>([]);

    // Determine visible steps based on industry
    const isITIndustry = IT_INDUSTRIES.includes(industry as typeof IT_INDUSTRIES[number]);
    const isBankingFinance = BANKING_FINANCE_INDUSTRIES.includes(industry as typeof BANKING_FINANCE_INDUSTRIES[number]);

    const steps: Step[] = [
        { id: "industry", title: "Industry & CV", visible: true },
        { id: "basic", title: "Basic Info", visible: true },
        { id: "experience", title: "Experience", visible: true },
        { id: "education", title: "Education", visible: true },
        { id: "awards", title: "Awards", visible: true },
        { id: "projects", title: "Projects", visible: isITIndustry },
        { id: "certificates", title: "Certificates", visible: isITIndustry },
        { id: "licenses", title: "Licenses", visible: isBankingFinance },
        { id: "bankingSkills", title: "Skills", visible: isBankingFinance },
        { id: "compliance", title: "Compliance", visible: isBankingFinance },
        { id: "summary", title: "Summary", visible: true },
    ].filter((step) => step.visible);

    const totalSteps = steps.length;
    const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

    const handleCVExtracted = useCallback((data: CVExtractionResult) => {
        setCvUploaded(true);

        // Populate form fields from extracted data
        if (data.firstName) setBasicInfo((prev) => ({ ...prev, firstName: data.firstName! }));
        if (data.lastName) setBasicInfo((prev) => ({ ...prev, lastName: data.lastName! }));
        if (data.email) setBasicInfo((prev) => ({ ...prev, email: data.email! }));
        if (data.phone) setBasicInfo((prev) => ({ ...prev, phone: data.phone! }));
        if (data.address) setBasicInfo((prev) => ({ ...prev, address: data.address! }));
        if (data.currentPosition) setBasicInfo((prev) => ({ ...prev, currentPosition: data.currentPosition! }));
        if (data.yearsOfExperience) setBasicInfo((prev) => ({ ...prev, yearsOfExperience: data.yearsOfExperience! }));
        if (data.professionalSummary) setProfessionalSummary(data.professionalSummary);

        // Work experiences
        if (data.workExperiences?.length) {
            setWorkExperiences(
                data.workExperiences.map((exp) => ({
                    jobTitle: exp.jobTitle || "",
                    company: exp.company || "",
                    employmentType: "full_time" as const,
                    locationType: "onsite" as const,
                    startDate: exp.startDate || "",
                    endDate: exp.endDate || null,
                    description: exp.description || "",
                    isCurrent: exp.isCurrent || false,
                }))
            );
        }

        // Educations
        if (data.educations?.length) {
            setEducations(
                data.educations.map((edu) => ({
                    educationType: "academic" as const,
                    degreeDiploma: edu.degreeDiploma || "",
                    institution: edu.institution || "",
                    status: (edu.status === "complete" ? "complete" : "incomplete") as "complete" | "incomplete",
                }))
            );
        }

        // Certificates (for IT)
        if (data.certificates?.length) {
            setCertificates(
                data.certificates.map((cert) => ({
                    certificateName: cert.certificateName || "",
                    issuingAuthority: cert.issuingAuthority || "",
                    issueDate: cert.issueDate || "",
                }))
            );
        }

        // Projects (for IT)
        if (data.projects?.length) {
            setProjects(
                data.projects.map((proj) => ({
                    projectName: proj.projectName || "",
                    description: proj.description || "",
                    demoUrl: proj.demoUrl || "",
                    isCurrent: false,
                }))
            );
        }

        // Move to next step
        setCurrentStep(1);
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
            setError(null);
        }
    }, [currentStep, totalSteps]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
            setError(null);
        }
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const profileData: CompleteProfileData = {
                industry: industry as CompleteProfileData["industry"],
                basicInfo,
                professionalSummary,
                workExperiences,
                educations,
                awards,
                projects: isITIndustry ? projects : undefined,
                certificates: isITIndustry ? certificates : undefined,
                financialLicenses: isBankingFinance ? financialLicenses : undefined,
                bankingSkills: isBankingFinance ? bankingSkills : undefined,
                complianceTrainings: isBankingFinance ? complianceTrainings : undefined,
            };

            const result = await completeFullProfile(userId, profileData);

            if (result.success) {
                router.push("/candidate/dashboard");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Profile submission error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [
        userId, industry, basicInfo, professionalSummary, workExperiences,
        educations, awards, projects, certificates, financialLicenses,
        bankingSkills, complianceTrainings, isITIndustry, isBankingFinance, router
    ]);

    const renderStep = () => {
        const stepId = steps[currentStep]?.id;

        switch (stepId) {
            case "industry":
                return (
                    <IndustryStep
                        industry={industry}
                        onIndustryChange={setIndustry}
                        onCVExtracted={handleCVExtracted}
                        onSkipCV={() => setCurrentStep(1)}
                        onNext={handleNext}
                    />
                );
            case "basic":
                return (
                    <BasicInfoStep
                        data={basicInfo}
                        onChange={setBasicInfo}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "experience":
                return (
                    <ExperienceStep
                        experiences={workExperiences}
                        onChange={setWorkExperiences}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "education":
                return (
                    <EducationStep
                        educations={educations}
                        onChange={setEducations}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "awards":
                return (
                    <AwardsStep
                        awards={awards}
                        onChange={setAwards}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "projects":
                return (
                    <ProjectsStep
                        projects={projects}
                        onChange={setProjects}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "certificates":
                return (
                    <CertificatesStep
                        certificates={certificates}
                        onChange={setCertificates}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "licenses":
                return (
                    <LicensesStep
                        licenses={financialLicenses}
                        onChange={setFinancialLicenses}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "bankingSkills":
                return (
                    <BankingSkillsStep
                        skills={bankingSkills}
                        onChange={setBankingSkills}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "compliance":
                return (
                    <ComplianceStep
                        trainings={complianceTrainings}
                        onChange={setComplianceTrainings}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                );
            case "summary":
                return (
                    <SummaryStep
                        industry={industry}
                        basicInfo={basicInfo}
                        professionalSummary={professionalSummary}
                        onSummaryChange={setProfessionalSummary}
                        workExperiences={workExperiences}
                        educations={educations}
                        awards={awards}
                        projects={isITIndustry ? projects : undefined}
                        certificates={isITIndustry ? certificates : undefined}
                        financialLicenses={isBankingFinance ? financialLicenses : undefined}
                        bankingSkills={isBankingFinance ? bankingSkills : undefined}
                        complianceTrainings={isBankingFinance ? complianceTrainings : undefined}
                        onSubmit={handleSubmit}
                        onPrevious={handlePrevious}
                        isLoading={isLoading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                            {steps[currentStep]?.title}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Step {currentStep + 1} of {totalSteps}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="pb-4">
                    <Progress value={progress} className="h-2" />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        {steps.map((step, index) => (
                            <span
                                key={step.id}
                                className={index <= currentStep ? "text-primary font-medium" : ""}
                            >
                                {index + 1}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Current Step Content */}
            {renderStep()}
        </div>
    );
}
