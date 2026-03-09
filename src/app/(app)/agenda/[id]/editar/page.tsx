import { notFound } from 'next/navigation'
import { buscarAula } from '@/lib/notion/aulas'
import { listarAlunos } from '@/lib/notion/alunos'
import { listarProfessores } from '@/lib/notion/professores'
import { AulaForm } from '@/components/agenda/aula-form'

export default async function EditarAulaPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params
        const aula = await buscarAula(resolvedParams.id)

        const [alunos, professores] = await Promise.all([
            listarAlunos({ status: 'ativo' }),
            listarProfessores()
        ])

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar Aula</h1>
                    <p className="text-sm text-muted-foreground">
                        Modifique a data, horário ou professor desta aula agendada.
                    </p>
                </div>

                <AulaForm
                    alunos={alunos}
                    professores={professores}
                    aulaInicial={aula}
                />
            </div>
        )
    } catch (error) {
        console.error(error)
        notFound()
    }
}
