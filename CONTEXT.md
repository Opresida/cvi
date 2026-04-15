# CVI Amazonas — Contexto do Projeto

## Resumo

Site institucional single-page do **CVI - Centro de Vida Independente do Amazonas** (CNPJ: 07.555.086/0001-68). Migrado de WordPress/Divi para uma aplicação React moderna, com foco em performance, acessibilidade e impacto visual.

## Stack Técnica

- **Framework:** React 19 + TypeScript
- **Build:** Vite 6
- **Estilização:** Tailwind CSS 4 (design tokens via `@theme`)
- **Animações:** Framer Motion 12
- **Ícones:** Lucide React
- **Roteamento:** React Router DOM 7 (preparado, mas atualmente single-page)

## Regras de Negócio

### Sobre a Instituição
- O CVI é um centro de reabilitação biopsicossocial sem fins lucrativos
- Atendimento 100% gratuito, financiado pelo SUS (Fundo Nacional de Saúde)
- Termos de Cooperação 001/2021 e 001/2024 com a SES/AM
- Atende pessoas com deficiência permanente ou temporária, familiares e comunidade
- Abrange 50+ municípios do estado do Amazonas

### Público-Alvo do Site
1. **Pacientes e familiares** — buscar informações sobre serviços
2. **Comunidade** — conhecer o trabalho do CVI
3. **Doadores** — contribuir financeiramente ou como voluntários
4. **Parceiros institucionais** — estabelecer parcerias
5. **Governo e órgãos públicos** — transparência e prestação de contas

### Requisitos de Acessibilidade
- WCAG AA como padrão mínimo (público-alvo são PcDs)
- Semântica HTML correta
- Navegação por teclado
- Contraste de cores adequado
- Foco visível em elementos interativos
- Alt text em todas as imagens
- Futuramente: VLibras, alto contraste, ajuste de fonte

### Tom e Copy
- **Tom:** Profissional, acolhedor, esperançoso, empoderador
- **Linguagem:** Inclusiva e acessível
- **Foco:** Storytelling de impacto e transformação de vidas
- **Idioma:** Português Brasileiro (pt-BR)

## Design System

### Paleta de Cores
| Token | Hex | Uso |
|---|---|---|
| `primary-500` | #0fa8bd | Teal — saúde, confiança |
| `secondary-500` | #d43d48 | Coral — acolhimento |
| `accent-500` | #10b981 | Verde — esperança |
| `warm-500` | #f59e0b | Dourado — excelência |
| `neutral-900` | #0f172a | Texto principal |

### Tipografia
- **Headings:** Plus Jakarta Sans (Google Fonts)
- **Body:** Inter (Google Fonts)

### Componentes Reutilizáveis
- `Button` — variantes: primary, secondary, outline, ghost
- `SectionLabel` — badge com pill para identificar seções

## Decisões Arquiteturais

1. **Single-page vs Multi-page:** Optamos por single-page para dar consistência e volume ao site, já que o conteúdo não justifica múltiplas rotas separadas
2. **Conteúdo centralizado:** Todo o conteúdo textual está em `src/data/content.ts`, facilitando manutenção e futura integração com CMS
3. **Design tokens no CSS:** Usamos `@theme` do Tailwind 4 para definir tokens, mantendo consistência
4. **Framer Motion:** Animações suaves que respeitam `prefers-reduced-motion`
5. **Sem backend:** Site estático, ideal para deploy em CDN

## Padrões de Código

- Componentes funcionais com TypeScript
- Props tipadas com interfaces
- Hooks customizados para lógica reutilizável
- Componentes organizados por responsabilidade (layout, sections, ui)
- CSS utilitário via Tailwind, sem CSS modules
