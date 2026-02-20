"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function UpgradeProCard() {
    return (
        <div className="rounded-2xl overflow-hidden shadow-sm">
            {/* Gradient background */}
            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-700 dark:via-purple-700 dark:to-indigo-800 p-5">
                {/* Subtle decorative circles */}
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-white/5 blur-xl" />

                {/* Icon */}
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 mb-3">
                    <Zap className="h-4 w-4 text-white" fill="white" />
                </div>

                {/* Text */}
                <h3 className="relative text-sm font-bold text-white">Upgrade to Pro</h3>
                <p className="relative mt-1 text-xs text-white/80 leading-relaxed">
                    Get noticed faster with featured applications and priority support.
                </p>

                {/* CTA */}
                <Link
                    href="/candidate/settings"
                    className="relative mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-xs font-bold text-violet-700 hover:bg-white/90 transition-colors"
                >
                    View Plans
                </Link>
            </div>
        </div>
    );
}
