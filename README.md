# CVI Amazonas — Centro de Vida Independente

Site institucional moderno do **CVI - Centro de Vida Independente do Amazonas** — um centro de reabilitação biopsicossocial que atende pessoas com deficiência há mais de 20 anos, oferecendo atendimento 100% gratuito, financiado pelo SUS.

Construído com foco em **identidade editorial, performance e acessibilidade premium (WCAG 2.1 AA)**, alinhado à missão institucional de promover autonomia e inclusão para pessoas com deficiência.

---

## ✨ Highlights

- 🎨 **Design editorial** — sem cards genéricos: timeline horizontal, infográficos, diagrama circular SVG, carrossel acessível, tipografia revista
- ♿ **Acessibilidade Premium** — toolbar com VLibras (oficial gov.br), alto contraste, ajuste de fonte, pausar animações, sublinhar links — preferências persistidas em `localStorage`
- 💚 **CTAs flutuantes** — WhatsApp (bottom-left) + Doação (bottom-right) sempre visíveis
- 🔍 **Schema.org** — `MedicalOrganization + NGO` para SEO especializado em saúde
- 🎯 **WCAG 2.1 AA** — skip links, landmarks ARIA, `prefers-reduced-motion`, focus visível 3px, contrastes elevados
- ⚡ **Performance** — bundle 125KB gzip, fonte preconnect, lazy loading, animações GPU-accelerated

---

## 🛠 Tech Stack

| Tecnologia | Versão | Propósito |
|---|---|---|
| **React** | 19.x | UI Library |
| **TypeScript** | 5.x | Tipagem estática |
| **Vite** | 8.x | Build tool + dev server |
| **Tailwind CSS** | 4.x | Design system + estilização (via `@theme`) |
| **Framer Motion** | 12.x | Animações e transições |
| **Lucide React** | — | Ícones SVG |
| **qrcode.react** | — | QR Code Pix dinâmico |
| **VLibras** | gov.br | Tradutor oficial de Libras |

---

## 🚀 Instalação

### Pré-requisitos
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Setup
```bash
git clone https://github.com/Opresida/cvi.git
cd cvi
npm install
npm run dev
```

O app abre automaticamente em **http://localhost:5000**

### Scripts
| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server na porta 5000 (com HMR) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa o linter (ESLint) |

---

## 📁 Estrutura do Projeto

```
cvi/
├── public/                       # Assets estáticos servidos como-estão
│   └── favicon.png
├── src/
│   ├── assets/
│   │   └── images/               # Logos, fotos, imagem hero
│   │       ├── logo.png          # Versão colorida (Header)
│   │       ├── logo-white.png    # Versão branca (Footer)
│   │       ├── hero-transition.jpeg  # Showcase entre Hero e About
│   │       ├── team-photo.jpg
│   │       └── favicon.png
│   ├── components/
│   │   ├── layout/               # Estrutura global
│   │   │   ├── Header.tsx              # Nav fixa + scrollspy + mobile menu
│   │   │   ├── Footer.tsx              # Selos, parceiros, financiamento
│   │   │   ├── SkipLinks.tsx           # Pular para conteúdo/nav
│   │   │   ├── AccessibilityToolbar.tsx # Toolbar WCAG + VLibras
│   │   │   ├── FloatingDonateCTA.tsx   # Botão flutuante de doação
│   │   │   └── FloatingWhatsApp.tsx    # Botão flutuante WhatsApp
│   │   ├── sections/             # Seções da home single-page
│   │   │   ├── Hero.tsx                # Headline + ondas SVG
│   │   │   ├── Showcase.tsx            # Imagem com orbital animada
│   │   │   ├── About.tsx               # Manifesto + timeline + valores
│   │   │   ├── Impact.tsx              # Escada de autonomia (números)
│   │   │   ├── Services.tsx            # Diagrama circular interativo
│   │   │   ├── Pillars.tsx             # 5 pilares editoriais
│   │   │   ├── Team.tsx                # Equipe + especialidades
│   │   │   ├── Testimonials.tsx        # Carrossel acessível
│   │   │   ├── Donate.tsx              # Breakdown + QR Code Pix
│   │   │   └── Contact.tsx             # Tipografia + mapa + form
│   │   └── ui/                   # Componentes reutilizáveis
│   │       ├── Button.tsx
│   │       └── SectionLabel.tsx
│   ├── data/
│   │   └── content.ts            # Toda copy + dados estáticos
│   ├── hooks/
│   │   ├── useCountUp.ts                # Contador animado em scroll
│   │   ├── useScrollspy.ts              # Highlight nav ativa
│   │   ├── useReducedMotion.ts          # Detecta preferência do SO
│   │   └── useAccessibilitySettings.ts  # Toolbar (localStorage)
│   ├── App.tsx                   # Composição das seções
│   ├── main.tsx                  # Bootstrap React
│   └── index.css                 # Design tokens + Tailwind + a11y CSS
├── index.html                    # Schema.org + meta tags + fontes
├── ARCHITECTURE.md               # Fluxo de dados e responsabilidades
├── CONTEXT.md                    # Regras de negócio e decisões
├── TODO.md                       # Tarefas e melhorias futuras
└── README.md                     # Este arquivo
```

---

## 🎨 Design System

### Paleta de Cores

| Token | Hex | Uso |
|---|---|---|
| `primary-700` | `#0a7688` | Teal escuro — header, CTAs, headings de destaque |
| `primary-500` | `#0fa8bd` | Teal médio — links, foco, accent primário |
| `primary-50` | `#e6f7f9` | Teal claro — backgrounds suaves |
| `secondary-500` | `#d43d48` | Coral — CTA de doação, calor humano |
| `accent-500` | `#10b981` | Verde — esperança, vida, sucesso |
| `warm-500` | `#f59e0b` | Dourado — excelência (uso pontual) |
| `neutral-900` | `#0f172a` | Texto principal |
| `neutral-700` | `#334155` | Corpo de texto (contraste WCAG AA+) |

### Tipografia
- **Headings**: Plus Jakarta Sans (700, 800) — tracking-tight `-0.02em`
- **Body**: Inter (400, 500, 600) — line-height 1.7

### Sombras
- `shadow-soft` — header scrolled
- `shadow-card` — elementos elevados ao hover
- `shadow-elevated` — modais, CTAs flutuantes

---

## ♿ Plano de Inclusão (WCAG 2.1 AA)

### Toolbar de Acessibilidade
Botão sticky lateral esquerda (top-28). Recursos:
- **Tamanho da fonte** — 3 níveis (16px / 18px / 20px)
- **Alto contraste** — paleta preto/amarelo/branco
- **Pausar animações** — toggle independente do `prefers-reduced-motion` do SO
- **Sublinhar links** — destaca todos os links da página
- **VLibras** — widget oficial do gov.br (carregado sob demanda)
- **Restaurar padrões** — reset com 1 clique
- Preferências salvas em `localStorage`, fechamento via `ESC`

### Outros recursos
- ✅ Skip Links (primeiro Tab) → conteúdo / navegação
- ✅ Landmarks ARIA (`banner`, `main`, `contentinfo`, `navigation`)
- ✅ `aria-current="location"` no link da seção ativa
- ✅ `aria-live` em notificações dinâmicas (Pix copiado, form enviado)
- ✅ `aria-expanded` / `aria-controls` em disclosures e menu mobile
- ✅ Carrossel de testimoniais navegável por `←` / `→`
- ✅ Foco visível 3px `primary-500` + offset 3px
- ✅ Ícones decorativos com `aria-hidden="true"`
- ✅ E-mail / telefone / website como `<a>` clicáveis (`mailto:`, `tel:`)
- ✅ Formulário com `<label>`, `aria-required`, status `aria-live`
- ✅ Texto alternativo em todas imagens; molduras decorativas com `aria-hidden`
- ✅ `prefers-reduced-motion` global respeitado em CSS + Framer Motion

---

## 🌊 Identidade Visual

Para fugir do "site genérico de IA", o redesign substituiu **31 cards idênticos** por componentes editoriais únicos:

| Seção | Padrão visual |
|---|---|
| **Hero** | Fundo sólido editorial + ondas SVG (Rio Amazonas) + headline com palavra-destaque |
| **Showcase** | Imagem com **borda orbital animada** (conic gradient girando) + molduras geométricas + gleam no hover |
| **About** | Bloco manifesto tipográfico + timeline horizontal de marcos + valores integrados |
| **Impact** | **Escada ascendente** de autonomia — números crescem com indentação progressiva |
| **Services** | **Diagrama circular SVG** interativo (Pessoa Atendida no centro) + accordion |
| **Pillars** | Tipografia revista — número 9xl como fundo decorativo |
| **Team** | Foto com molduras geométricas + lista numerada de especialidades |
| **Testimonials** | Carrossel tela cheia + tipografia 4xl + indicadores de progresso |
| **Donate** | Breakdown de impacto ("R$50 = 1 sessão") + QR Code Pix dinâmico |
| **Contact** | Hierarquia tipográfica + Google Maps + formulário acessível |

---

## 📦 Deploy

```bash
npm run build
```

Saída em `dist/` — bundle gzip ~125KB. Compatível com:
- **Vercel** / **Netlify** (zero config)
- **AWS S3 + CloudFront**
- **GitHub Pages** (com base path)
- Qualquer hosting estático

---

## 📝 Documentação Adicional

- 📐 **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Diagrama de fluxo de dados, responsabilidades por componente
- 🎯 **[CONTEXT.md](./CONTEXT.md)** — Regras de negócio, decisões arquiteturais, padrões de código
- ✅ **[TODO.md](./TODO.md)** — Tarefas pendentes, melhorias futuras, bugs conhecidos

---

## 🔐 Sobre a Instituição

- **Nome**: CVI - Centro de Vida Independente do Amazonas
- **CNPJ**: 07.555.086/0001-68
- **Localização**: Manaus, Amazonas - Brasil
- **Atuação**: 20+ anos, 50+ municípios atendidos
- **Financiamento**: 100% público (SUS / Fundo Nacional de Saúde)
- **Termos de Cooperação**: 001/2021 e 001/2024 — SES/AM

---

## 📄 Licença

Projeto privado — CVI - Centro de Vida Independente do Amazonas.

Todos os direitos reservados. Conteúdo institucional protegido.
