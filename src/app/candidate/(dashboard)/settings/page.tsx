import { Settings } from "lucide-react";
import { CandidateLayout } from "@/components/candidate";
import { PortalRichPlaceholder } from "@/components/shared/PortalRichPlaceholder";

export default function SettingsPage() {
    return (
        <CandidateLayout
            pageTitle="Settings"
            pageDescription="Manage your account preferences and notifications"
        >
            <PortalRichPlaceholder
                icon={Settings}
                title="Settings are almost ready"
                description="Profile and resume controls already live under My Profile and My Resumes. For hiring updates, Invitations and Calendar stay the fastest path today."
                primaryAction={{ label: "Edit profile", href: "/candidate/profile" }}
                secondaryAction={{ label: "Manage resumes", href: "/candidate/resumes" }}
            />
        </CandidateLayout>
    );
}
