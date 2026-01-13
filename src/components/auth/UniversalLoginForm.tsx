"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { universalLogin } from "@/app/actions/universal-auth";

export function UniversalLoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction, isPending] = useActionState(universalLogin, null);

    // Handle redirects and show messages using useEffect
    useEffect(() => {
        if (!state) return;

        if (state.success && state.redirectTo) {
            toast.success(state.message);
            // Small delay for better UX
            setTimeout(() => {
                router.push(state.redirectTo!);
                router.refresh();
            }, 300);
        } else if (!state.success) {
            toast.error(state.message);
            if (state.redirectTo) {
                setTimeout(() => {
                    router.push(state.redirectTo!);
                }, 1500);
            }
        }
    }, [state, router]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    disabled={isPending}
                    autoComplete="email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        disabled={isPending}
                        autoComplete="current-password"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        disabled={isPending}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    );
}
