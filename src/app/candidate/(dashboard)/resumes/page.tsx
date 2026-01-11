import { CandidateLayout } from "@/components/candidate";
import { ResumesClientContent } from "./ResumesClientContent";

export default function ResumesPage() {
    return (
        <CandidateLayout
            pageTitle="My Resumes"
            pageDescription="Manage and view your uploaded resume."
        >
            <ResumesClientContent />
        </CandidateLayout>
    );
}
