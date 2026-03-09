# 06 — Camada de Serviço: Notion API

> Código de referência para `src/lib/notion/`. O agente deve seguir estes padrões exatamente.

---

## `src/lib/notion/client.ts`

```typescript
import { Client } from '@notionhq/client'

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})
```

---

## `src/lib/notion/databases.ts`

```typescript
export const DB = {
  alunos:      process.env.NOTION_DB_ALUNOS!,
  professores: process.env.NOTION_DB_PROFESSORES!,
  aulas:       process.env.NOTION_DB_AULAS!,
  pagamentos:  process.env.NOTION_DB_PAGAMENTOS!,
  contratos:   process.env.NOTION_DB_CONTRATOS!,
  planos:      process.env.NOTION_DB_PLANOS!,
} as const
```

---

## `src/lib/notion/alunos.ts`

```typescript
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getMultiSelect, getDate } from '@/types/notion'
import type { Aluno, AlunoFiltros, AlunoFormData, Instrumento, StatusAluno } from '@/types'

function mapearAluno(page: PageObjectResponse): Aluno {
  return {
    id: page.id,
    nome: getTitle(page, 'Nome'),
    telefone: getRichText(page, 'Telefone'),
    email: getRichText(page, 'Email') || undefined,
    responsavel: getRichText(page, 'Responsável') || undefined,
    instrumentos: getMultiSelect(page, 'Instrumentos') as Instrumento[],
    status: (getSelect(page, 'Status') ?? 'ativo') as StatusAluno,
    dataInicio: getDate(page, 'Data Início') ?? '',
    observacoes: getRichText(page, 'Observações') || undefined,
  }
}

export async function listarAlunos(filtros?: AlunoFiltros): Promise<Aluno[]> {
  const filters: Parameters<typeof notion.databases.query>[0]['filter'][] = []

  if (filtros?.status) {
    filters.push({ property: 'Status', select: { equals: filtros.status } })
  }
  if (filtros?.instrumento) {
    filters.push({ property: 'Instrumentos', multi_select: { contains: filtros.instrumento } })
  }

  const response = await notion.databases.query({
    database_id: DB.alunos,
    filter: filters.length > 1
      ? { and: filters }
      : filters.length === 1 ? filters[0] : undefined,
    sorts: [{ property: 'Nome', direction: 'ascending' }],
    page_size: 100,
  })

  return (response.results as PageObjectResponse[]).map(mapearAluno)
}

export async function buscarAluno(id: string): Promise<Aluno> {
  const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
  return mapearAluno(page)
}

export async function criarAluno(data: AlunoFormData): Promise<Aluno> {
  const page = await notion.pages.create({
    parent: { database_id: DB.alunos },
    properties: {
      'Nome':        { title: [{ text: { content: data.nome } }] },
      'Telefone':    { phone_number: data.telefone },
      'Email':       data.email ? { email: data.email } : { email: null },
      'Responsável': { rich_text: [{ text: { content: data.responsavel ?? '' } }] },
      'Instrumentos':{ multi_select: data.instrumentos.map(i => ({ name: i })) },
      'Status':      { select: { name: data.status } },
      'Data Início': { date: { start: data.dataInicio } },
      'Observações': { rich_text: [{ text: { content: data.observacoes ?? '' } }] },
    },
  }) as PageObjectResponse

  return mapearAluno(page)
}

export async function atualizarAluno(id: string, data: Partial<AlunoFormData>): Promise<Aluno> {
  const properties: Record<string, unknown> = {}

  if (data.nome)        properties['Nome']        = { title: [{ text: { content: data.nome } }] }
  if (data.telefone)    properties['Telefone']    = { phone_number: data.telefone }
  if (data.email !== undefined) properties['Email'] = { email: data.email ?? null }
  if (data.responsavel !== undefined) properties['Responsável'] = { rich_text: [{ text: { content: data.responsavel ?? '' } }] }
  if (data.instrumentos) properties['Instrumentos'] = { multi_select: data.instrumentos.map(i => ({ name: i })) }
  if (data.status)      properties['Status']      = { select: { name: data.status } }
  if (data.dataInicio)  properties['Data Início'] = { date: { start: data.dataInicio } }
  if (data.observacoes !== undefined) properties['Observações'] = { rich_text: [{ text: { content: data.observacoes ?? '' } }] }

  const page = await notion.pages.update({
    page_id: id,
    properties,
  }) as PageObjectResponse

  return mapearAluno(page)
}

export async function arquivarAluno(id: string): Promise<void> {
  await atualizarAluno(id, { status: 'inativo' })
}
```

---

## `src/lib/notion/aulas.ts`

```typescript
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getDate, getNumber, getRelationIds } from '@/types/notion'
import type { Aula, AulaFiltros, AulaFormData, Instrumento, StatusAula, TipoAula } from '@/types'

function mapearAula(page: PageObjectResponse): Aula {
  return {
    id: page.id,
    alunoId: getRelationIds(page, 'Aluno')[0] ?? '',
    professorId: getRelationIds(page, 'Professor')[0] ?? '',
    dataHora: getDate(page, 'Data e Hora') ?? '',
    duracaoMinutos: getNumber(page, 'Duração (min)') ?? 50,
    instrumento: (getSelect(page, 'Instrumento') ?? 'outro') as Instrumento,
    status: (getSelect(page, 'Status') ?? 'agendada') as StatusAula,
    tipo: (getSelect(page, 'Tipo') ?? 'fixa') as TipoAula,
    observacoes: getRichText(page, 'Observações') || undefined,
    aulaOrigemId: getRelationIds(page, 'Aula Origem')[0] || undefined,
  }
}

export async function listarAulasDaSemana(dataInicio: string, dataFim: string): Promise<Aula[]> {
  const response = await notion.databases.query({
    database_id: DB.aulas,
    filter: {
      and: [
        { property: 'Data e Hora', date: { on_or_after: dataInicio } },
        { property: 'Data e Hora', date: { on_or_before: dataFim } },
      ]
    },
    sorts: [{ property: 'Data e Hora', direction: 'ascending' }],
    page_size: 100,
  })
  return (response.results as PageObjectResponse[]).map(mapearAula)
}

export async function listarAulasPorAluno(alunoId: string, limite = 10): Promise<Aula[]> {
  const response = await notion.databases.query({
    database_id: DB.aulas,
    filter: { property: 'Aluno', relation: { contains: alunoId } },
    sorts: [{ property: 'Data e Hora', direction: 'descending' }],
    page_size: limite,
  })
  return (response.results as PageObjectResponse[]).map(mapearAula)
}

export async function buscarAula(id: string): Promise<Aula> {
  const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
  return mapearAula(page)
}

export async function criarAula(data: AulaFormData): Promise<Aula> {
  const titulo = `Aula — ${data.dataHora.slice(0, 10)}`
  const page = await notion.pages.create({
    parent: { database_id: DB.aulas },
    properties: {
      'Título':        { title: [{ text: { content: titulo } }] },
      'Aluno':         { relation: [{ id: data.alunoId }] },
      'Professor':     { relation: [{ id: data.professorId }] },
      'Data e Hora':   { date: { start: data.dataHora } },
      'Duração (min)': { number: data.duracaoMinutos },
      'Instrumento':   { select: { name: data.instrumento } },
      'Status':        { select: { name: 'agendada' } },
      'Tipo':          { select: { name: data.tipo } },
      'Observações':   { rich_text: [{ text: { content: data.observacoes ?? '' } }] },
      ...(data.aulaOrigemId ? {
        'Aula Origem': { relation: [{ id: data.aulaOrigemId }] }
      } : {}),
    },
  }) as PageObjectResponse
  return mapearAula(page)
}

export async function atualizarStatusAula(id: string, status: StatusAula): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: {
      'Status': { select: { name: status } },
    },
  })
}
```

---

## `src/lib/notion/pagamentos.ts`

```typescript
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getDate, getNumber, getRelationIds } from '@/types/notion'
import type { Pagamento, PagamentoFiltros, StatusPagamento, FormaPagamento } from '@/types'

function mapearPagamento(page: PageObjectResponse): Pagamento {
  return {
    id: page.id,
    referencia: getTitle(page, 'Referência'),
    alunoId: getRelationIds(page, 'Aluno')[0] ?? '',
    valor: getNumber(page, 'Valor') ?? 0,
    vencimento: getDate(page, 'Vencimento') ?? '',
    dataPagamento: getDate(page, 'Data Pagamento') ?? undefined,
    status: (getSelect(page, 'Status') ?? 'pendente') as StatusPagamento,
    formaPagamento: getSelect(page, 'Forma de Pagamento') as FormaPagamento | null ?? undefined,
    observacoes: getRichText(page, 'Observações') || undefined,
  }
}

export async function listarPagamentos(filtros?: PagamentoFiltros): Promise<Pagamento[]> {
  const filters: Parameters<typeof notion.databases.query>[0]['filter'][] = []

  if (filtros?.status) {
    filters.push({ property: 'Status', select: { equals: filtros.status } })
  }
  if (filtros?.alunoId) {
    filters.push({ property: 'Aluno', relation: { contains: filtros.alunoId } })
  }
  if (filtros?.mes && filtros?.ano) {
    const inicio = `${filtros.ano}-${String(filtros.mes).padStart(2, '0')}-01`
    const fim = `${filtros.ano}-${String(filtros.mes).padStart(2, '0')}-31`
    filters.push({ property: 'Vencimento', date: { on_or_after: inicio } })
    filters.push({ property: 'Vencimento', date: { on_or_before: fim } })
  }

  const response = await notion.databases.query({
    database_id: DB.pagamentos,
    filter: filters.length > 1
      ? { and: filters }
      : filters.length === 1 ? filters[0] : undefined,
    sorts: [{ property: 'Vencimento', direction: 'descending' }],
    page_size: 100,
  })
  return (response.results as PageObjectResponse[]).map(mapearPagamento)
}

export async function listarInadimplentes(): Promise<Pagamento[]> {
  const response = await notion.databases.query({
    database_id: DB.pagamentos,
    filter: { property: 'Status', select: { equals: 'atrasado' } },
    sorts: [{ property: 'Vencimento', direction: 'ascending' }],
    page_size: 100,
  })
  return (response.results as PageObjectResponse[]).map(mapearPagamento)
}

export async function verificarPagamentoExistente(
  alunoId: string,
  mes: number,
  ano: number
): Promise<boolean> {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fim = `${ano}-${String(mes).padStart(2, '0')}-31`

  const response = await notion.databases.query({
    database_id: DB.pagamentos,
    filter: {
      and: [
        { property: 'Aluno', relation: { contains: alunoId } },
        { property: 'Vencimento', date: { on_or_after: inicio } },
        { property: 'Vencimento', date: { on_or_before: fim } },
      ]
    },
    page_size: 1,
  })
  return response.results.length > 0
}

export async function criarPagamento(data: {
  referencia: string
  alunoId: string
  valor: number
  vencimento: string
}): Promise<Pagamento> {
  const page = await notion.pages.create({
    parent: { database_id: DB.pagamentos },
    properties: {
      'Referência':   { title: [{ text: { content: data.referencia } }] },
      'Aluno':        { relation: [{ id: data.alunoId }] },
      'Valor':        { number: data.valor },
      'Vencimento':   { date: { start: data.vencimento } },
      'Status':       { select: { name: 'pendente' } },
    },
  }) as PageObjectResponse
  return mapearPagamento(page)
}

export async function marcarComoPago(
  id: string,
  formaPagamento: FormaPagamento,
  dataPagamento?: string
): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: {
      'Status':            { select: { name: 'pago' } },
      'Forma de Pagamento':{ select: { name: formaPagamento } },
      'Data Pagamento':    { date: { start: dataPagamento ?? new Date().toISOString().slice(0, 10) } },
    },
  })
}
```

---

## `src/lib/notion/contratos.ts`

```typescript
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getSelect, getDate, getNumber, getRelationIds } from '@/types/notion'
import type { Contrato, ContratoFormData, StatusContrato } from '@/types'

function mapearContrato(page: PageObjectResponse): Contrato {
  return {
    id: page.id,
    titulo: getTitle(page, 'Título'),
    alunoId: getRelationIds(page, 'Aluno')[0] ?? '',
    planoId: getRelationIds(page, 'Plano')[0] ?? '',
    dataInicio: getDate(page, 'Data Início') ?? '',
    dataFim: getDate(page, 'Data Fim') ?? '',
    status: (getSelect(page, 'Status') ?? 'ativo') as StatusContrato,
    valorMensal: getNumber(page, 'Valor Mensal') ?? 0,
  }
}

export async function listarContratos(): Promise<Contrato[]> {
  const response = await notion.databases.query({
    database_id: DB.contratos,
    sorts: [{ property: 'Data Fim', direction: 'ascending' }],
    page_size: 100,
  })
  return (response.results as PageObjectResponse[]).map(mapearContrato)
}

export async function buscarContratoAtivo(alunoId: string): Promise<Contrato | null> {
  const response = await notion.databases.query({
    database_id: DB.contratos,
    filter: {
      and: [
        { property: 'Aluno', relation: { contains: alunoId } },
        { property: 'Status', select: { equals: 'ativo' } },
      ]
    },
    page_size: 1,
  })
  if (response.results.length === 0) return null
  return mapearContrato(response.results[0] as PageObjectResponse)
}

export async function listarContratosVencendo(dias: number): Promise<Contrato[]> {
  const hoje = new Date()
  const limite = new Date()
  limite.setDate(hoje.getDate() + dias)

  const response = await notion.databases.query({
    database_id: DB.contratos,
    filter: {
      and: [
        { property: 'Status', select: { equals: 'ativo' } },
        { property: 'Data Fim', date: { on_or_before: limite.toISOString().slice(0, 10) } },
        { property: 'Data Fim', date: { on_or_after: hoje.toISOString().slice(0, 10) } },
      ]
    },
    sorts: [{ property: 'Data Fim', direction: 'ascending' }],
  })
  return (response.results as PageObjectResponse[]).map(mapearContrato)
}

export async function criarContrato(data: ContratoFormData): Promise<Contrato> {
  const page = await notion.pages.create({
    parent: { database_id: DB.contratos },
    properties: {
      'Título':      { title: [{ text: { content: data.titulo } }] },
      'Aluno':       { relation: [{ id: data.alunoId }] },
      'Plano':       { relation: [{ id: data.planoId }] },
      'Data Início': { date: { start: data.dataInicio } },
      'Data Fim':    { date: { start: data.dataFim } },
      'Status':      { select: { name: 'ativo' } },
    },
  }) as PageObjectResponse
  return mapearContrato(page)
}

export async function atualizarStatusContrato(id: string, status: StatusContrato): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: { 'Status': { select: { name: status } } },
  })
}
```

---

## `src/lib/notion/planos.ts`

```typescript
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getNumber } from '@/types/notion'
import type { Plano, DuracaoPlano } from '@/types'

function mapearPlano(page: PageObjectResponse): Plano {
  return {
    id: page.id,
    nome: getTitle(page, 'Nome do Plano'),
    duracao: (getSelect(page, 'Duração') ?? 'mensal') as DuracaoPlano,
    aulasPorSemana: getNumber(page, 'Aulas por semana') ?? 1,
    valor: getNumber(page, 'Valor') ?? 0,
    descricao: getRichText(page, 'Descrição') || undefined,
  }
}

export async function listarPlanos(): Promise<Plano[]> {
  const response = await notion.databases.query({
    database_id: DB.planos,
    sorts: [{ property: 'Valor', direction: 'ascending' }],
  })
  return (response.results as PageObjectResponse[]).map(mapearPlano)
}

export async function criarPlano(data: Omit<Plano, 'id'>): Promise<Plano> {
  const page = await notion.pages.create({
    parent: { database_id: DB.planos },
    properties: {
      'Nome do Plano':   { title: [{ text: { content: data.nome } }] },
      'Duração':         { select: { name: data.duracao } },
      'Aulas por semana':{ number: data.aulasPorSemana },
      'Valor':           { number: data.valor },
      'Descrição':       { rich_text: [{ text: { content: data.descricao ?? '' } }] },
    },
  }) as PageObjectResponse
  return mapearPlano(page)
}
```

---

## `src/lib/notion/professores.ts`

```typescript
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getMultiSelect } from '@/types/notion'
import type { Professor, Instrumento } from '@/types'

function mapearProfessor(page: PageObjectResponse): Professor {
  return {
    id: page.id,
    nome: getTitle(page, 'Nome'),
    telefone: getRichText(page, 'Telefone') || undefined,
    instrumentos: getMultiSelect(page, 'Instrumentos') as Instrumento[],
    status: (getSelect(page, 'Status') ?? 'ativo') as 'ativo' | 'inativo',
    disponibilidade: getRichText(page, 'Disponibilidade') || undefined,
  }
}

export async function listarProfessores(apenasAtivos = true): Promise<Professor[]> {
  const response = await notion.databases.query({
    database_id: DB.professores,
    filter: apenasAtivos
      ? { property: 'Status', select: { equals: 'ativo' } }
      : undefined,
    sorts: [{ property: 'Nome', direction: 'ascending' }],
  })
  return (response.results as PageObjectResponse[]).map(mapearProfessor)
}
```

---

## `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Gerado pelo shadcn — não remover
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar valor monetário
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

// Formatar data ISO para exibição
export function formatarData(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(isoDate))
}

// Formatar data e hora
export function formatarDataHora(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(isoDate))
}

// Calcular data fim do contrato baseado na duração do plano
export function calcularDataFimContrato(dataInicio: string, duracao: string): string {
  const data = new Date(dataInicio)
  const meses = { mensal: 1, trimestral: 3, semestral: 6, anual: 12 }
  data.setMonth(data.getMonth() + (meses[duracao as keyof typeof meses] ?? 1))
  return data.toISOString().slice(0, 10)
}

// Gerar referência de mensalidade
export function gerarReferenciaMensalidade(nomeAluno: string, mes: number, ano: number): string {
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(ano, mes - 1))
  return `Mensalidade ${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${ano} — ${nomeAluno}`
}

// Verificar se uma data está atrasada
export function estaAtrasado(vencimento: string): boolean {
  return new Date(vencimento) < new Date()
}
```
