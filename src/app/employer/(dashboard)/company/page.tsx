import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerLayout } from "@/components/employer";
import { getCompanyProfile } from "@/app/actions/employer-profiles";
import { CompanyProfileClient } from "@/components/employer/CompanyProfileClient";

export const metadata: Metadata = {
    title: "Company Profile | JobGenie",
    description: "View your company information",
};

export default async function CompanyProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const companyProfile = await getCompanyProfile(user.id);

    if (!companyProfile) {
        redirect("/employer/dashboard");
    }

    return (
        <EmployerLayout
            pageTitle="Company Profile"
            pageDescription="View and manage your company information"
        >
            <CompanyProfileClient company={companyProfile} userId={user.id} />
        </EmployerLayout>
    );
}
