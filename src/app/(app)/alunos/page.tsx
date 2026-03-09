import { listarAlunos } from '@/lib/notion/alunos'
import { AlunosTable } from '@/components/alunos/alunos-table'

export default async function AlunosPage() {
    const alunos = await listarAlunos()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Alunos</h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie os alunos matriculados na escola.
                </p>
            </div>

            <AlunosTable alunosIniciais={alunos} />
        </div>
    )
}
