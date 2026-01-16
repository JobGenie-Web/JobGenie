"use client";

import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "../shared/FormSection";
import { StepNavigation } from "../shared/StepNavigation";
import type { BasicInfoData } from "@/lib/validations/profile-schema";

interface BasicInfoStepProps {
    data: BasicInfoData;
    onChange: (data: BasicInfoData) => void;
    onNext: () => void;
    onPrevious: () => void;
    onImageSelect: (file: File | null) => void;
}

const EXPERIENCE_LEVELS = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "junior", label: "Junior (2-4 years)" },
    { value: "mid", label: "Mid Level (4-7 years)" },
    { value: "senior", label: "Senior (7-10 years)" },
    { value: "lead", label: "Lead/Manager (10+ years)" },
    { value: "principal", label: "Principal/Director" },
];

const AVAILABILITY_STATUSES = [
    { value: "available", label: "Actively Looking" },
    { value: "open_to_opportunities", label: "Open to Opportunities" },
    { value: "not_looking", label: "Not Currently Looking" },
];

const NOTICE_PERIODS = [
    { value: "immediate", label: "Immediate" },
    { value: "1_week", label: "1 Week" },
    { value: "2_weeks", label: "2 Weeks" },
    { value: "1_month", label: "1 Month" },
    { value: "2_months", label: "2 Months" },
    { value: "3_months", label: "3+ Months" },
];

const EMPLOYMENT_TYPES = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "freelance", label: "Freelance" },
];

const COUNTRIES = [
    "Sri Lanka", "United States", "United Kingdom", "Canada",
    "Australia", "India", "Singapore", "United Arab Emirates", "Germany", "Other",
];

const QUALIFICATION_OPTIONS = [
    { value: "bachelors_degree", label: "Bachelor's Degree" },
    { value: "masters_degree", label: "Master's Degree" },
    { value: "doctorate_phd", label: "Doctorate/PhD" },
    { value: "undergraduate", label: "Undergraduate" },
    { value: "post_graduate", label: "Post Graduate" },
    { value: "diploma", label: "Diploma" },
    { value: "certificate", label: "Certificate" },
    { value: "professional_certification", label: "Professional Certification" },
    { value: "vocational_training", label: "Vocational Training" },
    { value: "no_formal_education", label: "No Formal Education" },
];

function FormField({
    label, id, required, children, error,
}: {
    label: string; id: string; required?: boolean; children: React.ReactNode; error?: string;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>
                {label}{required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {children}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

export function BasicInfoStep({ data, onChange, onNext, onPrevious, onImageSelect }: BasicInfoStepProps) {
    const updateField = <K extends keyof BasicInfoData>(key: K, value: BasicInfoData[K]) => {
        onChange({ ...data, [key]: value });
    };

    const canProceed = data.firstName && data.lastName && data.email && data.phone &&
        data.address && data.currentPosition;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size must be less than 5MB");
                return;
            }
            if (!file.type.startsWith("image/")) {
                alert("Please upload an image file");
                return;
            }

            // Create object URL for preview
            const objectUrl = URL.createObjectURL(file);
            updateField("profileImageUrl", objectUrl);
            onImageSelect(file);
        }
    };

    return (
        <div className="space-y-6">
            <FormSection
                title="Personal Information"
                description="Your basic contact details"
            >
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="First Name" id="firstName" required>
                            <Input
                                id="firstName"
                                value={data.firstName}
                                onChange={(e) => updateField("firstName", e.target.value)}
                                placeholder="John"
                            />
                        </FormField>
                        <FormField label="Last Name" id="lastName" required>
                            <Input
                                id="lastName"
                                value={data.lastName}
                                onChange={(e) => updateField("lastName", e.target.value)}
                                placeholder="Doe"
                            />
                        </FormField>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="shrink-0">
                            {data.profileImageUrl ? (
                                <img
                                    src={data.profileImageUrl}
                                    alt="Profile Preview"
                                    className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted border-2 border-dashed border-muted-foreground/25">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="profileImage" className="text-base font-medium">Profile Picture</Label>
                            <p className="text-sm text-muted-foreground pb-2">
                                Upload a professional picture (Max 5MB)
                            </p>
                            <Input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full max-w-xs"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Email" id="email" required>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="john@example.com"
                            />
                        </FormField>
                        <FormField label="Phone" id="phone" required>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                placeholder="+94 77 123 4567"
                            />
                        </FormField>
                    </div>

                    <FormField label="Alternative Phone" id="alternativePhone">
                        <Input
                            id="alternativePhone"
                            value={data.alternativePhone}
                            onChange={(e) => updateField("alternativePhone", e.target.value)}
                            placeholder="Optional"
                        />
                    </FormField>

                    <FormField label="Address" id="address" required>
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => updateField("address", e.target.value)}
                            placeholder="Your full address"
                            rows={2}
                        />
                    </FormField>

                    <FormField label="Country" id="country">
                        <Select
                            value={data.country}
                            onValueChange={(value) => updateField("country", value)}
                        >
                            <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                title="Professional Details"
                description="Your current role and experience"
            >
                <div className="space-y-4">
                    <FormField label="Current Position" id="currentPosition" required>
                        <Input
                            id="currentPosition"
                            value={data.currentPosition}
                            onChange={(e) => updateField("currentPosition", e.target.value)}
                            placeholder="e.g., Software Engineer"
                        />
                    </FormField>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Years of Experience" id="yearsOfExperience">
                            <Input
                                id="yearsOfExperience"
                                type="number"
                                min="0"
                                max="50"
                                step="1"
                                value={data.yearsOfExperience || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Only accept integers (no decimals)
                                    if (value === "" || /^\d+$/.test(value)) {
                                        updateField("yearsOfExperience", value === "" ? 0 : parseInt(value));
                                    }
                                }}
                                placeholder="Enter years"
                            />
                        </FormField>
                        <FormField label="Experience Level" id="experienceLevel">
                            <Select
                                value={data.experienceLevel}
                                onValueChange={(value) => updateField("experienceLevel", value as BasicInfoData["experienceLevel"])}
                            >
                                <SelectTrigger id="experienceLevel">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPERIENCE_LEVELS.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Highest Qualification" id="highestQualification">
                        <Select
                            value={data.highestQualification}
                            onValueChange={(value) => updateField("highestQualification", value as BasicInfoData["highestQualification"])}
                        >
                            <SelectTrigger id="highestQualification">
                                <SelectValue placeholder="Select highest qualification" />
                            </SelectTrigger>
                            <SelectContent>
                                {QUALIFICATION_OPTIONS.map((qualification) => (
                                    <SelectItem key={qualification.value} value={qualification.value}>
                                        {qualification.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                title="Job Preferences"
                description="Your availability and expectations"
            >
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Availability Status" id="availabilityStatus">
                            <Select
                                value={data.availabilityStatus}
                                onValueChange={(value) => updateField("availabilityStatus", value as BasicInfoData["availabilityStatus"])}
                            >
                                <SelectTrigger id="availabilityStatus">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABILITY_STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Notice Period" id="noticePeriod">
                            <Select
                                value={data.noticePeriod}
                                onValueChange={(value) => updateField("noticePeriod", value)}
                            >
                                <SelectTrigger id="noticePeriod">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NOTICE_PERIODS.map((period) => (
                                        <SelectItem key={period.value} value={period.value}>
                                            {period.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Employment Type" id="employmentType">
                            <Select
                                value={data.employmentType}
                                onValueChange={(value) => updateField("employmentType", value as BasicInfoData["employmentType"])}
                            >
                                <SelectTrigger id="employmentType">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EMPLOYMENT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Expected Monthly Salary (LKR)" id="expectedMonthlySalary">
                            <Input
                                id="expectedMonthlySalary"
                                type="number"
                                min="0"
                                value={data.expectedMonthlySalary || ""}
                                onChange={(e) => updateField("expectedMonthlySalary", parseInt(e.target.value) || 0)}
                                placeholder="e.g., 150000"
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            <StepNavigation
                currentStep={2}
                totalSteps={10}
                onPrevious={onPrevious}
                onNext={onNext}
                canProceed={!!canProceed}
            />
        </div >
    );
}
