# CVI Amazonas — Arquitetura

## Visão Geral

```
┌─────────────────────────────────────────────────┐
│                    index.html                     │
│                  (entry point)                    │
├─────────────────────────────────────────────────┤
│                    main.tsx                        │
│              (React bootstrap)                    │
├─────────────────────────────────────────────────┤
│                    App.tsx                         │
│            (Composição de seções)                 │
├─────────────────────────────────────────────────┤
│  Header ─── Hero ─── About ─── Impact ───        │
│  Services ─── Pillars ─── Team ───               │
│  Testimonials ─── Donate ─── Contact ─── Footer  │
└─────────────────────────────────────────────────┘
```

## Fluxo de Dados

```
content.ts (dados estáticos)
     │
     ▼
  Seções (componentes React)
     │
     ├─► Props → Componentes UI (Button, SectionLabel)
     │
     ├─► Hooks → useCountUp (animação de números)
     │         → useScrollspy (navegação ativa)
     │
     └─► Framer Motion → Animações de entrada
```

## Estrutura de Pastas

```
cvi/
├── app/                          # Aplicação React
│   ├── public/                   # Assets estáticos
│   │   └── favicon.png
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/           # Imagens importadas pelo bundler
│   │   │       ├── logo.png
│   │   │       ├── logo-symbol.png
│   │   │       ├── favicon.png
│   │   │       └── team-photo.jpg
│   │   ├── components/
│   │   │   ├── layout/           # Estrutura do site
│   │   │   │   ├── Header.tsx    # Navegação fixa + scroll spy
│   │   │   │   └── Footer.tsx    # Rodapé com links e social
│   │   │   ├── sections/         # Seções da página
│   │   │   │   ├── Hero.tsx      # Banner principal
│   │   │   │   ├── About.tsx     # Sobre nós + missão/visão/valores
│   │   │   │   ├── Impact.tsx    # Números com contadores animados
│   │   │   │   ├── Services.tsx  # Serviços oferecidos
│   │   │   │   ├── Pillars.tsx   # 5 pilares de atuação
│   │   │   │   ├── Team.tsx      # Equipe multidisciplinar
│   │   │   │   ├── Testimonials.tsx # Depoimentos
│   │   │   │   ├── Donate.tsx    # Doações + Pix
│   │   │   │   └── Contact.tsx   # Informações de contato
│   │   │   └── ui/               # Componentes reutilizáveis
│   │   │       ├── Button.tsx    # Botão com variantes
│   │   │       └── SectionLabel.tsx # Label de seção
│   │   ├── data/
│   │   │   └── content.ts        # Todo o conteúdo textual
│   │   ├── hooks/
│   │   │   ├── useCountUp.ts     # Animação de contagem
│   │   │   └── useScrollspy.ts   # Scroll spy para nav
│   │   ├── styles/               # Estilos extras (reservado)
│   │   ├── App.tsx               # Composição das seções
│   │   ├── main.tsx              # Bootstrap React
│   │   └── index.css             # Design tokens + Tailwind
│   ├── TODO.md                   # Tarefas pendentes
│   ├── README.md                 # Como instalar e rodar
│   ├── CONTEXT.md                # Regras e lógica de negócio
│   ├── ARCHITECTURE.md           # Este arquivo
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── www.cviam.com.br/             # Site original (referência)
```

## Componentes — Responsabilidades

### Layout
| Componente | Responsabilidade |
|---|---|
| `Header` | Navegação fixa, scroll spy, menu mobile, CTA "Doe Agora" |
| `Footer` | Links, redes sociais, informações legais, créditos |

### Seções
| Componente | Responsabilidade |
|---|---|
| `Hero` | Primeiro impacto, headline principal, CTAs |
| `About` | História, missão, visão, valores (4 cards) |
| `Impact` | 6 estatísticas com contadores animados |
| `Services` | 4 cards de serviços com detalhamento |
| `Pillars` | 5 pilares numerados de atuação |
| `Team` | Foto da equipe + especialidades (tags) |
| `Testimonials` | 3 cards de depoimentos |
| `Donate` | 3 formas de ajudar + chave Pix com copy |
| `Contact` | Informações de contato + horário |

### UI
| Componente | Props | Variantes |
|---|---|---|
| `Button` | children, href, variant, size, onClick | primary, secondary, outline, ghost |
| `SectionLabel` | children | — |

### Hooks
| Hook | Propósito |
|---|---|
| `useCountUp` | Anima número de 0 até target quando visível na viewport |
| `useScrollspy` | Retorna o ID da seção atualmente visível para highlight na nav |

## Decisões de Design

### Por que Single-Page?
O conteúdo do CVI é compacto e narrativo. Uma single-page permite:
- Experiência de scroll contínuo (storytelling)
- Menor tempo de carregamento
- Navegação fluida com scroll suave
- SEO simplificado (uma URL principal)

### Por que conteúdo em `content.ts`?
- Separação clara entre dados e apresentação
- Facilita tradução futura
- Preparado para migração a CMS headless
- Manutenção de copy sem tocar em componentes

### Por que Tailwind em vez de CSS Modules?
- Design tokens nativos (`@theme`)
- Responsividade inline
- Consistência visual garantida pelo sistema
- Produtividade na prototipação

## Performance

- **Vite** — bundling e HMR ultrarrápidos
- **Tailwind 4** — CSS mínimo, só o que é usado
- **Lazy loading** — imagens carregam sob demanda (nativo do browser)
- **Animações** — GPU-accelerated via Framer Motion (transform/opacity)
- **Fontes** — preconnect + display=swap para evitar FOIT
