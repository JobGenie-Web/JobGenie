import { FileText } from 'lucide-react';
import { CandidateLayout } from '@/components/candidate';

export default function ApplicationsPage() {
    return (
        <CandidateLayout
            pageTitle="My Applications"
            pageDescription="Track the status of your job applications"
        >
            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-muted p-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground">
                    Start applying to jobs to see your applications here.
                </p>
            </div>
        </CandidateLayout>
    );
}
