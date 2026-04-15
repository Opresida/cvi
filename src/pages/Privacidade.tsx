import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Cookie, Settings2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLinks } from "@/components/layout/SkipLinks";
import { AccessibilityToolbar } from "@/components/layout/AccessibilityToolbar";
import { FloatingDonateCTA } from "@/components/layout/FloatingDonateCTA";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

const LAST_UPDATE = "novembro de 2025";

export function Privacidade() {
  const openCookiePrefs = () => {
    window.dispatchEvent(new CustomEvent("cvi:open-cookie-preferences"));
  };

  return (
    <>
      <SkipLinks />
      <Header />
      <AccessibilityToolbar />

      <main id="main-content" role="main">
        {/* Hero */}
        <section
          aria-labelledby="privacy-title"
          className="relative pt-40 pb-16 lg:pt-48 lg:pb-20 bg-gradient-to-b from-primary-50 via-white to-white overflow-hidden"
        >
          <div className="relative mx-auto max-w-4xl px-6 sm:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 mb-8 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 rounded-sm"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Voltar para a página inicial
              </Link>

              <div className="flex items-center gap-4 mb-8">
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-lg shadow-primary-700/25"
                >
                  <Shield size={24} strokeWidth={1.6} />
                </span>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span aria-hidden="true" className="h-px w-12 bg-primary-600" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
                      Transparência &amp; LGPD
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Última atualização: {LAST_UPDATE}
                  </p>
                </div>
              </div>

              <h1
                id="privacy-title"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.05] tracking-tight mb-6"
              >
                Política de Privacidade e Cookies
              </h1>

              <p className="text-lg text-neutral-700 leading-[1.75]">
                O CVI Amazonas respeita sua privacidade. Este documento explica quais
                dados coletamos, por que coletamos e como você pode exercer seus
                direitos — em cumprimento à <strong>Lei Geral de Proteção de
                Dados (Lei nº 13.709/2018)</strong>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-16">
            <div className="prose-style">
              <Section id="quem-somos" title="1. Quem somos">
                <p>
                  O Centro de Vida Independente do Amazonas (CVI-AM), inscrito sob o
                  CNPJ 07.555.086/0001-68, é uma instituição sem fins lucrativos
                  reconhecida pelo Ministério da Saúde como Centro Especializado em
                  Reabilitação — CER III. Operamos em Manaus/AM e mantemos este
                  site como canal institucional de comunicação pública.
                </p>
              </Section>

              <Section id="dados-coletados" title="2. Quais dados coletamos">
                <p>Coletamos dados apenas quando estritamente necessário, sempre com finalidade declarada:</p>
                <ul>
                  <li>
                    <strong>Dados de navegação (cookies):</strong> identificador de
                    sessão, preferências de acessibilidade (fonte, contraste),
                    preferências de cookies e métricas anônimas de uso (se você
                    consentir).
                  </li>
                  <li>
                    <strong>Dados fornecidos voluntariamente:</strong> quando você
                    preenche formulários de contato (nome, e-mail, telefone,
                    mensagem) ou envia mensagens via WhatsApp.
                  </li>
                  <li>
                    <strong>Dados sensíveis de saúde:</strong> eventualmente,
                    informações clínicas compartilhadas em contatos de triagem —
                    tratadas com a proteção agravada prevista na LGPD (art. 11).
                  </li>
                </ul>
                <p className="callout">
                  Não vendemos, alugamos ou comercializamos seus dados. Nunca.
                </p>
              </Section>

              <Section id="finalidades" title="3. Para que usamos seus dados">
                <ul>
                  <li>Responder contatos, triagens e pedidos de informação;</li>
                  <li>Agendar avaliações e acompanhar atendimentos via rede SUS;</li>
                  <li>Melhorar a experiência do site (acessibilidade, performance, navegação);</li>
                  <li>Comunicação institucional (quando você autoriza expressamente);</li>
                  <li>Prestação de contas a órgãos públicos quando exigido por lei.</li>
                </ul>
              </Section>

              <Section id="base-legal" title="4. Base legal do tratamento (LGPD)">
                <ul>
                  <li><strong>Consentimento</strong> — para cookies opcionais e envio de comunicação institucional;</li>
                  <li><strong>Execução de políticas públicas</strong> — para atendimento no âmbito do SUS (art. 7º, III);</li>
                  <li><strong>Cumprimento de obrigação legal</strong> — para prestação de contas à SES/AM e ao Fundo Nacional de Saúde;</li>
                  <li><strong>Tutela da saúde</strong> — em procedimentos clínicos (art. 11, II, f).</li>
                </ul>
              </Section>

              <Section id="cookies" title="5. Cookies — detalhamento">
                <p>Utilizamos três categorias de cookies:</p>
                <dl>
                  <dt>Essenciais <span className="badge">Obrigatórios</span></dt>
                  <dd>Mantêm o site funcionando: sessão do navegador, preferências de acessibilidade (tamanho de fonte, alto contraste), consentimento de cookies. Não podem ser desativados.</dd>

                  <dt>Analíticos <span className="badge badge-optional">Opcionais</span></dt>
                  <dd>Métricas anônimas e agregadas (páginas mais visitadas, tempo de permanência, dispositivo). Ajudam a identificar falhas de acessibilidade e melhorar a experiência. Nenhum dado pessoal é vinculado.</dd>

                  <dt>Marketing <span className="badge badge-optional">Opcionais</span></dt>
                  <dd>Cookies de remarketing institucional que permitem mensurar o alcance de campanhas de conscientização sobre direitos da PcD. Jamais usados para fins comerciais de terceiros.</dd>
                </dl>

                <div className="action-card">
                  <div>
                    <h4>Gerenciar preferências de cookies</h4>
                    <p>Você pode aceitar, rejeitar ou personalizar suas escolhas a qualquer momento.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCookiePrefs}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-700 text-white font-bold text-sm hover:bg-primary-800 transition-colors shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 focus-visible:ring-offset-3 whitespace-nowrap"
                  >
                    <Settings2 size={16} aria-hidden="true" />
                    Abrir preferências
                  </button>
                </div>
              </Section>

              <Section id="compartilhamento" title="6. Com quem compartilhamos">
                <p>
                  Seus dados são compartilhados apenas quando estritamente necessário:
                </p>
                <ul>
                  <li><strong>Rede SUS e SES/AM:</strong> para continuidade do cuidado e prestação de contas;</li>
                  <li><strong>Autoridades competentes:</strong> mediante requisição legal;</li>
                  <li><strong>Operadores de infraestrutura:</strong> provedores de hospedagem e e-mail, sob contrato com cláusulas de confidencialidade.</li>
                </ul>
                <p>
                  Nenhum dado é transferido para fora do Brasil sem sua ciência expressa.
                </p>
              </Section>

              <Section id="direitos" title="7. Seus direitos (LGPD)">
                <p>
                  A LGPD garante ao titular dos dados os seguintes direitos, exercíveis
                  a qualquer tempo:
                </p>
                <ul>
                  <li>Confirmar a existência de tratamento dos seus dados;</li>
                  <li>Acessar os dados que possuímos sobre você;</li>
                  <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                  <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                  <li>Revogar o consentimento e se opor a tratamentos baseados nele;</li>
                  <li>Solicitar a portabilidade dos seus dados;</li>
                  <li>Ser informado sobre compartilhamentos realizados.</li>
                </ul>
              </Section>

              <Section id="seguranca" title="8. Segurança e retenção">
                <p>
                  Adotamos medidas técnicas e administrativas adequadas para proteger
                  seus dados: criptografia em trânsito (HTTPS), controle de acesso
                  baseado em função e registros de auditoria.
                </p>
                <p>
                  Os dados são retidos apenas pelo tempo necessário às finalidades
                  declaradas ou às obrigações legais de guarda (prontuários médicos,
                  por exemplo, seguem prazos específicos da legislação sanitária).
                </p>
              </Section>

              <Section id="contato" title="9. Como nos contatar">
                <p>
                  Para exercer seus direitos, esclarecer dúvidas ou relatar incidentes
                  envolvendo dados pessoais:
                </p>
                <ul className="contact-list">
                  <li>
                    <strong>E-mail:</strong>{" "}
                    <a href="mailto:cvi.amazonas@gmail.com">cvi.amazonas@gmail.com</a>
                  </li>
                  <li>
                    <strong>WhatsApp:</strong>{" "}
                    <a href="https://wa.me/5592991163746" target="_blank" rel="noreferrer">(92) 99116-3746</a>
                  </li>
                  <li>
                    <strong>Endereço:</strong> Manaus, Amazonas — Brasil
                  </li>
                </ul>
                <p>
                  Você também pode apresentar reclamação à{" "}
                  <a
                    href="https://www.gov.br/anpd"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-2 decoration-primary-300 underline-offset-4"
                  >
                    Autoridade Nacional de Proteção de Dados (ANPD)
                  </a>
                  .
                </p>
              </Section>

              <Section id="alteracoes" title="10. Alterações desta política">
                <p>
                  Esta política pode ser atualizada para refletir mudanças legais ou
                  operacionais. A data da última revisão estará sempre indicada no
                  topo deste documento. Alterações substanciais farão com que o banner
                  de cookies seja exibido novamente para renovar seu consentimento.
                </p>
              </Section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingDonateCTA />
      <FloatingWhatsApp />

      {/* Estilos específicos da página */}
      <style>{`
        .prose-style { color: #334155; font-size: 1rem; line-height: 1.8; }
        .prose-style p { margin: 0 0 1.25rem; }
        .prose-style ul { margin: 0 0 1.5rem; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .prose-style li { list-style: disc; padding-left: 0.25rem; }
        .prose-style li::marker { color: #0a7688; }
        .prose-style strong { color: #0f172a; font-weight: 700; }
        .prose-style a { color: #0a7688; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; text-decoration-color: rgba(15, 168, 189, 0.35); font-weight: 600; }
        .prose-style a:hover { text-decoration-color: #0a7688; }
        .prose-style a:focus-visible { outline: 3px solid #0fa8bd; outline-offset: 3px; border-radius: 2px; }
        .prose-style .callout { background: rgba(15, 168, 189, 0.06); border-left: 4px solid #0a7688; padding: 1rem 1.25rem; border-radius: 0.5rem; font-weight: 600; color: #0f172a; margin: 1.5rem 0; }
        .prose-style dl { margin: 1rem 0 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .prose-style dt { font-weight: 700; color: #0f172a; font-size: 1.05rem; display: inline-flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .prose-style dd { margin: 0.25rem 0 0 0; padding-left: 0; color: #475569; line-height: 1.75; }
        .prose-style .badge { display: inline-flex; font-size: 0.68rem; padding: 0.15rem 0.6rem; border-radius: 999px; background: #e5e7eb; color: #374151; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .prose-style .badge-optional { background: rgba(15, 168, 189, 0.12); color: #0a7688; }
        .prose-style .action-card { margin: 1.5rem 0; padding: 1.5rem; background: #f0f9fa; border: 1px solid rgba(15, 168, 189, 0.2); border-radius: 1rem; display: grid; gap: 1rem; }
        @media (min-width: 640px) { .prose-style .action-card { grid-template-columns: 1fr auto; align-items: center; } }
        .prose-style .action-card h4 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; }
        .prose-style .action-card p { margin: 0; font-size: 0.9rem; color: #475569; }
        .prose-style .contact-list li { list-style: none; padding-left: 0; }
        .prose-style .contact-list { padding-left: 0; }
      `}</style>
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-5 flex items-center gap-3">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Cookie size={16} strokeWidth={2} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
