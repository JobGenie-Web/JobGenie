import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { SignupCTA } from "@/components/landing/SignupCTA";
import { Contact } from "@/components/landing/Contact";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <SignupCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
