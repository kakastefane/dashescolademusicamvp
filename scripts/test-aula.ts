import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const DB_AULAS = process.env.NOTION_DB_AULAS!
const DB_ALUNOS = process.env.NOTION_DB_ALUNOS!
const DB_PROFESSORES = process.env.NOTION_DB_PROFESSORES!

async function test() {
    try {
        const alunos = await notion.databases.query({ database_id: DB_ALUNOS, page_size: 1 })
        const profs = await notion.databases.query({ database_id: DB_PROFESSORES, page_size: 1 })

        const alunoId = alunos.results[0]?.id
        const profId = profs.results[0]?.id

        if (!alunoId || !profId) {
            console.log('Faltam alunos ou profs cadastrados no Notion para testar')
            return
        }

        console.log(`Tentando criar aula para o aluno ${alunoId} com prof ${profId}...`)

        const response = await notion.pages.create({
            parent: { database_id: DB_AULAS },
            properties: {
                'Título': { title: [{ text: { content: 'Teste Aula Bot' } }] },
                'Aluno': { relation: [{ id: alunoId }] },
                'Professor': { relation: [{ id: profId }] },
                'Data e Hora': { date: { start: '2026-03-09T14:00:00-03:00' } },
                'Duração (min)': { number: 60 },
                'Instrumento': { select: { name: 'violao' } },
                'Status': { select: { name: 'agendada' } },
                'Tipo': { select: { name: 'fixa' } },
            }
        })

        console.log('SUCESSO! Aula criada:', response.id)

    } catch (err: any) {
        console.error('ERRO DA API NOTION:')
        console.error(err.body || err.message || err)
    }
}

test()
