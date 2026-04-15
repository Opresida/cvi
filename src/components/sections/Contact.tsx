import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe, Clock, Send } from "lucide-react";
import { siteContent } from "@/data/content";

const { contact } = siteContent;

function formatPhoneHref(phone: string): string {
  return "tel:+55" + phone.replace(/\D/g, "");
}

export function Contact() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrar com backend/serviço de e-mail (EmailJS, Formspree, etc.)
    setStatus("sent");
    setTimeout(() => {
      setStatus("idle");
      setFormState({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <section id="contato" aria-labelledby="contact-title" className="relative py-28 lg:py-36 bg-white overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-10 right-0 text-[20rem] font-black text-primary-50 leading-none select-none pointer-events-none hidden lg:block"
      >
        10
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
              {contact.section_label}
            </span>
          </div>
          <h2 id="contact-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] mb-6">
            {contact.headline}
          </h2>
          <p className="text-lg text-neutral-700 leading-relaxed">{contact.subheadline}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Informações tipográficas (sem cards) */}
          <div>
            <dl className="space-y-8 mb-10">
              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 mb-1">
                  <MapPin size={14} aria-hidden="true" /> Endereço
                </dt>
                <dd className="text-2xl font-semibold text-neutral-900 leading-tight">
                  {contact.info.address}
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 mb-1">
                  <Phone size={14} aria-hidden="true" /> Telefone
                </dt>
                <dd>
                  <a
                    href={formatPhoneHref(contact.info.phone)}
                    className="text-2xl font-semibold text-primary-700 hover:text-primary-900 border-b-2 border-primary-200 hover:border-primary-600 transition-colors"
                  >
                    {contact.info.phone}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 mb-1">
                  <Mail size={14} aria-hidden="true" /> E-mail
                </dt>
                <dd>
                  <a
                    href={`mailto:${contact.info.email}`}
                    className="text-2xl font-semibold text-primary-700 hover:text-primary-900 border-b-2 border-primary-200 hover:border-primary-600 transition-colors break-all"
                  >
                    {contact.info.email}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 mb-1">
                  <Globe size={14} aria-hidden="true" /> Website
                </dt>
                <dd>
                  <a
                    href={`https://${contact.info.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl font-semibold text-primary-700 hover:text-primary-900 border-b-2 border-primary-200 hover:border-primary-600 transition-colors"
                  >
                    {contact.info.website}
                  </a>
                </dd>
              </div>

              <div className="flex items-start gap-3 pt-6 border-t border-neutral-200">
                <Clock size={20} aria-hidden="true" className="text-primary-600 mt-1" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
                    {contact.hours.label}
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {contact.hours.schedule}
                  </p>
                </div>
              </div>
            </dl>

            {/* Google Maps embed - Manaus */}
            <div className="aspect-video rounded-2xl overflow-hidden border border-neutral-200">
              <iframe
                title="Localização do CVI Amazonas em Manaus"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d31902.52!2d-60.0215!3d-3.1019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1700000000000"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Formulário acessível */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            aria-labelledby="form-title"
            className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 lg:p-10"
          >
            <h3 id="form-title" className="text-2xl font-bold text-neutral-900 mb-6">
              Envie sua mensagem
            </h3>

            <div className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-neutral-800 mb-2">
                  Nome <span aria-hidden="true" className="text-secondary-500">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  aria-required="true"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-neutral-800 mb-2">
                  E-mail <span aria-hidden="true" className="text-secondary-500">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  aria-required="true"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-neutral-800 mb-2">
                  Mensagem <span aria-hidden="true" className="text-secondary-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  aria-required="true"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sent"}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800
                  disabled:bg-accent-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl
                  transition-colors focus-visible:ring-4 focus-visible:ring-primary-300"
              >
                {status === "sent" ? "Mensagem enviada!" : "Enviar mensagem"}
                <Send size={18} aria-hidden="true" />
              </button>

              <p role="status" aria-live="polite" className="sr-only">
                {status === "sent" ? "Sua mensagem foi enviada com sucesso" : ""}
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
