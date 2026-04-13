import { TimezoneSync } from "@/components/common/TimezoneSync";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <TimezoneSync />
            {children}
        </>
    );
}
