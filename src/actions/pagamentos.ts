'use server'

import { revalidatePath } from 'next/cache'
import { listarAlunos } from '@/lib/notion/alunos'
import { buscarContratoAtivo } from '@/lib/notion/contratos'
import { marcarComoPago as marcarComoPagoNotion, verificarPagamentoExistente, criarPagamento } from '@/lib/notion/pagamentos'
import { gerarReferenciaMensalidade } from '@/lib/utils'
import type { FormaPagamento } from '@/types'

export async function marcarComoPagoAction(id: string, formaPagamento: FormaPagamento) {
    try {
        await marcarComoPagoNotion(id, formaPagamento)
        revalidatePath('/financeiro')
    } catch (error) {
        console.error('[Action: marcarComoPago]', error)
        throw new Error('Não foi possível marcar o pagamento como pago.')
    }
}

export async function gerarMensalidadesMesAction(mes: number, ano: number) {
    try {
        const alunosAtivos = await listarAlunos({ status: 'ativo' })
        const resultados = { criados: 0, pulados: 0, erros: 0 }

        for (const aluno of alunosAtivos) {
            const contrato = await buscarContratoAtivo(aluno.id)
            if (!contrato) { resultados.pulados++; continue }

            const jaExiste = await verificarPagamentoExistente(aluno.id, mes, ano)
            if (jaExiste) { resultados.pulados++; continue }

            try {
                const vencimento = `${ano}-${String(mes).padStart(2, '0')}-10`
                await criarPagamento({
                    referencia: gerarReferenciaMensalidade(aluno.nome, mes, ano),
                    alunoId: aluno.id,
                    valor: contrato.valorMensal,
                    vencimento,
                })
                resultados.criados++
            } catch {
                resultados.erros++
            }
        }

        revalidatePath('/financeiro')
        return resultados
    } catch (error) {
        console.error('[Action: gerarMensalidadesMes]', error)
        throw new Error('Não foi possível gerar as mensalidades.')
    }
}
