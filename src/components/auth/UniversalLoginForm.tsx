"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { universalLogin, type ActionState } from "@/app/actions/universal-auth";
import { cn } from "@/lib/utils";

export function UniversalLoginForm({ returnUrl }: { returnUrl?: string }) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [state, setState] = useState<ActionState | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                const result = await universalLogin(null, formData);
                setState(result);
            } catch {
                toast.error("Invalid email or password. Please try again.");
            }
        });
    };

    useEffect(() => {
        if (!state) return;
        if (state.success && state.redirectTo) {
            toast.success(state.message);
            setTimeout(() => router.push(state.redirectTo!), 300);
        } else if (!state.success) {
            toast.error(state.message);
            if (state.redirectTo) setTimeout(() => router.push(state.redirectTo!), 1500);
        }
    }, [state, router]);

    return (
        <form action={handleSubmit} className="space-y-4">
            {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}

            {/* Email */}
            <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Email Address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={isPending}
                    autoComplete="email"
                    className={cn(
                        "w-full rounded-xl border border-white/[0.10] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/25",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                        "disabled:opacity-50 transition-colors",
                    )}
                />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-white/60 uppercase tracking-wide">
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        disabled={isPending}
                        autoComplete="current-password"
                        className={cn(
                            "w-full rounded-xl border border-white/[0.10] bg-white/[0.05] px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/25",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                            "disabled:opacity-50 transition-colors",
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        disabled={isPending}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className={cn(
                    "relative w-full rounded-xl py-2.5 px-4 text-sm font-semibold transition-all",
                    "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.99]",
                    "shadow-lg shadow-primary/20",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2",
                )}
            >
                {isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
                ) : (
                    <><LogIn className="h-4 w-4" />Sign In</>
                )}
            </button>
        </form>
    );
}
