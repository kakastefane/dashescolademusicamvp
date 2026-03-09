import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getRichText, getSelect, getMultiSelect, getPhone } from '@/types/notion'
import type { Professor, Instrumento } from '@/types'

function mapearProfessor(page: PageObjectResponse): Professor {
    return {
        id: page.id,
        nome: getTitle(page, 'Nome'),
        telefone: getPhone(page, 'Telefone') || undefined,
        instrumentos: getMultiSelect(page, 'Instrumentos') as Instrumento[],
        status: (getSelect(page, 'Status') ?? 'ativo') as 'ativo' | 'inativo',
        disponibilidade: getRichText(page, 'Disponibilidade') || undefined,
    }
}

export async function listarProfessores(apenasAtivos = true): Promise<Professor[]> {
    try {
        const response = await notion.databases.query({
            database_id: DB.professores,
            filter: apenasAtivos
                ? { property: 'Status', select: { equals: 'ativo' } }
                : undefined,
            sorts: [{ property: 'Nome', direction: 'ascending' }],
        })
        return (response.results as PageObjectResponse[]).map(mapearProfessor)
    } catch (error: unknown) {
        console.error('[listarProfessores]', error)
        throw new Error('Erro ao listar professores.')
    }
}

export async function buscarProfessor(id: string): Promise<Professor> {
    try {
        const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
        return mapearProfessor(page)
    } catch (error: unknown) {
        console.error('[buscarProfessor]', error)
        throw new Error('Erro ao buscar professor.')
    }
}

export type ProfessorFormData = Omit<Professor, 'id'>

export async function criarProfessor(data: ProfessorFormData): Promise<Professor> {
    try {
        const page = await notion.pages.create({
            parent: { database_id: DB.professores },
            properties: {
                'Nome': { title: [{ text: { content: data.nome } }] },
                'Telefone': data.telefone ? { phone_number: data.telefone } : { phone_number: null },
                'Instrumentos': { multi_select: data.instrumentos.map(i => ({ name: i })) },
                'Status': { select: { name: data.status } },
                'Disponibilidade': { rich_text: [{ text: { content: data.disponibilidade ?? '' } }] },
            },
        }) as PageObjectResponse
        return mapearProfessor(page)
    } catch (error: unknown) {
        console.error('[criarProfessor]', error)
        throw new Error('Erro ao criar professor.')
    }
}

export async function atualizarProfessor(id: string, data: Partial<ProfessorFormData>): Promise<Professor> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties: Record<string, any> = {}

        if (data.nome) properties['Nome'] = { title: [{ text: { content: data.nome } }] }
        if (data.telefone !== undefined) properties['Telefone'] = { phone_number: data.telefone ?? null }
        if (data.instrumentos) properties['Instrumentos'] = { multi_select: data.instrumentos.map(i => ({ name: i })) }
        if (data.status) properties['Status'] = { select: { name: data.status } }
        if (data.disponibilidade !== undefined) properties['Disponibilidade'] = { rich_text: [{ text: { content: data.disponibilidade ?? '' } }] }

        const page = await notion.pages.update({
            page_id: id,
            properties,
        }) as PageObjectResponse

        return mapearProfessor(page)
    } catch (error: unknown) {
        console.error('[atualizarProfessor]', error)
        throw new Error('Erro ao atualizar professor.')
    }
}

export async function arquivarProfessor(id: string): Promise<void> {
    await atualizarProfessor(id, { status: 'inativo' })
}
