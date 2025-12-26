import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Contact() {
    return (
        <section id="contact" className="border-t border-border/40 bg-muted/20 py-20 sm:py-28">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Get in <span className="text-primary">Touch</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 lg:grid-cols-3">
                    {/* Contact Info Cards */}
                    {[
                        {
                            icon: Mail,
                            title: 'Email',
                            content: 'support@jobgenie.com',
                            href: 'mailto:support@jobgenie.com',
                        },
                        {
                            icon: Phone,
                            title: 'Phone',
                            content: '+1 (555) 123-4567',
                            href: 'tel:+15551234567',
                        },
                        {
                            icon: MapPin,
                            title: 'Office',
                            content: 'San Francisco, CA',
                            href: '#',
                        },
                    ].map((item) => (
                        <a
                            key={item.title}
                            href={item.href}
                            className="group flex flex-col items-center rounded-2xl border border-border/40 bg-card p-8 text-center transition-all hover:border-primary/40 hover:shadow-md"
                        >
                            <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                            <p className="text-muted-foreground">{item.content}</p>
                        </a>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="mx-auto mt-16 max-w-xl">
                    <form className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="message" className="mb-2 block text-sm font-medium">
                                Message
                            </label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                placeholder="How can we help?"
                            />
                        </div>
                        <Button type="submit" size="lg" className="w-full">
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
