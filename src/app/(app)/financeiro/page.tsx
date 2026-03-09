import Link from 'next/link'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listarPagamentos } from '@/lib/notion/pagamentos'
import { listarAlunos } from '@/lib/notion/alunos'
import { PagamentosTable } from '@/components/financeiro/pagamentos-table'
import { GerarMensalidadesDialog } from '@/components/financeiro/gerar-mensalidades-dialog'

export default async function FinanceiroPage() {
    const [pagamentosCru, alunos] = await Promise.all([
        listarPagamentos(), // MVP: Traz os últimos 100 pagamentos
        listarAlunos()
    ])

    // Map to get real student names to avoid N+1 querying in UI
    const pagamentos = pagamentosCru.map(p => ({
        ...p,
        alunoNome: alunos.find(a => a.id === p.alunoId)?.nome || '(Aluno Desconhecido)'
    }))

    const inadimplentes = pagamentos.filter(p => p.status === 'atrasado').length

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Financeiro</h1>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe o fluxo de caixa, mensalidades e pendências.
                    </p>
                </div>
                <div className="flex center gap-3">
                    <GerarMensalidadesDialog />
                </div>
            </div>

            {inadimplentes > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-destructive flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Atenção: Há pagamentos em atraso
                            </span>
                            <Button variant="link" className="text-destructive p-0 h-auto" asChild>
                                <Link href="/financeiro/inadimplentes" className="flex items-center">
                                    Ver Inadimplentes <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            <PagamentosTable pagamentos={pagamentos} />
        </div>
    )
}
