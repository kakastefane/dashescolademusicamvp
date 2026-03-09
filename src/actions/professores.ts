'use server'

import { revalidatePath } from 'next/cache'
import { criarProfessor, atualizarProfessor, arquivarProfessor, type ProfessorFormData } from '@/lib/notion/professores'

export async function criarProfessorAction(data: ProfessorFormData) {
    try {
        const professor = await criarProfessor(data)
        revalidatePath('/professores')
        revalidatePath('/agenda')
        return { success: true, data: professor }
    } catch (error) {
        console.error('[criarProfessorAction]', error)
        return { success: false, error: 'Erro ao criar professor.' }
    }
}

export async function atualizarProfessorAction(id: string, data: Partial<ProfessorFormData>) {
    try {
        const professor = await atualizarProfessor(id, data)
        revalidatePath('/professores')
        revalidatePath(`/professores/${id}`)
        revalidatePath('/agenda')
        return { success: true, data: professor }
    } catch (error) {
        console.error('[atualizarProfessorAction]', error)
        return { success: false, error: 'Erro ao atualizar professor.' }
    }
}

export async function arquivarProfessorAction(id: string) {
    try {
        await arquivarProfessor(id)
        revalidatePath('/professores')
        return { success: true }
    } catch (error) {
        console.error('[arquivarProfessorAction]', error)
        return { success: false, error: 'Erro ao arquivar professor.' }
    }
}
