import { notion } from './client'
import { DB } from './databases'
import { format } from 'date-fns'
import { listarContratosVencendo } from './contratos'
import { listarInadimplentes } from './pagamentos'
import { getSelect, getNumber } from '@/types/notion'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

export async function contarAlunosAtivos(): Promise<number> {
    try {
        const response = await notion.databases.query({
            database_id: DB.alunos,
            filter: { property: 'Status', select: { equals: 'ativo' } }
        })
        return response.results.length
    } catch (e) {
        console.error('[contarAlunosAtivos]', e)
        return 0
    }
}

export async function contarAulasHoje(): Promise<number> {
    try {
        const hoje = format(new Date(), 'yyyy-MM-dd')
        const amanhaObj = new Date()
        amanhaObj.setDate(amanhaObj.getDate() + 1)
        const amanha = format(amanhaObj, 'yyyy-MM-dd')

        const response = await notion.databases.query({
            database_id: DB.aulas,
            filter: {
                and: [
                    { property: 'Status', select: { equals: 'agendada' } },
                    { property: 'Data e Hora', date: { on_or_after: hoje } },
                    { property: 'Data e Hora', date: { before: amanha } },
                ]
            }
        })
        return response.results.length
    } catch (e) {
        console.error('[contarAulasHoje]', e)
        return 0
    }
}

export async function obterResumoFinanceiroMes(mes: number, ano: number): Promise<{ prevista: number; recebida: number }> {
    try {
        const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
        const fim = `${ano}-${String(mes).padStart(2, '0')}-31`

        const response = await notion.databases.query({
            database_id: DB.pagamentos,
            filter: {
                and: [
                    { property: 'Vencimento', date: { on_or_after: inicio } },
                    { property: 'Vencimento', date: { on_or_before: fim } },
                    { property: 'Status', select: { does_not_equal: 'cancelado' } }
                ]
            }
        })

        let prevista = 0
        let recebida = 0

        for (const page of response.results as PageObjectResponse[]) {
            const status = getSelect(page, 'Status')
            const valor = getNumber(page, 'Valor') ?? 0

            prevista += valor
            if (status === 'pago') {
                recebida += valor
            }
        }

        return { prevista, recebida }
    } catch (e) {
        console.error('[obterReceitaMes]', e)
        return { prevista: 0, recebida: 0 }
    }
}

export async function obterDadosDashboard() {
    const hoje = new Date()
    const mes = hoje.getMonth() + 1
    const ano = hoje.getFullYear()

    const [
        totalAlunos,
        aulasHoje,
        resumoFinanceiro,
        inadimplentes,
        contratosVencendo
    ] = await Promise.all([
        contarAlunosAtivos(),
        contarAulasHoje(),
        obterResumoFinanceiroMes(mes, ano),
        listarInadimplentes(),
        listarContratosVencendo(30)
    ])

    return {
        totalAlunos,
        aulasHoje,
        receita: resumoFinanceiro,
        inadimplentes,
        contratosVencendo
    }
}
