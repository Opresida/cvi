import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  Heart,
  ShieldCheck,
  Accessibility,
  Activity,
  Award,
  Users,
  Sparkles,
  HeartHandshake,
  Calendar,
  Quote,
  ChevronDown,
  Cookie,
  Mail,
  Phone,
  Globe,
  RotateCcw,
  Code2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLinks } from "@/components/layout/SkipLinks";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";
import logoImg from "@/assets/images/logo.png";
import logoWhiteImg from "@/assets/images/logo-white.png";

/* ── Dados do design system ──────────────────────────────────────── */

type Shade = { token: string; hex: string; note?: string };

const palette: { family: string; hint: string; shades: Shade[] }[] = [
  {
    family: "Primary (Teal)",
    hint: "Saúde, confiança, institucional",
    shades: [
      { token: "primary-50", hex: "#e6f7f9", note: "Fundos suaves, hover" },
      { token: "primary-100", hex: "#b3e8ef" },
      { token: "primary-200", hex: "#80d9e5" },
      { token: "primary-300", hex: "#4dcadb" },
      { token: "primary-400", hex: "#26bfd4" },
      { token: "primary-500", hex: "#0fa8bd", note: "Accent primário, foco" },
      { token: "primary-600", hex: "#0d94a7" },
      { token: "primary-700", hex: "#0a7688", note: "CTAs, headings" },
      { token: "primary-800", hex: "#085969" },
      { token: "primary-900", hex: "#053c47", note: "Seções dark" },
    ],
  },
  {
    family: "Secondary (Coral)",
    hint: "Acolhimento, CTA de doação",
    shades: [
      { token: "secondary-50", hex: "#fef0f1" },
      { token: "secondary-100", hex: "#fcd1d4" },
      { token: "secondary-200", hex: "#f9a3a9" },
      { token: "secondary-300", hex: "#f0737c" },
      { token: "secondary-400", hex: "#e5525d" },
      { token: "secondary-500", hex: "#d43d48", note: "CTA doação" },
      { token: "secondary-600", hex: "#b8333d" },
      { token: "secondary-700", hex: "#932932" },
      { token: "secondary-800", hex: "#6e1f26" },
      { token: "secondary-900", hex: "#49151a" },
    ],
  },
  {
    family: "Accent (Verde Esperança)",
    hint: "Sucesso, vida, impacto",
    shades: [
      { token: "accent-50", hex: "#ecfdf5" },
      { token: "accent-200", hex: "#a7f3d0" },
      { token: "accent-400", hex: "#34d399" },
      { token: "accent-500", hex: "#10b981", note: "Selos de impacto" },
      { token: "accent-700", hex: "#047857" },
      { token: "accent-900", hex: "#064e3b" },
    ],
  },
  {
    family: "Warm (Dourado)",
    hint: "Excelência, status 'em breve'",
    shades: [
      { token: "warm-50", hex: "#fffbeb" },
      { token: "warm-200", hex: "#fde68a" },
      { token: "warm-400", hex: "#fbbf24" },
      { token: "warm-500", hex: "#f59e0b", note: "Uso pontual" },
    ],
  },
  {
    family: "Neutral",
    hint: "Texto, fundos, estrutura",
    shades: [
      { token: "neutral-50", hex: "#f8fafb" },
      { token: "neutral-100", hex: "#f1f4f6" },
      { token: "neutral-200", hex: "#e2e8ed" },
      { token: "neutral-700", hex: "#334155", note: "Corpo de texto" },
      { token: "neutral-900", hex: "#0f172a", note: "Títulos" },
    ],
  },
];

const fonts = [
  {
    family: "Plus Jakarta Sans",
    weights: [500, 600, 700, 800],
    role: "Headings, CTAs, numerais, labels institucionais",
    sample: "Cada pessoa merece viver com autonomia.",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  {
    family: "Inter",
    weights: [400, 500, 600, 700],
    role: "Corpo de texto, descrições, listas, parágrafos",
    sample:
      "Há mais de 20 anos, transformamos vidas através da reabilitação biopsicossocial — com atendimento 100% gratuito pelo SUS.",
    fontFamily: "'Inter', sans-serif",
  },
];

/* ── Componentes auxiliares ──────────────────────────────────────── */

function ColorChip({ shade, onCopy, copied }: { shade: Shade; onCopy: () => void; copied: boolean }) {
  const isDark = ["600", "700", "800", "900"].some((n) => shade.token.endsWith(n));
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copiar hex ${shade.hex} (${shade.token})`}
      className={`group relative flex flex-col justify-between w-full h-32 rounded-xl p-4 text-left transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 ${
        isDark ? "text-white" : "text-neutral-900"
      }`}
      style={{ background: shade.hex }}
    >
      <span className="text-xs font-mono font-bold tracking-[0.1em] opacity-80">
        {shade.token}
      </span>
      <div className="flex items-end justify-between">
        <div>
          <code className="block font-mono text-sm font-bold">{shade.hex}</code>
          {shade.note && (
            <span className={`block text-[0.65rem] mt-1 ${isDark ? "text-white/80" : "text-neutral-900/70"}`}>
              {shade.note}
            </span>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`opacity-0 group-hover:opacity-100 transition-opacity ${
            isDark ? "text-white" : "text-neutral-900"
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </span>
      </div>
    </button>
  );
}

function SigField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  const id = `sig-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-[0.2em] text-primary-700 mb-2 flex items-center gap-2"
      >
        {icon && <span className="text-primary-600">{icon}</span>}
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-500/30 transition"
      />
    </div>
  );
}

function SectionTitle({ num, eyebrow, title, subtitle }: { num: string; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-16 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs tracking-[0.3em] text-primary-600 tabular-nums">{num}</span>
        <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-5 text-lg text-neutral-700 leading-[1.75]">{subtitle}</p>}
    </div>
  );
}

/* ── Assinatura de e-mail — geração HTML ─────────────────────────── */

type SignatureData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  website: string;
};

const DEFAULT_SIGNATURE: SignatureData = {
  name: "Nome Completo",
  role: "Cargo · Área",
  email: "cvi.amazonas@gmail.com",
  phone: "(92) 99116-3746",
  website: "www.cviam.com.br",
};

const SIGNATURE_LOGO_URL = "https://i.imgur.com/LWnHD4Q.png";

function buildSignatureHtml(d: SignatureData): string {
  const whatsappLink = `https://wa.me/55${d.phone.replace(/\D/g, "")}`;
  const siteUrl = `https://${d.website.replace(/^https?:\/\//, "")}`;
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#334155;line-height:1.5;border-collapse:collapse;">
  <tr>
    <td style="padding:0 22px 0 0;vertical-align:middle;text-align:center;">
      <a href="${siteUrl}" style="text-decoration:none;display:inline-block;">
        <img src="${SIGNATURE_LOGO_URL}" alt="CVI Amazonas" width="90" height="90" style="display:block;border:0;outline:none;-ms-interpolation-mode:bicubic;" />
      </a>
    </td>
    <td style="padding:0 0 0 22px;border-left:3px solid #0fa8bd;vertical-align:top;">
      <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;line-height:1.2;">${escapeHtml(d.name)}</div>
      <div style="margin-top:4px;font-size:12px;font-weight:600;color:#0a7688;text-transform:uppercase;letter-spacing:0.1em;">${escapeHtml(d.role)}</div>
      <div style="margin-top:14px;font-size:13px;color:#334155;line-height:1.75;">
        <div style="margin-bottom:4px;">
          <span style="color:#0a7688;font-weight:600;">E-mail:</span>
          <a href="mailto:${escapeHtml(d.email)}" style="color:#334155;text-decoration:none;">${escapeHtml(d.email)}</a>
        </div>
        <div style="margin-bottom:4px;">
          <span style="color:#0a7688;font-weight:600;">WhatsApp:</span>
          <a href="${whatsappLink}" style="color:#334155;text-decoration:none;">${escapeHtml(d.phone)}</a>
        </div>
        <div>
          <span style="color:#0a7688;font-weight:600;">Site:</span>
          <a href="${siteUrl}" style="color:#334155;text-decoration:none;">${escapeHtml(d.website)}</a>
        </div>
      </div>
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid #e2e8ed;font-size:11px;color:#64748b;font-style:italic;max-width:360px;line-height:1.6;">
        CVI — Centro de Vida Independente do Amazonas · CNPJ 07.555.086/0001-68<br/>
        Reabilitação biopsicossocial · Atendimento 100% gratuito pelo SUS
      </div>
    </td>
  </tr>
</table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ── Página ─────────────────────────────────────────────────────── */

export function Brandbook() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [sig, setSig] = useState<SignatureData>(DEFAULT_SIGNATURE);
  const [sigCopied, setSigCopied] = useState<"html" | "rich" | null>(null);

  const handleCopy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1500);
    } catch {
      /* ignora */
    }
  };

  const signatureHtml = buildSignatureHtml(sig);

  const copySignatureCode = async () => {
    try {
      await navigator.clipboard.writeText(signatureHtml);
      setSigCopied("html");
      setTimeout(() => setSigCopied(null), 1800);
    } catch {
      /* ignora */
    }
  };

  const copySignatureRich = async () => {
    try {
      // Clipboard com text/html — permite colar direto em Gmail/Outlook mantendo formatação
      if (typeof window.ClipboardItem === "function") {
        const blob = new Blob([signatureHtml], { type: "text/html" });
        const text = new Blob([sig.name + " — " + sig.role], { type: "text/plain" });
        await navigator.clipboard.write([
          new ClipboardItem({ "text/html": blob, "text/plain": text }),
        ]);
      } else {
        // Fallback: copia do preview renderizado
        const el = document.getElementById("signature-preview");
        if (el) {
          const range = document.createRange();
          range.selectNode(el);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          document.execCommand("copy");
          selection?.removeAllRanges();
        }
      }
      setSigCopied("rich");
      setTimeout(() => setSigCopied(null), 1800);
    } catch {
      /* ignora */
    }
  };

  const resetSignature = () => setSig(DEFAULT_SIGNATURE);

  return (
    <>
      <SkipLinks />
      <Header />
      <AccessibilityToolbar />

      <main id="main-content" role="main">
        {/* ── HERO ──────────────────────────────────────────── */}
        <section
          aria-labelledby="brandbook-title"
          className="relative pt-40 pb-20 lg:pt-48 lg:pb-28 bg-gradient-to-b from-primary-50 via-white to-white overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -top-10 right-0 text-[20rem] font-black text-primary-100/50 leading-none select-none pointer-events-none hidden lg:block"
          >
            00
          </div>

          <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 mb-8 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 rounded-sm"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Voltar para a página inicial
              </Link>

              <div className="flex items-center gap-3 mb-6">
                <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
                  Brandbook &amp; UI System
                </span>
              </div>

              <h1
                id="brandbook-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] tracking-tight mb-6"
              >
                A identidade visual do CVI Amazonas.
              </h1>

              <p className="text-lg sm:text-xl text-neutral-700 leading-[1.75] max-w-2xl">
                Este documento reúne a paleta, a tipografia, a iconografia, os componentes
                e as diretrizes de acessibilidade que sustentam a comunicação institucional
                do CVI-AM — online e impresso.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 01 · LOGO ─────────────────────────────────────── */}
        <section aria-labelledby="logo-title" className="relative py-24 lg:py-32 bg-white overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionTitle
              num="01"
              eyebrow="Marca"
              title="Logotipo e aplicações."
              subtitle="Nossa marca respeita três contextos de aplicação. Sempre preserve a área de respiro e nunca distorça ou recolore livremente."
            />

            <div className="grid md:grid-cols-3 gap-6">
              {/* Logo sobre claro */}
              <div className="rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="bg-white h-56 flex items-center justify-center p-8">
                  <img src={logoImg} alt="Logotipo CVI Amazonas" className="max-h-full w-auto" />
                </div>
                <div className="p-5 border-t border-neutral-200 bg-neutral-50/50">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
                    Sobre fundo claro
                  </span>
                  <p className="mt-1 text-sm text-neutral-700">
                    Versão preferencial para materiais institucionais, papelaria e headers claros.
                  </p>
                </div>
              </div>

              {/* Logo sobre dark */}
              <div className="rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="bg-neutral-900 h-56 flex items-center justify-center p-8">
                  <img src={logoWhiteImg} alt="Logotipo CVI Amazonas versão branca" className="max-h-full w-auto" />
                </div>
                <div className="p-5 border-t border-neutral-200 bg-neutral-50/50">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
                    Sobre fundo escuro
                  </span>
                  <p className="mt-1 text-sm text-neutral-700">
                    Versão branca obrigatória sobre fundos escuros (footer, CTAs dark, materiais noturnos).
                  </p>
                </div>
              </div>

              {/* Logo sobre teal */}
              <div className="rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="bg-primary-700 h-56 flex items-center justify-center p-8">
                  <img src={logoWhiteImg} alt="Logotipo CVI Amazonas sobre fundo teal" className="max-h-full w-auto" />
                </div>
                <div className="p-5 border-t border-neutral-200 bg-neutral-50/50">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
                    Sobre fundo teal institucional
                  </span>
                  <p className="mt-1 text-sm text-neutral-700">
                    Aplicação em peças de campanha, banners e call-to-actions de destaque.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/50">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-700 mb-3">
                Área de respiro
              </h4>
              <p className="text-sm text-neutral-700 leading-relaxed max-w-3xl">
                Mantenha ao redor do logotipo uma área livre equivalente à altura do símbolo
                da mão. Jamais posicione elementos dentro dessa margem — incluindo texto,
                outros logos ou imagens.
              </p>
            </div>
          </div>
        </section>

        {/* ── 02 · PALETA ───────────────────────────────────── */}
        <section aria-labelledby="palette-title" className="relative py-24 lg:py-32 bg-neutral-50 overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionTitle
              num="02"
              eyebrow="Paleta"
              title="Cores institucionais."
              subtitle="Clique em qualquer tom para copiar o hex. Todas as combinações de texto atendem WCAG 2.1 nível AA (contraste ≥ 4.5:1 para corpo de texto)."
            />

            <div className="space-y-10">
              {palette.map((fam) => (
                <div key={fam.family}>
                  <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{fam.family}</h3>
                    <span className="text-sm text-neutral-600">{fam.hint}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {fam.shades.map((shade) => (
                      <ColorChip
                        key={shade.token}
                        shade={shade}
                        onCopy={() => handleCopy(shade.hex)}
                        copied={copiedHex === shade.hex}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 · TIPOGRAFIA ───────────────────────────────── */}
        <section aria-labelledby="type-title" className="relative py-24 lg:py-32 bg-white overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionTitle
              num="03"
              eyebrow="Tipografia"
              title="Duas famílias, muita voz."
              subtitle="Plus Jakarta Sans expressa a força institucional. Inter conduz o leitor pela narrativa. Ambas carregadas via Google Fonts com preconnect."
            />

            <div className="space-y-10">
              {fonts.map((font) => (
                <div key={font.family} className="rounded-2xl border border-neutral-200 p-8 lg:p-10">
                  <div className="flex items-baseline justify-between gap-4 flex-wrap mb-6">
                    <h3
                      className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      {font.family}
                    </h3>
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
                      {font.role}
                    </span>
                  </div>

                  <p
                    className="text-2xl sm:text-3xl text-neutral-900 leading-[1.3] mb-8"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.sample}
                  </p>

                  <div className="flex flex-wrap gap-6 pt-6 border-t border-neutral-200">
                    {font.weights.map((w) => (
                      <div key={w}>
                        <div
                          className="text-xl text-neutral-900"
                          style={{ fontFamily: font.fontFamily, fontWeight: w }}
                        >
                          Aa Bb Cc
                        </div>
                        <code className="block text-xs font-mono text-neutral-500 mt-1">
                          weight {w}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Escala tipográfica */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-6">Escala tipográfica</h3>
              <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-200">
                {[
                  { label: "Display", cls: "text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight", family: "jakarta" },
                  { label: "H1", cls: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight", family: "jakarta" },
                  { label: "H2", cls: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight", family: "jakarta" },
                  { label: "H3", cls: "text-2xl sm:text-3xl font-bold tracking-tight", family: "jakarta" },
                  { label: "Lead", cls: "text-lg sm:text-xl leading-[1.7]", family: "inter" },
                  { label: "Body", cls: "text-base leading-[1.7]", family: "inter" },
                  { label: "Small", cls: "text-sm leading-[1.6]", family: "inter" },
                  { label: "Caption", cls: "text-xs tracking-wider uppercase font-semibold", family: "inter" },
                ].map((row) => (
                  <div key={row.label} className="grid grid-cols-[120px_1fr] items-center gap-6 p-5">
                    <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-primary-700">
                      {row.label}
                    </span>
                    <p
                      className={`text-neutral-900 ${row.cls}`}
                      style={{ fontFamily: row.family === "jakarta" ? "'Plus Jakarta Sans', sans-serif" : "'Inter', sans-serif" }}
                    >
                      {row.label === "Caption" ? "LABEL INSTITUCIONAL" : "Reabilitar é devolver o poder."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 · UI SYSTEM ────────────────────────────────── */}
        <section aria-labelledby="ui-title" className="relative py-24 lg:py-32 bg-neutral-50 overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionTitle
              num="04"
              eyebrow="UI System"
              title="Componentes reutilizáveis."
              subtitle="Botões, formulários, cards e badges. Todos com foco visível de 3px e contraste WCAG AA."
            />

            {/* Botões */}
            <div className="mb-14">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-5">Botões</h3>
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 transition shadow-md">
                  Primário
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary-500 text-white font-bold hover:bg-secondary-600 transition shadow-md">
                  Doação
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary-600 text-primary-800 font-bold hover:bg-primary-50 transition">
                  Outline
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-primary-800 font-bold hover:bg-primary-50 transition">
                  Ghost
                </button>
              </div>
              <p className="mt-3 text-xs text-neutral-600 font-mono">
                Componente: <code className="bg-neutral-200 px-1.5 py-0.5 rounded">@/components/ui/Button</code>
              </p>
            </div>

            {/* Badges */}
            <div className="mb-14">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-5">Badges & Pills</h3>
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-xs font-bold uppercase tracking-wider">
                  Em breve
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-50 border border-warm-200 text-warm-800 text-xs font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-warm-500 animate-pulse" aria-hidden="true" />
                  Em preparação
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 border border-accent-200 text-accent-800 text-xs font-bold uppercase tracking-wider">
                  <Check size={12} aria-hidden="true" />
                  Disponível
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider">
                  Obrigatórios
                </span>
              </div>
            </div>

            {/* Card & Form */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Card */}
              <div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-5">Card institucional</h3>
                <div className="rounded-2xl bg-white border border-neutral-200 hover:border-primary-400 hover:shadow-card transition-all p-8">
                  <span className="font-mono text-xs tracking-[0.2em] text-primary-600 mb-3 block">01</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700 mb-5">
                    <HeartHandshake size={22} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">Acolhimento</h4>
                  <p className="text-sm text-neutral-700 leading-[1.7]">
                    Escuta ativa e porta de entrada para todo o processo de reabilitação.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-5">Formulário</h3>
                <div className="rounded-2xl bg-white border border-neutral-200 p-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary-700 mb-2">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      placeholder="Como podemos chamar você?"
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="voce@exemplo.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 transition"
                    />
                  </div>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 transition shadow-md">
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="mt-10">
              <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-5">Citação / blockquote</h3>
              <div className="rounded-2xl bg-primary-900 text-white p-10 text-center">
                <Quote size={40} strokeWidth={1.2} className="mx-auto mb-5 text-primary-300" aria-hidden="true" />
                <blockquote
                  className="text-2xl sm:text-3xl font-bold leading-[1.3] tracking-tight max-w-2xl mx-auto"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  “O CVI me devolveu a confiança de que eu podia voltar a viver plenamente.”
                </blockquote>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-300">
                  — Maria S., paciente há 3 anos
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 · ICONOGRAFIA ──────────────────────────────── */}
        <section aria-labelledby="icons-title" className="relative py-24 lg:py-32 bg-white overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionTitle
              num="05"
              eyebrow="Iconografia"
              title="Lucide React, linha fina."
              subtitle="Padrão: stroke 1.5 em ícones grandes (28–40px) e 1.8 em ícones médios (16–22px). Sempre acompanhados de texto legível."
            />

            <div className="rounded-2xl border border-neutral-200 bg-white p-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-6">
              {[
                { Icon: Heart, name: "heart" },
                { Icon: HeartHandshake, name: "heart-handshake" },
                { Icon: ShieldCheck, name: "shield-check" },
                { Icon: Accessibility, name: "accessibility" },
                { Icon: Activity, name: "activity" },
                { Icon: Award, name: "award" },
                { Icon: Users, name: "users" },
                { Icon: Sparkles, name: "sparkles" },
                { Icon: Calendar, name: "calendar" },
                { Icon: Cookie, name: "cookie" },
                { Icon: Check, name: "check" },
                { Icon: ChevronDown, name: "chevron-down" },
              ].map(({ Icon, name }) => (
                <div key={name} className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <code className="text-[0.68rem] font-mono text-neutral-600">{name}</code>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-neutral-600 font-mono">
              Biblioteca: <code className="bg-neutral-200 px-1.5 py-0.5 rounded">lucide-react</code>
            </p>
          </div>
        </section>

        {/* ── 06 · ACESSIBILIDADE ───────────────────────────── */}
        <section aria-labelledby="a11y-title" className="relative py-24 lg:py-32 bg-primary-50/40 overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionTitle
              num="06"
              eyebrow="Acessibilidade"
              title="WCAG 2.1 AA é o mínimo — não o teto."
              subtitle="Nossa audiência inclui pessoas com deficiência. Cada decisão de design passa por esta régua."
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-accent-200 p-8">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-700 mb-4">
                  <Check size={14} aria-hidden="true" />
                  Sempre fazer
                </span>
                <ul className="space-y-3 text-sm text-neutral-800 leading-[1.7]">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} aria-hidden="true" className="mt-0.5 text-accent-600 shrink-0" strokeWidth={2.5} />
                    Foco visível de 3px em tom primary-500 com offset 3px
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} aria-hidden="true" className="mt-0.5 text-accent-600 shrink-0" strokeWidth={2.5} />
                    Contraste mínimo 4.5:1 para corpo, 3:1 para títulos grandes
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} aria-hidden="true" className="mt-0.5 text-accent-600 shrink-0" strokeWidth={2.5} />
                    Landmarks ARIA (main, nav, contentinfo, banner)
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} aria-hidden="true" className="mt-0.5 text-accent-600 shrink-0" strokeWidth={2.5} />
                    Skip links ("Pular para o conteúdo")
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} aria-hidden="true" className="mt-0.5 text-accent-600 shrink-0" strokeWidth={2.5} />
                    Animações respeitam prefers-reduced-motion
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} aria-hidden="true" className="mt-0.5 text-accent-600 shrink-0" strokeWidth={2.5} />
                    Ícones decorativos com aria-hidden="true"
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} aria-hidden="true" className="mt-0.5 text-accent-600 shrink-0" strokeWidth={2.5} />
                    VLibras integrado (toolbar de acessibilidade)
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white border border-secondary-200 p-8">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary-700 mb-4">
                  Nunca fazer
                </span>
                <ul className="space-y-3 text-sm text-neutral-800 leading-[1.7]">
                  <li className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0" />
                    Usar cor como única forma de transmitir informação
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0" />
                    Texto sobre imagem sem overlay suficiente para contraste
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0" />
                    Autoplay de vídeos com som
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0" />
                    Esconder foco do teclado (outline: none sem substituto)
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0" />
                    Botões sem label textual ou aria-label
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0" />
                    Tempo fixo em animações críticas (ex: carrosséis sem controle)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 07 · ASSINATURA DE E-MAIL ─────────────────────── */}
        <section aria-labelledby="signature-title" className="relative py-24 lg:py-32 bg-white overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionTitle
              num="07"
              eyebrow="Assinatura de E-mail"
              title="Gere sua assinatura institucional."
              subtitle="Preencha seus dados à esquerda, visualize o resultado à direita e copie o HTML pronto para colar no Gmail, Outlook, Apple Mail ou qualquer cliente de e-mail corporativo."
            />

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10">
              {/* Form de personalização */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8">
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight mb-5 flex items-center gap-2">
                  <Mail size={18} aria-hidden="true" className="text-primary-700" />
                  Seus dados
                </h3>

                <div className="space-y-4">
                  <SigField
                    label="Nome completo"
                    value={sig.name}
                    onChange={(v) => setSig((s) => ({ ...s, name: v }))}
                    placeholder="Ex: Maria Silva Santos"
                    icon={<Users size={14} aria-hidden="true" />}
                  />
                  <SigField
                    label="Cargo · Área"
                    value={sig.role}
                    onChange={(v) => setSig((s) => ({ ...s, role: v }))}
                    placeholder="Ex: Coordenadora · Fisioterapia"
                    icon={<Award size={14} aria-hidden="true" />}
                  />
                  <SigField
                    label="E-mail"
                    type="email"
                    value={sig.email}
                    onChange={(v) => setSig((s) => ({ ...s, email: v }))}
                    placeholder="voce@cviam.com.br"
                    icon={<Mail size={14} aria-hidden="true" />}
                  />
                  <SigField
                    label="Telefone / WhatsApp"
                    value={sig.phone}
                    onChange={(v) => setSig((s) => ({ ...s, phone: v }))}
                    placeholder="(92) 99999-9999"
                    icon={<Phone size={14} aria-hidden="true" />}
                  />
                  <SigField
                    label="Site institucional"
                    value={sig.website}
                    onChange={(v) => setSig((s) => ({ ...s, website: v }))}
                    placeholder="www.cviam.com.br"
                    icon={<Globe size={14} aria-hidden="true" />}
                  />
                </div>

                <button
                  type="button"
                  onClick={resetSignature}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 rounded-sm"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Restaurar padrões
                </button>
              </div>

              {/* Preview + ações */}
              <div className="flex flex-col gap-5">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-white">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
                      Visualização
                    </span>
                    <span className="text-[0.65rem] text-neutral-500 font-mono">
                      fidelidade de cliente de e-mail
                    </span>
                  </div>
                  <div className="p-8 bg-white">
                    <div
                      id="signature-preview"
                      dangerouslySetInnerHTML={{ __html: signatureHtml }}
                    />
                  </div>
                </div>

                {/* Botões de cópia */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={copySignatureRich}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary-700 text-white font-bold hover:bg-primary-800 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3"
                  >
                    {sigCopied === "rich" ? (
                      <>
                        <Check size={16} aria-hidden="true" />
                        Copiado! Cole no e-mail.
                      </>
                    ) : (
                      <>
                        <Copy size={16} aria-hidden="true" />
                        Copiar assinatura formatada
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={copySignatureCode}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-neutral-300 text-neutral-800 font-bold hover:bg-neutral-50 hover:border-neutral-400 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3"
                  >
                    {sigCopied === "html" ? (
                      <>
                        <Check size={16} aria-hidden="true" />
                        HTML copiado!
                      </>
                    ) : (
                      <>
                        <Code2 size={16} aria-hidden="true" />
                        Copiar código HTML
                      </>
                    )}
                  </button>
                </div>

                {/* Código HTML (collapsible) */}
                <details className="rounded-2xl border border-neutral-200 bg-neutral-50 group">
                  <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer font-semibold text-sm text-neutral-800 hover:bg-neutral-100 rounded-2xl transition-colors list-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3">
                    <span className="flex items-center gap-2">
                      <Code2 size={16} aria-hidden="true" className="text-primary-700" />
                      Ver código-fonte HTML
                    </span>
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className="text-neutral-500 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="border-t border-neutral-200 p-5">
                    <pre className="text-[11px] leading-relaxed font-mono text-neutral-800 overflow-x-auto whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
                      <code>{signatureHtml}</code>
                    </pre>
                  </div>
                </details>

                {/* Instruções rápidas */}
                <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5 text-sm text-neutral-800 leading-[1.7]">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700 mb-2">
                    Como instalar
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li><strong>Gmail:</strong> Configurações → Ver todas as configurações → Assinatura → Colar.</li>
                    <li><strong>Outlook (web):</strong> Configurações → E-mail → Redigir e responder → Colar em "Assinatura de e-mail".</li>
                    <li><strong>Apple Mail:</strong> Mail → Preferências → Assinaturas → colar na assinatura desejada (marque "Sempre corresponder à fonte padrão" <em>desmarcado</em>).</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 08 · TOM DE VOZ ───────────────────────────────── */}
        <section aria-labelledby="voice-title" className="relative py-24 lg:py-32 bg-neutral-900 text-white overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <div className="mb-16 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-xs tracking-[0.3em] text-primary-300 tabular-nums">08</span>
                <span aria-hidden="true" className="h-px w-12 bg-primary-400" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
                  Tom de voz
                </span>
              </div>
              <h2 id="voice-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                Como o CVI fala com o mundo.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Acolhedor",
                  desc: "Falamos com quem está chegando. Nunca intimidamos. Priorizamos escuta e clareza sobre jargão técnico.",
                },
                {
                  title: "Profissional",
                  desc: "Somos credenciados pelo Ministério da Saúde. A linguagem reflete responsabilidade, rigor e transparência clínica.",
                },
                {
                  title: "Empoderador",
                  desc: "Reabilitação é devolver o poder de escolha. Evitamos termos que diminuam ou infantilizem a pessoa atendida.",
                },
              ].map((t) => (
                <div key={t.title} className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-8">
                  <h3 className="text-xl font-bold tracking-tight mb-3">{t.title}</h3>
                  <p className="text-sm text-neutral-300 leading-[1.7]">{t.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-primary-500/40 bg-primary-900/50 p-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-300 mb-3">
                Regra de ouro
              </h3>
              <p className="text-xl font-bold leading-[1.4] tracking-tight text-white">
                Se a frase soaria estranha dita em voz alta para alguém que está vivendo o momento
                mais difícil da vida, reescreva.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
