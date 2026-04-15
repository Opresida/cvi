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
├── src/
│   ├── assets/images/           # Logos, fotos, hero, team
│   │   ├── logo.png
│   │   ├── logo-white.png
│   │   ├── hero-transition.jpeg
│   │   └── team-photo.jpg
│   │
│   ├── components/
│   │   ├── layout/              # Estrutura global
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── SkipLinks.tsx
│   │   │   ├── AccessibilityToolbar.tsx
│   │   │   ├── CookieConsent.tsx      # Banner + modal LGPD
│   │   │   ├── FloatingDonateCTA.tsx
│   │   │   └── FloatingWhatsApp.tsx
│   │   │
│   │   ├── sections/            # Seções da home single-page
│   │   │   ├── Hero.tsx
│   │   │   ├── Showcase.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Impact.tsx
│   │   │   ├── Services.tsx     # Home section + CTA /servicos
│   │   │   ├── Pillars.tsx
│   │   │   ├── Team.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Faq.tsx
│   │   │   ├── Galeria.tsx      # Home preview + CTA /galeria
│   │   │   ├── Donate.tsx
│   │   │   └── Contact.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── SectionLabel.tsx
│   │
│   ├── pages/                   # Rotas
│   │   ├── Home.tsx
│   │   ├── Servicos.tsx
│   │   ├── Galeria.tsx
│   │   ├── Privacidade.tsx
│   │   └── Brandbook.tsx
│   │
│   ├── data/
│   │   └── content.ts           # nav, hero, about, impact,
│   │                            # servicesPage, faq, gallery,
│   │                            # testimonials, donate, contact,
│   │                            # footer
│   │
│   ├── hooks/
│   │   ├── useCountUp.ts
│   │   ├── useScrollspy.ts
│   │   ├── useReducedMotion.ts
│   │   ├── useAccessibilitySettings.ts
│   │   └── useCookieConsent.ts  # LGPD (localStorage versionado)
│   │
│   ├── App.tsx                  # Routes + CookieConsent
│   ├── main.tsx                 # BrowserRouter bootstrap
│   └── index.css                # Design tokens + Tailwind + a11y CSS
│
├── ARCHITECTURE.md              # Este arquivo
├── CONTEXT.md
├── README.md
├── TODO.md
├── eslint.config.js
├── netlify.toml
├── package.json
├── tsconfig.json
└── vite.config.ts
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
