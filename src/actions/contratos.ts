'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { criarContrato as criarContratoNotion } from '@/lib/notion/contratos'
import { criarPagamento } from '@/lib/notion/pagamentos'
import { listarPlanos } from '@/lib/notion/planos'
import { buscarAluno } from '@/lib/notion/alunos'
import { gerarReferenciaMensalidade } from '@/lib/utils'
import type { ContratoFormData } from '@/types'

export async function criarContratoAction(data: ContratoFormData) {
    try {
        const contrato = await criarContratoNotion(data)

        // Criar o primeiro pagamento automaticamente
        const [aluno, planos] = await Promise.all([
            buscarAluno(data.alunoId),
            listarPlanos(),
        ])

        const plano = planos.find(p => p.id === data.planoId)
        if (plano) {
            const hoje = new Date()
            const mes = hoje.getMonth() + 1
            const ano = hoje.getFullYear()
            const vencimento = `${ano}-${String(mes).padStart(2, '0')}-10`

            await criarPagamento({
                referencia: gerarReferenciaMensalidade(aluno.nome, mes, ano),
                alunoId: data.alunoId,
                valor: plano.valor,
                vencimento,
            })
        }

        revalidatePath('/contratos')
        revalidatePath(`/alunos/${data.alunoId}`)
        redirect(`/contratos/${contrato.id}`)
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
        console.error('[Action: criarContrato]', error)
        throw new Error('Não foi possível criar o contrato.')
    }
}
