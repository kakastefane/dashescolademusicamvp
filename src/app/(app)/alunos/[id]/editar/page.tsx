import { notFound } from 'next/navigation'
import { buscarAluno } from '@/lib/notion/alunos'
import { AlunoForm } from '@/components/alunos/aluno-form'

export default async function EditarAlunoPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params
        const aluno = await buscarAluno(resolvedParams.id)

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar Aluno</h1>
                    <p className="text-sm text-muted-foreground">
                        Atualize as informações de {aluno.nome}.
                    </p>
                </div>

                <AlunoForm alunoInicial={aluno} />
            </div>
        )
    } catch (error) {
        console.error(error)
        notFound()
    }
}
