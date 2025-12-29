import { User } from 'lucide-react';

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">
                    Manage your personal information and CV
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-muted p-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Profile Coming Soon</h3>
                <p className="text-muted-foreground">
                    This page is under development. Check back soon!
                </p>
            </div>
        </div>
    );
}
