import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { siteContent } from "@/data/content";
import { useScrollspy } from "@/hooks/useScrollspy";
import logoImg from "@/assets/images/logo.png";

const { nav } = siteContent;
const sectionIds = nav.links.map((l) => l.href.replace("#", ""));

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollspy(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <motion.header
      role="banner"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft"
          : "bg-white/85 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav id="main-nav" className="flex items-center justify-between h-20" aria-label="Navegação principal">
          <a href="#inicio" className="flex items-center gap-3 shrink-0" aria-label="CVI Amazonas - Ir para o início">
            <img src={logoImg} alt="" aria-hidden="true" className="h-12 w-auto" />
            <span className="sr-only">CVI Amazonas</span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={activeId === link.href.replace("#", "") ? "location" : undefined}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeId === link.href.replace("#", "")
                      ? "text-primary-800 bg-primary-50"
                      : "text-neutral-700 hover:text-primary-800 hover:bg-neutral-100"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
            aria-label={mobileOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-neutral-200 overflow-hidden"
          >
            <ul className="px-4 py-6 space-y-1" role="list">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={activeId === link.href.replace("#", "") ? "location" : undefined}
                    className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                      activeId === link.href.replace("#", "")
                        ? "text-primary-800 bg-primary-50"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
