import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CandidateSidebar } from "./CandidateSidebar";
import { CandidateHeader } from "./CandidateHeader";
import { createClient } from "@/lib/supabase/server";

interface CandidateLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
    pageDescription?: string;
}

async function getCurrentUser() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get additional user data from candidates table
    const { data: candidate } = await supabase
        .from('candidates')
        .select('first_name, last_name, profile_image, membership_no')
        .eq('user_id', user.id)
        .single();

    return {
        id: user.id,
        email: user.email || '',
        firstName: candidate?.first_name || user.user_metadata?.first_name || '',
        lastName: candidate?.last_name || user.user_metadata?.last_name || '',
        profileImage: candidate?.profile_image || undefined,
        membershipNo: candidate?.membership_no || undefined,
    };
}

export async function CandidateLayout({ children, pageTitle, pageDescription }: CandidateLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <CandidateSidebar />
                <SidebarInset className="flex flex-col flex-1">
                    <CandidateHeader
                        user={user}
                        pageTitle={pageTitle}
                        pageDescription={pageDescription}
                    />
                    <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
