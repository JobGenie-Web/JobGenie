import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MISSidebar } from "./MISSidebar";
import { MISHeader } from "./MISHeader";
import { createClient } from "@/lib/supabase/server";

interface MISLayoutProps {
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

    // Get additional user data from users table
    const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, profile_image_url')
        .eq('id', user.id)
        .single();

    return {
        id: user.id,
        email: user.email || '',
        firstName: userData?.first_name || user.user_metadata?.first_name || '',
        lastName: userData?.last_name || user.user_metadata?.last_name || '',
        profileImage: userData?.profile_image_url || undefined,
    };
}

export async function MISLayout({ children, pageTitle, pageDescription }: MISLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <MISSidebar />
                <SidebarInset className="flex flex-col flex-1">
                    <MISHeader
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
