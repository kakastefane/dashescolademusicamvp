import { CheckCircle2, Clock, Users, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { obterDadosDashboard } from '@/lib/notion/dashboard'
import { MetricCard } from '@/components/dashboard/metric-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
    const data = await obterDadosDashboard()

    const currencyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Resumo Gerencial</h1>
                <p className="text-sm text-muted-foreground">
                    Acompanhamento geral das métricas da escola para este mês.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Alunos Ativos"
                    value={data.totalAlunos}
                    icon={Users}
                    description="Contratos vigentes ou avulsos ativos."
                />
                <MetricCard
                    title="Aulas Hoje"
                    value={data.aulasHoje}
                    icon={Calendar}
                    description="Agendadas para esta data."
                />
                <MetricCard
                    title="Receita do Mês"
                    value={currencyFormatter.format(data.receita.recebida)}
                    icon={DollarSign}
                    description={`Previsto: ${currencyFormatter.format(data.receita.prevista)}`}
                />
                <MetricCard
                    title="Inadimplentes"
                    value={data.inadimplentes.length}
                    icon={AlertCircle}
                    description="Faturas vencidas não pagas."
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex gap-2 items-center">
                            <Clock className="w-4 h-4" />
                            Contratos Vencendo (30 dias)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.contratosVencendo.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum contrato vencendo em breve.</p>
                        ) : (
                            <div className="space-y-4">
                                {data.contratosVencendo.slice(0, 5).map(contrato => (
                                    <div key={contrato.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{contrato.titulo}</p>
                                            <p className="text-xs text-muted-foreground">Vence em: {contrato.dataFim}</p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/alunos/${contrato.alunoId}`}>Ver aluno</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {data.contratosVencendo.length > 5 && (
                            <Button variant="link" asChild className="mt-4 p-0">
                                <Link href="/contratos">Ver todos os {data.contratosVencendo.length}</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex gap-2 items-center text-destructive">
                            <AlertCircle className="w-4 h-4" />
                            Atenção Financeira
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.inadimplentes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma fatura em atraso neste momento.</p>
                        ) : (
                            <div className="space-y-4">
                                {data.inadimplentes.slice(0, 5).map(fatura => (
                                    <div key={fatura.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{fatura.referencia}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{currencyFormatter.format(fatura.valor)}</p>
                                        </div>
                                        <Badge variant="destructive">Vencida</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                        {data.inadimplentes.length > 5 && (
                            <Button variant="link" asChild className="mt-4 p-0 text-destructive">
                                <Link href="/financeiro">Ver todos no Financeiro</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
