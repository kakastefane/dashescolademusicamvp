import { listarAulasDaSemana } from '@/lib/notion/aulas'
import { listarProfessores } from '@/lib/notion/professores'
import { listarAlunos } from '@/lib/notion/alunos'
import { AgendaSemana } from '@/components/agenda/agenda-semana'

export default async function AgendaPage() {
    // Para MVP, vamos carregar as aulas de um intervalo largo (ex: mês atual inteiro)
    // ou apenas as aulas da semana atual, dependendo do suporte do Notion.
    // Como o componente AgendaSemana navega client-side para ser rápido sem refresh,
    // vamos carregar as aulas de 2 meses (1 mês antes, 1 mês depois)
    const hoje = new Date()
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString()
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0).toISOString()

    // Se a escola tiver MILHARES de aulas, isso quebra.
    // Em prod: A navegação de semana faria ?date= e o server buscaria só aquela semana.
    // Pro nosso escopo do MVP, vamos buscar do mês atual.

    const [aulas, professores, alunos] = await Promise.all([
        listarAulasDaSemana(dataInicio, dataFim),
        listarProfessores(),
        listarAlunos()
    ])

    // "Hydrating" as aulas com nomes sem causar N+1 Queries no Notion
    const aulasComNomes = aulas.map(aula => ({
        ...aula,
        alunoNome: alunos.find(a => a.id === aula.alunoId)?.nome || 'Aluno Desconhecido',
        professorNome: professores.find(p => p.id === aula.professorId)?.nome || 'Prof. Desconhecido'
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Agenda Semanal</h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie e visualize as aulas agendadas.
                </p>
            </div>

            <AgendaSemana aulasIniciais={aulasComNomes} professores={professores} />
        </div>
    )
}
