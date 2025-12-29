import Link from 'next/link';
import { User, Briefcase, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CandidateDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Manage your job applications and profile.
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-blue-500/10 p-3 text-blue-500">
                        <User className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">My Profile</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Update your personal information and CV
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/candidate/profile">View Profile</Link>
                    </Button>
                </div>

                {/* Jobs Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-green-500/10 p-3 text-green-500">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Browse Jobs</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Discover new opportunities that match your skills
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/candidate/jobs">Find Jobs</Link>
                    </Button>
                </div>

                {/* Applications Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-purple-500/10 p-3 text-purple-500">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Applications</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Track the status of your job applications
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/candidate/applications">View Applications</Link>
                    </Button>
                </div>

                {/* Settings Card */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-orange-500/10 p-3 text-orange-500">
                        <Settings className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Settings</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Manage your account preferences and notifications
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/candidate/settings">Settings</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
