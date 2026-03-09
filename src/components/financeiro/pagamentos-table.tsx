'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, Clock, FileWarning, Search, CreditCard, Banknote, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { marcarComoPagoAction } from '@/actions/pagamentos'
import type { Pagamento, PagamentoFormData, FormaPagamento } from '@/types'

interface PagamentosTableProps {
    pagamentos: Pagamento[]
}

const statusConfig = {
    pendente: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
    pago: { label: 'Pago', variant: 'default' as const, icon: CheckCircle2 },
    atrasado: { label: 'Atrasado', variant: 'destructive' as const, icon: AlertCircle },
    cancelado: { label: 'Cancelado', variant: 'outline' as const, icon: FileWarning },
}

const formaConfig: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_debito: 'Débito',
    cartao_credito: 'Crédito',
    boleto: 'Boleto'
}

export function PagamentosTable({ pagamentos }: PagamentosTableProps) {
    const [busca, setBusca] = useState('')
    const [isPending, startTransition] = useTransition()

    const filtrados = pagamentos.filter(p => {
        const nomeAluno = p.aluno?.nome?.toLowerCase() || ''
        const ref = p.referencia.toLowerCase()
        const termo = busca.toLowerCase()
        return nomeAluno.includes(termo) || ref.includes(termo)
    })

    function handleMarcarPago(id: string, forma: FormaPagamento) {
        startTransition(async () => {
            try {
                await marcarComoPagoAction(id, forma)
                toast.success('Pagamento marcado como concluído!')
            } catch (error) {
                toast.error('Erro ao atualizar o pagamento.')
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
                <Input
                    placeholder="Buscar por aluno ou referência..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aluno / Ref</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Forma (Baixa)</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    Nenhum pagamento encontrado para este mês ou filtro.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtrados.map(pagamento => {
                                const StatusIcon = statusConfig[pagamento.status].icon

                                return (
                                    <TableRow key={pagamento.id}>
                                        <TableCell>
                                            <div className="font-medium text-primary hover:underline">
                                                <Link href={`/alunos/${pagamento.alunoId}`}>
                                                    {pagamento.alunoNome || pagamento.aluno?.nome || 'Aluno Desconhecido'}
                                                </Link>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{pagamento.referencia}</div>
                                        </TableCell>

                                        <TableCell>
                                            {format(new Date(pagamento.vencimento + 'T12:00:00'), 'dd/MM/yyyy')}
                                            {pagamento.status === 'atrasado' && (
                                                <span className="text-destructive text-xs ml-2 font-medium">Vencido</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pagamento.valor)}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={statusConfig[pagamento.status].variant} className="flex w-fit items-center gap-1 pr-2">
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig[pagamento.status].label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-sm text-muted-foreground">
                                            {pagamento.formaPagamento ? formaConfig[pagamento.formaPagamento] : '—'}
                                            {pagamento.dataPagamento && ` (${format(new Date(pagamento.dataPagamento + 'T12:00:00'), 'dd/MM')})`}
                                        </TableCell>

                                        <TableCell className="text-right space-x-2">
                                            {pagamento.status !== 'pago' && pagamento.status !== 'cancelado' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" disabled={isPending}>
                                                            Dar Baixa
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Forma de Pagamento</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleMarcarPago(pagamento.id, 'pix')}>
                                                            PIX
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleMarcarPago(pagamento.id, 'dinheiro')}>
                                                            Dinheiro
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleMarcarPago(pagamento.id, 'cartao_credito')}>
                                                            Cartão de Crédito
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleMarcarPago(pagamento.id, 'cartao_debito')}>
                                                            Cartão de Débito
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
