import { FileText } from "lucide-react";
import { CandidateLayout } from "@/components/candidate";
import { PortalRichPlaceholder } from "@/components/shared/PortalRichPlaceholder";

export default function ApplicationsPage() {
    return (
        <CandidateLayout
            pageTitle="My Applications"
            pageDescription="Track the status of your job applications"
        >
            <PortalRichPlaceholder
                icon={FileText}
                title="No applications logged yet"
                description="Once you apply to published roles, each submission will land here with its current stage. Until then, nurture warm conversations inside Invitations."
                primaryAction={{ label: "View invitations", href: "/candidate/invitations" }}
                secondaryAction={{ label: "Open calendar", href: "/candidate/calendar" }}
            />
        </CandidateLayout>
    );
}
