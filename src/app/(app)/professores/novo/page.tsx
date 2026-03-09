import { ProfessorForm } from '@/components/professores/professor-form'

export default function NovoProfessorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Cadastrar Professor</h1>
                <p className="text-sm text-muted-foreground">
                    Preencha os dados abaixo para adicionar um profissional à equipe.
                </p>
            </div>

            <ProfessorForm />
        </div>
    )
}
