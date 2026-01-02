"use client";

import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "../shared/FormSection";
import { DynamicList } from "../shared/DynamicList";
import { StepNavigation } from "../shared/StepNavigation";
import type { FinancialLicenseData } from "@/lib/validations/profile-schema";

interface LicensesStepProps {
    licenses: FinancialLicenseData[];
    onChange: (licenses: FinancialLicenseData[]) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const LICENSE_TYPES = [
    { value: "cfa", label: "CFA (Chartered Financial Analyst)" },
    { value: "cpa", label: "CPA (Certified Public Accountant)" },
    { value: "acca", label: "ACCA" },
    { value: "cima", label: "CIMA" },
    { value: "frm", label: "FRM (Financial Risk Manager)" },
    { value: "cfp", label: "CFP (Certified Financial Planner)" },
    { value: "caia", label: "CAIA" },
    { value: "cma", label: "CMA" },
    { value: "cia", label: "CIA (Certified Internal Auditor)" },
    { value: "aml_certification", label: "AML Certification" },
    { value: "securities_license", label: "Securities License" },
    { value: "banking_license", label: "Banking License" },
    { value: "insurance_license", label: "Insurance License" },
    { value: "other", label: "Other" },
];

const LICENSE_STATUSES = [
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "pending_renewal", label: "Pending Renewal" },
];

const emptyLicense: FinancialLicenseData = {
    licenseType: "cfa",
    licenseName: "",
    issuingAuthority: "",
    licenseNumber: "",
    issueDate: "",
    expiryDate: null,
    status: "active",
};

export function LicensesStep({ licenses, onChange, onNext, onPrevious }: LicensesStepProps) {
    const handleAdd = () => {
        onChange([...licenses, { ...emptyLicense }]);
    };

    const handleRemove = (index: number) => {
        onChange(licenses.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, field: keyof FinancialLicenseData, value: unknown) => {
        const updated = [...licenses];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <FormSection
                title="Financial Licenses & Certifications"
                description="Add your professional financial licenses and certifications"
            >
                <DynamicList
                    items={licenses}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    addLabel="Add License"
                    emptyMessage="No licenses added yet. Add your professional certifications."
                    maxItems={10}
                    renderItem={(license, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`licenseType-${index}`}>License Type</Label>
                                    <Select
                                        value={license.licenseType}
                                        onValueChange={(value) => handleUpdate(index, "licenseType", value)}
                                    >
                                        <SelectTrigger id={`licenseType-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LICENSE_TYPES.map((type) => (
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
                                        value={license.status}
                                        onValueChange={(value) => handleUpdate(index, "status", value)}
                                    >
                                        <SelectTrigger id={`status-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LICENSE_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`licenseName-${index}`}>
                                    License Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={`licenseName-${index}`}
                                    value={license.licenseName}
                                    onChange={(e) => handleUpdate(index, "licenseName", e.target.value)}
                                    placeholder="e.g., CFA Level 3"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`issuingAuthority-${index}`}>
                                    Issuing Authority <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={`issuingAuthority-${index}`}
                                    value={license.issuingAuthority}
                                    onChange={(e) => handleUpdate(index, "issuingAuthority", e.target.value)}
                                    placeholder="e.g., CFA Institute"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor={`licenseNumber-${index}`}>License Number</Label>
                                    <Input
                                        id={`licenseNumber-${index}`}
                                        value={license.licenseNumber || ""}
                                        onChange={(e) => handleUpdate(index, "licenseNumber", e.target.value)}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`issueDate-${index}`}>Issue Date</Label>
                                    <Input
                                        id={`issueDate-${index}`}
                                        type="date"
                                        value={license.issueDate || ""}
                                        onChange={(e) => handleUpdate(index, "issueDate", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`expiryDate-${index}`}>Expiry Date</Label>
                                    <Input
                                        id={`expiryDate-${index}`}
                                        type="date"
                                        value={license.expiryDate || ""}
                                        onChange={(e) => handleUpdate(index, "expiryDate", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <StepNavigation
                currentStep={8}
                totalSteps={11}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </div>
    );
}
