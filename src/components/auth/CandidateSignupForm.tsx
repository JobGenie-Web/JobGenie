"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    candidateRegistrationSchema,
    calculatePasswordStrength,
    getStrengthLabel,
    getStrengthColor,
} from "@/lib/validations/candidate-schema";
import { registerCandidate, type ActionState } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

// Individual field component for consistent styling
function FormField({
    label,
    id,
    error,
    children,
    required = true,
}: {
    label: React.ReactNode;
    id: string;
    error?: string[];
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && error.length > 0 && (
                <p className="text-sm text-destructive">{error[0]}</p>
            )}
        </div>
    );
}

export function CandidateSignupForm() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
        registerCandidate,
        null
    );

    // Handle redirect on success
    useEffect(() => {
        if (state?.success && state.redirectTo) {
            localStorage.removeItem("candidate-signup-form");
            // Small delay to show success message before redirect
            const timer = setTimeout(() => {
                router.push(state.redirectTo!);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    // Form state for controlled inputs
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        nicPassport: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        contactNo: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("candidate-signup-form");
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch (e) { }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem("candidate-signup-form", JSON.stringify(formData));
    }, [formData]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Client-side validation state
    const [clientErrors, setClientErrors] = useState<Record<string, string[]>>({});

    // Password strength
    const passwordStrength = calculatePasswordStrength(formData.password);
    const strengthLabel = getStrengthLabel(passwordStrength);
    const strengthColor = getStrengthColor(passwordStrength);

    // Password match check
    const passwordsMatch = formData.password.length > 0 && formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
    const passwordsDontMatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

    // Combine server and client errors
    const errors = { ...clientErrors, ...state?.errors };

    // Real-time validation for specific fields
    const validateField = (name: string, value: string) => {
        try {
            const schema = candidateRegistrationSchema;
            const fieldSchema = schema.shape[name as keyof typeof schema.shape];
            if (fieldSchema) {
                fieldSchema.parse(value);
                setClientErrors((prev) => {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                });
            }
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'issues' in error) {
                const zodError = error as { issues: Array<{ message: string }> };
                setClientErrors((prev) => ({
                    ...prev,
                    [name]: zodError.issues.map((i) => i.message),
                }));
            }
        }
    };

    return (
        <form action={formAction} className="space-y-4">
            {/* Success/Error Message */}
            {state?.message && (
                <div
                    className={cn(
                        "rounded-lg p-3 text-sm",
                        state.success
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-destructive/10 text-destructive"
                    )}
                >
                    {state.message}
                </div>
            )}

            {/* Name Fields - Row */}
            <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" id="firstName" error={errors.firstName}>
                    <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        onBlur={(e) => validateField("firstName", e.target.value)}
                        aria-invalid={!!errors.firstName}
                    />
                </FormField>

                <FormField label="Last Name" id="lastName" error={errors.lastName}>
                    <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        onBlur={(e) => validateField("lastName", e.target.value)}
                        aria-invalid={!!errors.lastName}
                    />
                </FormField>
            </div>

            {/* NIC/Passport and Gender - Row */}
            <div className="grid grid-cols-2 gap-4">
                <FormField label="NIC/Passport" id="nicPassport" error={errors.nicPassport}>
                    <Input
                        id="nicPassport"
                        name="nicPassport"
                        placeholder="123456789V or 200012345678"
                        maxLength={12}
                        value={formData.nicPassport}
                        onChange={(e) => handleChange("nicPassport", e.target.value)}
                        onBlur={(e) => validateField("nicPassport", e.target.value)}
                        aria-invalid={!!errors.nicPassport}
                    />
                </FormField>

                <FormField label="Gender" id="gender" error={errors.gender}>
                    <input type="hidden" name="gender" value={formData.gender} />
                    <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                        <SelectTrigger id="gender" className="w-full" aria-invalid={!!errors.gender}>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>
            </div>

            {/* Date of Birth */}
            <FormField label="Date of Birth" id="dateOfBirth" error={errors.dateOfBirth}>
                <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    max="9999-12-31"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    onBlur={(e) => validateField("dateOfBirth", e.target.value)}
                    aria-invalid={!!errors.dateOfBirth}
                />
            </FormField>

            {/* Residential Address */}
            <FormField label="Residential Address" id="address" error={errors.address}>
                <Input
                    id="address"
                    name="address"
                    placeholder="123 Main Street, City"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    onBlur={(e) => validateField("address", e.target.value)}
                    aria-invalid={!!errors.address}
                />
            </FormField>

            {/* Contact Number and Email - Row */}
            <div className="grid grid-cols-2 gap-4">
                <FormField label={<>Contact No <span className="text-xs text-muted-foreground font-normal ml-1">( Format: +94XXXXXXXXX )</span></>} id="contactNo" error={errors.contactNo}>
                    <Input
                        id="contactNo"
                        name="contactNo"
                        type="tel"
                        maxLength={15}
                        placeholder="+94771234567"
                        value={formData.contactNo}
                        onChange={(e) => handleChange("contactNo", e.target.value)}
                        onBlur={(e) => validateField("contactNo", e.target.value)}
                        aria-invalid={!!errors.contactNo}
                    />
                </FormField>

                <FormField label="Email" id="email" error={errors.email}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={(e) => validateField("email", e.target.value)}
                        aria-invalid={!!errors.email}
                    />
                </FormField>
            </div>

            {/* Password */}
            <FormField label="Password" id="password" error={errors.password}>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        onBlur={(e) => validateField("password", e.target.value)}
                        className="pr-10"
                        aria-invalid={!!errors.password}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>

                {/* Password Validation Message */}
                <p className="text-xs text-muted-foreground mt-2 mb-2">
                    Minimum 8 characters, must include atleast an uppercase, a lowercase, a number and a special character
                </p>

                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={cn(
                                        "h-1.5 flex-1 rounded-full transition-colors",
                                        level <= passwordStrength ? strengthColor : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Password strength: <span className="font-medium">{strengthLabel}</span>
                        </p>
                    </div>
                )}
            </FormField>

            {/* Confirm Password */}
            <FormField label="Confirm Password" id="confirmPassword" error={errors.confirmPassword}>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className={cn(
                            "pr-16",
                            passwordsMatch && "border-green-500 focus-visible:ring-green-500/50",
                            passwordsDontMatch && "border-destructive focus-visible:ring-destructive/50"
                        )}
                        aria-invalid={passwordsDontMatch || !!errors.confirmPassword}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {formData.confirmPassword.length > 0 && (
                            <span className={cn(
                                "flex items-center",
                                passwordsMatch ? "text-green-500" : "text-destructive"
                            )}>
                                {passwordsMatch ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword.length > 0 && (
                    <p className={cn(
                        "text-xs mt-1",
                        passwordsMatch ? "text-green-500" : "text-destructive"
                    )}>
                        {passwordsMatch ? "Passwords match ✓" : "Passwords do not match"}
                    </p>
                )}
            </FormField>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>
        </form>
    );
}
