"use client";

import { Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "../shared/FormSection";
import { DynamicList } from "../shared/DynamicList";
import { StepNavigation } from "../shared/StepNavigation";
import type { AwardData } from "@/lib/validations/profile-schema";

interface AwardsStepProps {
    awards: AwardData[];
    onChange: (awards: AwardData[]) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const emptyAward: AwardData = {
    natureOfAward: "",
    offeredBy: "",
    description: "",
};

export function AwardsStep({ awards, onChange, onNext, onPrevious }: AwardsStepProps) {
    const handleAdd = () => {
        onChange([...awards, { ...emptyAward }]);
    };

    const handleRemove = (index: number) => {
        onChange(awards.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, field: keyof AwardData, value: string) => {
        const updated = [...awards];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <FormSection
                title="Awards & Achievements"
                description="Highlight your recognitions and accomplishments (optional)"
            >
                <DynamicList
                    items={awards}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    addLabel="Add Award"
                    emptyMessage="No awards added yet. This section is optional."
                    maxItems={10}
                    renderItem={(award, index) => (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor={`natureOfAward-${index}`}>
                                    Award Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={`natureOfAward-${index}`}
                                    value={award.natureOfAward}
                                    onChange={(e) => handleUpdate(index, "natureOfAward", e.target.value)}
                                    placeholder="e.g., Employee of the Year"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`offeredBy-${index}`}>Offered By</Label>
                                <Input
                                    id={`offeredBy-${index}`}
                                    value={award.offeredBy || ""}
                                    onChange={(e) => handleUpdate(index, "offeredBy", e.target.value)}
                                    placeholder="Organization or institution"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`description-${index}`}>Description</Label>
                                <Textarea
                                    id={`description-${index}`}
                                    value={award.description || ""}
                                    onChange={(e) => handleUpdate(index, "description", e.target.value)}
                                    placeholder="Brief description of the achievement"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <StepNavigation
                currentStep={5}
                totalSteps={10}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </div>
    );
}
