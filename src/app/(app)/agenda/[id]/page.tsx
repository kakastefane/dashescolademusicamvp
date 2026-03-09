import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, XCircle, AlertCircle, Clock, Music, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buscarAula, atualizarStatusAula } from '@/lib/notion/aulas'
import { buscarAluno } from '@/lib/notion/alunos'
import { buscarProfessor } from '@/lib/notion/professores'
import { formatarDataHora } from '@/lib/utils'

// Server Action Inline helper to simplify the buttons
import { revalidatePath } from 'next/cache'

export default async function AulaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params
        const aula = await buscarAula(resolvedParams.id)

        // Buscando os detalhes de Aluno e Professor (já que a aula crua traz apenas os IDs)
        const [aluno, professor] = await Promise.all([
            buscarAluno(aula.alunoId).catch(() => null),
            buscarProfessor(aula.professorId).catch(() => null)
        ])

        // Inline Server Action to handle the status update from this Server Component directly
        async function handleStatus(formData: FormData) {
            'use server'
            const status = formData.get('status') as 'realizada' | 'cancelada' | 'faltou'
            await atualizarStatusAula(resolvedParams.id, status)
            revalidatePath(`/agenda/${resolvedParams.id}`)
            revalidatePath('/agenda')
            revalidatePath(`/alunos/${aula.alunoId}`)
        }

        const variantByStatus: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            agendada: 'default',
            realizada: 'secondary',
            cancelada: 'destructive',
            faltou: 'destructive' // ou warning se tivéssemos na paleta, vamos de destructive para MVP
        }

        const dataFormatada = format(new Date(aula.dataHora), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })

        return (
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Detalhes da Aula</h1>
                        <p className="text-sm text-muted-foreground capitalize">{dataFormatada}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/agenda/${aula.id}/editar`}>Editar Aula</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/agenda">Voltar</Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Aula de {aula.instrumento}</CardTitle>
                            <Badge variant={variantByStatus[aula.status]} className="capitalize px-3 py-1">
                                {aula.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" /> Aluno
                                </p>
                                <div className="font-medium">
                                    {aluno ? (
                                        <Link href={`/alunos/${aula.alunoId}`} className="hover:underline text-primary">
                                            {aluno.nome}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" /> Professor
                                </p>
                                <p className="font-medium">{professor?.nome || '—'}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Duração
                                </p>
                                <p className="font-medium">{aula.duracaoMinutos} minutos</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Music className="h-4 w-4" /> Tipo
                                </p>
                                <p className="font-medium capitalize">{aula.tipo}</p>
                            </div>
                        </div>

                        {aula.observacoes && (
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                                <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                                    {aula.observacoes}
                                </p>
                            </div>
                        )}
                    </CardContent>

                    {aula.status === 'agendada' && (
                        <CardFooter className="bg-muted/30 border-t p-4 flex flex-wrap gap-3">
                            <form action={handleStatus}>
                                <input type="hidden" name="status" value="realizada" />
                                <Button type="submit" variant="default" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Realizada
                                </Button>
                            </form>

                            <form action={handleStatus}>
                                <input type="hidden" name="status" value="faltou" />
                                <Button type="submit" variant="destructive" className="gap-2">
                                    <AlertCircle className="h-4 w-4" /> Aluno Faltou
                                </Button>
                            </form>

                            <form action={handleStatus}>
                                <input type="hidden" name="status" value="cancelada" />
                                <Button type="submit" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2">
                                    <XCircle className="h-4 w-4" /> Cancelar Aula
                                </Button>
                            </form>
                        </CardFooter>
                    )}

                    {aula.status === 'faltou' && (
                        <CardFooter className="bg-destructive/10 border-t p-4 border-destructive flex items-center justify-between">
                            <p className="text-sm font-medium text-destructive">
                                O aluno faltou a esta aula.
                            </p>
                            <Button size="sm" asChild>
                                <Link href={`/agenda/nova-aula?alunoId=${aula.alunoId}&origem=${aula.id}`}>
                                    Agendar Reposição
                                </Link>
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        )
    } catch (error) {
        console.error(error)
        notFound()
    }
}
