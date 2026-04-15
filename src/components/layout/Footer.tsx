import { Heart, Shield, Accessibility, Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { siteContent } from "@/data/content";
import logoImg from "@/assets/images/logo-white.png";

const { footer, nav } = siteContent;

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <FacebookIcon />,
  instagram: <InstagramIcon />,
  youtube: <YoutubeIcon />,
};

const socialLabels: Record<string, string> = {
  facebook: "Facebook do CVI Amazonas",
  instagram: "Instagram do CVI Amazonas",
  youtube: "Canal do YouTube do CVI Amazonas",
};

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-neutral-900 text-neutral-400">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-16">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <img src={logoImg} alt="" aria-hidden="true" className="h-14 w-auto mb-5" />
            <p className="text-sm leading-relaxed mb-5 max-w-sm">{footer.tagline}</p>
            <p className="text-xs text-neutral-500 mb-4">{footer.cnpj}</p>

            <div className="flex gap-3">
              {footer.social.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  aria-label={socialLabels[s.platform]}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 hover:bg-primary-600 hover:text-white transition-all focus-visible:ring-4 focus-visible:ring-primary-500"
                >
                  {socialIcons[s.platform]}
                </a>
              ))}
            </div>

            <img
              src="https://i.imgur.com/Ia0Dn7G.png"
              alt="Selos institucionais do CVI Amazonas"
              className="mt-6 w-full max-w-sm h-auto object-contain"
            />
          </div>

          {/* Navegação */}
          <nav aria-label="Rodapé - navegação" className="md:col-span-3">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navegação</h4>
            <ul role="list" className="space-y-2">
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Selos + financiamento */}
          <div className="md:col-span-4">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Compromissos
            </h4>
            <ul role="list" className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Accessibility size={16} aria-hidden="true" className="text-accent-400 mt-0.5 shrink-0" />
                <span>Acessibilidade WCAG 2.1 nível AA</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Shield size={16} aria-hidden="true" className="text-accent-400 mt-0.5 shrink-0" />
                <span>LGPD — Seus dados são protegidos</span>
              </li>
            </ul>

            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Financiamento
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {footer.funding}
            </p>
          </div>
        </div>

        {/* Linha parceiros (placeholders tipográficos até receber logos) */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-4">Parceiros institucionais</p>
          <ul role="list" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-neutral-300 font-semibold">
            <li>Ministério da Saúde</li>
            <li aria-hidden="true" className="text-neutral-700">•</li>
            <li>Fundo Nacional de Saúde</li>
            <li aria-hidden="true" className="text-neutral-700">•</li>
            <li>SES/AM</li>
            <li aria-hidden="true" className="text-neutral-700">•</li>
            <li>Governo do Amazonas</li>
          </ul>
        </div>

        {/* Links legais */}
        <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <Link
            to="/privacidade"
            className="text-neutral-400 hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 focus-visible:ring-offset-neutral-900 rounded-sm"
          >
            Política de Privacidade
          </Link>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("cvi:open-cookie-preferences"))
            }
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 focus-visible:ring-offset-neutral-900 rounded-sm"
          >
            <Cookie size={12} aria-hidden="true" />
            Preferências de Cookies
          </button>
          <Link
            to="/#contato"
            className="text-neutral-400 hover:text-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 focus-visible:ring-offset-neutral-900 rounded-sm"
          >
            Contato
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">{footer.copyright}</p>
          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            Feito com
            <Heart size={12} aria-hidden="true" className="text-secondary-400 fill-secondary-400" />
            para o Amazonas
          </p>
        </div>
      </div>
    </footer>
  );
}
