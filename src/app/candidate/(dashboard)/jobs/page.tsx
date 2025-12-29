import { Briefcase } from 'lucide-react';

export default function JobsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Browse Jobs</h1>
                <p className="text-muted-foreground">
                    Discover new opportunities that match your skills
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-muted p-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Jobs Coming Soon</h3>
                <p className="text-muted-foreground">
                    Browse available jobs once employers start posting.
                </p>
            </div>
        </div>
    );
}
