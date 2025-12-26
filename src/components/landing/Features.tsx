import {
    Search,
    Shield,
    Zap,
    Users,
    BarChart3,
    MessageSquare
} from 'lucide-react';

const features = [
    {
        icon: Search,
        title: 'Smart Job Matching',
        description: 'Our AI-powered algorithm matches candidates with the perfect opportunities based on skills, experience, and preferences.',
    },
    {
        icon: Shield,
        title: 'Verified Profiles',
        description: 'All candidates and employers go through our verification process to ensure authentic connections.',
    },
    {
        icon: Zap,
        title: 'Instant Applications',
        description: 'Apply to jobs with one click using your saved profile. No more filling out endless forms.',
    },
    {
        icon: Users,
        title: 'Talent Pool Access',
        description: 'Employers get access to a curated pool of pre-screened candidates ready to join your team.',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description: 'Track your job search progress or recruitment metrics with our comprehensive analytics tools.',
    },
    {
        icon: MessageSquare,
        title: 'Direct Messaging',
        description: 'Communicate directly with employers or candidates through our secure messaging platform.',
    },
];

export function Features() {
    return (
        <section id="features" className="border-t border-border bg-muted/30 py-20 sm:py-28">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Why Choose <span className="text-primary">JobGenie</span>?
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        We've built the most comprehensive job portal to streamline your hiring and job search experience.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-sm"
                        >
                            {/* Icon */}
                            <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <feature.icon className="h-6 w-6" />
                            </div>

                            {/* Content */}
                            <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
