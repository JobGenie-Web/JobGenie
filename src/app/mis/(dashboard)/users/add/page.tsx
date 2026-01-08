import Link from "next/link";
import { AddMISUserForm } from "@/components/auth/AddMISUserForm";

export default function AddMISUserPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/mis/dashboard"
                        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Add MIS User</h1>
                    <p className="text-muted-foreground mt-2">
                        Create a new MIS administrator account
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <AddMISUserForm />
                </div>
            </div>
        </div>
    );
}
