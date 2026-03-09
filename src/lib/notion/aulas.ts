import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getDate, getNumber, getRelationIds } from '@/types/notion'
import type { Aula, AulaFormData, Instrumento, StatusAula, TipoAula } from '@/types'

function mapearAula(page: PageObjectResponse): Aula {
    const alunoIds = getRelationIds(page, 'Alunos')
    if (alunoIds.length === 0) {
        console.warn(`[mapearAula] Aula ${page.id} sem aluno vinculado`)
    }

    return {
        id: page.id,
        alunoId: alunoIds[0] ?? '',
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
    try {
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
    } catch (error: unknown) {
        console.error('[listarAulasDaSemana]', error)
        throw new Error('Erro ao listar aulas da semana.')
    }
}

export async function listarAulasPorAluno(alunoId: string, limite = 10): Promise<Aula[]> {
    try {
        const response = await notion.databases.query({
            database_id: DB.aulas,
            filter: { property: 'Alunos', relation: { contains: alunoId } },
            sorts: [{ property: 'Data e Hora', direction: 'descending' }],
            page_size: limite,
        })
        return (response.results as PageObjectResponse[]).map(mapearAula)
    } catch (error: unknown) {
        console.error('[listarAulasPorAluno]', error)
        throw new Error('Erro ao listar aulas do aluno.')
    }
}

export async function buscarAula(id: string): Promise<Aula> {
    try {
        const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
        return mapearAula(page)
    } catch (error: unknown) {
        console.error('[buscarAula]', error)
        throw new Error('Erro ao buscar aula.')
    }
}

export async function criarAula(data: AulaFormData): Promise<Aula> {
    try {
        const titulo = `Aula — ${data.dataHora.slice(0, 10)}`
        const page = await notion.pages.create({
            parent: { database_id: DB.aulas },
            properties: {
                'Título': { title: [{ text: { content: titulo } }] },
                'Alunos': { relation: [{ id: data.alunoId }] },
                'Professor': { relation: [{ id: data.professorId }] },
                'Data e Hora': { date: { start: data.dataHora } },
                'Duração (min)': { number: data.duracaoMinutos },
                'Instrumento': { select: { name: data.instrumento } },
                'Status': { select: { name: 'agendada' } },
                'Tipo': { select: { name: data.tipo } },
                'Observações': { rich_text: [{ text: { content: data.observacoes ?? '' } }] },
                ...(data.aulaOrigemId ? {
                    'Aula Origem': { relation: [{ id: data.aulaOrigemId }] }
                } : {}),
            },
        }) as PageObjectResponse
        return mapearAula(page)
    } catch (error: unknown) {
        console.error('[criarAula]', error)
        throw new Error('Erro ao criar aula.')
    }
}

export async function atualizarAula(id: string, data: AulaFormData): Promise<Aula> {
    try {
        const titulo = `Aula — ${data.dataHora.slice(0, 10)}`
        const page = await notion.pages.update({
            page_id: id,
            properties: {
                'Título': { title: [{ text: { content: titulo } }] },
                'Alunos': { relation: [{ id: data.alunoId }] },
                'Professor': { relation: [{ id: data.professorId }] },
                'Data e Hora': { date: { start: data.dataHora } },
                'Duração (min)': { number: data.duracaoMinutos },
                'Instrumento': { select: { name: data.instrumento } },
                'Tipo': { select: { name: data.tipo } },
                'Observações': { rich_text: [{ text: { content: data.observacoes ?? '' } }] },
                ...(data.aulaOrigemId ? {
                    'Aula Origem': { relation: [{ id: data.aulaOrigemId }] }
                } : {}),
            },
        }) as PageObjectResponse
        return mapearAula(page)
    } catch (error: unknown) {
        console.error('[atualizarAula]', error)
        throw new Error('Erro ao atualizar aula.')
    }
}

export async function atualizarStatusAula(id: string, status: StatusAula): Promise<void> {
    try {
        await notion.pages.update({
            page_id: id,
            properties: {
                'Status': { select: { name: status } },
            },
        })
    } catch (error: unknown) {
        console.error('[atualizarStatusAula]', error)
        throw new Error('Erro ao atualizar status da aula.')
    }
}
