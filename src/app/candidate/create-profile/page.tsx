import { ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateProfileWizard } from "@/components/profile/CreateProfileWizard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function getCandidateData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: candidate } = await supabase
        .from("candidates")
        .select(`
            first_name,
            last_name,
            email,
            phone,
            address,
            country,
            industry
        `)
        .eq("user_id", user.id)
        .single();

    return { userId: user.id, candidate };
}

export default async function CreateProfilePage() {
    const { userId, candidate } = await getCandidateData();

    return (
        <div className="space-y-6">
            {/* Back to Home */}
            <div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>

            {/* Header */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 text-primary">
                        <UserCircle className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                        <p className="text-muted-foreground mt-1">
                            Welcome{candidate?.first_name ? `, ${candidate.first_name}` : ""}!
                            Fill in your details to access your dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Wizard */}
            <CreateProfileWizard
                userId={userId}
                initialData={{
                    firstName: candidate?.first_name || "",
                    lastName: candidate?.last_name || "",
                    email: candidate?.email || "",
                    phone: candidate?.phone || "",
                    address: candidate?.address || "",
                    country: candidate?.country || "",
                    industry: candidate?.industry || "",
                }}
            />
        </div>
    );
}

