'use server'

import { revalidatePath } from 'next/cache'
import { criarPlano as criarPlanoNotion } from '@/lib/notion/planos'
import type { Plano } from '@/types'

export async function criarPlanoAction(data: Omit<Plano, 'id'>) {
    try {
        await criarPlanoNotion(data)
        revalidatePath('/planos')
    } catch (error) {
        console.error('[Action: criarPlano]', error)
        throw new Error('Não foi possível criar o plano.')
    }
}
