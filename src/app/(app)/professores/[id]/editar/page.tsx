import { notFound } from 'next/navigation'
import { buscarProfessor } from '@/lib/notion/professores'
import { ProfessorForm } from '@/components/professores/professor-form'

export default async function EditarProfessorPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const professor = await buscarProfessor(id)

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Editar Professor</h1>
                    <p className="text-sm text-muted-foreground">
                        Atualize os dados e a disponibilidade do professor.
                    </p>
                </div>

                <ProfessorForm professorId={id} initialData={professor} />
            </div>
        )
    } catch (error) {
        console.error(error)
        notFound()
    }
}
