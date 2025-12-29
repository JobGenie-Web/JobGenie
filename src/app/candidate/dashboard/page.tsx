import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Briefcase, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyToken } from '@/lib/jwt';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    return await verifyToken(token);
}

export default async function CandidateDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center justify-center rounded-xl bg-primary/10 p-2 text-primary">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">
                                    Welcome, {user.firstName || 'Candidate'}!
                                </h1>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <form action="/api/auth/logout" method="POST">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold">Your Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage your job applications and profile
                    </p>
                </div>

                {/* Quick Actions */}
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
                            <Link href="/jobs">Find Jobs</Link>
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
            </main>
        </div>
    );
}
