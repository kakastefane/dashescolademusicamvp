'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CalendarRange, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { gerarMensalidadesMesAction } from '@/actions/pagamentos'

export function GerarMensalidadesDialog() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const hoje = new Date()
    const mesesA = [hoje.getMonth() + 1, hoje.getMonth() + 2] // Current and next month
    const anoAtual = hoje.getFullYear()

    // Default para o mês que vem
    const [mesSelecionado, setMesSelecionado] = useState(String(hoje.getMonth() + 2 > 12 ? 1 : hoje.getMonth() + 2))
    const [anoSelecionado, setAnoSelecionado] = useState(String(hoje.getMonth() + 2 > 12 ? anoAtual + 1 : anoAtual))

    function handleGerar() {
        startTransition(async () => {
            try {
                const res = await gerarMensalidadesMesAction(Number(mesSelecionado), Number(anoSelecionado))
                setOpen(false)
                if (res.erros > 0) {
                    toast.warning(`Processo finalizado com ${res.erros} erros. ${res.criados} criadas, ${res.pulados} puladas (já existiam).`)
                } else {
                    toast.success(`${res.criados} novas mensalidades geradas com sucesso! (${res.pulados} puladas)`)
                }
            } catch (error) {
                toast.error('Ocorreu um erro crítico ao gerar mensalidades.')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Sparkles className="h-4 w-4" /> Gerar Mensalidades em Lote
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gerar Mensalidades</DialogTitle>
                    <DialogDescription>
                        Isso vai criar um novo pagamento agrupado como Pendente para cada aluno com contrato Ativo que ainda não tem parcela no mês escolhido.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mês Referência</label>
                            <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Janeiro</SelectItem>
                                    <SelectItem value="2">Fevereiro</SelectItem>
                                    <SelectItem value="3">Março</SelectItem>
                                    <SelectItem value="4">Abril</SelectItem>
                                    <SelectItem value="5">Maio</SelectItem>
                                    <SelectItem value="6">Junho</SelectItem>
                                    <SelectItem value="7">Julho</SelectItem>
                                    <SelectItem value="8">Agosto</SelectItem>
                                    <SelectItem value="9">Setembro</SelectItem>
                                    <SelectItem value="10">Outubro</SelectItem>
                                    <SelectItem value="11">Novembro</SelectItem>
                                    <SelectItem value="12">Dezembro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ano</label>
                            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={String(anoAtual)}>{anoAtual}</SelectItem>
                                    <SelectItem value={String(anoAtual + 1)}>{anoAtual + 1}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleGerar} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar e Gerar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
