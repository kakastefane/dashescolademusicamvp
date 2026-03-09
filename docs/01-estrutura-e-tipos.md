# 01 — Estrutura de Pastas & Tipagens TypeScript

## Estrutura de Pastas (Next.js 15 App Router)

```
escola-musica/
├── .env.local                        # Variáveis de ambiente (não versionar)
├── .env.example                      # Template de variáveis (versionar)
├── next.config.ts
├── tailwind.config.ts
├── components.json                   # Config do shadcn/ui
│
├── src/
│   ├── app/                          # App Router — todas as páginas
│   │   ├── layout.tsx                # Layout raiz (html, body, providers)
│   │   ├── page.tsx                  # Redirect para /dashboard
│   │   │
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (app)/                    # Group com layout autenticado
│   │   │   ├── layout.tsx            # Sidebar + header
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── alunos/
│   │   │   │   ├── page.tsx          # Listagem de alunos
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx      # Formulário de novo aluno
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Detalhe do aluno
│   │   │   │       └── editar/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── agenda/
│   │   │   │   ├── page.tsx          # Agenda semanal
│   │   │   │   ├── nova-aula/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detalhe da aula
│   │   │   │
│   │   │   ├── financeiro/
│   │   │   │   ├── page.tsx          # Listagem de pagamentos
│   │   │   │   ├── inadimplentes/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── contratos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── planos/
│   │   │       ├── page.tsx
│   │   │       └── novo/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                      # Route Handlers (webhooks, etc.)
│   │       └── notion/
│   │           └── webhook/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                       # Componentes gerados pelo shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── nav-item.tsx
│   │   │
│   │   ├── alunos/
│   │   │   ├── aluno-card.tsx
│   │   │   ├── aluno-form.tsx
│   │   │   └── alunos-table.tsx
│   │   │
│   │   ├── agenda/
│   │   │   ├── agenda-semana.tsx
│   │   │   ├── aula-card.tsx
│   │   │   └── aula-form.tsx
│   │   │
│   │   ├── financeiro/
│   │   │   ├── pagamentos-table.tsx
│   │   │   ├── status-badge.tsx
│   │   │   └── resumo-mensal.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── metric-card.tsx
│   │       ├── alertas-vencimento.tsx
│   │       └── inadimplentes-list.tsx
│   │
│   ├── lib/
│   │   ├── notion/
│   │   │   ├── client.ts             # Instância do @notionhq/client
│   │   │   ├── databases.ts          # IDs das databases (do .env)
│   │   │   ├── alunos.ts             # Queries e mutations de alunos
│   │   │   ├── aulas.ts
│   │   │   ├── pagamentos.ts
│   │   │   ├── contratos.ts
│   │   │   ├── planos.ts
│   │   │   └── professores.ts
│   │   │
│   │   └── utils.ts                  # Helpers gerais (formatação, datas, etc.)
│   │
│   ├── actions/                      # Server Actions
│   │   ├── alunos.ts
│   │   ├── aulas.ts
│   │   ├── pagamentos.ts
│   │   └── contratos.ts
│   │
│   └── types/
│       ├── notion.ts                 # Tipos raw da Notion API
│       └── index.ts                  # Tipos de domínio da aplicação
```

---

## Tipagens TypeScript (`src/types/index.ts`)

```typescript
// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type StatusAluno = 'ativo' | 'inativo' | 'trancado'

export type StatusAula =
  | 'agendada'
  | 'realizada'
  | 'cancelada'
  | 'faltou'
  | 'reposicao'

export type TipoAula = 'fixa' | 'avulsa' | 'reposicao'

export type StatusPagamento = 'pendente' | 'pago' | 'atrasado' | 'cancelado'

export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'boleto'

export type DuracaoPlano = 'mensal' | 'trimestral' | 'semestral' | 'anual'

export type StatusContrato = 'ativo' | 'expirado' | 'cancelado'

export type Instrumento =
  | 'violao'
  | 'guitarra'
  | 'baixo'
  | 'bateria'
  | 'piano'
  | 'teclado'
  | 'canto'
  | 'violino'
  | 'flauta'
  | 'saxofone'
  | 'outro'

// ─── ENTIDADES ────────────────────────────────────────────────────────────────

export interface Aluno {
  id: string                        // ID da página no Notion
  nome: string
  telefone: string
  email?: string
  responsavel?: string              // Para alunos menores
  instrumentos: Instrumento[]
  status: StatusAluno
  dataInicio: string                // ISO date string
  observacoes?: string
  // Relações (opcionais — podem não vir em todas as queries)
  contratoAtual?: Contrato
  pagamentosPendentes?: number      // Contagem via rollup
}

export interface Professor {
  id: string
  nome: string
  telefone?: string
  instrumentos: Instrumento[]
  status: 'ativo' | 'inativo'
  disponibilidade?: string
}

export interface Plano {
  id: string
  nome: string
  duracao: DuracaoPlano
  aulasPorSemana: number
  valor: number                     // Em reais (centavos ou float — defina e padronize)
  descricao?: string
}

export interface Contrato {
  id: string
  titulo: string
  alunoId: string
  aluno?: Pick<Aluno, 'id' | 'nome'>
  planoId: string
  plano?: Plano
  dataInicio: string
  dataFim: string
  status: StatusContrato
  valorMensal: number
}

export interface Aula {
  id: string
  alunoId: string
  aluno?: Pick<Aluno, 'id' | 'nome'>
  professorId: string
  professor?: Pick<Professor, 'id' | 'nome'>
  dataHora: string                  // ISO datetime string
  duracaoMinutos: number
  instrumento: Instrumento
  status: StatusAula
  tipo: TipoAula
  observacoes?: string
  aulaOrigemId?: string             // Se for reposição, referencia a aula original
}

export interface Pagamento {
  id: string
  referencia: string                // Ex: "Mensalidade Março/2026"
  alunoId: string
  aluno?: Pick<Aluno, 'id' | 'nome'>
  valor: number
  vencimento: string                // ISO date string
  dataPagamento?: string
  status: StatusPagamento
  formaPagamento?: FormaPagamento
  observacoes?: string
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalAlunosAtivos: number
  aulaHoje: number
  aulaSemana: number
  receitaPrevistaMes: number
  receitaRecebidaMes: number
  totalInadimplentes: number
  contratosVencendoEm30Dias: number
}

// ─── FORMS ────────────────────────────────────────────────────────────────────

export type AlunoFormData = Omit<Aluno, 'id' | 'contratoAtual' | 'pagamentosPendentes'>
export type AulaFormData = Omit<Aula, 'id' | 'aluno' | 'professor'>
export type PagamentoFormData = Omit<Pagamento, 'id' | 'aluno'>
export type ContratoFormData = Omit<Contrato, 'id' | 'aluno' | 'plano'>

// ─── API / NOTION ──────────────────────────────────────────────────────────────

// Resultado paginado (Notion usa cursor-based pagination)
export interface PaginatedResult<T> {
  items: T[]
  hasMore: boolean
  nextCursor?: string
}

// Filtros comuns para listagens
export interface AlunoFiltros {
  status?: StatusAluno
  instrumento?: Instrumento
  busca?: string
}

export interface AulaFiltros {
  alunoId?: string
  professorId?: string
  status?: StatusAula
  dataInicio?: string
  dataFim?: string
}

export interface PagamentoFiltros {
  alunoId?: string
  status?: StatusPagamento
  mes?: number  // 1–12
  ano?: number
}
```

---

## Tipagem da Camada Notion (`src/types/notion.ts`)

```typescript
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

// Helper para extrair propriedades tipadas do Notion
export type NotionPage = PageObjectResponse

export type NotionProperty = PageObjectResponse['properties'][string]

// Helpers de extração (use em lib/notion/*.ts)
export function getTitle(page: NotionPage, field: string): string {
  const prop = page.properties[field]
  if (prop?.type === 'title') {
    return prop.title.map(t => t.plain_text).join('')
  }
  return ''
}

export function getRichText(page: NotionPage, field: string): string {
  const prop = page.properties[field]
  if (prop?.type === 'rich_text') {
    return prop.rich_text.map(t => t.plain_text).join('')
  }
  return ''
}

export function getSelect(page: NotionPage, field: string): string | null {
  const prop = page.properties[field]
  if (prop?.type === 'select') return prop.select?.name ?? null
  return null
}

export function getMultiSelect(page: NotionPage, field: string): string[] {
  const prop = page.properties[field]
  if (prop?.type === 'multi_select') return prop.multi_select.map(s => s.name)
  return []
}

export function getDate(page: NotionPage, field: string): string | null {
  const prop = page.properties[field]
  if (prop?.type === 'date') return prop.date?.start ?? null
  return null
}

export function getNumber(page: NotionPage, field: string): number | null {
  const prop = page.properties[field]
  if (prop?.type === 'number') return prop.number
  return null
}

export function getRelationIds(page: NotionPage, field: string): string[] {
  const prop = page.properties[field]
  if (prop?.type === 'relation') return prop.relation.map(r => r.id)
  return []
}
```

---

## Configuração de Ambiente (`.env.example`)

```bash
# Notion
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# IDs das Databases (copie do URL de cada database no Notion)
NOTION_DB_ALUNOS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_PROFESSORES=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_AULAS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_PAGAMENTOS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_CONTRATOS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_PLANOS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Auth (Next.js - defina uma string aleatória longa)
NEXTAUTH_SECRET=sua_chave_secreta_aqui
NEXTAUTH_URL=http://localhost:3000
```
