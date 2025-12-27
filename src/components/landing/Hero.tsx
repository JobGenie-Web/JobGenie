import Link from 'next/link';
import { ArrowRight, Briefcase, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
    return (
        <section className="relative">
            <div className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-16">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                        </span>
                        Your Gateway to Career Success
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        Find Your Perfect
                        <span className="block text-primary mt-2">Career Match</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        JobGenie connects talented candidates with forward-thinking employers.
                        Whether you're looking for your dream job or the perfect hire, we've got you covered.
                    </p>

                    {/* Stats */}
                    <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
                        {[
                            { value: '10K+', label: 'Active Jobs' },
                            { value: '50K+', label: 'Candidates' },
                            { value: '5K+', label: 'Companies' },
                            { value: '95%', label: 'Success Rate' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Signup Cards */}
                <div className="mt-16 grid gap-8 lg:grid-cols-2">
                    {/* Candidate Card */}
                    <div className="group rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg sm:p-10">
                        <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 text-primary">
                            <Users className="h-8 w-8" />
                        </div>

                        <h3 className="mb-3 text-2xl font-bold sm:text-3xl">
                            For Job Seekers
                        </h3>

                        <p className="mb-5 text-muted-foreground">
                            Create your profile, showcase your skills, and let employers come to you.
                            Access thousands of job opportunities from top companies.
                        </p>

                        <ul className="mb-6 space-y-2.5">
                            {[
                                'Free profile creation',
                                'AI-powered job recommendations',
                                'Track applications in one place',
                                'Get noticed by top employers',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Button asChild size="lg" className="group/btn gap-2">
                            <Link href="/candidate/signup">
                                Get Started Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Employer Card */}
                    <div className="group rounded-3xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg sm:p-10">
                        <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4 text-primary">
                            <Building2 className="h-8 w-8" />
                        </div>

                        <h3 className="mb-3 text-2xl font-bold sm:text-3xl">
                            For Employers
                        </h3>

                        <p className="mb-5 text-muted-foreground">
                            Find the perfect candidates for your team. Post jobs, search our talent pool,
                            and connect with qualified professionals instantly.
                        </p>

                        <ul className="mb-6 space-y-2.5">
                            {[
                                'Post unlimited job listings',
                                'Access verified talent pool',
                                'Advanced candidate filtering',
                                'Streamlined recruitment workflow',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Button asChild size="lg" className="group/btn gap-2">
                            <Link href="/employer/signup">
                                Start Hiring
                                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
