"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { User, Eye, EyeOff } from "lucide-react";
import {
    calculatePasswordStrength,
    getStrengthLabel,
    getStrengthColor,
} from "@/lib/validations/employer-schema";

interface EmployerProfileStepProps {
    data: {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        password: string;
        confirmPassword: string;
        jobTitle: string;
    };
    onChange: (data: EmployerProfileStepProps["data"]) => void;
    onPrevious: () => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export function EmployerProfileStep({
    data,
    onChange,
    onPrevious,
    onSubmit,
    isLoading,
}: EmployerProfileStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordStrength = calculatePasswordStrength(data.password);
    const strengthLabel = getStrengthLabel(passwordStrength);
    const strengthColor = getStrengthColor(passwordStrength);

    const handleChange = (field: keyof typeof data, value: string) => {
        onChange({ ...data, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!data.firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (data.firstName.length < 2) {
            newErrors.firstName = "First name must be at least 2 characters";
        }

        if (!data.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (data.lastName.length < 2) {
            newErrors.lastName = "Last name must be at least 2 characters";
        }

        if (!data.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[+]?[\d\s-]+$/.test(data.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        if (!data.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!data.password) {
            newErrors.password = "Password is required";
        } else if (data.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/[a-z]/.test(data.password)) {
            newErrors.password = "Password must contain at least one lowercase letter";
        } else if (!/[A-Z]/.test(data.password)) {
            newErrors.password = "Password must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(data.password)) {
            newErrors.password = "Password must contain at least one number";
        }

        if (!data.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (data.password !== data.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!data.jobTitle.trim()) {
            newErrors.jobTitle = "Job title is required";
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
                    <h2 className="text-xl font-semibold">Your Information</h2>
                </div>

                <div className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                First Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                placeholder="Enter first name"
                                value={data.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                className={errors.firstName ? "border-destructive" : ""}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">{errors.firstName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Last Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                placeholder="Enter last name"
                                value={data.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                className={errors.lastName ? "border-destructive" : ""}
                            />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter phone number"
                            value={data.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@company.com"
                            value={data.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    {/* Job Title */}
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">
                            Job Title / Designation <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="jobTitle"
                            placeholder="e.g., HR Manager, CEO, Recruiter"
                            value={data.jobTitle}
                            onChange={(e) => handleChange("jobTitle", e.target.value)}
                            className={errors.jobTitle ? "border-destructive" : ""}
                        />
                        {errors.jobTitle && (
                            <p className="text-sm text-destructive">{errors.jobTitle}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                value={data.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className={errors.password ? "border-destructive pr-10" : "pr-10"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password}</p>
                        )}

                        {/* Password Strength Indicator */}
                        {data.password && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Password Strength:</span>
                                    <span className="font-medium">{strengthLabel}</span>
                                </div>
                                <Progress value={(passwordStrength / 5) * 100} className="h-1.5" />
                                <div
                                    className={`h-1.5 rounded-full transition-all ${strengthColor}`}
                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                            Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter your password"
                                value={data.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={onPrevious}
                        disabled={isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="min-w-32"
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
