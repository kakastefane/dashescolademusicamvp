
import { listarAlunos } from '@/lib/notion/alunos'
import { listarPlanos } from '@/lib/notion/planos'
import { listarContratos } from '@/lib/notion/contratos'
import { ContratoForm } from '@/components/contratos/contrato-form'

export default async function NovoContratoPage() {
    const [todosAlunos, planos, contratosExistentes] = await Promise.all([
        listarAlunos({ status: 'ativo' }),
        listarPlanos(),
        listarContratos()
    ])

    // Um aluno não pode ter dois contratos ativos ao mesmo tempo. 
    // Filtramos a lista para enviar ao form só a galera elegível.
    const idsComContratoAtivo = new Set(
        contratosExistentes
            .filter(c => c.status === 'ativo')
            .map(c => c.alunoId)
    )

    const alunosElegiveis = todosAlunos.filter(a => !idsComContratoAtivo.has(a.id))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Novo Contrato</h1>
                <p className="text-sm text-muted-foreground">
                    Associe um plano de aulas a um aluno ativo para formalizar as mensalidades.
                </p>
            </div>

            <ContratoForm alunos={alunosElegiveis} planos={planos} />
        </div>
    )
}
