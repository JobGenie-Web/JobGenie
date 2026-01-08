"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMISUser, type ActionState } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

// Individual field component for consistent styling
function FormField({
    label,
    id,
    error,
    children,
    required = true,
}: {
    label: string;
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

export function AddMISUserForm() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
        addMISUser,
        null
    );

    // Handle redirect on success
    useEffect(() => {
        if (state?.success && state.redirectTo) {
            // Small delay to show success message before redirect
            const timer = setTimeout(() => {
                router.push(state.redirectTo!);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    // Combine server and client errors
    const errors = state?.errors || {};

    return (
        <form action={formAction} className="space-y-4">
            {/* Success/Error Message */}
            {state?.message && (
                <div
                    className={cn(
                        "rounded-lg p-3 text-sm flex items-start gap-2",
                        state.success
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-destructive/10 text-destructive"
                    )}
                >
                    {state.success && <Mail className="h-4 w-4 mt-0.5" />}
                    <span>{state.message}</span>
                </div>
            )}

            {/* Information Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">📨 Invitation Email Process</p>
                <p className="text-xs">An invitation email will be sent to the provided email address with instructions to set up their password.</p>
            </div>

            {/* Name Fields - Row */}
            <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" id="firstName" error={errors.firstName}>
                    <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        aria-invalid={!!errors.firstName}
                    />
                </FormField>

                <FormField label="Last Name" id="lastName" error={errors.lastName}>
                    <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        aria-invalid={!!errors.lastName}
                    />
                </FormField>
            </div>

            {/* Email */}
            <FormField label="Email Address" id="email" error={errors.email}>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    aria-invalid={!!errors.email}
                />
            </FormField>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Invitation...
                    </>
                ) : (
                    <>
                        <Mail className="h-4 w-4" />
                        Send Invitation
                    </>
                )}
            </Button>
        </form>
    );
}
