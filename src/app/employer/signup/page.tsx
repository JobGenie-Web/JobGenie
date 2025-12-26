import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmployerSignupPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 text-primary">
                            <Building2 className="h-10 w-10" />
                        </div>
                    </div>

                    {/* Header */}
                    <h1 className="mb-2 text-center text-2xl font-bold">
                        Create Your Employer Account
                    </h1>
                    <p className="mb-8 text-center text-muted-foreground">
                        Start hiring top talent for your organization today.
                    </p>

                    {/* Placeholder Form */}
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="company" className="mb-2 block text-sm font-medium">
                                Company Name
                            </label>
                            <input
                                type="text"
                                id="company"
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Acme Inc."
                            />
                        </div>
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                Work Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="you@company.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="••••••••"
                            />
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                            Create Employer Account
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Back link */}
                <div className="mt-6 text-center">
                    <Button variant="ghost" asChild>
                        <Link href="/" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
