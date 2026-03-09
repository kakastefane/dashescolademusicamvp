import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pencil, Calendar, DollarSign, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { buscarAluno } from '@/lib/notion/alunos'
import { buscarContratoAtivo } from '@/lib/notion/contratos'
import { listarAulasPorAluno } from '@/lib/notion/aulas'
import { listarPagamentosPorAluno } from '@/lib/notion/pagamentos'
import { formatarMoeda, formatarData, formatarDataHora } from '@/lib/utils'

export default async function AlunoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params
        const aluno = await buscarAluno(resolvedParams.id)
        const [contrato, aulas, pagamentos] = await Promise.all([
            buscarContratoAtivo(aluno.id),
            listarAulasPorAluno(aluno.id, 5),
            listarPagamentosPorAluno(aluno.id),
        ])

        const variantByStatus: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            ativo: 'default',
            inativo: 'secondary',
            trancado: 'destructive'
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{aluno.nome}</h1>
                            <Badge variant={variantByStatus[aluno.status]}>{aluno.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                            <span>📱 {aluno.telefone}</span>
                            {aluno.email && <span>✉️ {aluno.email}</span>}
                            <span>📅 Desde {formatarData(aluno.dataInicio)}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {aluno.instrumentos.map(inst => (
                                <Badge key={inst} variant="outline" className="capitalize">{inst}</Badge>
                            ))}
                        </div>
                        {aluno.responsavel && (
                            <p className="text-sm mt-3 border-l-2 pl-3 italic">
                                Responsável: {aluno.responsavel}
                            </p>
                        )}
                    </div>

                    <Button asChild>
                        <Link href={`/alunos/${aluno.id}/editar`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Aluno
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Contrato Atual
                            </CardTitle>
                            {contrato && (
                                <Badge variant="outline">Vence em {formatarData(contrato.dataFim)}</Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            {contrato ? (
                                <div className="space-y-2 mt-2">
                                    <p className="font-medium">{contrato.titulo}</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {formatarMoeda(contrato.valorMensal)} <span className="text-sm font-normal text-muted-foreground">/mês</span>
                                    </p>
                                    <Button variant="link" className="px-0" asChild>
                                        <Link href={`/contratos/${contrato.id}`}>Ver detalhes do contrato →</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground mt-2 space-y-3">
                                    <p>Nenhum contrato ativo encontrado para este aluno.</p>
                                    <Button variant="outline" asChild>
                                        <Link href={`/contratos/novo?alunoId=${aluno.id}`}>
                                            Criar Contrato
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5" /> Próximas Aulas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {aulas.length > 0 ? (
                                <ul className="space-y-3 mt-2">
                                    {aulas.map(aula => (
                                        <li key={aula.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{formatarDataHora(aula.dataHora)}</p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {aula.instrumento} • {aula.duracaoMinutos} min • {aula.tipo}
                                                </p>
                                            </div>
                                            <Badge variant="outline">{aula.status}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-2">Nenhuma aula futura agendada.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5" /> Últimos Pagamentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pagamentos.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {pagamentos.slice(0, 6).map(pag => (
                                    <div key={pag.id} className="p-3 border rounded-md">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-medium text-sm line-clamp-1" title={pag.referencia}>
                                                {pag.referencia}
                                            </p>
                                            <Badge variant={pag.status === 'pago' ? 'default' : pag.status === 'atrasado' ? 'destructive' : 'secondary'}>
                                                {pag.status}
                                            </Badge>
                                        </div>
                                        <p className="text-lg font-bold">{formatarMoeda(pag.valor)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Venc: {formatarData(pag.vencimento)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhum histórico de pagamentos.</p>
                        )}
                    </CardContent>
                </Card>

                {aluno.observacoes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Observações Gerais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm">{aluno.observacoes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    } catch (error) {
        console.error(error)
        notFound()
    }
}
