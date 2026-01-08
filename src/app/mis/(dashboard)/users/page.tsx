import Link from "next/link";
import { MISLayout } from "@/components/mis";

export default async function MISUsersPage() {
    return (
        <MISLayout
            pageTitle="MIS Users"
            pageDescription="Manage MIS administrator accounts"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header with Add Button */}
                <div className="flex items-center justify-end mb-6">
                    <Link
                        href="/mis/users/add"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
                    >
                        Add MIS User
                    </Link>
                </div>

                {/* Placeholder for user list */}
                <div className="bg-card border rounded-lg p-6">
                    <p className="text-muted-foreground text-center">
                        User list will be implemented here
                    </p>
                </div>
            </div>
        </MISLayout>
    );
}
