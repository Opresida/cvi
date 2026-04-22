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
- **Intervalo:** 1h almoço (configurável por funcionário via `hasLunchBreak`)
- **Banco de horas:** 12 meses compensação
- **Horas extras:** 50% seg-sex, 75% sáb/dom/feriado (CCT SINDISAÚDE)
- **Fechamento mensal:** dia 20
- **Geofencing:** GPS Haversine a partir da sede (R. Acari, 50, Manaus-AM) — 3 faixas:
  - **0-100m** → registro válido
  - **100-350m** → registrado com flag `fora_perimetro` (admin revisa)
  - **Acima de 350m** → **bloqueado** (HTTP 403 com mensagem explicativa)
  - Raios configuráveis em `systemSettings.geofenceRadius` e `geofenceMaxRadius`

### Jornada sem almoço (hasLunchBreak = false)
Funcionários com jornada reduzida ou prestadores de serviço podem ter almoço desligado:
- Admin marca/desmarca "Tem intervalo de almoço" no cadastro (reversível)
- Backend rejeita `saida_almoco`/`volta_almoco` com HTTP 400
- Frontend esconde os botões correspondentes e mostra aviso

### Reconhecimento facial
- **Obrigatório** para Entrada e Saída
- **Opcional** para Saída/Volta Almoço (só GPS)
- **Tecnologia:** face-api.js (TensorFlow.js) — processamento 100% no browser do funcionário
- **Dois modos:** webcam do dispositivo OU QR Code em outro celular (sessão temporária 5min)
- **Armazenamento:** apenas embedding numérico (128 floats), nenhuma foto salva (LGPD)
- **Threshold:** distância euclidiana < 0.6 para match

### Perfis de acesso
- **Admin:** tudo (CRUD funcionários, aprovar ajustes, ver todos os pontos, cadastrar rostos, tratamento, exportação, contracheques)
- **Gestor:** mesmo que admin (futuro: restrito ao seu departamento)
- **Funcionário:** bater ponto, solicitar ajustes com anexo, ver espelho próprio, revisar tratamento mensal, baixar contracheques, ver férias

### Sidebar por departamento
- Estrutura extensível com grupos colapsáveis
- RH (atual): Ponto, Funcionários, Ajustes, Espelho, Férias, Tratamento, Contracheques
- Futuros: Financeiro, Exames (rotas preparadas)

## Sistema de Salário

### Histórico de salário (tabela `salary_history`)
- Cada registro tem: `userId`, `grossSalary`, `netSalary`, `effectiveFrom`, `notes`, `createdBy`
- **Salário vigente em uma data** = registro mais recente com `effectiveFrom` <= essa data
- Permite aumento/ajuste sem perder histórico — fundamental para auditoria
- Funcionário vê o próprio salário atual no Dashboard Home
- Admin gerencia no modal de edição de funcionário

### Validações
- `netSalary <= grossSalary` (líquido nunca maior que bruto)
- Valores >= 0
- Data no formato ISO `YYYY-MM-DD`

## Tratamento Mensal de Ponto

### Fluxo (tabela `monthly_treatments`)
1. **draft** — admin cria e ajusta desconto/abono/notas livremente
2. **submitted_to_employee** — admin envia pra revisão (timer 24h inicia via `submittedAt`)
3. **approved_by_employee** — funcionário aprova explicitamente
4. **auto_approved** — scheduler interno aprova após 24h de inatividade
5. **questioned** — funcionário questiona (volta pro admin corrigir)

### Regras de negócio
- 1 registro único por `(userId, referenceMonth)` — upsert
- Desconto e abono são **digitados manualmente** pelo admin (sem cálculo automático)
- `Total a pagar = netSalary - discountAmount + bonusAmount`
- Admin só pode editar quando status for `draft` ou `questioned`
- Funcionário só vê tratamentos que saíram do `draft`

### Auto-aprovação (24h corridas)
- Scheduler interno em `server/utils/autoApproveTreatments.ts`
- Roda **a cada 5 minutos** + uma vez no startup (limpa pendências)
- Tratamentos com `submittedAt < agora - 24h` viram `auto_approved`
- Precisão: aprovação ocorre em até 5 min após o deadline

### Notificação ao funcionário
- Banner sticky amarelo abaixo do header quando tem tratamento pendente
- Modal de revisão com timer ao vivo + summary completo (pontos + ajustes do mês)
- Componente: `src/components/admin/PendingTreatmentAlert.tsx`

## Férias (CLT + PJ)

### Regras
- **30 dias anuais** (período único — sem fracionamento)
- **Sem abono pecuniário** (venda de dias)
- Vale para **CLT e PJ** (todos os funcionários têm direito)
- Status: `agendada` → `em_curso` → `concluida` (ou `cancelada`)
- Bloqueio de sobreposição com outras férias ativas do mesmo funcionário
- Aviso PDF opcional anexado pelo admin
- Funcionário confirma ciência (botão "Confirmar ciência" — disponível mesmo sem PDF anexado)

## Exportação ZIP (Folha Mensal)

### Fluxo
1. Admin trata ponto de todos os funcionários do mês
2. Envia pra revisão, aguarda aprovação (ou auto-aprovação 24h)
3. Clica "Exportar ZIP" → escolhe "Apenas aprovados" (recomendado) ou "Todos"
4. Baixa o ZIP → envia pro contador externamente (WhatsApp/Email)
5. Contador devolve contracheques em PDF
6. Admin faz upload dos contracheques em `/admin/dashboard/rh/contracheques`
7. Funcionários baixam os próprios

### Estrutura do ZIP
```
folha-2026-04.zip
├── LEIAME.txt                          (metadata)
├── folha-consolidada-2026-04.csv       (planilha resumo)
├── folha-2026-04.pdf                   (PDF institucional timbrado — opcional)
└── <Nome do Funcionário>/
    ├── resumo.txt                      (dados + total a pagar)
    ├── pontos.csv                      (todos os pontos do mês)
    ├── ajustes.csv                     (ajustes solicitados com status)
    └── notas-rh.txt                    (se houver)
```

### PDF institucional (opcional)
- Baseado em `pdf-lib` (mesmo padrão usado no projeto IDASAM)
- Cabeçalho fixo: logo branca + dados institucionais do CVI
- Rodapé fixo: confidencialidade + data/hora + número de página
- Auto page-break via função `ensureSpace()` respeita margens
- Seções: Capa / Sumário consolidado / 1 página por funcionário / Encerramento com assinatura

## Contracheques

### Regras
- 1 contracheque por funcionário/mês (upsert — substitui arquivo antigo)
- **Apenas PDF**, máximo 10 MB
- Admin faz upload em `/admin/dashboard/rh/contracheques`
- Funcionário baixa o próprio na mesma rota (visão adaptada por role)
- Armazenamento: tabela `file_storage` (bytea no Neon)
- Autorização por endpoint: dono ou admin/gestor

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
