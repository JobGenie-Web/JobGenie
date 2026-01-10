import Link from "next/link";
import { Users, UserSquare, Building2, Briefcase, BarChart3 } from "lucide-react";
import { MISLayout } from "@/components/mis";
import { createClient } from "@/lib/supabase/server";

export default async function MISDashboardPage() {
    const supabase = await createClient();

    // Fetch counts for dashboard stats
    const [candidatesCount, employersCount, jobsCount] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('profile_completed', true),
        supabase.from('employers').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
    ]);

    const dashboardCards = [
        {
            title: "MIS User Management",
            description: "Manage MIS administrator accounts",
            href: "/mis/users",
            icon: Users,
            color: "blue",
            count: null,
        },
        {
            title: "Candidate Approvals",
            description: "Review and approve candidate profiles",
            href: "/mis/candidates",
            icon: UserSquare,
            color: "green",
            count: candidatesCount.count || 0,
        },
        {
            title: "Employer Management",
            description: "Manage employer accounts and companies",
            href: "/mis/employers",
            icon: Building2,
            color: "purple",
            count: employersCount.count || 0,
        },
        {
            title: "Job Management",
            description: "Oversee job postings and listings",
            href: "/mis/jobs",
            icon: Briefcase,
            color: "orange",
            count: jobsCount.count || 0,
        },
        {
            title: "Reports & Analytics",
            description: "View system reports and analytics",
            href: "/mis/reports",
            icon: BarChart3,
            color: "indigo",
            count: null,
        },
    ];

    const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
        blue: { bg: "bg-blue-500/10", text: "text-blue-500", hover: "hover:border-blue-500" },
        green: { bg: "bg-green-500/10", text: "text-green-500", hover: "hover:border-green-500" },
        purple: { bg: "bg-purple-500/10", text: "text-purple-500", hover: "hover:border-purple-500" },
        orange: { bg: "bg-orange-500/10", text: "text-orange-500", hover: "hover:border-orange-500" },
        indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500", hover: "hover:border-indigo-500" },
    };

    return (
        <MISLayout
            pageTitle="MIS Dashboard"
            pageDescription="Welcome to the Management Information System dashboard."
        >
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardCards.map((card) => {
                        const Icon = card.icon;
                        const colors = colorClasses[card.color];

                        return (
                            <Link
                                key={card.href}
                                href={card.href}
                                className={`group bg-card border rounded-lg p-6 transition-all hover:shadow-md ${colors.hover}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 ${colors.bg} rounded-lg`}>
                                        <Icon className={`h-6 w-6 ${colors.text}`} />
                                    </div>
                                    {card.count !== null && (
                                        <div className="text-2xl font-bold">{card.count}</div>
                                    )}
                                </div>
                                <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                    {card.title}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {card.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </MISLayout>
    );
}
