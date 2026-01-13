import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmployerProfileData } from "@/app/actions/employer-profile";
import { EmployerProfileWizard } from "@/components/employer/profile/EmployerProfileWizard";

export const metadata: Metadata = {
    title: "Complete Profile | JobGenie",
    description: "Complete your employer profile to start posting jobs",
};

export default async function CompleteProfilePage() {
    // Check authentication
    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect("/employer/login");
    }

    // Fetch employer and company data
    const profileData = await getEmployerProfileData(session.user.id);

    if (!profileData) {
        redirect("/employer/login");
    }

    // If both profiles are complete, redirect to dashboard
    if (profileData.employer.profile_completed && profileData.company.profile_completed) {
        redirect("/employer/dashboard");
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h1>
                    <p className="text-muted-foreground">
                        Let's finish setting up your profile to start posting jobs and finding top talent
                    </p>
                </div>

                {/* Wizard */}
                <EmployerProfileWizard initialData={profileData} />
            </div>
        </div>
    );
}
