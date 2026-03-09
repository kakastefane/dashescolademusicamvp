import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, User, Music, Calendar, DollarSign, FileText } from "lucide-react"

import { buscarContrato } from "@/lib/notion/contratos"
import { buscarAluno } from "@/lib/notion/alunos"
import { buscarPlano } from "@/lib/notion/planos"
import { formatarMoeda } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatarDataExtenso(isoDate: string) {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    const tzDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000)
    return format(tzDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export default async function DetalheContratoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    try {
        const contrato = await buscarContrato(id)
        const aluno = await buscarAluno(contrato.alunoId)
        const plano = await buscarPlano(contrato.planoId)

        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/contratos">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{contrato.titulo}</h1>
                        <p className="text-muted-foreground mt-1">Detalhes do contrato firmado</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Informações do Contrato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                <Badge variant={contrato.status === 'ativo' ? 'default' : 'secondary'} className="capitalize">
                                    {contrato.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                        <Calendar className="h-3.5 w-3.5" /> Início
                                    </p>
                                    <p className="font-medium">{formatarDataExtenso(contrato.dataInicio)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                        <Calendar className="h-3.5 w-3.5" /> Término (Vencimento)
                                    </p>
                                    <p className="font-medium">{formatarDataExtenso(contrato.dataFim)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
                                    <DollarSign className="h-3.5 w-3.5" /> Mensalidade
                                </p>
                                <p className="text-2xl font-bold text-primary">{formatarMoeda(contrato.valorMensal)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" /> Aluno Vinculado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium text-lg mb-4">{aluno.nome}</p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/alunos/${aluno.id}`}>Ver Perfil do Aluno</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Music className="h-5 w-5" /> Plano Contratado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium text-lg leading-none">{plano.nome}</p>
                                <p className="text-sm text-muted-foreground mt-2 capitalize">
                                    Duração: {plano.duracao} • {plano.aulasPorSemana} aula(s) p/ semana
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error(error)
        notFound()
    }
}
