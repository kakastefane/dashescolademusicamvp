'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addMonths, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { criarContratoAction } from '@/actions/contratos'
import type { Aluno, Plano, ContratoFormData } from '@/types'

interface ContratoFormProps {
    alunos: Aluno[]
    planos: Plano[]
}

const duracaoMeses: Record<string, number> = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12
}

export function ContratoForm({ alunos, planos }: ContratoFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Estados para cálculos visuais
    const [planoId, setPlanoId] = useState<string>('')
    const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'))

    const planoSelecionado = planos.find(p => p.id === planoId)

    // Cálculo automático da Data Fim
    const dataFimCalculada = planoSelecionado && dataInicio
        ? format(addMonths(new Date(dataInicio + 'T12:00:00'), duracaoMeses[planoSelecionado.duracao]), 'yyyy-MM-dd')
        : ''

    async function onSubmit(formData: FormData) {
        try {
            setLoading(true)

            const alunoId = formData.get('alunoId') as string
            const selectedPlano = formData.get('planoId') as string
            const inicio = formData.get('dataInicio') as string
            const fim = formData.get('dataFim') as string

            if (!alunoId || !selectedPlano || !inicio || !fim) {
                toast.error('Preencha todos os campos obrigatórios')
                return
            }

            const pSelecionado = planos.find(p => p.id === selectedPlano)

            const titulo = `Contrato — ${pSelecionado?.nome} (${format(new Date(inicio + 'T12:00:00'), 'MMM/yyyy')})`

            const novoContrato: ContratoFormData = {
                titulo,
                alunoId,
                planoId: selectedPlano,
                dataInicio: inicio,
                dataFim: fim,
                status: 'ativo',
                valorMensal: pSelecionado?.valor || 0
            }

            await criarContratoAction(novoContrato)
            toast.success('Contrato ativado com sucesso. Primeira cobrança gerada!')

        } catch (error) {
            toast.error('Erro ao firmar contrato')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Novo Contrato</CardTitle>
            </CardHeader>

            <form action={onSubmit}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="space-y-2">
                            <Label htmlFor="alunoId">Aluno *</Label>
                            <Select name="alunoId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o aluno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {alunos.map(aluno => (
                                        <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                                    ))}
                                    {alunos.length === 0 && <SelectItem value="vazio" disabled>Nenhum aluno ativo disponível</SelectItem>}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Apenas alunos ativos sem um contrato vigente.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planoId">Plano Escolhido *</Label>
                            <Select name="planoId" value={planoId} onValueChange={setPlanoId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    {planos.map(plano => (
                                        <SelectItem key={plano.id} value={plano.id}>
                                            {plano.nome} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valor)}/mês
                                        </SelectItem>
                                    ))}
                                    {planos.length === 0 && <SelectItem value="vazio" disabled>Nenhum plano cadastrado</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataInicio">Data de Início *</Label>
                            <Input
                                id="dataInicio"
                                name="dataInicio"
                                type="date"
                                required
                                value={dataInicio}
                                onChange={e => setDataInicio(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataFim">Data do Vencimento do Contrato *</Label>
                            <Input
                                id="dataFim"
                                name="dataFim"
                                type="date"
                                required
                                readOnly
                                value={dataFimCalculada}
                                className="bg-muted text-muted-foreground cursor-not-allowed"
                                title="Calculado automaticamente com base na duração do plano selecionado"
                            />
                        </div>
                    </div>

                    {planoSelecionado && (
                        <div className="bg-primary/5 p-4 rounded-md border text-sm text-primary-foreground space-y-1">
                            <p className="font-semibold text-primary">Resumo do Contrato:</p>
                            <ul className="list-disc pl-5 text-muted-foreground">
                                <li>Duração: <span className="capitalize">{planoSelecionado.duracao}</span> ({duracaoMeses[planoSelecionado.duracao]} meses)</li>
                                <li>Frequência: {planoSelecionado.aulasPorSemana} aula(s) por semana</li>
                                <li>Uma cobrança (Pendente) do 1º mês será automaticamente lançada no Financeiro.</li>
                            </ul>
                        </div>
                    )}

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
                    <Button type="submit" disabled={loading || !planoSelecionado}>
                        {loading ? 'Salvando...' : 'Firmar Contrato'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
