import { Settings } from 'lucide-react';
import { CandidateLayout } from '@/components/candidate';

export default function SettingsPage() {
    return (
        <CandidateLayout
            pageTitle="Settings"
            pageDescription="Manage your account preferences and notifications"
        >
            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-muted p-4">
                    <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                <p className="text-muted-foreground">
                    This page is under development. Check back soon!
                </p>
            </div>
        </CandidateLayout>
    );
}
