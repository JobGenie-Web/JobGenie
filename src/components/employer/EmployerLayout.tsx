import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { EmployerSidebar } from "./EmployerSidebar";
import { EmployerHeader } from "./EmployerHeader";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { PortalMain } from "@/components/layout/PortalMain";
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
    const company = (employer as Record<string, unknown>).companies as { company_name?: string } | null;

    return {
        id: user.id,
        email: user.email || '',
        firstName: employer.first_name || '',
        lastName: employer.last_name || '',
        companyName: company?.company_name || undefined,
    };
}

export async function EmployerLayout({ children, pageTitle, pageDescription }: EmployerLayoutProps) {
    const user = await getCurrentEmployer();

    if (!user) {
        redirect('/login');
    }

    return (
        <SidebarProvider className="h-dvh! min-h-0! overflow-hidden">
            <EmployerSidebar />
            <SidebarInset className="flex flex-col min-h-0 overflow-hidden">
                <EmployerHeader
                    user={user}
                    pageTitle={pageTitle}
                    pageDescription={pageDescription}
                />
                <div className="flex-1 overflow-y-auto min-h-0 bg-background">
                    <PageTransitionWrapper>
                        <div className="p-5 md:p-6">
                            {children}
                        </div>
                    </PageTransitionWrapper>
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
