"use client";

import { ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "../shared/FormSection";
import { DynamicList } from "../shared/DynamicList";
import { StepNavigation } from "../shared/StepNavigation";
import type { ComplianceTrainingData } from "@/lib/validations/profile-schema";

interface ComplianceStepProps {
    trainings: ComplianceTrainingData[];
    onChange: (trainings: ComplianceTrainingData[]) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const TRAINING_TYPES = [
    { value: "aml_cft", label: "AML/CFT" },
    { value: "kyc", label: "KYC (Know Your Customer)" },
    { value: "data_privacy", label: "Data Privacy / GDPR" },
    { value: "fraud_prevention", label: "Fraud Prevention" },
    { value: "sanctions_screening", label: "Sanctions Screening" },
    { value: "code_of_conduct", label: "Code of Conduct" },
    { value: "information_security", label: "Information Security" },
    { value: "regulatory_updates", label: "Regulatory Updates" },
    { value: "market_abuse", label: "Market Abuse" },
    { value: "insider_trading", label: "Insider Trading" },
    { value: "risk_management", label: "Risk Management" },
    { value: "credit_risk", label: "Credit Risk" },
    { value: "operational_risk", label: "Operational Risk" },
    { value: "other", label: "Other" },
];

const emptyTraining: ComplianceTrainingData = {
    trainingName: "",
    trainingType: "aml_cft",
    provider: "",
    completionDate: "",
    validityPeriod: "",
    expiryDate: null,
    certificateUrl: "",
};

export function ComplianceStep({ trainings, onChange, onNext, onPrevious }: ComplianceStepProps) {
    const handleAdd = () => {
        onChange([...trainings, { ...emptyTraining }]);
    };

    const handleRemove = (index: number) => {
        onChange(trainings.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, field: keyof ComplianceTrainingData, value: unknown) => {
        const updated = [...trainings];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <FormSection
                title="Compliance Training"
                description="Add your compliance and regulatory training certifications"
            >
                <DynamicList
                    items={trainings}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    addLabel="Add Training"
                    emptyMessage="No compliance training added yet."
                    maxItems={15}
                    renderItem={(training, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`trainingType-${index}`}>Training Type</Label>
                                    <Select
                                        value={training.trainingType}
                                        onValueChange={(value) => handleUpdate(index, "trainingType", value)}
                                    >
                                        <SelectTrigger id={`trainingType-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TRAINING_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`trainingName-${index}`}>
                                        Training Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`trainingName-${index}`}
                                        value={training.trainingName}
                                        onChange={(e) => handleUpdate(index, "trainingName", e.target.value)}
                                        placeholder="e.g., Annual AML Certification"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`provider-${index}`}>Training Provider</Label>
                                <Input
                                    id={`provider-${index}`}
                                    value={training.provider || ""}
                                    onChange={(e) => handleUpdate(index, "provider", e.target.value)}
                                    placeholder="e.g., ACAMS, Thomson Reuters"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor={`completionDate-${index}`}>Completion Date</Label>
                                    <Input
                                        id={`completionDate-${index}`}
                                        type="date"
                                        value={training.completionDate || ""}
                                        onChange={(e) => handleUpdate(index, "completionDate", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`validityPeriod-${index}`}>Validity Period</Label>
                                    <Input
                                        id={`validityPeriod-${index}`}
                                        value={training.validityPeriod || ""}
                                        onChange={(e) => handleUpdate(index, "validityPeriod", e.target.value)}
                                        placeholder="e.g., Annual, 2 years"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`expiryDate-${index}`}>Expiry Date</Label>
                                    <Input
                                        id={`expiryDate-${index}`}
                                        type="date"
                                        value={training.expiryDate || ""}
                                        onChange={(e) => handleUpdate(index, "expiryDate", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`certificateUrl-${index}`}>Certificate URL</Label>
                                <Input
                                    id={`certificateUrl-${index}`}
                                    value={training.certificateUrl || ""}
                                    onChange={(e) => handleUpdate(index, "certificateUrl", e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <StepNavigation
                currentStep={10}
                totalSteps={11}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </div>
    );
}
