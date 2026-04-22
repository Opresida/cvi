# CVI Amazonas — Arquitetura

## Visão Geral

```
┌─────────────────────────────────────────────────┐
│                    index.html                    │
│                   (entry + SEO)                  │
├─────────────────────────────────────────────────┤
│                     main.tsx                     │
│           (React bootstrap + Router)             │
├─────────────────────────────────────────────────┤
│                      App.tsx                     │
│       (Routes + CookieConsent global)            │
├─────────────────────────────────────────────────┤
│   /            → Home (10 seções)                │
│   /servicos    → Catálogo completo               │
│   /galeria     → 5 pastas + lightbox             │
│   /privacidade → Política LGPD                   │
│   /brandbook   → Design system + gerador email   │
└─────────────────────────────────────────────────┘
```

## Estrutura de Rotas

### `/` — Home (single-page narrativa)
```
Header → Hero (00) → Showcase → About (01) → Impact (02)
     → Services (03) → Pillars (04) → Team (05)
     → Testimonials (06) → Faq (07) → Galeria (08)
     → Donate (09) → Contact (10) → Footer
```

### `/servicos` — Catálogo completo
```
Hero → Imagem humanização (esq) → Filosofia (dark quote)
    → Especialidades (12 cards, grid 2 cols)
    → Projetos estruturantes (PTS + Incontinência)
    → Patologias (18 pills)
    → Imagem humanização (dir)
    → Modalidades (grid 3 cols dark)
    → Formas de entrada (grid numerado)
    → Elegibilidade (3 tipos + inelegibilidade)
    → Fluxo de alta
    → CTA final
```

### `/galeria` — Galeria com 5 pastas
```
Hero → Abas sticky (5 pastas + contador)
    → Grid dinâmico da pasta ativa (2/3/4 cols)
    → Lightbox (ESC fecha, ←/→ navega)
    → CTA final (contato + doação)
```

### `/privacidade` — Política LGPD
```
Hero → Introdução institucional
    → 10 seções (Quem somos, Dados, Finalidades, Base legal,
                Cookies, Compartilhamento, Direitos, Segurança,
                Contato, Alterações)
    → Botão "Abrir preferências de cookies" inline
```

### `/brandbook` — Design system
```
Hero (00) → Logo (01) → Paleta (02) → Tipografia (03)
    → UI System (04) → Iconografia (05) → Acessibilidade (06)
    → Assinatura de e-mail — gerador (07)
    → Tom de voz (08)
```

## Fluxo de Dados

```
content.ts  (fonte única de copy e dados estáticos)
     │
     ├─► Páginas (Home, Servicos, Galeria)
     │       │
     │       ├─► Componentes de seção (importam siteContent)
     │       │       │
     │       │       ├─► Props → UI primitives (Button, SectionLabel)
     │       │       ├─► Hooks de interação (useCountUp, useScrollspy)
     │       │       └─► Framer Motion (entrada animada)
     │       │
     │       └─► Estado local (lightbox, tabs, accordion)
     │
     ├─► Brandbook → renderiza paleta/fontes + gerador de assinatura
     │
     └─► Privacidade → conteúdo editorial estruturado

────────────────────────────────────────────────────

window (eventos globais)
     ├─► cvi:open-cookie-preferences → CookieConsent abre modal
     └─► cvi:consent-change         → componentes reagem a mudanças
                                      (ex: ativar/desativar GA4)

────────────────────────────────────────────────────

localStorage (persistência client-side)
     ├─► cvi.cookie-consent        → { version, preferences, decidedAt }
     └─► cvi.accessibility-settings → { fontSize, highContrast, ... }
```

## Estrutura de Pastas

```
cvi/
├── public/
│   └── favicon.png
├── server/                         # Backend Express + Drizzle
│   ├── db/
│   │   ├── index.ts                # Conexão Neon serverless
│   │   └── schema.ts               # Todas as tabelas + enums
│   ├── routes/
│   │   ├── auth.ts                 # Login, logout, me, change-password
│   │   ├── employees.ts            # CRUD de funcionários
│   │   ├── ponto.ts                # Registro + geofencing 3 faixas + espelho
│   │   ├── adjustments.ts          # Ajustes com anexo PDF (multer)
│   │   ├── face.ts                 # Reconhecimento facial + sessões QR
│   │   ├── salary.ts               # Histórico de salário
│   │   ├── vacations.ts            # Férias + aviso PDF + acknowledge
│   │   ├── treatments.ts           # Tratamento mensal + ciclo 24h
│   │   ├── exports.ts              # ZIP mensal (CSV + PDF institucional)
│   │   └── paystubs.ts             # Upload/download contracheque
│   ├── middleware/
│   │   └── auth.ts                 # JWT verify + blacklist + roles
│   ├── utils/
│   │   ├── geofence.ts             # Haversine distance
│   │   ├── sanitize.ts             # XSS prevention
│   │   ├── tokenBlacklist.ts       # JWT invalidation
│   │   ├── fileStorage.ts          # bytea helpers (saveFile/loadFile)
│   │   ├── autoApproveTreatments.ts # Scheduler 24h interno
│   │   └── pdfFolha.ts             # PDF institucional (pdf-lib)
│   ├── index.ts                    # Express server + rate limit + scheduler boot
│   └── seed.ts                     # Admin inicial + systemSettings
│
├── src/                            # Frontend React + Vite
│   ├── assets/images/              # Logos, fotos, hero, team
│   │   ├── logo.png                # Colorido (site público)
│   │   ├── logo-white.png          # Branco (header dashboard + PDF timbrado)
│   │   ├── logo-symbol.png
│   │   ├── hero-transition.jpeg
│   │   └── team-photo.jpg
│   │
│   ├── components/
│   │   ├── layout/                 # Estrutura global do site público
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── SkipLinks.tsx
│   │   │   ├── AccessibilityToolbar.tsx
│   │   │   ├── CookieConsent.tsx   # Banner + modal LGPD
│   │   │   ├── FloatingDonateCTA.tsx
│   │   │   └── FloatingWhatsApp.tsx
│   │   │
│   │   ├── sections/               # Seções da home single-page
│   │   │   ├── Hero.tsx / Showcase.tsx / About.tsx / Impact.tsx
│   │   │   ├── Services.tsx / Pillars.tsx / Team.tsx
│   │   │   ├── Testimonials.tsx / Faq.tsx
│   │   │   ├── Galeria.tsx / Donate.tsx / Contact.tsx
│   │   │
│   │   ├── admin/                  # Componentes do painel administrativo
│   │   │   ├── PendingTreatmentAlert.tsx  # Banner sticky + modal de revisão 24h
│   │   │   └── TreatmentSummary.tsx       # Pontos + ajustes consolidados do mês
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── SectionLabel.tsx
│   │       ├── FaceCapture.tsx     # Webcam + QR Code pra facial
│   │       ├── PasswordInput.tsx   # Input senha com toggle olho
│   │       └── SplashLoader.tsx
│   │
│   ├── pages/                      # Rotas
│   │   ├── Home.tsx
│   │   ├── Servicos.tsx
│   │   ├── Galeria.tsx
│   │   ├── Privacidade.tsx
│   │   ├── Brandbook.tsx
│   │   ├── NotFound.tsx
│   │   ├── FaceMobile.tsx          # Scan QR → captura facial via celular
│   │   └── admin/                  # Painel administrativo
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx       # Shell com sidebar + modal trocar senha
│   │       ├── DashboardHome.tsx   # Home do admin + card "Meu salário"
│   │       ├── Ponto.tsx           # Registro + presença de hoje (admin)
│   │       ├── Employees.tsx       # CRUD + salário + facial
│   │       ├── Adjustments.tsx     # Workflow com anexo
│   │       ├── Timesheet.tsx       # Espelho mensal imprimível
│   │       ├── Vacations.tsx       # Férias (admin gerencia + funcionário confirma)
│   │       ├── Treatments.tsx      # Tratamento mensal + export ZIP
│   │       └── Paystubs.tsx        # Contracheques (adapta por role)
│   │
│   ├── data/
│   │   └── content.ts              # Copy centralizada do site público
│   │
│   ├── hooks/
│   │   ├── useCountUp.ts / useScrollspy.ts / useReducedMotion.ts
│   │   ├── useAccessibilitySettings.ts
│   │   └── useCookieConsent.ts
│   │
│   ├── App.tsx                     # Routes + CookieConsent
│   ├── main.tsx                    # BrowserRouter bootstrap
│   └── index.css                   # Design tokens + Tailwind + a11y CSS
│
├── drizzle.config.ts
├── vite.config.ts                  # Proxy /api → localhost:3001
├── netlify.toml
├── .replit
├── scripts/
│   └── post-merge.sh               # npm install automático após git pull
├── ARCHITECTURE.md                 # Este arquivo
├── CONTEXT.md
├── README.md
├── TODO.md
├── eslint.config.js
├── package.json
└── tsconfig.json
```

## Componentes — Responsabilidades

### Layout
| Componente | Responsabilidade |
|---|---|
| `Header` | Nav fixa · scroll spy · menu mobile · CTA "Doe Agora" |
| `Footer` | Selos institucionais · redes sociais · **links legais** (Privacidade / Cookies / Contato) |
| `SkipLinks` | Pular para conteúdo principal / navegação |
| `AccessibilityToolbar` | Toggle de fonte/contraste/animações/links + VLibras + **Preferências de cookies** |
| `CookieConsent` | Banner sticky no rodapé (primeira visita) + modal de personalização com 3 categorias |
| `FloatingDonateCTA` | Botão fixo bottom-right de doação |
| `FloatingWhatsApp` | Botão fixo bottom-left — link `wa.me/5592991163746` |

### Seções (home)
| # | Componente | Responsabilidade |
|---|---|---|
| 00 | `Hero` | Headline principal + CTAs (conhecer / doar) |
| — | `Showcase` | Imagem institucional com orbital animada |
| 01 | `About` | Manifesto · CER III · timeline · missão/visão/valores |
| 02 | `Impact` | 6 stats com contadores animados |
| 03 | `Services` | Diagrama SVG + 4 especialidades + CTA "Ver todos" → `/servicos` |
| 04 | `Pillars` | 5 pilares numerados editoriais |
| 05 | `Team` | Equipe multidisciplinar + especialidades |
| 06 | `Testimonials` | Carrossel acessível (3 depoimentos) |
| 07 | `Faq` | Accordion com 10 perguntas frequentes |
| 08 | `Galeria` | Preview 5 pastas + CTA "Explorar galeria" → `/galeria` |
| 09 | `Donate` | Breakdown de impacto + QR Code Pix + chave copiável |
| 10 | `Contact` | Hierarquia tipográfica + mapa + formulário |

### Páginas (rotas)
| Página | Responsabilidade |
|---|---|
| `Home` | Orquestra componentes de seção em ordem narrativa |
| `Servicos` | Catálogo completo (copy extraída do site antigo via WebFetch) — 7 blocos editoriais |
| `Galeria` | Abas por pasta + grid responsivo + lightbox acessível + CTA final |
| `Privacidade` | Política LGPD em 10 seções + botão para reabrir preferências de cookies |
| `Brandbook` | Design system navegável + **gerador interativo de assinatura de e-mail HTML** |

### UI Primitives
| Componente | Props | Variantes |
|---|---|---|
| `Button` | children, href, variant, size, onClick | primary, secondary, outline, ghost |
| `SectionLabel` | children | — |

### Hooks
| Hook | Propósito | Persistência |
|---|---|---|
| `useCountUp` | Anima número de 0 até target quando visível | — |
| `useScrollspy` | ID da seção atualmente visível | — |
| `useReducedMotion` | Detecta `prefers-reduced-motion` do SO | — |
| `useAccessibilitySettings` | Fonte, contraste, animações, links | `localStorage` |
| `useCookieConsent` | Consentimento LGPD + eventos de sincronização | `localStorage` versionado |

## Fluxos-chave

### Galeria — navegação por pasta
```
Clicar em card de pasta na home (/)
     │
     ▼
Link com hash: /galeria#acolhimento
     │
     ▼
Página Galeria monta + useEffect lê hash
     │
     ▼
setActiveSlug("acolhimento") → renderiza fotos
     │
     ▼
Clicar em foto → setLightbox(index)
     │
     ▼
Lightbox modal (ESC fecha, ←/→ navega)
```

### Consentimento de cookies — fluxo LGPD
```
Primeira visita
     │
     ▼
useCookieConsent lê localStorage
     │
     ▼
Se não há decisão registrada:
     │
     ├─► Banner sticky aparece (bottom)
     │       │
     │       ├─► "Aceitar todos" → acceptAll()
     │       ├─► "Apenas essenciais" → rejectOptional()
     │       └─► "Personalizar" → abre modal
     │               │
     │               └─► 3 toggles → save(custom) → fecha
     │
     └─► writeStored() salva em localStorage
              │
              └─► window.dispatchEvent('cvi:consent-change')
                     │
                     └─► Outros componentes reagem
                         (ex: ativar GA4 se analytics=true)
```

## Backend — Schema do Banco (Drizzle + Neon)

### Tabelas principais
| Tabela | Propósito |
|---|---|
| `users` | Funcionários, gestores, admins — com `hasLunchBreak`, `faceDescriptor`, jornada configurável |
| `system_settings` | Config global: coords da sede, raio de geofencing, tolerância, fechamento |
| `punch_records` | Pontos batidos (entrada/saída/almoço) com status (valido/fora_perimetro/ajuste_pendente/ajustado) |
| `punch_adjustments` | Solicitações de ajuste com `attachmentFileId` (anexo PDF) |
| `file_storage` | Bytea genérico pra PDFs (atestados, avisos de férias, contracheques) |
| `salary_history` | Histórico de salário por vigência (bruto/líquido/effectiveFrom) |
| `vacations` | Férias 30 dias com status enum + aviso PDF + acknowledge |
| `monthly_treatments` | Tratamento mensal com workflow de aprovação 24h |
| `paystubs` | Contracheques mensais (1 por funcionário/mês, apenas PDF) |

### Enums
- `user_role`: admin / gestor / funcionario
- `employment_type`: clt / pj
- `punch_type`: entrada / saida_almoco / volta_almoco / saida
- `punch_status`: valido / fora_perimetro / ajuste_pendente / ajustado
- `adjustment_status`: pendente / aprovado / rejeitado
- `vacation_status`: agendada / em_curso / concluida / cancelada
- `treatment_status`: draft / submitted_to_employee / approved_by_employee / auto_approved / questioned

## Backend — Rotas (API REST)

### Autenticação (`/api/auth/*`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/login` | JWT 8h + cookie httpOnly |
| POST | `/logout` | Blacklist do token |
| GET | `/me` | Dados do user logado |
| POST | `/change-password` | Troca senha + invalida token atual |

### Funcionários (`/api/employees/*`) — admin/gestor
CRUD completo + soft delete (ativa/desativa) + upload facial

### Ponto (`/api/ponto/*`)
| Rota | Descrição |
|---|---|
| POST `/registrar` | Registra ponto (3 faixas de geofencing + rejeita almoço se hasLunchBreak=false) |
| GET `/hoje` | Pontos do dia (próprios) |
| GET `/historico` | Histórico N dias (próprio) |
| GET `/espelho` | Espelho mensal (próprio; admin vê de outros via ?userId) |
| GET `/todos` | Todos do período (admin/gestor) |

### Ajustes (`/api/adjustments/*`)
- POST `/` — cria ajuste com anexo multipart
- GET `/mine` — próprios
- GET `/pending` — pendentes (admin/gestor)
- GET `/:id/attachment` — baixa anexo (dono ou staff)
- PUT `/:id/review` — aprova/rejeita (admin/gestor)

### Salário (`/api/salary/*`)
- GET `/:userId/current` — vigente na data atual
- GET `/:userId/history` — todo histórico
- POST `/:userId` — novo registro (admin/gestor)
- DELETE `/entry/:id` — remove registro (admin/gestor)

### Férias (`/api/vacations/*`)
- GET `/` — lista (admin todos, funcionário só próprias)
- POST `/` — agenda 30 dias + aviso PDF opcional (admin/gestor)
- PUT `/:id` — muda status/notes (admin/gestor)
- POST `/:id/notice` — anexa/substitui PDF do aviso
- GET `/:id/notice` — baixa PDF (dono ou staff)
- POST `/:id/acknowledge` — funcionário confirma ciência
- DELETE `/:id` — remove (admin/gestor)

### Tratamento (`/api/treatments/*`)
- GET `/` — lista filtrada (admin todos, funcionário só próprios não-draft)
- GET `/summary/:id` — pontos + ajustes do mês (consolidado)
- GET `/:userId/:month` — detalhe (admin/gestor)
- POST `/` — upsert draft (admin/gestor)
- POST `/:id/submit` — envia pra revisão (admin/gestor)
- POST `/:id/approve` — funcionário aprova
- POST `/:id/question` — funcionário questiona
- DELETE `/:id` — remove draft

### Exportação (`/api/exports/*`) — admin/gestor
- GET `/monthly?month=YYYY-MM&status=approved|all&pdf=1` — ZIP stream

### Contracheques (`/api/paystubs/*`)
- GET `/` — admin filtra por mês, funcionário vê histórico próprio
- POST `/` — upload PDF (admin/gestor) com upsert por mês
- GET `/:id/download` — baixa (dono ou staff)
- DELETE `/:id` — remove registro + arquivo

### Face (`/api/face/*`)
Cadastro e verificação facial + sessões QR Code para mobile

## Backend — Scheduler Interno

### Auto-aprovação de tratamentos (24h corridas)
- Arquivo: [`server/utils/autoApproveTreatments.ts`](server/utils/autoApproveTreatments.ts)
- Inicializado em `server/index.ts:listen` via `startAutoApproveScheduler()`
- `runAutoApproveSweep()` roda no startup + a cada **5 minutos** via `setInterval`
- Query: `UPDATE monthly_treatments SET status='auto_approved' WHERE status='submitted_to_employee' AND submittedAt < now() - 24h`
- Precisão: aprovação ocorre em até 5 min após o deadline (aceitável pra folha mensal)

## Backend — Storage de Arquivos (bytea)

### Padrão seguro por design
- Tabela `file_storage` com colunas: `id`, `filename`, `mimeType`, `sizeBytes`, `data` (bytea), `uploadedBy`, `uploadedAt`
- Helpers centralizados em [`server/utils/fileStorage.ts`](server/utils/fileStorage.ts)
- **Sem endpoint genérico de download** — cada feature expõe seu próprio download autorizado:
  - `GET /api/adjustments/:id/attachment` — dono ou staff
  - `GET /api/vacations/:id/notice` — dono ou staff
  - `GET /api/paystubs/:id/download` — dono ou staff
- Isso evita que qualquer usuário logado baixe qualquer arquivo (IDOR prevention)

## Backend — PDF Institucional (pdf-lib)

### Padrão adaptado do projeto IDASAM
- Arquivo: [`server/utils/pdfFolha.ts`](server/utils/pdfFolha.ts)
- Biblioteca: **pdf-lib** (JS puro, sem headless browser)
- A4 em pontos (72dpi): 595 × 842
- Margens: header 85px / footer 50px / gap 35px entre header e conteúdo
- Funções auxiliares:
  - `drawHeader(pg)` — logo branca + institucional + faixa colorida
  - `drawFooter(pg, pageNum)` — confidencialidade + data + número da página
  - `ensureSpace(needed)` — **a chave**: antes de desenhar, checa espaço; se não cabe → desenha footer + addPage + desenha header + reseta curY
  - `drawSectionTitle(title)` — barra lateral colorida + título
  - `drawField(label, value)` — label bold + valor com word-wrap automático
  - `drawParagraph(text)` — parágrafo com wrap multi-linha
- Toda página nova (automática ou manual) redesenha header/footer — zero risco de texto vazar pro rodapé

## Decisões de Design

### Por que multi-page (agora) em vez de só SPA?
- Deep-linking para conteúdo específico (compartilhar `/galeria#eventos`)
- SEO por rota (metadados futuros dedicados a cada página)
- Carregamento mais leve: home não precisa baixar catálogo completo de serviços
- Preserva storytelling contínuo na home enquanto oferece densidade de conteúdo em páginas dedicadas

### Por que conteúdo em `content.ts`?
- Separação clara entre dados e apresentação
- Facilita tradução futura (PT-BR / EN / ES)
- Preparado para migração a CMS headless (Sanity, Strapi)
- Revisão de copy sem tocar em componentes
- TypeScript `as const` garante inferência precisa de tipos

### Por que Tailwind 4 com `@theme`?
- Design tokens nativos e declarativos
- Responsividade inline (menos arquivos CSS)
- Consistência visual garantida pelo sistema
- Produtividade na prototipação
- Sem configuração externa (`tailwind.config.js` morreu na v4)

### Por que eventos customizados `cvi:*`?
- Comunicação entre componentes distantes sem prop-drilling
- Footer → CookieConsent, Toolbar → CookieConsent, Privacidade → CookieConsent
- Desacoplamento total — `CookieConsent` é montado uma vez global em `App.tsx`

## Performance

- **Vite 8** — bundling e HMR ultrarrápidos
- **Tailwind 4** — CSS mínimo, só o que é usado
- **Lazy loading** — imagens com `loading="lazy"` nativamente
- **Animações** — GPU-accelerated via Framer Motion (transform/opacity)
- **Fontes** — preconnect + display=swap (evita FOIT)
- **Bundle gzip** — ~125KB inicial
- **Assinatura de e-mail** — logo hospedada externamente (Imgur) para não impactar bundle
