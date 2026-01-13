"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { EmployerProfileStep } from "./steps/EmployerProfileStep";
import { registerEmployer, type ActionState } from "@/app/actions/auth";

export function EmployerSignupWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isCertificateVerified, setIsCertificateVerified] = useState(false);

    // Step 1: Company Data
    const [companyData, setCompanyData] = useState({
        companyName: "",
        businessRegistrationNo: "",
        industry: "",
        businessRegisteredAddress: "",
        brCertificateUrl: "", // Will be set after successful upload
    });

    // Store the BR certificate file separately (will upload during registration)
    const [brCertificateFile, setBrCertificateFile] = useState<File | null>(null);

    // Step 2: Employer Data
    const [employerData, setEmployerData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        jobTitle: "",
    });

    const steps = [
        { id: "company", title: "Company Information" },
        { id: "profile", title: "Your Information" },
    ];

    const totalSteps = steps.length;
    const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

    const handleNext = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    }, [currentStep, totalSteps]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);

        try {
            let uploadedCertificateUrl = "";

            // Step 1: Upload BR certificate file first
            if (brCertificateFile) {
                toast.info("Uploading business registration certificate...");

                const uploadFormData = new FormData();
                uploadFormData.append("file", brCertificateFile);
                uploadFormData.append("bucket", "br-certificates");

                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to upload BR certificate");
                }

                const uploadData = await uploadResponse.json();
                uploadedCertificateUrl = uploadData.url;
            } else {
                toast.error("BR certificate file is missing");
                setIsLoading(false);
                return;
            }

            // Step 2: Register employer with uploaded certificate URL
            const formData = new FormData();

            // Add company data
            formData.append("companyName", companyData.companyName);
            formData.append("businessRegistrationNo", companyData.businessRegistrationNo);
            formData.append("industry", companyData.industry);
            formData.append("businessRegisteredAddress", companyData.businessRegisteredAddress);
            formData.append("brCertificateUrl", uploadedCertificateUrl);

            // Add employer data
            formData.append("firstName", employerData.firstName);
            formData.append("lastName", employerData.lastName);
            formData.append("phone", employerData.phone);
            formData.append("email", employerData.email);
            formData.append("password", employerData.password);
            formData.append("confirmPassword", employerData.confirmPassword);
            formData.append("jobTitle", employerData.jobTitle);

            const result = await registerEmployer(null, formData);

            if (result.success) {
                toast.success(result.message || "Registration successful!");
                if (result.redirectTo) {
                    setTimeout(() => {
                        router.push(result.redirectTo!);
                    }, 1000);
                }
            } else {
                // Registration failed - clean up uploaded certificate
                if (uploadedCertificateUrl) {
                    try {
                        await fetch("/api/delete-file", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ fileUrl: uploadedCertificateUrl }),
                        });
                    } catch (cleanupError) {
                        console.error("Failed to clean up uploaded certificate:", cleanupError);
                    }
                }

                // Display field-specific errors
                if (result.errors && Object.keys(result.errors).length > 0) {
                    Object.entries(result.errors).forEach(([field, messages]) => {
                        const errorMessage = Array.isArray(messages) ? messages.join(", ") : messages;
                        toast.error(`${field}: ${errorMessage}`);
                    });
                } else {
                    toast.error(result.message || "Registration failed. Please try again.");
                }
            }
        } catch (err) {
            console.error("Registration error:", err);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [companyData, employerData, brCertificateFile, router]);

    const renderStep = () => {
        const stepId = steps[currentStep]?.id;

        switch (stepId) {
            case "company":
                return (
                    <CompanyInfoStep
                        data={companyData}
                        onChange={setCompanyData}
                        onNext={handleNext}
                        onFileVerified={setIsCertificateVerified}
                        onFileSelect={setBrCertificateFile}
                        isVerified={isCertificateVerified}
                    />
                );
            case "profile":
                return (
                    <EmployerProfileStep
                        data={employerData}
                        onChange={setEmployerData}
                        onPrevious={handlePrevious}
                        onSubmit={handleSubmit}
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

            {/* Current Step Content */}
            {renderStep()}
        </div>
    );
}
