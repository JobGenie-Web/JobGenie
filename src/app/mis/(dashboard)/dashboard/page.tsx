import Link from "next/link";
import { Users } from "lucide-react";
import { MISLayout } from "@/components/mis";

export default async function MISDashboardPage() {
    return (
        <MISLayout
            pageTitle="MIS Dashboard"
            pageDescription="Welcome to the Management Information System dashboard."
        >
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/mis/users"
                        className="group bg-card border rounded-lg p-6 hover:border-primary transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                User Management
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Manage MIS administrator accounts
                        </p>
                    </Link>

                    {/* Add more dashboard cards here as needed */}
                </div>
            </div>
        </MISLayout>
    );
}
