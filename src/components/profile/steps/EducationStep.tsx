"use client";

import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "../shared/FormSection";
import { DynamicList } from "../shared/DynamicList";
import { StepNavigation } from "../shared/StepNavigation";
import type { EducationData } from "@/lib/validations/profile-schema";

interface EducationStepProps {
    educations: EducationData[];
    onChange: (educations: EducationData[]) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const EDUCATION_TYPES = [
    { value: "academic", label: "Academic" },
    { value: "professional", label: "Professional" },
];

const EDUCATION_STATUSES = [
    { value: "incomplete", label: "In Progress / Incomplete" },
    { value: "first_class", label: "First Class" },
    { value: "second_class_upper", label: "Second Class Upper" },
    { value: "second_class_lower", label: "Second Class Lower" },
    { value: "general", label: "General" },
];

const emptyEducation: EducationData = {
    educationType: "academic",
    degreeDiploma: "",
    institution: "",
    status: "incomplete", // Changed to match schema
};

export function EducationStep({ educations, onChange, onNext, onPrevious }: EducationStepProps) {
    const handleAdd = () => {
        onChange([...educations, { ...emptyEducation }]);
    };

    const handleRemove = (index: number) => {
        onChange(educations.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, field: keyof EducationData, value: unknown) => {
        const updated = [...educations];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <FormSection
                title="Education"
                description="Add your academic and professional qualifications"
            >
                <DynamicList
                    items={educations}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    addLabel="Add Education"
                    emptyMessage="No education added yet. Click below to add your qualifications."
                    maxItems={10}
                    renderItem={(edu, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`educationType-${index}`}>Type</Label>
                                    <Select
                                        value={edu.educationType}
                                        onValueChange={(value) => handleUpdate(index, "educationType", value)}
                                    >
                                        <SelectTrigger id={`educationType-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EDUCATION_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`status-${index}`}>Status</Label>
                                    <Select
                                        value={edu.status}
                                        onValueChange={(value) => handleUpdate(index, "status", value)}
                                    >
                                        <SelectTrigger id={`status-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EDUCATION_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`degreeDiploma-${index}`}>
                                    Degree / Diploma <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={`degreeDiploma-${index}`}
                                    value={edu.degreeDiploma}
                                    onChange={(e) => handleUpdate(index, "degreeDiploma", e.target.value)}
                                    placeholder="e.g., BSc in Computer Science"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`institution-${index}`}>
                                    Institution <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={`institution-${index}`}
                                    value={edu.institution}
                                    onChange={(e) => handleUpdate(index, "institution", e.target.value)}
                                    placeholder="e.g., University of Colombo"
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <StepNavigation
                currentStep={4}
                totalSteps={10}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </div>
    );
}
