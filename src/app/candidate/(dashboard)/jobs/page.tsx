import { Briefcase } from "lucide-react";
import { CandidateLayout } from "@/components/candidate";
import { PortalRichPlaceholder } from "@/components/shared/PortalRichPlaceholder";

export default function JobsPage() {
    return (
        <CandidateLayout
            pageTitle="Browse Jobs"
            pageDescription="Discover new opportunities that match your skills"
        >
            <PortalRichPlaceholder
                icon={Briefcase}
                title="Job board goes live soon"
                description="Employers are onboarding now. While listings are being prepared, use Invitations to manage active interviews and your Dashboard for status at a glance."
                primaryAction={{ label: "Go to invitations", href: "/candidate/invitations" }}
                secondaryAction={{ label: "Back to overview", href: "/candidate/dashboard" }}
            />
        </CandidateLayout>
    );
}
