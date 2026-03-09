'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { criarAluno as criarAlunoNotion, atualizarAluno, arquivarAluno } from '@/lib/notion/alunos'
import { buscarContratoAtivo, atualizarStatusContrato } from '@/lib/notion/contratos'
import type { AlunoFormData } from '@/types'

export async function criarAlunoAction(data: AlunoFormData) {
    try {
        const aluno = await criarAlunoNotion(data)
        revalidatePath('/alunos')
        redirect(`/alunos/${aluno.id}`)
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
        console.error('[Action: criarAluno]', error)
        throw new Error('Não foi possível criar o aluno. Tente novamente.')
    }
}

export async function editarAlunoAction(id: string, data: Partial<AlunoFormData>) {
    try {
        await atualizarAluno(id, data)
        revalidatePath(`/alunos/${id}`)
        revalidatePath('/alunos')
        redirect(`/alunos/${id}`)
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
        console.error('[Action: editarAluno]', error)
        throw new Error('Não foi possível atualizar o aluno.')
    }
}

export async function inativarAlunoAction(id: string) {
    try {
        // Inativar aluno
        await arquivarAluno(id)

        // Cancelar contrato ativo, se existir
        const contrato = await buscarContratoAtivo(id)
        if (contrato) {
            await atualizarStatusContrato(contrato.id, 'cancelado')
        }

        revalidatePath('/alunos')
        redirect('/alunos')
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
        console.error('[Action: inativarAluno]', error)
        throw new Error('Não foi possível inativar o aluno.')
    }
}
