import type { PageObjectResponse, QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints'
import { notion } from './client'
import { DB } from './databases'
import { getTitle, getPhone, getEmail, getRichText, getSelect, getMultiSelect, getDate } from '@/types/notion'
import type { Aluno, AlunoFiltros, AlunoFormData, Instrumento, StatusAluno } from '@/types'

type PropertyFilter = Extract<NonNullable<QueryDatabaseParameters['filter']>, { property: string }>

function mapearAluno(page: PageObjectResponse): Aluno {
    return {
        id: page.id,
        nome: getTitle(page, 'Nome'),
        telefone: getPhone(page, 'Telefone'),
        email: getEmail(page, 'Email') || undefined,
        responsavel: getRichText(page, 'Responsável') || undefined,
        instrumentos: getMultiSelect(page, 'Instrumentos') as Instrumento[],
        status: (getSelect(page, 'Status') ?? 'ativo') as StatusAluno,
        dataInicio: getDate(page, 'Data Início') ?? '',
        observacoes: getRichText(page, 'Observações') || undefined,
    }
}

export async function listarAlunos(filtros?: AlunoFiltros): Promise<Aluno[]> {
    try {
        const filters: PropertyFilter[] = []

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
    } catch (error: unknown) {
        console.error('[listarAlunos]', error)
        throw new Error('Erro ao listar alunos.')
    }
}

export async function buscarAluno(id: string): Promise<Aluno> {
    try {
        const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
        return mapearAluno(page)
    } catch (error: unknown) {
        console.error('[buscarAluno]', error)
        throw new Error('Erro ao buscar aluno.')
    }
}

export async function criarAluno(data: AlunoFormData): Promise<Aluno> {
    try {
        const page = await notion.pages.create({
            parent: { database_id: DB.alunos },
            properties: {
                'Nome': { title: [{ text: { content: data.nome } }] },
                'Telefone': { phone_number: data.telefone },
                'Email': data.email ? { email: data.email } : { email: null },
                'Responsável': { rich_text: [{ text: { content: data.responsavel ?? '' } }] },
                'Instrumentos': { multi_select: data.instrumentos.map(i => ({ name: i })) },
                'Status': { select: { name: data.status } },
                'Data Início': { date: { start: data.dataInicio } },
                'Observações': { rich_text: [{ text: { content: data.observacoes ?? '' } }] },
            },
        }) as PageObjectResponse

        return mapearAluno(page)
    } catch (error: unknown) {
        console.error('[criarAluno]', error)
        throw new Error('Erro ao criar aluno.')
    }
}

export async function atualizarAluno(id: string, data: Partial<AlunoFormData>): Promise<Aluno> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties: Record<string, any> = {}

        if (data.nome) properties['Nome'] = { title: [{ text: { content: data.nome } }] }
        if (data.telefone) properties['Telefone'] = { phone_number: data.telefone }
        if (data.email !== undefined) properties['Email'] = { email: data.email ?? null }
        if (data.responsavel !== undefined) properties['Responsável'] = { rich_text: [{ text: { content: data.responsavel ?? '' } }] }
        if (data.instrumentos) properties['Instrumentos'] = { multi_select: data.instrumentos.map(i => ({ name: i })) }
        if (data.status) properties['Status'] = { select: { name: data.status } }
        if (data.dataInicio) properties['Data Início'] = { date: { start: data.dataInicio } }
        if (data.observacoes !== undefined) properties['Observações'] = { rich_text: [{ text: { content: data.observacoes ?? '' } }] }

        const page = await notion.pages.update({
            page_id: id,
            properties,
        }) as PageObjectResponse

        return mapearAluno(page)
    } catch (error: unknown) {
        console.error('[atualizarAluno]', error)
        throw new Error('Erro ao atualizar aluno.')
    }
}

export async function arquivarAluno(id: string): Promise<void> {
    await atualizarAluno(id, { status: 'inativo' })
}
