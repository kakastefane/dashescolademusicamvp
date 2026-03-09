import { listarProfessores } from '@/lib/notion/professores'
import { ProfessoresTable } from '@/components/professores/professores-table'

export default async function ProfessoresPage() {
    // Listar todos, incluindo inativos
    const professores = await listarProfessores(false)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Professores</h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie a equipe de professores e seus instrumentos.
                </p>
            </div>

            <ProfessoresTable professores={professores} />
        </div>
    )
}
