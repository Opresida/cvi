import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLinks } from "@/components/layout/SkipLinks";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";
import { FloatingDonateCTA } from "@/components/layout/FloatingDonateCTA";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Hero } from "@/components/sections/Hero";
import { Showcase } from "@/components/sections/Showcase";
import { About } from "@/components/sections/About";
import { Impact } from "@/components/sections/Impact";
import { Services } from "@/components/sections/Services";
import { Pillars } from "@/components/sections/Pillars";
import { Team } from "@/components/sections/Team";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Galeria } from "@/components/sections/Galeria";
import { Donate } from "@/components/sections/Donate";
import { Contact } from "@/components/sections/Contact";

export function Home() {
  return (
    <>
      <SkipLinks />
      <Header />
      <AccessibilityToolbar />
      <main id="main-content" role="main">
        <Hero />
        <Showcase />
        <About />
        <Impact />
        <Services />
        <Pillars />
        <Team />
        <Testimonials />
        <Faq />
        <Galeria />
        <Donate />
        <Contact />
      </main>
      <Footer />
      <FloatingDonateCTA />
      <FloatingWhatsApp />
    </>
  );
}
