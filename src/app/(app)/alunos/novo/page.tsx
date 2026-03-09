import { AlunoForm } from '@/components/alunos/aluno-form'

export default function NovoAlunoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Cadastrar Aluno</h1>
                <p className="text-sm text-muted-foreground">
                    Preencha os dados abaixo para matricular um novo aluno.
                </p>
            </div>

            <AlunoForm />
        </div>
    )
}
