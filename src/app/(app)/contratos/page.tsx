import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { listarContratos } from '@/lib/notion/contratos'
import { listarAlunos } from '@/lib/notion/alunos'
import { listarPlanos } from '@/lib/notion/planos'

export default async function ContratosPage() {
    const [contratosCru, alunos, planos] = await Promise.all([
        listarContratos(),
        listarAlunos(),
        listarPlanos()
    ])

    // Mapping entities
    const contratos = contratosCru.map(c => ({
        ...c,
        alunoNome: alunos.find(a => a.id === c.alunoId)?.nome || '(Aluno Excluído)',
        planoNome: planos.find(p => p.id === c.planoId)?.nome || '(Plano Excluído)'
    }))

    const statusConfig = {
        ativo: { variant: 'default' as const, label: 'Ativo' },
        expirado: { variant: 'secondary' as const, label: 'Expirado' },
        cancelado: { variant: 'destructive' as const, label: 'Cancelado' }
    }

    // Identificando contratos para vencer nos próximos 30 dias (Alerta)
    const hoje = new Date()
    const limiteAlerta = new Date()
    limiteAlerta.setDate(hoje.getDate() + 30)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Contratos</h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie os vínculos contratuais dos alunos.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/contratos/novo">
                        <Plus className="h-4 w-4 mr-2" /> Novo Contrato
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título / Aluno</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Vigência</TableHead>
                            <TableHead>Mensalidade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contratos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    Nenhum contrato encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            contratos.map(contrato => {
                                const dataFim = new Date(contrato.dataFim + 'T12:00:00')
                                const vencendo = contrato.status === 'ativo' && dataFim <= limiteAlerta && dataFim >= hoje

                                return (
                                    <TableRow key={contrato.id} className={vencendo ? 'bg-amber-500/10' : ''}>
                                        <TableCell>
                                            <div className="font-semibold">{contrato.titulo}</div>
                                            <div className="text-sm text-primary hover:underline">
                                                <Link href={`/alunos/${contrato.alunoId}`}>{contrato.alunoNome}</Link>
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-medium text-muted-foreground">
                                            {contrato.planoNome}
                                        </TableCell>

                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(contrato.dataInicio + 'T12:00:00'), 'dd/MMM/yy', { locale: ptBR })}</span>
                                                <span className={vencendo ? 'text-amber-600 font-bold' : 'text-muted-foreground'}>
                                                    até {format(dataFim, 'dd/MMM/yy', { locale: ptBR })}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="font-medium">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valorMensal)}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={statusConfig[contrato.status].variant}>
                                                {statusConfig[contrato.status].label}
                                            </Badge>
                                            {vencendo && <span className="text-[10px] uppercase font-bold text-amber-600 block mt-1">Vence logo</span>}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/alunos/${contrato.alunoId}`}>Acessar Aluno</Link>
                                            </Button>
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
