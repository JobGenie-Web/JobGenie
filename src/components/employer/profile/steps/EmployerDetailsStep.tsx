"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { ProfileImageUpload } from "../ProfileImageUpload";

interface EmployerDetailsStepProps {
    data: {
        department: string;
        profile_image_url: string;
        address: string;
    };
    onChange: (data: EmployerDetailsStepProps["data"]) => void;
    onFileSelect: (file: File | null) => void; // Separate file handler
    onPrevious: () => void;
    onSubmit: () => void;
    isLoading: boolean;
    employerName: string; // For display
}

export function EmployerDetailsStep({
    data,
    onChange,
    onFileSelect,
    onPrevious,
    onSubmit,
    isLoading,
    employerName,
}: EmployerDetailsStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof typeof data, value: string) => {
        onChange({ ...data, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Department is optional, but if provided, check length
        if (data.department && data.department.trim().length < 2) {
            newErrors.department = "Department must be at least 2 characters";
        }

        // Address is optional, but if provided, check length
        if (data.address && data.address.trim().length < 10) {
            newErrors.address = "Address must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSubmit();
        }
    };

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="text-xl font-semibold">Complete Your Profile</h2>
                        <p className="text-sm text-muted-foreground">{employerName}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Profile Image */}
                    <div className="space-y-2">
                        <Label>Profile Picture</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                            Upload a professional photo for your profile
                        </p>
                        <ProfileImageUpload
                            onImageSelect={onFileSelect}
                            currentImageUrl={data.profile_image_url}
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">Department / Division</Label>
                        <Input
                            id="department"
                            placeholder="e.g., Human Resources, Operations, IT"
                            value={data.department}
                            onChange={(e) => handleChange("department", e.target.value)}
                            className={errors.department ? "border-destructive" : ""}
                        />
                        {errors.department && (
                            <p className="text-sm text-destructive">{errors.department}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            The department or division you work in (optional)
                        </p>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Personal Address</Label>
                        <Textarea
                            id="address"
                            placeholder="Enter your personal address"
                            value={data.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            className={errors.address ? "border-destructive" : ""}
                            rows={3}
                        />
                        {errors.address && (
                            <p className="text-sm text-destructive">{errors.address}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Your personal address (optional, defaults to company address)
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
                        Previous
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="min-w-32">
                        {isLoading ? "Completing Profile..." : "Complete Profile"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
