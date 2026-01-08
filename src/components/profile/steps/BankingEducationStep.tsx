"use client";

import { GraduationCap, Award, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "../shared/FormSection";
import { DynamicList } from "../shared/DynamicList";
import { StepNavigation } from "../shared/StepNavigation";
import type { BankingAcademicEducationData, BankingProfessionalEducationData, BankingSpecializedTrainingData } from "@/lib/validations/profile-schema";

interface BankingEducationStepProps {
    academicEducation: BankingAcademicEducationData[];
    professionalEducation: BankingProfessionalEducationData[];
    specializedTraining: BankingSpecializedTrainingData[];
    onAcademicChange: (data: BankingAcademicEducationData[]) => void;
    onProfessionalChange: (data: BankingProfessionalEducationData[]) => void;
    onSpecializedChange: (data: BankingSpecializedTrainingData[]) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const statusOptions = [
    { value: "incomplete", label: "Incomplete" },
    { value: "first_class", label: "First Class" },
    { value: "second_class_upper", label: "Second Class Upper" },
    { value: "second_class_lower", label: "Second Class Lower" },
    { value: "general", label: "General" },
];

export function BankingEducationStep({
    academicEducation,
    professionalEducation,
    specializedTraining,
    onAcademicChange,
    onProfessionalChange,
    onSpecializedChange,
    onNext,
    onPrevious,
}: BankingEducationStepProps) {
    // Handlers remain the same...
    const handleAddAcademic = () => {
        onAcademicChange([
            ...academicEducation,
            { degreeDiploma: "", institution: "", status: "incomplete" },
        ]);
    };

    const handleRemoveAcademic = (index: number) => {
        onAcademicChange(academicEducation.filter((_, i) => i !== index));
    };

    const handleUpdateAcademic = (index: number, field: keyof BankingAcademicEducationData, value: unknown) => {
        const updated = [...academicEducation];
        updated[index] = { ...updated[index], [field]: value };
        onAcademicChange(updated);
    };

    const handleAddProfessional = () => {
        onProfessionalChange([
            ...professionalEducation,
            { professionalQualification: "", institution: "", status: "incomplete" },
        ]);
    };

    const handleRemoveProfessional = (index: number) => {
        onProfessionalChange(professionalEducation.filter((_, i) => i !== index));
    };

    const handleUpdateProfessional = (index: number, field: keyof BankingProfessionalEducationData, value: unknown) => {
        const updated = [...professionalEducation];
        updated[index] = { ...updated[index], [field]: value };
        onProfessionalChange(updated);
    };

    const handleAddSpecialized = () => {
        onSpecializedChange([
            ...specializedTraining,
            { certificateName: "", issuingAuthority: "", certificateIssueMonth: "", status: "incomplete" },
        ]);
    };

    const handleRemoveSpecialized = (index: number) => {
        onSpecializedChange(specializedTraining.filter((_, i) => i !== index));
    };

    const handleUpdateSpecialized = (index: number, field: keyof BankingSpecializedTrainingData, value: unknown) => {
        const updated = [...specializedTraining];
        updated[index] = { ...updated[index], [field]: value };
        onSpecializedChange(updated);
    };

    return (
        <div className="space-y-6">
            {/* Academic Education Section */}
            <FormSection
                title="Academic Education"
                description="Degree/Diploma/Postgraduate Diploma – Banking and Finance"
                icon={<GraduationCap className="h-5 w-5" />}
            >
                <DynamicList
                    items={academicEducation}
                    onAdd={handleAddAcademic}
                    onRemove={handleRemoveAcademic}
                    addLabel="Add Academic Education"
                    emptyMessage="No academic education added yet."
                    maxItems={10}
                    renderItem={(edu, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`degreeDiploma-${index}`}>
                                        Degree/Diploma <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`degreeDiploma-${index}`}
                                        placeholder="e.g., BSc in Banking and Finance"
                                        value={edu.degreeDiploma}
                                        onChange={(e) => handleUpdateAcademic(index, "degreeDiploma", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`institution-${index}`}>
                                        Institution <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`institution-${index}`}
                                        placeholder="e.g., University of Colombo"
                                        value={edu.institution}
                                        onChange={(e) => handleUpdateAcademic(index, "institution", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`status-${index}`}>
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={edu.status}
                                        onValueChange={(value) => handleUpdateAcademic(index, "status", value)}
                                    >
                                        <SelectTrigger id={`status-${index}`}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            {/* Professional Education Section */}
            <FormSection
                title="Professional Education"
                description="Professional Banking Programs / Specialist Diplomas / International Professional Qualifications"
                icon={<Award className="h-5 w-5" />}
            >
                <DynamicList
                    items={professionalEducation}
                    onAdd={handleAddProfessional}
                    onRemove={handleRemoveProfessional}
                    addLabel="Add Professional Education"
                    emptyMessage="No professional education added yet."
                    maxItems={10}
                    renderItem={(edu, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`professionalQualification-${index}`}>
                                        Professional Qualification <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`professionalQualification-${index}`}
                                        placeholder="e.g., CIMA, ACIB, CIB"
                                        value={edu.professionalQualification}
                                        onChange={(e) => handleUpdateProfessional(index, "professionalQualification", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`profInstitution-${index}`}>
                                        Institution <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`profInstitution-${index}`}
                                        placeholder="e.g., CIMA, Institute of Bankers"
                                        value={edu.institution}
                                        onChange={(e) => handleUpdateProfessional(index, "institution", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`profStatus-${index}`}>
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={edu.status}
                                        onValueChange={(value) => handleUpdateProfessional(index, "status", value)}
                                    >
                                        <SelectTrigger id={`profStatus-${index}`}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            {/* Specialized Training Section */}
            <FormSection
                title="Specialized Banking Training / Certificates"
                description="Certificates, Training Programs, and Specialized Banking Qualifications"
                icon={<FileText className="h-5 w-5" />}
            >
                <DynamicList
                    items={specializedTraining}
                    onAdd={handleAddSpecialized}
                    onRemove={handleRemoveSpecialized}
                    addLabel="Add Specialized Training"
                    emptyMessage="No specialized training added yet."
                    maxItems={10}
                    renderItem={(training, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`certificateName-${index}`}>
                                        Certificate / Training Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`certificateName-${index}`}
                                        placeholder="e.g., Credit Risk Management Certificate"
                                        value={training.certificateName}
                                        onChange={(e) => handleUpdateSpecialized(index, "certificateName", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`issuingAuthority-${index}`}>
                                        Issuing Authority / Institution <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`issuingAuthority-${index}`}
                                        placeholder="e.g., Institute of Banking Studies"
                                        value={training.issuingAuthority}
                                        onChange={(e) => handleUpdateSpecialized(index, "issuingAuthority", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`certificateIssueMonth-${index}`}>
                                        Issue / Completion Month
                                    </Label>
                                    <Input
                                        id={`certificateIssueMonth-${index}`}
                                        type="month"
                                        value={training.certificateIssueMonth}
                                        onChange={(e) => handleUpdateSpecialized(index, "certificateIssueMonth", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`trainStatus-${index}`}>
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={training.status}
                                        onValueChange={(value) => handleUpdateSpecialized(index, "status", value)}
                                    >
                                        <SelectTrigger id={`trainStatus-${index}`}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <StepNavigation
                currentStep={4}
                totalSteps={7}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </div>
    );
}
