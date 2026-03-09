'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
    criarAula as criarAulaNotion,
    atualizarAula as atualizarAulaNotion,
    atualizarStatusAula as atualizarStatusNotion
} from '@/lib/notion/aulas'
import type { AulaFormData, StatusAula } from '@/types'

export async function criarAulaAction(data: AulaFormData) {
    try {
        await criarAulaNotion(data)
        revalidatePath('/agenda')
        redirect('/agenda')
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
        console.error('[Action: criarAula]', error)
        throw new Error('Não foi possível criar a aula. Tente novamente.')
    }
}

export async function atualizarStatusAulaAction(id: string, status: StatusAula) {
    try {
        await atualizarStatusNotion(id, status)
        revalidatePath('/agenda')
        revalidatePath(`/agenda/${id}`)
    } catch (error) {
        console.error('[Action: atualizarStatusAula]', error)
        throw new Error('Não foi possível atualizar o status da aula.')
    }
}

export async function atualizarAulaAction(id: string, data: AulaFormData) {
    try {
        await atualizarAulaNotion(id, data)
        revalidatePath('/agenda')
        revalidatePath(`/agenda/${id}`)
        redirect(`/agenda/${id}`)
    } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
        console.error('[Action: atualizarAula]', error)
        throw new Error('Não foi possível atualizar a aula. Tente novamente.')
    }
}
