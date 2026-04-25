"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Info } from "lucide-react";
import { BRCertificateUpload } from "../BRCertificateUpload";
import { useIndustries } from "@/hooks/useIndustries";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

interface CompanyInfoStepProps {
    data: {
        companyName: string;
        businessRegistrationNo: string;
        industry: string;
        businessRegisteredAddress: string;
        brCertificateUrl: string;
    };
    onChange: (data: CompanyInfoStepProps["data"]) => void;
    onNext: () => void;
    onFileVerified: (verified: boolean) => void;
    onFileSelect: (file: File) => void; // Added to pass file to wizard
    isVerified: boolean;
}

export function CompanyInfoStep({
    data,
    onChange,
    onNext,
    onFileVerified,
    onFileSelect,
    isVerified,
}: CompanyInfoStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { industries, loading: industriesLoading, error: industriesError } = useIndustries();

    const handleChange = (field: keyof typeof data, value: string) => {
        onChange({ ...data, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleFileSelect = (file: File) => {
        // Pass file to parent wizard
        onFileSelect(file);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!data.companyName.trim()) {
            newErrors.companyName = "Company name is required";
        }

        if (!data.businessRegistrationNo.trim()) {
            newErrors.businessRegistrationNo = "Business registration number is required";
        } else {
            // Validate BR number format: PV/P/PB/GR/HP followed by numbers
            const brPattern = /^(PV|PB|GR|HP)\s*\d+$/i;
            if (!brPattern.test(data.businessRegistrationNo.trim())) {
                newErrors.businessRegistrationNo = "Invalid format. Must be PV/PB/GR/HP followed by numbers (e.g., PV 12345678 or PB 12345678)";
            }
        }

        if (!data.industry) {
            newErrors.industry = "Please select an industry";
        }

        if (!data.businessRegisteredAddress.trim()) {
            newErrors.businessRegisteredAddress = "Business address is required";
        }

        if (!isVerified) {
            newErrors.brCertificate = "Please upload and verify your BR certificate";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onNext();
        }
    };

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Company Information</h2>
                </div>
                <p className="p-2 border border-amber-400 bg-amber-50 rounded-lg text-sm text-amber-600">Company name & Business registration number should match with your BR certificate. Please recheck before proceeding.</p>

                <div className="space-y-4">
                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="companyName">
                            Company Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="companyName"
                            placeholder="Enter your company name"
                            value={data.companyName}
                            onChange={(e) => handleChange("companyName", e.target.value)}
                            className={errors.companyName ? "border-destructive" : ""}
                        />
                        {errors.companyName && (
                            <p className="text-sm text-destructive">{errors.companyName}</p>
                        )}
                    </div>

                    {/* Business Registration Number */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="businessRegistrationNo">
                                Business Registration Number <span className="text-destructive">*</span>
                            </Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-md p-0">
                                        <div className="p-2">
                                            <p className="text-sm font-semibold mb-2">BR Number Format Guide</p>
                                            <Image
                                                src="/br-format-guide.png"
                                                alt="BR Number Format Guide"
                                                width={400}
                                                height={150}
                                                className="rounded"
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Format: Prefix (PV/PB/GR/HP) + Space + Numbers (e.g., PV 12345678)
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Input
                            id="businessRegistrationNo"
                            placeholder="e.g., PV 12345678"
                            value={data.businessRegistrationNo}
                            onChange={(e) => handleChange("businessRegistrationNo", e.target.value)}
                            className={errors.businessRegistrationNo ? "border-destructive" : ""}
                        />
                        {errors.businessRegistrationNo && (
                            <p className="text-sm text-destructive">{errors.businessRegistrationNo}</p>
                        )}
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                        <Label htmlFor="industry">
                            Industry <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.industry}
                            onValueChange={(value) => handleChange("industry", value)}
                            disabled={industriesLoading || industries.length === 0}
                        >
                            <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
                                <SelectValue placeholder={industriesLoading ? "Loading industries..." : "Select industry"} />
                            </SelectTrigger>
                            <SelectContent>
                                {industriesLoading && (
                                    <SelectItem value="loading" disabled>
                                        Loading industries...
                                    </SelectItem>
                                )}
                                {!industriesLoading && industries.length === 0 && (
                                    <SelectItem value="no-industries" disabled>
                                        No industries available
                                    </SelectItem>
                                )}
                                {industries.map((industry) => (
                                    <SelectItem key={industry.industry_id} value={industry.industry_name}>
                                        {industry.industry_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {industriesError && (
                            <p className="text-sm text-destructive">{industriesError}</p>
                        )}
                        {errors.industry && (
                            <p className="text-sm text-destructive">{errors.industry}</p>
                        )}
                    </div>

                    {/* Business Registered Address */}
                    <div className="space-y-2">
                        <Label htmlFor="businessRegisteredAddress">
                            Business Registered Address <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="businessRegisteredAddress"
                            placeholder="Enter business registered address"
                            value={data.businessRegisteredAddress}
                            onChange={(e) => handleChange("businessRegisteredAddress", e.target.value)}
                            className={errors.businessRegisteredAddress ? "border-destructive" : ""}
                            rows={3}
                        />
                        {errors.businessRegisteredAddress && (
                            <p className="text-sm text-destructive">{errors.businessRegisteredAddress}</p>
                        )}
                    </div>

                    {/* BR Certificate Upload */}
                    <div className="space-y-2">
                        <Label>
                            Business Registration Certificate <span className="text-destructive">*</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mb-3">
                            Upload your BR certificate. Our AI will automatically verify it matches your company details.
                        </p>
                        <BRCertificateUpload
                            onFileSelect={handleFileSelect}
                            onVerificationComplete={onFileVerified}
                            companyName={data.companyName}
                            businessRegistrationNo={data.businessRegistrationNo}
                        />
                        {errors.brCertificate && (
                            <p className="text-sm text-destructive">{errors.brCertificate}</p>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleNext}
                        disabled={!isVerified}
                        className="min-w-24"
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
