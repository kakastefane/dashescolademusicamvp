import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { listarInadimplentes } from '@/lib/notion/pagamentos'
import { listarAlunos } from '@/lib/notion/alunos'

export default async function InadimplentesPage() {
    const [pagamentosCru, alunos] = await Promise.all([
        listarInadimplentes(),
        listarAlunos()
    ])

    // Agrupamento de dívidas por aluno
    const dividasMap = new Map<string, { alunoId: string; nome: string; quantidade: number; total: number }>()

    pagamentosCru.forEach(p => {
        const atual = dividasMap.get(p.alunoId)
        if (atual) {
            atual.quantidade += 1
            atual.total += p.valor
        } else {
            dividasMap.set(p.alunoId, {
                alunoId: p.alunoId,
                nome: alunos.find(a => a.id === p.alunoId)?.nome || '(Desconhecido)',
                quantidade: 1,
                total: p.valor
            })
        }
    })

    // Converter para array e ordenar pelo maior devedor
    const devedores = Array.from(dividasMap.values()).sort((a, b) => b.total - a.total)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/financeiro"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Inadimplentes</h1>
                    <p className="text-sm text-muted-foreground">
                        Visão consolidada de alunos com pagamentos em atraso.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead className="text-center">Qtd. Pagamentos Atrasados</TableHead>
                            <TableHead className="text-right">Valor Total em Atraso</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {devedores.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                                    Que ótimo! Não há nenhum aluno inadimplente no momento.
                                </TableCell>
                            </TableRow>
                        ) : (
                            devedores.map(dev => (
                                <TableRow key={dev.alunoId}>
                                    <TableCell className="font-medium">{dev.nome}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="bg-destructive/10 text-destructive font-bold px-2 py-0.5 rounded">
                                            {dev.quantidade}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-destructive">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dev.total)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/alunos/${dev.alunoId}`}>Cobrar Aluno</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
