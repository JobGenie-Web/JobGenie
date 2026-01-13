import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { EmployerSidebar } from "./EmployerSidebar";
import { EmployerHeader } from "./EmployerHeader";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";

interface EmployerLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
    pageDescription?: string;
}

async function getCurrentEmployer() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get employer data with company info
    const { data: employer } = await supabase
        .from('employers')
        .select(`
            first_name,
            last_name,
            profile_image_url,
            companies!inner (
                company_name
            )
        `)
        .eq('user_id', user.id)
        .single();

    if (!employer) {
        return null;
    }

    // Type assertion for nested company data
    const company = (employer as any).companies;

    return {
        id: user.id,
        email: user.email || '',
        firstName: employer.first_name || '',
        lastName: employer.last_name || '',
        profileImage: employer.profile_image_url || undefined,
        companyName: company?.company_name || undefined,
    };
}

export async function EmployerLayout({ children, pageTitle, pageDescription }: EmployerLayoutProps) {
    const user = await getCurrentEmployer();

    if (!user) {
        redirect('/login');
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <EmployerSidebar />
                <SidebarInset className="flex flex-col flex-1">
                    <EmployerHeader
                        user={user}
                        pageTitle={pageTitle}
                        pageDescription={pageDescription}
                    />
                    <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
            <Toaster />
        </SidebarProvider>
    );
}
