import type { PageObjectResponse, QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getDate, getNumber, getRelationIds } from '@/types/notion'
import type { Pagamento, PagamentoFiltros, StatusPagamento, FormaPagamento } from '@/types'

type PropertyFilter = Extract<NonNullable<QueryDatabaseParameters['filter']>, { property: string }>

function mapearPagamento(page: PageObjectResponse): Pagamento {
    return {
        id: page.id,
        referencia: getTitle(page, 'Referência'),
        alunoId: getRelationIds(page, 'Alunos')[0] ?? '',
        valor: getNumber(page, 'Valor') ?? 0,
        vencimento: getDate(page, 'Vencimento') ?? '',
        dataPagamento: getDate(page, 'Data Pagamento') ?? undefined,
        status: (getSelect(page, 'Status') ?? 'pendente') as StatusPagamento,
        formaPagamento: (getSelect(page, 'Forma de Pagamento') as FormaPagamento | null) ?? undefined,
        observacoes: getRichText(page, 'Observações') || undefined,
    }
}

export async function listarPagamentos(filtros?: PagamentoFiltros): Promise<Pagamento[]> {
    try {
        const filters: PropertyFilter[] = []

        if (filtros?.status) {
            filters.push({ property: 'Status', select: { equals: filtros.status } })
        }
        if (filtros?.alunoId) {
            filters.push({ property: 'Alunos', relation: { contains: filtros.alunoId } })
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
    } catch (error: unknown) {
        console.error('[listarPagamentos]', error)
        throw new Error('Erro ao listar pagamentos.')
    }
}

export async function listarPagamentosPorAluno(alunoId: string): Promise<Pagamento[]> {
    try {
        const response = await notion.databases.query({
            database_id: DB.pagamentos,
            filter: { property: 'Alunos', relation: { contains: alunoId } },
            sorts: [{ property: 'Vencimento', direction: 'descending' }],
            page_size: 100,
        })
        return (response.results as PageObjectResponse[]).map(mapearPagamento)
    } catch (error: unknown) {
        console.error('[listarPagamentosPorAluno]', error)
        throw new Error('Erro ao listar pagamentos do aluno.')
    }
}

export async function listarInadimplentes(): Promise<Pagamento[]> {
    try {
        const response = await notion.databases.query({
            database_id: DB.pagamentos,
            filter: { property: 'Status', select: { equals: 'atrasado' } },
            sorts: [{ property: 'Vencimento', direction: 'ascending' }],
            page_size: 100,
        })
        return (response.results as PageObjectResponse[]).map(mapearPagamento)
    } catch (error: unknown) {
        console.error('[listarInadimplentes]', error)
        throw new Error('Erro ao listar inadimplentes.')
    }
}

export async function verificarPagamentoExistente(
    alunoId: string,
    mes: number,
    ano: number
): Promise<boolean> {
    try {
        const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
        const fim = `${ano}-${String(mes).padStart(2, '0')}-31`

        const response = await notion.databases.query({
            database_id: DB.pagamentos,
            filter: {
                and: [
                    { property: 'Alunos', relation: { contains: alunoId } },
                    { property: 'Vencimento', date: { on_or_after: inicio } },
                    { property: 'Vencimento', date: { on_or_before: fim } },
                ]
            },
            page_size: 1,
        })
        return response.results.length > 0
    } catch (error: unknown) {
        console.error('[verificarPagamentoExistente]', error)
        throw new Error('Erro ao verificar pagamento existente.')
    }
}

export async function criarPagamento(data: {
    referencia: string
    alunoId: string
    valor: number
    vencimento: string
}): Promise<Pagamento> {
    try {
        const page = await notion.pages.create({
            parent: { database_id: DB.pagamentos },
            properties: {
                'Referência': { title: [{ text: { content: data.referencia } }] },
                'Alunos': { relation: [{ id: data.alunoId }] },
                'Valor': { number: data.valor },
                'Vencimento': { date: { start: data.vencimento } },
                'Status': { select: { name: 'pendente' } },
            },
        }) as PageObjectResponse
        return mapearPagamento(page)
    } catch (error: unknown) {
        console.error('[criarPagamento]', error)
        throw new Error('Erro ao criar pagamento.')
    }
}

export async function marcarComoPago(
    id: string,
    formaPagamento: FormaPagamento,
    dataPagamento?: string
): Promise<void> {
    try {
        await notion.pages.update({
            page_id: id,
            properties: {
                'Status': { select: { name: 'pago' } },
                'Forma de Pagamento': { select: { name: formaPagamento } },
                'Data Pagamento': { date: { start: dataPagamento ?? new Date().toISOString().slice(0, 10) } },
            },
        })
    } catch (error: unknown) {
        console.error('[marcarComoPago]', error)
        throw new Error('Erro ao marcar pagamento como pago.')
    }
}
