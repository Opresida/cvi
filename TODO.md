# CVI Amazonas — Lista de Tarefas

## 🔥 Aguardando Cliente

- [ ] **Chaves de API do gateway de pagamento** — para integração real de doações (Mercado Pago, Asaas ou PagBank a definir)
- [ ] **Endereço completo do CVI** — atualizar `contact.info.address` em `src/data/content.ts` (atualmente apenas "Manaus, Amazonas - Brasil")
- [ ] **Depoimentos reais** de pacientes/familiares/profissionais (substituir placeholders em `testimonials.items`)
- [ ] **Coordenadas exatas para Google Maps** em `Contact.tsx`
- [ ] **Logos institucionais em SVG/PNG transparente** (SUS, FNS, SES/AM) para substituir selos atuais no footer

## 🏢 Painel Administrativo — Próximas Etapas

### Dashboard por departamento
- [ ] **Dashboard do RH** — o Painel atual será transformado no dashboard específico do RH, com métricas de ponto, banco de horas, resumo mensal, alertas de ajustes pendentes
- [ ] **Dashboard geral** — visão consolidada de todos os departamentos (só admin)

### Novos departamentos (sidebar já preparada)
- [ ] **Financeiro** — rota `/admin/dashboard/financeiro/*`
- [ ] **Exames** — rota `/admin/dashboard/exames/*`
- [ ] Cada departamento terá seu responsável e dashboard próprio

### Controle de acesso por nível
- [ ] Criar sistema de permissões granulares (não só admin/gestor/funcionario)
- [ ] Cada gestor gerencia apenas seu departamento (ex: Enéas → RH, outro → Financeiro)
- [ ] Funcionário vê apenas as funções do departamento ao qual pertence
- [ ] Painel de gestão de permissões para o admin

### Sistema de RH — evoluções futuras (Fase 2)
- [ ] **Lançamentos granulares de desconto/abono** (em vez do valor total — cada lançamento vinculado a um atraso ou atestado específico)
- [ ] **Cálculo automático de descontos** (sugestão baseada em atraso × valor-hora, admin aprova)
- [ ] **Notificação por e-mail** quando admin envia tratamento pra revisão (hoje só janela flutuante)
- [ ] **Dashboard financeiro mensal** (gráficos de folha, evolução de descontos/abonos, total a pagar)
- [ ] **Integração com contador** (envio automatizado do ZIP por e-mail ao invés de download manual)
- [ ] **Upload em lote de contracheques** (drag & drop múltiplos PDFs, matching por nome)
- [ ] **Relatórios gerenciais** (banco de horas, horas extras, absenteísmo)
- [ ] **Assinatura digital real** nos PDFs exportados (ICP-Brasil ou similar)
- [ ] **Histórico auditável** de edições em tratamento (quem alterou o quê, quando)

## 🔍 SEO & Analytics

- [ ] Configurar Google Analytics 4 / Tag Manager (respeitar consentimento LGPD)
- [ ] Gerar `sitemap.xml` e `robots.txt`
- [ ] Open Graph image (1200×630) para compartilhamento social
- [ ] Meta tags específicas por rota (`/servicos`, `/galeria`, `/privacidade`, `/brandbook`)
- [ ] Schema.org `FAQPage` para a seção de perguntas frequentes
- [ ] Verificar Search Console + Bing Webmaster Tools

## ⚙️ Site Institucional — pendências

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

## 📸 Fotografia

- [x] ~~Pasta "Acolhimento"~~ — 9 fotos carregadas
- [x] ~~Pasta "Apoio no Transporte"~~ — 10 fotos carregadas
- [x] ~~Pasta "Assembleia da Fundação"~~ — 11 fotos carregadas
- [x] ~~Pasta "Atividades"~~ — 8 fotos carregadas
- [x] ~~Pasta "Eventos"~~ — 7 fotos carregadas
- [ ] Legendas descritivas em cada foto da galeria (hoje `caption: ""`)
- [ ] Foto da fachada / instalações do CVI em Manaus (para Showcase ou About)
- [ ] Fotos adicionais para futuras campanhas (banners, redes sociais)

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

## 🏗️ Infraestrutura

- [ ] **Migrar backend do Replit pro Render** (elimina fricção do agente Replit com migrations)
- [ ] **Separar banco Neon em branches** (dev local vs prod) — evita testes sujarem prod
- [ ] **Backup automatizado do Neon** (exportar schema + dados diariamente)
- [ ] **Monitoramento de uptime** (UptimeRobot ou similar) com alerta em caso de queda
- [ ] **Logs estruturados** do servidor (hoje `console.log` puro — migrar para Pino/Winston)

## 🚀 Entregas Recentes (changelog)

### Ciclo completo de folha mensal (8 blocos — commit `4670a59`)
- ✅ **Storage de arquivos** (bytea no Neon) — base para contracheques, atestados, avisos de férias
- ✅ **Histórico de salário** (bruto + líquido + vigência) — com UI no modal de funcionário + card no Dashboard
- ✅ **Justificativas com anexo PDF** — multer + autorização por endpoint, preview no admin
- ✅ **Férias 30 dias** — período único, aviso PDF opcional, acknowledge do funcionário, mudança de status
- ✅ **Tratamento mensal** (desconto/abono manual + notas) — com pré-visualização do que o funcionário verá
- ✅ **Ciclo de aprovação 24h** — scheduler interno, janela flutuante, aprovar/questionar/auto-aprovar
- ✅ **Exportação ZIP** — pasta por funcionário + CSV consolidado + PDF institucional timbrado (padrão IDASAM)
- ✅ **Contracheque** — admin faz upload PDF, funcionário baixa o próprio; substituição automática

### Correções/melhorias do mesmo período
- ✅ **Geofencing 3 faixas** (0-100m válido / 100-350m flagga / >350m bloqueia)
- ✅ **CORS com log estruturado** (origem, IP, path, user-agent em rejeições)
- ✅ **Responsividade mobile completa** em todas as telas admin (cards no mobile, tabela no desktop)
- ✅ **Modal "Alterar senha"** no dropdown do avatar + endpoint autenticado
- ✅ **Componente PasswordInput** reutilizável com toggle olho/olho-fechado
- ✅ **Almoço opcional** (`hasLunchBreak` por funcionário, reversível)
- ✅ **Busca de presença de hoje** na tela de Ponto (só admin/gestor, refresh 30s)

### Anteriores (mantidos)
- ✅ **Reconhecimento facial** com face-api.js (TensorFlow.js) — cadastro + verificação + QR Code mobile
- ✅ **Sistema de ponto** — GPS geofencing + reconhecimento facial obrigatório (entrada/saída)
- ✅ **Painel admin** com sidebar colapsável por departamento (RH, futuros: Financeiro, Exames)
- ✅ **CRUD de funcionários** (CLT/PJ, jornada configurável, ativar/desativar/reativar)
- ✅ **Workflow de ajustes** (solicitar → aprovar/rejeitar) com anti race condition
- ✅ **Espelho de ponto** mensal com impressão e assinatura
- ✅ **Segurança** — 84 testes + 30 vetores de pentest + sanitização XSS + JWT blacklist + rate limiting
- ✅ Sistema LGPD completo (banner + modal + política + integração Footer/Toolbar)
- ✅ Brandbook `/brandbook` com gerador de assinatura de e-mail
- ✅ Galeria `/galeria` com 5 pastas, 45 fotos, lightbox e CTA final
- ✅ Página `/servicos` com catálogo completo migrado do site antigo
- ✅ Contato oficial atualizado (telefone, e-mail, Instagram) em site + Schema.org
- ✅ Rota multi-page ativada (BrowserRouter)
