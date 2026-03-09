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
