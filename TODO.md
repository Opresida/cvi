# CVI Amazonas — Lista de Tarefas

## 🔥 Aguardando Cliente

- [ ] **Chaves de API do gateway de pagamento** — para integração real de doações (Mercado Pago, Asaas ou PagBank a definir)
- [ ] **Endereço completo do CVI** — atualizar `contact.info.address` em `src/data/content.ts` (atualmente apenas "Manaus, Amazonas - Brasil")
- [ ] **Depoimentos reais** de pacientes/familiares/profissionais (substituir placeholders em `testimonials.items`)
- [ ] **Coordenadas exatas para Google Maps** em `Contact.tsx`
- [ ] **Logos institucionais em SVG/PNG transparente** (SUS, FNS, SES/AM) para substituir selos atuais no footer

## ✅ Dados Reais — Concluídos

- [x] ~~Número do WhatsApp~~ → `5592991163746`
- [x] ~~E-mail institucional~~ → `cvi.amazonas@gmail.com`
- [x] ~~Telefone~~ → `(92) 99116-3746`
- [x] ~~Instagram oficial~~ → `https://www.instagram.com/cvi.am/`
- [x] ~~Reconhecimento CER III~~ → incluído em About.tsx
- [x] ~~Copy completa da página de serviços~~ → extraída via WebFetch do site antigo

## 📸 Fotografia

- [x] ~~Pasta "Acolhimento"~~ — 9 fotos carregadas
- [x] ~~Pasta "Apoio no Transporte"~~ — 10 fotos carregadas
- [x] ~~Pasta "Assembleia da Fundação"~~ — 11 fotos carregadas
- [x] ~~Pasta "Atividades"~~ — 8 fotos carregadas
- [x] ~~Pasta "Eventos"~~ — 7 fotos carregadas
- [ ] Legendas descritivas em cada foto da galeria (hoje `caption: ""`)
- [ ] Foto da fachada / instalações do CVI em Manaus (para Showcase ou About)
- [ ] Fotos adicionais para futuras campanhas (banners, redes sociais)

## ⚙️ Funcionalidades

### Alta prioridade
- [ ] **Integrar gateway real de doação** (Stripe, Mercado Pago, Asaas) — `src/services/donationAPI.ts` a criar quando chegar a chave
- [ ] **Validação de payload Pix dinâmico** (Banco Central — EMV) quando houver gateway com valor customizável
- [ ] **Integrar formulário de contato com backend** (EmailJS, Formspree, ou função serverless Netlify)
- [ ] **Integração Google Analytics 4** — consumir `preferences.analytics` via `useCookieConsent()` antes de inicializar

### Média prioridade
- [ ] Página `/transparencia` (relatórios anuais, prestação de contas SUS/SES-AM)
- [ ] Página `/trabalhe-conosco` com upload de currículo
- [ ] Blog/notícias integrado (CMS headless: Sanity, Strapi ou Contentful)
- [ ] Endereço via API ViaCEP no formulário de contato
- [ ] Campo de telefone com máscara no formulário
- [ ] Newsletter integrada (RD Station, Mailchimp)

### Baixa prioridade
- [ ] Modo escuro (dark mode toggle)
- [ ] Internacionalização (PT-BR / EN / ES)
- [ ] PWA — funcionamento offline para áreas com conexão limitada
- [ ] Chatbot acessível para suporte inicial
- [ ] Vídeos institucionais com legendas + transcrição (WebVTT)
- [ ] Área do paciente (login + agendamento)

## 🔍 SEO & Analytics

- [ ] Configurar Google Analytics 4 / Tag Manager (respeitar consentimento LGPD)
- [ ] Gerar `sitemap.xml` e `robots.txt`
- [ ] Open Graph image (1200×630) para compartilhamento social
- [ ] Meta tags específicas por rota (`/servicos`, `/galeria`, `/privacidade`, `/brandbook`)
- [ ] Schema.org `FAQPage` para a seção de perguntas frequentes
- [ ] Verificar Search Console + Bing Webmaster Tools

## ♿ Acessibilidade — Validação Final

- [ ] Auditoria com Lighthouse (meta ≥ 95)
- [ ] Teste com screen reader (NVDA no Windows / VoiceOver no Mac)
- [ ] Teste manual de navegação por teclado em todas rotas e modais
- [ ] Validar contraste de todas combinações cor/fundo (WAVE)
- [ ] Testar com `prefers-reduced-motion` ativado no SO
- [ ] Validar com utilizadores reais (PcDs)
- [ ] Teste do lightbox com screen reader (`role="dialog"`, `aria-modal`)
- [ ] Teste do banner de cookies com navegação por teclado

## 🔐 Privacidade & Compliance

- [x] ~~Banner de cookies LGPD~~ — implementado (`CookieConsent.tsx`)
- [x] ~~Modal de preferências (3 categorias)~~ — implementado
- [x] ~~Página `/privacidade`~~ — política LGPD completa (10 seções)
- [ ] Revisão jurídica da política de privacidade (contratar ou solicitar DPO/assessoria)
- [ ] Publicar DPO designado pelo CVI (caso aplicável)
- [ ] Fluxo operacional para atender requests de titular (acesso, correção, eliminação)

## 🎨 Brandbook & Identidade

- [x] ~~Brandbook completo em `/brandbook`~~ (Logo, Paleta, Tipografia, UI System, Iconografia, Acessibilidade, Tom de voz)
- [x] ~~Gerador interativo de assinatura de e-mail com logo~~ — copy HTML + rich paste
- [ ] Variantes adicionais do logo (marca-d'água, stencil, ícone isolado oficial)
- [ ] Templates de e-mail (boas-vindas, agendamento, feedback)
- [ ] Kit de apresentação institucional (slides, pitch deck)

## 🐛 Bugs Conhecidos

- Nenhum bug ativo identificado até o momento.

## 🚀 Entregas Recentes (changelog resumido)

- ✅ Sistema LGPD completo (banner + modal + política + integração Footer/Toolbar)
- ✅ Brandbook `/brandbook` com gerador de assinatura de e-mail
- ✅ Galeria `/galeria` com 5 pastas, 45 fotos, lightbox e CTA final
- ✅ Página `/servicos` com catálogo completo migrado do site antigo
- ✅ FAQ na home (seção 07)
- ✅ Seção Galeria na home (seção 08) com cover photos
- ✅ Contato oficial atualizado (telefone, e-mail, Instagram) em site + Schema.org
- ✅ Reconhecimento CER III incluído em About
- ✅ Selos institucionais no Footer
- ✅ Rota multi-page ativada (BrowserRouter)
