"use client";

import { TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "../shared/FormSection";
import { DynamicList } from "../shared/DynamicList";
import { StepNavigation } from "../shared/StepNavigation";
import type { BankingSkillData } from "@/lib/validations/profile-schema";

interface BankingSkillsStepProps {
    skills: BankingSkillData[];
    onChange: (skills: BankingSkillData[]) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const SKILL_CATEGORIES = [
    { value: "retail_banking", label: "Retail Banking" },
    { value: "corporate_banking", label: "Corporate Banking" },
    { value: "investment_banking", label: "Investment Banking" },
    { value: "private_banking", label: "Private Banking" },
    { value: "credit_analysis", label: "Credit Analysis" },
    { value: "financial_modeling", label: "Financial Modeling" },
    { value: "risk_assessment", label: "Risk Assessment" },
    { value: "portfolio_management", label: "Portfolio Management" },
    { value: "aml_kyc", label: "AML / KYC" },
    { value: "regulatory_compliance", label: "Regulatory Compliance" },
    { value: "forex_trading", label: "Forex Trading" },
    { value: "securities_trading", label: "Securities Trading" },
    { value: "derivatives", label: "Derivatives" },
    { value: "core_banking_systems", label: "Core Banking Systems" },
    { value: "wealth_management", label: "Wealth Management" },
    { value: "trade_finance", label: "Trade Finance" },
    { value: "treasury_operations", label: "Treasury Operations" },
    { value: "other", label: "Other" },
];

const PROFICIENCY_LEVELS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
];

const emptySkill: BankingSkillData = {
    skillCategory: "retail_banking",
    skillName: "",
    proficiencyLevel: "intermediate",
    yearsExperience: 0,
};

export function BankingSkillsStep({ skills, onChange, onNext, onPrevious }: BankingSkillsStepProps) {
    const handleAdd = () => {
        onChange([...skills, { ...emptySkill }]);
    };

    const handleRemove = (index: number) => {
        onChange(skills.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, field: keyof BankingSkillData, value: unknown) => {
        const updated = [...skills];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <FormSection
                title="Banking & Finance Skills"
                description="Add your specialized skills in banking and finance"
            >
                <DynamicList
                    items={skills}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    addLabel="Add Skill"
                    emptyMessage="No skills added yet. Add your banking/finance skills."
                    maxItems={15}
                    renderItem={(skill, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`skillCategory-${index}`}>Category</Label>
                                    <Select
                                        value={skill.skillCategory}
                                        onValueChange={(value) => handleUpdate(index, "skillCategory", value)}
                                    >
                                        <SelectTrigger id={`skillCategory-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SKILL_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`skillName-${index}`}>
                                        Skill Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`skillName-${index}`}
                                        value={skill.skillName}
                                        onChange={(e) => handleUpdate(index, "skillName", e.target.value)}
                                        placeholder="e.g., Credit Risk Analysis"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`proficiencyLevel-${index}`}>Proficiency Level</Label>
                                    <Select
                                        value={skill.proficiencyLevel}
                                        onValueChange={(value) => handleUpdate(index, "proficiencyLevel", value)}
                                    >
                                        <SelectTrigger id={`proficiencyLevel-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PROFICIENCY_LEVELS.map((level) => (
                                                <SelectItem key={level.value} value={level.value}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`yearsExperience-${index}`}>Years Experience</Label>
                                    <Input
                                        id={`yearsExperience-${index}`}
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={skill.yearsExperience || ""}
                                        onChange={(e) => handleUpdate(index, "yearsExperience", parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <StepNavigation
                currentStep={9}
                totalSteps={11}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </div>
    );
}
