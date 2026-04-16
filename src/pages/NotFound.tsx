import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLinks } from "@/components/layout/SkipLinks";

export function NotFound() {
  return (
    <>
      <SkipLinks />
      <Header />

      <main id="main-content" role="main">
        <section className="relative pt-40 pb-28 lg:pt-48 lg:pb-36 bg-gradient-to-b from-primary-50 via-white to-white min-h-[70vh] flex items-center">
          <div className="relative mx-auto max-w-3xl px-6 sm:px-10 lg:px-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span
                aria-hidden="true"
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-700 mb-8"
              >
                <Search size={36} strokeWidth={1.4} />
              </span>

              <h1 className="text-6xl sm:text-8xl font-bold text-primary-700 tracking-tight mb-4">
                404
              </h1>

              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-4">
                Página não encontrada
              </h2>

              <p className="text-base sm:text-lg text-neutral-700 leading-[1.75] max-w-xl mx-auto mb-10">
                A página que você procura não existe, foi movida ou o endereço pode estar
                incorreto. Sem problema — vamos ajudar você a encontrar o caminho.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 transition-colors shadow-lg shadow-primary-700/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3"
                >
                  <Home size={16} aria-hidden="true" />
                  Voltar para o início
                </Link>
                <Link
                  to="/#contato"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-primary-200 text-primary-800 font-bold hover:bg-primary-50 hover:border-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Falar com o CVI
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
