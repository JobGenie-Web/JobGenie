"use client";

import { Medal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "../shared/FormSection";
import { DynamicList } from "../shared/DynamicList";
import { StepNavigation } from "../shared/StepNavigation";
import type { CertificateData } from "@/lib/validations/profile-schema";

interface CertificatesStepProps {
    certificates: CertificateData[];
    onChange: (certificates: CertificateData[]) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const emptyCertificate: CertificateData = {
    certificateName: "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: null,
    credentialId: "",
    credentialUrl: "",
    description: "",
};

export function CertificatesStep({ certificates, onChange, onNext, onPrevious }: CertificatesStepProps) {
    const handleAdd = () => {
        onChange([...certificates, { ...emptyCertificate }]);
    };

    const handleRemove = (index: number) => {
        onChange(certificates.filter((_, i) => i !== index));
    };

    const handleUpdate = (index: number, field: keyof CertificateData, value: unknown) => {
        const updated = [...certificates];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <div className="space-y-6">
            <FormSection
                title="Certifications"
                description="Add your professional certifications (AWS, Azure, Google, etc.)"
            >
                <DynamicList
                    items={certificates}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    addLabel="Add Certificate"
                    emptyMessage="No certificates added yet. Add your professional certifications."
                    maxItems={15}
                    renderItem={(cert, index) => (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`certificateName-${index}`}>
                                        Certificate Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`certificateName-${index}`}
                                        value={cert.certificateName}
                                        onChange={(e) => handleUpdate(index, "certificateName", e.target.value)}
                                        placeholder="e.g., AWS Solutions Architect"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`issuingAuthority-${index}`}>Issuing Authority</Label>
                                    <Input
                                        id={`issuingAuthority-${index}`}
                                        value={cert.issuingAuthority || ""}
                                        onChange={(e) => handleUpdate(index, "issuingAuthority", e.target.value)}
                                        placeholder="e.g., Amazon Web Services"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`issueDate-${index}`}>Issue Date</Label>
                                    <Input
                                        id={`issueDate-${index}`}
                                        type="date"
                                        value={cert.issueDate || ""}
                                        onChange={(e) => handleUpdate(index, "issueDate", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`expiryDate-${index}`}>Expiry Date</Label>
                                    <Input
                                        id={`expiryDate-${index}`}
                                        type="date"
                                        value={cert.expiryDate || ""}
                                        onChange={(e) => handleUpdate(index, "expiryDate", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`credentialId-${index}`}>Credential ID</Label>
                                    <Input
                                        id={`credentialId-${index}`}
                                        value={cert.credentialId || ""}
                                        onChange={(e) => handleUpdate(index, "credentialId", e.target.value)}
                                        placeholder="Certificate ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`credentialUrl-${index}`}>Credential URL</Label>
                                    <Input
                                        id={`credentialUrl-${index}`}
                                        value={cert.credentialUrl || ""}
                                        onChange={(e) => handleUpdate(index, "credentialUrl", e.target.value)}
                                        placeholder="https://verify.example.com/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`description-${index}`}>Description</Label>
                                <Textarea
                                    id={`description-${index}`}
                                    value={cert.description || ""}
                                    onChange={(e) => handleUpdate(index, "description", e.target.value)}
                                    placeholder="Brief description (optional)"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                />
            </FormSection>

            <StepNavigation
                currentStep={7}
                totalSteps={10}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </div>
    );
}
