# CVI Amazonas — Centro de Vida Independente

Site institucional + sistema administrativo do **CVI - Centro de Vida Independente do Amazonas** — centro de reabilitação biopsicossocial reconhecido como **CER III** pelo Ministério da Saúde, com atendimento 100% gratuito financiado pelo SUS.

Construído com foco em **identidade editorial, performance, acessibilidade premium (WCAG 2.1 AA)** e **gestão interna de RH** com sistema de ponto eletrônico.

---

## ✨ Highlights

**Site Institucional:**
- 🎨 Design editorial — timeline, infográficos, diagrama SVG, carrossel acessível
- ♿ Toolbar de acessibilidade com VLibras (gov.br), alto contraste, ajuste de fonte
- 🔒 LGPD completo — banner de cookies + política de privacidade + preferências
- 📖 Brandbook interativo com gerador de assinatura de e-mail
- 📸 Galeria com 5 pastas, lightbox acessível e 45+ fotos
- 💚 CTAs flutuantes — WhatsApp + Doação sempre visíveis

**Painel Administrativo:**
- 🏢 Sidebar colapsável por departamento (RH, futuros: Financeiro, Exames)
- ⏰ Sistema de ponto com geofencing GPS (raio 100m da sede)
- 👥 CRUD de funcionários (CLT/PJ, jornada configurável, ativar/desativar)
- 📋 Workflow de ajustes (solicitar → aprovar/rejeitar)
- 📄 Espelho de ponto mensal com impressão
- 🔐 Auth JWT com blacklist, rate limiting, sanitização XSS
- ✅ 84 testes automatizados (62 API + 22 frontend) — 100% aprovados
- 🛡️ Pentest com 30 vetores (SQLi, XSS, JWT, IDOR, CORS, DoS) — 0 vulnerabilidades

---

## 🛠 Tech Stack

### Frontend
| Tecnologia | Propósito |
|---|---|
| **React 19** + **TypeScript 5** | UI Library + tipagem |
| **Vite 8** | Build tool + dev server + HMR |
| **Tailwind CSS 4** | Design system via `@theme` tokens |
| **Framer Motion 12** | Animações (respeita `prefers-reduced-motion`) |
| **React Router 7** | Multi-page + admin routes |
| **Lucide React** | Ícones SVG |
| **qrcode.react** | QR Code Pix dinâmico |

### Backend
| Tecnologia | Propósito |
|---|---|
| **Express 5** | API REST |
| **Drizzle ORM** | ORM type-safe (queries parametrizadas, zero SQLi) |
| **PostgreSQL** via **Neon** | Banco serverless |
| **JWT** + **bcrypt** | Autenticação e hashing de senhas |
| **express-rate-limit** | Proteção contra brute force e DoS |

---

## 🚀 Instalação

### Pré-requisitos
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Conta no **[Neon](https://neon.tech)** (PostgreSQL serverless gratuito)

### Setup

```bash
git clone https://github.com/Opresida/cvi.git
cd cvi

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com DATABASE_URL do Neon + JWT_SECRET

# Criar tabelas no banco
npm run db:push

# Criar usuário admin
npm run db:seed

# Iniciar frontend (porta 5000) + backend (porta 3001)
npm run dev          # frontend
npm run dev:server   # backend (em outro terminal)
```

### Variáveis de ambiente (.env)

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=sua_chave_secreta_aqui
PORT=3001
FRONTEND_URL=http://localhost:5000
```

---

## 📁 Rotas

### Site Institucional

| Rota | Página |
|---|---|
| `/` | Home — 10 seções editoriais |
| `/servicos` | Catálogo completo (especialidades, projetos, modalidades, elegibilidade) |
| `/galeria` | 5 pastas de fotos com lightbox acessível |
| `/privacidade` | Política de Privacidade e Cookies (LGPD) |
| `/brandbook` | Design system + gerador de assinatura de e-mail |

### Painel Administrativo

| Rota | Acesso | Página |
|---|---|---|
| `/admin` | Público | Login |
| `/admin/dashboard` | Auth | Painel com métricas reais |
| `/admin/dashboard/rh/ponto` | Auth | Registro de ponto (relógio + GPS) |
| `/admin/dashboard/rh/funcionarios` | Admin/Gestor | CRUD de funcionários |
| `/admin/dashboard/rh/ajustes` | Auth | Solicitar/aprovar ajustes de ponto |
| `/admin/dashboard/rh/espelho` | Auth | Espelho de ponto mensal |

### API (Backend)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login (JWT 8h) |
| POST | `/api/auth/logout` | Logout (blacklist token) |
| GET | `/api/auth/me` | Dados do usuário logado |
| GET/POST/PUT/DELETE | `/api/employees` | CRUD de funcionários (admin) |
| POST | `/api/ponto/registrar` | Registrar ponto (GPS + geofencing) |
| GET | `/api/ponto/hoje` | Registros do dia |
| GET | `/api/ponto/historico` | Histórico (filtro por dias) |
| GET | `/api/ponto/espelho` | Espelho mensal |
| GET | `/api/ponto/todos` | Todos os registros (admin) |
| POST | `/api/adjustments` | Solicitar ajuste |
| GET | `/api/adjustments/mine` | Minhas solicitações |
| GET | `/api/adjustments/pending` | Pendentes de aprovação (admin) |
| PUT | `/api/adjustments/:id/review` | Aprovar/rejeitar ajuste |

---

## 📁 Estrutura do Projeto

```
cvi/
├── server/                        # Backend (Express + Drizzle)
│   ├── db/
│   │   ├── index.ts               # Conexão Neon serverless
│   │   └── schema.ts              # Tabelas: users, punchRecords, adjustments, settings
│   ├── routes/
│   │   ├── auth.ts                # Login/logout/me
│   │   ├── ponto.ts               # Registro + geofencing + espelho
│   │   ├── employees.ts           # CRUD funcionários
│   │   └── adjustments.ts         # Workflow de ajustes
│   ├── middleware/
│   │   └── auth.ts                # JWT verify + blacklist + roles
│   ├── utils/
│   │   ├── geofence.ts            # Haversine distance calculation
│   │   ├── sanitize.ts            # XSS prevention (HTML escape)
│   │   └── tokenBlacklist.ts      # JWT invalidation pós-logout
│   ├── index.ts                   # Express server + rate limiting
│   └── seed.ts                    # Admin user + system settings
│
├── src/                           # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── layout/                # Header, Footer, SkipLinks, Toolbar, Cookies, WhatsApp, Donate
│   │   ├── sections/              # 10 seções da home (Hero → Contact)
│   │   └── ui/                    # Button, SectionLabel
│   ├── pages/
│   │   ├── Home.tsx               # Composição das seções
│   │   ├── Servicos.tsx           # Catálogo completo
│   │   ├── Galeria.tsx            # Galeria com lightbox
│   │   ├── Privacidade.tsx        # Política LGPD
│   │   ├── Brandbook.tsx          # Design system
│   │   └── admin/                 # Painel administrativo
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx      # Sidebar colapsável por departamento
│   │       ├── DashboardHome.tsx   # Métricas reais do banco
│   │       ├── Ponto.tsx          # Relógio + GPS + geofencing
│   │       ├── Employees.tsx      # CRUD com modal + CLT/PJ
│   │       ├── Adjustments.tsx    # Solicitar + aprovar/rejeitar
│   │       └── Timesheet.tsx      # Espelho mensal + impressão
│   ├── data/content.ts            # Copy centralizada
│   ├── hooks/                     # useCountUp, useScrollspy, useReducedMotion, etc.
│   ├── App.tsx                    # Routes (lazy loading) + CookieConsent
│   └── index.css                  # Design tokens + Tailwind + a11y CSS
│
├── .env.example                   # Template de variáveis
├── drizzle.config.ts              # Config do Drizzle (Neon)
├── netlify.toml                   # Deploy config (SPA fallback, headers, cache)
├── ARCHITECTURE.md                # Fluxo de dados e responsabilidades
├── CONTEXT.md                     # Regras de negócio e decisões
└── TODO.md                        # Roadmap e pendências
```

---

## 🔒 Segurança

### Proteções implementadas

| Vetor | Proteção |
|---|---|
| **SQL Injection** | Drizzle ORM (queries 100% parametrizadas) |
| **XSS** | `sanitizeHtml()` em todos os inputs texto (name, reason, notes) |
| **JWT Forjado** | Verificação com secret obrigatório (sem fallback) |
| **Token Replay** | Blacklist em memória após logout |
| **Brute Force** | Rate limiting: 10 login/15min, 10 ponto/min, 200 global/15min |
| **IDOR** | Autorização por role em todas as rotas admin |
| **Race Condition** | Anti-duplo ponto (60s) + anti-dupla aprovação (status check) |
| **GPS Spoofing** | Validação regex + bounds check (-90/90, -180/180) |
| **Privilege Escalation** | Middlewares separados: `adminOnly` vs `gestorOrAdmin` |
| **Info Disclosure** | Error IDs (UUID) sem stack traces em produção |

### Testes realizados
- **62 testes de API** — auth, CRUD, ponto, ajustes, segurança
- **22 testes de frontend** — rotas, meta tags, SPA fallback, build
- **30 vetores de pentest** — SQLi, XSS, JWT manipulation, IDOR, CORS, DoS
- **100% de aprovação** em todas as baterias

---

## ♿ Acessibilidade (WCAG 2.1 AA)

- Toolbar com VLibras, alto contraste, ajuste de fonte, pausar animações
- Skip Links, landmarks ARIA, foco visível 3px
- Carrossel e lightbox navegáveis por teclado
- `prefers-reduced-motion` respeitado globalmente
- Formulários com `<label>`, `aria-required`, `aria-live`
- Banner de cookies LGPD acessível

---

## 🏢 Sistema de Ponto — Regras de Negócio

| Regra | Valor |
|---|---|
| Tolerância | 10 minutos (CLT art. 58 §1º) |
| Intervalo | 1h almoço |
| Banco de horas | 12 meses de compensação |
| Horas extras | 50% seg-sex, 75% sáb/dom/feriado |
| Geofencing | GPS, raio 100m da sede |
| Fechamento mensal | Dia 20 |
| Espelho de ponto | Gerado para RH + funcionário |
| Sede | R. Acari, 50 - Conj. Atílio Andreazza, Manaus-AM |

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Frontend (porta 5000, HMR) |
| `npm run dev:server` | Backend (porta 3001, watch) |
| `npm run build` | Build de produção |
| `npm run server` | Backend produção |
| `npm run db:push` | Sincronizar schema no Neon |
| `npm run db:seed` | Criar admin + configurações |
| `npm run db:studio` | Drizzle Studio (explorar banco) |
| `npm run lint` | ESLint |

---

## 📦 Deploy

**Netlify** (site institucional):
- Configurado via `netlify.toml` — auto-deploy a cada push
- SPA fallback, security headers, cache otimizado

**Replit** (backend + admin):
- Adicionar `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` nos Secrets
- Rodar `npm run db:push` + `npm run db:seed`

---

## 🔐 Sobre a Instituição

- **Nome**: CVI - Centro de Vida Independente do Amazonas
- **CNPJ**: 07.555.086/0001-68
- **Reconhecimento**: CER III (Física, Intelectual e Auditiva) — Ministério da Saúde
- **Localização**: Manaus, Amazonas - Brasil
- **Contato**: cvi.amazonas@gmail.com | (92) 99116-3746 | @cvi.am
- **Financiamento**: 100% público (SUS / Fundo Nacional de Saúde)
- **Termos de Cooperação**: 001/2021 e 001/2024 — SES/AM

---

## 📄 Licença

Projeto privado — CVI - Centro de Vida Independente do Amazonas. Todos os direitos reservados.
