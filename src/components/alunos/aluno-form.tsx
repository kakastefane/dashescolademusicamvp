'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { criarAlunoAction, editarAlunoAction } from '@/actions/alunos'
import type { Aluno, AlunoFormData, Instrumento, StatusAluno } from '@/types'

interface AlunoFormProps {
    alunoInicial?: Aluno
}

const TODOS_INSTRUMENTOS: Instrumento[] = [
    'violao', 'guitarra', 'baixo', 'bateria', 'teclado', 'piano', 'canto', 'outro'
]

export function AlunoForm({ alunoInicial }: AlunoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isEditing = !!alunoInicial

    // Controle de estado para multi-select simples (Tailwind/HTML nativo para simplificar)
    const [instrumentos, setInstrumentos] = useState<Instrumento[]>(
        alunoInicial?.instrumentos || []
    )

    function toggleInstrumento(inst: Instrumento) {
        setInstrumentos(prev =>
            prev.includes(inst)
                ? prev.filter(i => i !== inst)
                : [...prev, inst]
        )
    }

    async function onSubmit(formData: FormData) {
        try {
            setLoading(true)

            const nome = formData.get('nome') as string
            const telefone = formData.get('telefone') as string
            const email = formData.get('email') as string
            const dataInicio = formData.get('dataInicio') as string
            const status = formData.get('status') as StatusAluno
            const responsavel = formData.get('responsavel') as string
            const observacoes = formData.get('observacoes') as string

            if (!nome || !telefone || !dataInicio || instrumentos.length === 0) {
                toast.error('Preencha os campos obrigatórios (Nome, Telefone, Data de Início e Instrumentos)')
                return
            }

            const dados: AlunoFormData = {
                nome,
                telefone,
                email: email || undefined,
                dataInicio,
                status,
                responsavel: responsavel || undefined,
                observacoes: observacoes || undefined,
                instrumentos,
            }

            if (isEditing && alunoInicial) {
                await editarAlunoAction(alunoInicial.id, dados)
                toast.success('Aluno atualizado com sucesso!')
            } else {
                await criarAlunoAction(dados)
                toast.success('Aluno criado com sucesso!')
            }

        } catch (error) {
            toast.error('Erro ao salvar aluno')
            console.error(error)
        } finally {
            // O finally vai rodar, mas em sucesso ocorre o redirect via action
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>{isEditing ? 'Editar Aluno' : 'Novo Aluno'}</CardTitle>
            </CardHeader>

            <form action={onSubmit}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo *</Label>
                            <Input id="nome" name="nome" defaultValue={alunoInicial?.nome} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataInicio">Data de Início *</Label>
                            <Input
                                id="dataInicio"
                                name="dataInicio"
                                type="date"
                                defaultValue={alunoInicial?.dataInicio || new Date().toISOString().slice(0, 10)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone (WhatsApp) *</Label>
                            <Input
                                id="telefone"
                                name="telefone"
                                type="tel"
                                placeholder="(00) 00000-0000"
                                defaultValue={alunoInicial?.telefone}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={alunoInicial?.email}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select name="status" defaultValue={alunoInicial?.status || 'ativo'} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="trancado">Trancado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="responsavel">Responsável (se menor)</Label>
                            <Input
                                id="responsavel"
                                name="responsavel"
                                defaultValue={alunoInicial?.responsavel}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Instrumentos *</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]">
                            {TODOS_INSTRUMENTOS.map(inst => {
                                const isSelected = instrumentos.includes(inst)
                                return (
                                    <Button
                                        key={inst}
                                        type="button"
                                        variant={isSelected ? 'default' : 'outline'}
                                        size="sm"
                                        className="capitalize"
                                        onClick={() => toggleInstrumento(inst)}
                                    >
                                        {inst}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações Gerais</Label>
                        <Textarea
                            id="observacoes"
                            name="observacoes"
                            className="min-h-[100px]"
                            defaultValue={alunoInicial?.observacoes}
                            placeholder="Anotações sobre o aluno, horários preferenciais, etc."
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
                        {loading ? 'Salvando...' : 'Salvar Aluno'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
