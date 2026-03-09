import { listarAlunos } from '@/lib/notion/alunos'
import { listarProfessores } from '@/lib/notion/professores'
import { AulaForm } from '@/components/agenda/aula-form'

export default async function NovaAulaPage() {
    // Precisamos apenas dos ativos para agendamento
    const [alunos, professores] = await Promise.all([
        listarAlunos({ status: 'ativo' }),
        listarProfessores()
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Agendar Nova Aula</h1>
                <p className="text-sm text-muted-foreground">
                    Preencha os dados abaixo para criar um novo horário na agenda.
                </p>
            </div>

            <AulaForm alunos={alunos} professores={professores} />
        </div>
    )
}
