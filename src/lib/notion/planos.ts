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
    try {
        const response = await notion.databases.query({
            database_id: DB.planos,
            sorts: [{ property: 'Valor', direction: 'ascending' }],
        })
        return (response.results as PageObjectResponse[]).map(mapearPlano)
    } catch (error: unknown) {
        console.error('[listarPlanos]', error)
        throw new Error('Erro ao listar planos.')
    }
}

export async function buscarPlano(id: string): Promise<Plano> {
    try {
        const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
        return mapearPlano(page)
    } catch (error: unknown) {
        console.error('[buscarPlano]', error)
        throw new Error('Erro ao buscar plano.')
    }
}

export async function criarPlano(data: Omit<Plano, 'id'>): Promise<Plano> {
    try {
        const page = await notion.pages.create({
            parent: { database_id: DB.planos },
            properties: {
                'Nome do Plano': { title: [{ text: { content: data.nome } }] },
                'Duração': { select: { name: data.duracao } },
                'Aulas por semana': { number: data.aulasPorSemana },
                'Valor': { number: data.valor },
                'Descrição': { rich_text: [{ text: { content: data.descricao ?? '' } }] },
            },
        }) as PageObjectResponse
        return mapearPlano(page)
    } catch (error: unknown) {
        console.error('[criarPlano]', error)
        throw new Error('Erro ao criar plano.')
    }
}
