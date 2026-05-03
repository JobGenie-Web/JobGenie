/**
 * Maps invitation + optional job offer to a single human-readable pipeline label
 * for candidates and employers (same underlying job_invitations / job_offers data).
 */

export type EmbeddedOffer = { status: string } | null | undefined;

export type InvitationJourneyFields = {
    status: string;
    invitation_canceled: boolean;
    interview_confirmed: boolean;
    mis_rescheduled?: boolean;
    pipeline_status?: string | null;
    current_round_number?: number | null;
    candidate_reschedule_requested?: boolean;
};

export function normalizeEmbeddedOffer(raw: unknown): { status: string } | null {
    if (raw == null) return null;
    if (Array.isArray(raw)) {
        const first = raw[0];
        if (first && typeof first === "object" && "status" in first) {
            return { status: String((first as { status: string }).status) };
        }
        return null;
    }
    if (typeof raw === "object" && raw !== null && "status" in raw) {
        return { status: String((raw as { status: string }).status) };
    }
    return null;
}

export type JourneyDisplay = {
    label: string;
    /** For styling badges consistently */
    variant: "pending" | "info" | "success" | "warning" | "danger" | "muted";
};

export function getInvitationJourneyDisplay(
    inv: InvitationJourneyFields,
    offer?: EmbeddedOffer
): JourneyDisplay {
    const pipeline = inv.pipeline_status ?? "active";
    const round = Math.max(1, inv.current_round_number ?? 1);

    if (inv.invitation_canceled && inv.mis_rescheduled) {
        return { label: "Rescheduled", variant: "success" };
    }
    if (inv.invitation_canceled) {
        return { label: "Canceled", variant: "muted" };
    }

    if (inv.status === "declined") {
        if (inv.candidate_reschedule_requested) {
            return { label: "Reschedule requested", variant: "warning" };
        }
        return { label: "Declined", variant: "danger" };
    }

    if (pipeline === "rejected") {
        return { label: "Rejected", variant: "danger" };
    }

    const offerStatus = offer?.status;

    if (offerStatus === "accepted" || pipeline === "hired") {
        return { label: "Job accepted", variant: "success" };
    }

    if (offerStatus === "declined") {
        return { label: "Job rejected", variant: "danger" };
    }

    if (pipeline === "offered" || offerStatus === "pending") {
        return { label: "Job offered", variant: "warning" };
    }

    if (pipeline === "withdrawn" && !offerStatus) {
        return { label: "Withdrawn", variant: "muted" };
    }

    if (inv.status === "accepted" && inv.interview_confirmed && pipeline === "active") {
        return { label: `Interview · Round ${round}`, variant: "info" };
    }

    if (inv.status === "accepted" && !inv.interview_confirmed) {
        return { label: "Accepted", variant: "success" };
    }

    if (inv.status === "pending" || inv.status === "viewed") {
        return { label: "Pending", variant: "pending" };
    }

    if (pipeline === "expired") {
        return { label: "Expired", variant: "muted" };
    }

    return { label: "Pending", variant: "pending" };
}

export function journeyVariantToCandidateClasses(v: JourneyDisplay["variant"]): string {
    switch (v) {
        case "success":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "warning":
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
        case "danger":
            return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
        case "info":
            return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300";
        case "muted":
            return "bg-muted text-muted-foreground";
        case "pending":
        default:
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
}

export function journeyVariantToEmployerBadgeProps(
    v: JourneyDisplay["variant"]
): { variant: "default" | "secondary" | "destructive"; className: string } {
    const map: Record<
        JourneyDisplay["variant"],
        { variant: "default" | "secondary" | "destructive"; className: string }
    > = {
        pending: {
            variant: "secondary",
            className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        },
        info: {
            variant: "default",
            className: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
        },
        success: {
            variant: "default",
            className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        },
        warning: {
            variant: "default",
            className: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
        },
        danger: {
            variant: "destructive",
            className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        },
        muted: {
            variant: "secondary",
            className: "bg-muted text-muted-foreground",
        },
    };
    return map[v] ?? map.pending;
}
