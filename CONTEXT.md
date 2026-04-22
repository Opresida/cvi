# CVI Amazonas — Contexto do Projeto

## Resumo

Site institucional multi-page do **CVI - Centro de Vida Independente do Amazonas** (CNPJ: 07.555.086/0001-68). Migrado de WordPress/Divi para uma aplicação React moderna, com foco em performance, acessibilidade premium (WCAG 2.1 AA) e conformidade com a LGPD.

Reconhecido pelo Ministério da Saúde como **Centro Especializado em Reabilitação — CER III** (Física, Intelectual e Auditiva), integra a Rede de Cuidados à Pessoa com Deficiência do SUS.

## Stack Técnica

### Frontend
- **Framework:** React 19 + TypeScript 5
- **Build:** Vite 8
- **Estilização:** Tailwind CSS 4 (design tokens via `@theme`)
- **Animações:** Framer Motion 12 (respeita `prefers-reduced-motion`)
- **Ícones:** Lucide React
- **Roteamento:** React Router DOM 7 (multi-page + admin routes)
- **QR Code:** `qrcode.react` (Pix + sessões faciais)
- **Reconhecimento Facial:** `face-api.js` (TensorFlow.js, processa no browser)

### Backend
- **Server:** Express 5
- **ORM:** Drizzle ORM (type-safe, queries parametrizadas)
- **Banco:** PostgreSQL via Neon Database (serverless)
- **Auth:** JWT (8h) + bcrypt (12 rounds) + blacklist pós-logout
- **Segurança:** express-rate-limit, sanitização XSS, error IDs (UUID)
- **Deploy:** Replit (backend) + Netlify (frontend estático)

## Regras de Negócio

### Sobre a Instituição
- Centro de reabilitação biopsicossocial sem fins lucrativos
- Atendimento 100% gratuito, financiado pelo SUS (Fundo Nacional de Saúde)
- Termos de Cooperação 001/2021 e 001/2024 com a SES/AM
- Reconhecido pelo Ministério da Saúde como **CER III** (Física, Intelectual e Auditiva)
- Atende pessoas com deficiência permanente ou temporária, familiares e comunidade
- Abrange 50+ municípios do estado do Amazonas

### Contato Oficial
- **E-mail:** `cvi.amazonas@gmail.com`
- **Telefone / WhatsApp:** (92) 99116-3746
- **Instagram:** `@cvi.am`
- **Endereço:** Manaus, Amazonas — Brasil (endereço completo pendente)

### Público-Alvo do Site
1. **Pacientes e familiares** — buscar informações sobre serviços e encaminhamento
2. **Comunidade** — conhecer o trabalho do CVI
3. **Doadores** — contribuir financeiramente ou como voluntários
4. **Parceiros institucionais** — estabelecer parcerias
5. **Governo e órgãos públicos** — transparência e prestação de contas

### Requisitos de Acessibilidade
- WCAG 2.1 nível AA como padrão mínimo (público-alvo inclui PcDs)
- Semântica HTML correta (landmarks, headings, listas)
- Navegação por teclado completa
- Contraste mínimo 4.5:1 para corpo de texto
- Foco visível 3px `primary-500` com offset 3px
- Alt text em todas as imagens; decorativas com `aria-hidden="true"`
- **AccessibilityToolbar:** fonte (3 níveis), alto contraste, pausar animações, sublinhar links, VLibras oficial gov.br, restaurar padrões
- `prefers-reduced-motion` respeitado em CSS e Framer Motion

### Tom e Copy
- **Tom:** Profissional, acolhedor, esperançoso, empoderador
- **Linguagem:** Inclusiva e acessível, sem jargão técnico excessivo
- **Foco:** Storytelling de impacto e transformação de vidas
- **Idioma:** Português Brasileiro (pt-BR)
- **Regra de ouro:** se a frase soaria estranha dita em voz alta para alguém vivendo o momento mais difícil da vida, reescreva.

## Design System

### Paleta de Cores (design tokens Tailwind 4)
| Família | Shade principal | Hex | Uso |
|---|---|---|---|
| Primary (Teal) | 500 / 700 | `#0fa8bd` / `#0a7688` | Saúde, confiança, CTAs institucionais |
| Secondary (Coral) | 500 | `#d43d48` | Acolhimento, CTA de doação |
| Accent (Verde) | 500 | `#10b981` | Esperança, sucesso, vida |
| Warm (Dourado) | 500 | `#f59e0b` | Excelência, status "em breve" |
| Neutral | 900 / 700 | `#0f172a` / `#334155` | Texto principal / corpo |

### Tipografia
- **Headings:** Plus Jakarta Sans (500, 600, 700, 800) — tracking-tight
- **Body:** Inter (400, 500, 600, 700) — line-height 1.7
- Ambas via Google Fonts com `preconnect` + `display=swap`

### Numeração editorial
Cada seção da home exibe um número grande (00–10) no canto como elemento decorativo editorial. **Regra:** ao adicionar/remover seções, renumerar todas em cascata.

### Componentes Reutilizáveis
- `Button` — variantes: primary, secondary, outline, ghost · sizes: sm, md, lg
- `SectionLabel` — badge com pill para identificar seções
- `CookieConsent` — banner sticky + modal com 3 categorias

## Decisões Arquiteturais

1. **Multi-page com React Router:** 5 rotas (`/`, `/servicos`, `/galeria`, `/privacidade`, `/brandbook`) — permite deep-linking, melhor SEO por página e compartilhamento de URLs específicas. A home permanece single-page narrativa.
2. **Conteúdo centralizado:** Todo o conteúdo textual está em `src/data/content.ts`, organizado por seção/rota. Facilita manutenção, futura integração com CMS headless e tradução.
3. **Design tokens via `@theme`:** Tailwind 4 declarativo, sem arquivo de config — mudar uma cor propaga por todo o projeto.
4. **Framer Motion com `viewport.once`:** animações disparam uma vez por reveal (não repetem ao rolar pra cima e voltar).
5. **Backend em Express 5:** API REST com Drizzle ORM + Neon PostgreSQL. Sistema de ponto eletrônico com geofencing GPS, reconhecimento facial (face-api.js via QR Code mobile), workflow de ajustes e espelho mensal.
6. **LGPD:** Banner de cookies + política completa. Nenhum tracker ativo até agora — a estrutura está pronta para receber GA4 quando aprovado, consumindo `preferences.analytics` via `useCookieConsent()`.

## Sistema de Ponto Eletrônico

### Regras trabalhistas
- **Tolerância:** 10 min (CLT art. 58 §1º)
- **Intervalo:** 1h almoço (futuro: 15min também)
- **Banco de horas:** 12 meses compensação
- **Horas extras:** 50% seg-sex, 75% sáb/dom/feriado (CCT SINDISAÚDE)
- **Fechamento mensal:** dia 20
- **Geofencing:** GPS Haversine, raio 100m da sede (R. Acari, 50, Manaus-AM)

### Reconhecimento facial
- **Obrigatório** para Entrada e Saída
- **Opcional** para Saída/Volta Almoço (só GPS)
- **Tecnologia:** face-api.js (TensorFlow.js) — processamento 100% no browser do funcionário
- **Dois modos:** webcam do computador OU QR Code pelo celular (sessão temporária 5min)
- **Armazenamento:** apenas embedding numérico (128 floats), nenhuma foto salva (LGPD)
- **Threshold:** distância euclidiana < 0.6 para match

### Perfis de acesso
- **Admin:** tudo (CRUD funcionários, aprovar ajustes, ver todos os pontos, cadastrar rostos)
- **Gestor:** mesmo que admin (futuro: restrito ao seu departamento)
- **Funcionário:** bater ponto, solicitar ajustes, ver espelho próprio

### Sidebar por departamento
- Estrutura extensível com grupos colapsáveis
- Atual: RH (ponto, funcionários, ajustes, espelho)
- Futuros: Financeiro, Exames (rotas preparadas)

## Estado de Doações (Pré-Integração)

- Página home `/#doar` com QR Code Pix estático (chave CNPJ) + botão "Copiar chave"
- Nenhum gateway configurado ainda — aguardando chaves de API do cliente
- Candidatos sugeridos: **Mercado Pago Checkout Pro** (rápido), **Asaas ONG tier** (melhor taxa pós-certificação CEBAS), **PagSeguro PagBank**
- Quando chegar a hora: criar `src/services/donationAPI.ts` como camada de abstração tipada, com stub retornando erro controlado e integração plugável via `import.meta.env.VITE_*`

## Padrões de Código

- Componentes funcionais com TypeScript
- Props tipadas com interfaces locais
- Hooks customizados para lógica reutilizável (`src/hooks/`)
- Componentes organizados por responsabilidade (`layout/`, `sections/`, `ui/`)
- CSS utilitário via Tailwind, sem CSS modules
- Imports com alias `@/` (configurado em `tsconfig.json` e `vite.config.ts`)
- Ícones sempre com `aria-hidden="true"` quando decorativos
- Eventos customizados `cvi:*` para comunicação entre componentes sem prop-drilling (ex: `cvi:open-cookie-preferences`, `cvi:consent-change`)
