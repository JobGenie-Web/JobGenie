import Link from 'next/link';
import { ArrowRight, Briefcase, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
    return (
        <section className="relative">
            <div className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
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

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                        <Button
                            asChild
                            size="lg"
                            className="group w-full sm:w-auto gap-2 text-base"
                        >
                            <Link href="/candidate/signup">
                                <Users className="h-5 w-5" />
                                I'm a Candidate
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="group w-full sm:w-auto gap-2 text-base"
                        >
                            <Link href="/employer/signup">
                                <Briefcase className="h-5 w-5" />
                                I'm an Employer
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
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
            </div>
        </section>
    );
}
