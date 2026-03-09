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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { criarProfessorAction, atualizarProfessorAction } from '@/actions/professores'
import type { Professor, Instrumento } from '@/types'

const TODOS_INSTRUMENTOS: Instrumento[] = [
    'violao', 'guitarra', 'baixo', 'bateria', 'teclado', 'piano', 'canto', 'outro'
]

interface ProfessorFormProps {
    professorId?: string
    initialData?: Professor
}

export function ProfessorForm({ professorId, initialData }: ProfessorFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isEditMode = !!professorId

    // Controlamos os instrumentos localmente por ser um multi-select custom
    const [instrumentosSelecionados, setInstrumentosSelecionados] = useState<Instrumento[]>(
        initialData?.instrumentos || []
    )

    function toggleInstrumento(inst: Instrumento) {
        setInstrumentosSelecionados(prev =>
            prev.includes(inst)
                ? prev.filter(i => i !== inst)
                : [...prev, inst]
        )
    }

    async function onSubmit(formData: FormData) {
        try {
            setLoading(true)

            const rawParams = {
                nome: formData.get('nome') as string,
                telefone: formData.get('telefone') as string,
                status: formData.get('status') as 'ativo' | 'inativo',
                disponibilidade: formData.get('disponibilidade') as string,
                instrumentos: instrumentosSelecionados,
            }

            if (!rawParams.nome) {
                toast.error('Preencha o nome do professor')
                return
            }

            if (isEditMode) {
                const result = await atualizarProfessorAction(professorId, rawParams)
                if (result.success) {
                    toast.success('Professor atualizado com sucesso!')
                    router.push('/professores')
                } else {
                    toast.error(result.error)
                }
            } else {
                const result = await criarProfessorAction(rawParams as any)
                if (result.success) {
                    toast.success('Professor cadastrado com sucesso!')
                    router.push('/professores')
                } else {
                    toast.error(result.error)
                }
            }

        } catch (error) {
            toast.error('Erro ao salvar os dados')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>{isEditMode ? 'Editar Professor' : 'Novo Professor'}</CardTitle>
            </CardHeader>
            <form action={onSubmit}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="nome">Nome Completo *</Label>
                            <Input
                                id="nome"
                                name="nome"
                                required
                                placeholder="Ex: João Silva"
                                defaultValue={initialData?.nome}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                            <Input
                                id="telefone"
                                name="telefone"
                                placeholder="(11) 99999-9999"
                                defaultValue={initialData?.telefone}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={initialData?.status ?? 'ativo'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label>Instrumentos que Leciona</Label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                                {TODOS_INSTRUMENTOS.map(inst => {
                                    const ativo = instrumentosSelecionados.includes(inst)
                                    return (
                                        <Badge
                                            key={inst}
                                            variant={ativo ? "default" : "outline"}
                                            className="cursor-pointer capitalize hover:bg-primary/90"
                                            onClick={() => toggleInstrumento(inst)}
                                        >
                                            {inst}
                                        </Badge>
                                    )
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">Clique nas tags para selecionar/remover.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="disponibilidade">Notas de Disponibilidade</Label>
                        <Textarea
                            id="disponibilidade"
                            name="disponibilidade"
                            placeholder="Ex: Segundas e Quartas à tarde. Apenas online às sextas..."
                            defaultValue={initialData?.disponibilidade}
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
                        {loading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Cadastrar Professor')}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
