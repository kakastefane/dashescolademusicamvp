import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getSelect, getDate, getRelationIds, getRollupNumber } from '@/types/notion'
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
        valorMensal: getRollupNumber(page, 'Valor Mensal') ?? 0,
    }
}

export async function listarContratos(): Promise<Contrato[]> {
    try {
        const response = await notion.databases.query({
            database_id: DB.contratos,
            sorts: [{ property: 'Data Fim', direction: 'ascending' }],
            page_size: 100,
        })
        return (response.results as PageObjectResponse[]).map(mapearContrato)
    } catch (error: unknown) {
        console.error('[listarContratos]', error)
        throw new Error('Erro ao listar contratos.')
    }
}

export async function buscarContrato(id: string): Promise<Contrato> {
    try {
        const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
        return mapearContrato(page)
    } catch (error: unknown) {
        console.error('[buscarContrato]', error)
        throw new Error('Erro ao buscar contrato.')
    }
}

export async function buscarContratoAtivo(alunoId: string): Promise<Contrato | null> {
    try {
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
    } catch (error: unknown) {
        console.error('[buscarContratoAtivo]', error)
        throw new Error('Erro ao buscar contrato ativo.')
    }
}

export async function listarContratosVencendo(dias: number): Promise<Contrato[]> {
    try {
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
    } catch (error: unknown) {
        console.error('[listarContratosVencendo]', error)
        throw new Error('Erro ao listar contratos vencendo.')
    }
}

export async function criarContrato(data: ContratoFormData): Promise<Contrato> {
    try {
        const page = await notion.pages.create({
            parent: { database_id: DB.contratos },
            properties: {
                'Título': { title: [{ text: { content: data.titulo } }] },
                'Aluno': { relation: [{ id: data.alunoId }] },
                'Plano': { relation: [{ id: data.planoId }] },
                'Data Início': { date: { start: data.dataInicio } },
                'Data Fim': { date: { start: data.dataFim } },
                'Status': { select: { name: 'ativo' } },
            },
        }) as PageObjectResponse
        return mapearContrato(page)
    } catch (error: unknown) {
        console.error('[criarContrato]', error)
        throw new Error('Erro ao criar contrato.')
    }
}

export async function atualizarStatusContrato(id: string, status: StatusContrato): Promise<void> {
    try {
        await notion.pages.update({
            page_id: id,
            properties: { 'Status': { select: { name: status } } },
        })
    } catch (error: unknown) {
        console.error('[atualizarStatusContrato]', error)
        throw new Error('Erro ao atualizar status do contrato.')
    }
}
