'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
import { criarPlanoAction } from '@/actions/planos'
import type { DuracaoPlano } from '@/types'

export function NovoPlanoDialog() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        try {
            setLoading(true)

            const nome = formData.get('nome') as string
            const descricao = formData.get('descricao') as string
            const valorStr = formData.get('valor') as string
            const aulasPorSemanaStr = formData.get('aulasPorSemana') as string
            const duracao = formData.get('duracao') as DuracaoPlano

            if (!nome || !valorStr || !aulasPorSemanaStr || !duracao) {
                toast.error('Preencha os campos obrigatórios')
                return
            }

            await criarPlanoAction({
                nome,
                descricao,
                valor: Number(valorStr),
                aulasPorSemana: Number(aulasPorSemanaStr),
                duracao,
            })

            toast.success('Plano criado com sucesso!')
            setOpen(false)
            router.refresh()
        } catch (error) {
            toast.error('Erro ao criar plano')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Plano
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Novo Plano</DialogTitle>
                    <DialogDescription>
                        Adicione um novo plano para os alunos da escola.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome do Plano *</Label>
                        <Input id="nome" name="nome" placeholder="Ex: Guitarra Iniciante" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor (R$) *</Label>
                            <Input id="valor" name="valor" type="number" step="0.01" min="0" placeholder="0.00" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duracao">Duração *</Label>
                            <Select name="duracao" defaultValue="mensal" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mensal">Mensal</SelectItem>
                                    <SelectItem value="trimestral">Trimestral</SelectItem>
                                    <SelectItem value="semestral">Semestral</SelectItem>
                                    <SelectItem value="anual">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="aulasPorSemana">Aulas por semana *</Label>
                        <Input id="aulasPorSemana" name="aulasPorSemana" type="number" min="1" defaultValue="1" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição (Opcional)</Label>
                        <Textarea id="descricao" name="descricao" placeholder="Detalhes do plano..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Plano'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
