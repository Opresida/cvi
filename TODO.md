# CVI Amazonas — Lista de Tarefas

## 🔥 Pendente — Dados Reais

- [ ] **Número real do WhatsApp** — atualizar `src/data/content.ts → contact.whatsapp.number` (placeholder atual: `5592000000000`)
- [ ] **Telefone, e-mail e endereço completo** do CVI (atualizar `contact.info`)
- [ ] **URLs reais das redes sociais** — Facebook, Instagram, YouTube em `footer.social`
- [ ] **Depoimentos reais** de pacientes/familiares/profissionais (substituir placeholders em `testimonials.items`)
- [ ] **Endereço real para Google Maps** — atualizar `src/components/sections/Contact.tsx` com coordenadas exatas
- [ ] **Logos de parceiros institucionais** (SUS, FNS, SES/AM) em formato SVG/PNG transparente

## 📸 Fotografia
- [ ] Galeria de fotos reais da equipe em atendimento
- [ ] Foto da fachada/instalações do CVI em Manaus
- [ ] Fotos de eventos, formaturas, comunidade

## ⚙️ Funcionalidades
- [ ] Integrar formulário de contato com backend (EmailJS, Formspree ou serviço próprio)
- [ ] Integrar gateway real de doação (Stripe, Cielo, Mercado Pago)
- [ ] Validar Pix dinâmico (Banco Central — payload Pix EMV)
- [ ] Página de transparência (relatórios anuais, prestação de contas)
- [ ] Página "Trabalhe Conosco" com upload de currículo
- [ ] Blog/notícias integrado (CMS headless: Sanity, Strapi, Contentful)

## 🎨 Visuais
- [ ] Substituir placeholders de avatar nos depoimentos por fotos reais (foco circular 56×56)
- [ ] Adicionar mais momentos visuais únicos (ilustrações customizadas amazônicas)
- [ ] Considerar dark mode opcional

## 🔍 SEO & Analytics
- [ ] Configurar Google Analytics 4 / Tag Manager
- [ ] Gerar `sitemap.xml` e `robots.txt`
- [ ] Open Graph image (1200×630) para compartilhamento social
- [ ] Verificar Search Console + Bing Webmaster Tools

## ♿ Acessibilidade — Validação Final
- [ ] Auditoria com Lighthouse (meta ≥ 95)
- [ ] Teste com screen reader (NVDA Windows / VoiceOver Mac)
- [ ] Teste manual de navegação por teclado em todas seções
- [ ] Validar contraste de todas combinações cor/fundo (WAVE)
- [ ] Testar com `prefers-reduced-motion` ativado no SO
- [ ] Validar com utilizadores reais (PcDs)

## 🐛 Bugs Conhecidos
- Nenhum bug identificado até o momento

## 🚀 Melhorias Futuras (Backlog)
- [ ] Internacionalização (pt-BR / en / es)
- [ ] PWA — funcionamento offline para áreas com conexão limitada
- [ ] Área do paciente (login + agendamento)
- [ ] Newsletter integrada
- [ ] Chatbot acessível para suporte inicial
- [ ] Vídeos institucionais com legendas + transcrição (WebVTT)
