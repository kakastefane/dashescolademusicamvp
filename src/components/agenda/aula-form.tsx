'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { criarAulaAction, atualizarAulaAction } from '@/actions/aulas'
import type { Aluno, Professor, Instrumento, AulaFormData, Aula } from '@/types'

const TODOS_INSTRUMENTOS: Instrumento[] = [
    'violao', 'guitarra', 'baixo', 'bateria', 'teclado', 'piano', 'canto', 'outro'
]

interface AulaFormProps {
    alunos: Aluno[]
    professores: Professor[]
    aulaInicial?: Aula
}

export function AulaForm({ alunos, professores, aulaInicial }: AulaFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)

    // Pegando valores default da query URL se existirem
    const preData = searchParams.get('data') || ''
    const preHora = searchParams.get('hora') || ''
    const alunoIdOrigem = searchParams.get('alunoId') || ''
    const origemId = searchParams.get('origem') || ''
    const isReposicao = !!origemId

    const isEditMode = !!aulaInicial

    const defaultData = isEditMode ? aulaInicial.dataHora.split('T')[0] : preData
    const defaultHora = isEditMode && aulaInicial.dataHora.includes('T') ? aulaInicial.dataHora.split('T')[1].slice(0, 5) : preHora
    const defaultAlunoId = isEditMode ? aulaInicial.alunoId : alunoIdOrigem
    const defaultProfessorId = isEditMode ? aulaInicial.professorId : undefined
    const defaultDuracao = isEditMode ? String(aulaInicial.duracaoMinutos) : "60"
    const defaultInstrumento = isEditMode ? aulaInicial.instrumento : undefined
    const defaultObservacoes = isEditMode ? aulaInicial.observacoes : (isReposicao ? `Reposição da aula ${origemId}` : undefined)

    // Estado que pode mudar os campos a serem exibidos
    const [tipo, setTipo] = useState<'fixa' | 'avulsa' | 'reposição'>(
        isEditMode ? aulaInicial.tipo as any : (isReposicao ? 'reposição' : 'fixa')
    )

    async function onSubmit(formData: FormData) {
        try {
            setLoading(true)

            const alunoId = isEditMode ? aulaInicial.alunoId : (formData.get('alunoId') as string)
            const professorId = formData.get('professorId') as string
            const data = formData.get('data') as string
            const hora = formData.get('hora') as string
            const duracaoMinutos = Number(formData.get('duracaoMinutos'))
            const instrumento = formData.get('instrumento') as Instrumento
            const tipoSelecionado = formData.get('tipo') as 'fixa' | 'avulsa' | 'reposição'
            const observacoes = formData.get('observacoes') as string

            if (!alunoId || !professorId || !data || !hora || !instrumento) {
                toast.error('Preencha os campos obrigatórios')
                return
            }

            const dataHoraIso = `${data}T${hora}:00-03:00` // Assumindo timezone de Brasília fixo para o MVP

            const novaAula: AulaFormData = {
                alunoId,
                professorId,
                dataHora: dataHoraIso,
                duracaoMinutos,
                instrumento,
                tipo: tipoSelecionado as any,
                status: isEditMode ? aulaInicial.status : 'agendada',
                observacoes: observacoes || undefined,
            }

            if (isEditMode) {
                await atualizarAulaAction(aulaInicial.id, novaAula)
                toast.success('Aula atualizada com sucesso!')
            } else {
                await criarAulaAction(novaAula)
                toast.success('Aula agendada com sucesso!')
            }

        } catch (error) {
            toast.error('Erro ao agendar aula')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Aula' : (isReposicao ? 'Agendar Reposição' : 'Nova Aula')}</CardTitle>
            </CardHeader>

            <form action={onSubmit}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="space-y-2">
                            <Label htmlFor="alunoId">Aluno *</Label>
                            <Select name="alunoId" defaultValue={defaultAlunoId} required disabled={isEditMode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o aluno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {alunos.map(aluno => (
                                        <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                                    ))}
                                    {alunos.length === 0 && <SelectItem value="vazio" disabled>Nenhum aluno ativo</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="professorId">Professor *</Label>
                            <Select name="professorId" defaultValue={defaultProfessorId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o professor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {professores.map(prof => (
                                        <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                                    ))}
                                    {professores.length === 0 && <SelectItem value="vazio" disabled>Nenhum professor</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data">Data *</Label>
                            <Input id="data" name="data" type="date" required defaultValue={defaultData} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hora">Horário *</Label>
                            <Input id="hora" name="hora" type="time" required defaultValue={defaultHora} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duracaoMinutos">Duração (minutos) *</Label>
                            <Select name="duracaoMinutos" defaultValue={defaultDuracao} required>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="45">45 min</SelectItem>
                                    <SelectItem value="60">60 min (1 hora)</SelectItem>
                                    <SelectItem value="90">90 min (1.5 horas)</SelectItem>
                                    <SelectItem value="120">120 min (2 horas)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instrumento">Instrumento *</Label>
                            <Select name="instrumento" defaultValue={defaultInstrumento} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TODOS_INSTRUMENTOS.map(inst => (
                                        <SelectItem key={inst} value={inst} className="capitalize">{inst}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="tipo">Tipo de Aula *</Label>
                            <Select name="tipo" value={tipo} onValueChange={(v: any) => setTipo(v)} required>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixa">Aula Fixa (Regular)</SelectItem>
                                    <SelectItem value="avulsa">Aula Avulsa (Extra)</SelectItem>
                                    <SelectItem value="reposição">Aula de Reposição</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            id="observacoes"
                            name="observacoes"
                            placeholder="Detalhes para o professor ou lembretes (ex: Trazer material novo)..."
                            defaultValue={defaultObservacoes}
                            className="min-h-[100px]"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-3 border-t pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Agendar Aula')}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
