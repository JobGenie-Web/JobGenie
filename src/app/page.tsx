import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import {
    LogoStrip,
    StatsSection,
    HowItWorksSection,
    TestimonialsSection,
    PortalShowcase,
    CTASection,
} from "@/components/landing/LandingSections";

export default function Home() {
    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh', overflowX: 'hidden', width: '100%', position: 'relative' }}>
            <Header />
            <main style={{ overflowX: 'hidden', width: '100%' }}>
                <Hero />
                <LogoStrip />
                <StatsSection />
                <Features />
                <HowItWorksSection />
                <TestimonialsSection />
                <PortalShowcase />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
