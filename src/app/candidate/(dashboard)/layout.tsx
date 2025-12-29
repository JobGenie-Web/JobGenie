import { CandidateLayout } from "@/components/candidate";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CandidateLayout>{children}</CandidateLayout>;
}
