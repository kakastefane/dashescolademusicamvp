import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatarMoeda } from '@/lib/utils'
import { listarPlanos } from '@/lib/notion/planos'
import { NovoPlanoDialog } from '@/components/planos/novo-plano-dialog'

export default async function PlanosPage() {
    const planos = await listarPlanos()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Planos</h1>
                    <p className="text-sm text-muted-foreground">Gerencie os planos e preços da escola</p>
                </div>
                <NovoPlanoDialog />
            </div>

            {planos.length === 0 ? (
                <div className="text-center p-12 border border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">Nenhum plano encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Comece criando o primeiro plano para a escola.
                    </p>
                    <NovoPlanoDialog />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {planos.map(plano => (
                        <Card key={plano.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl">{plano.nome}</CardTitle>
                                <CardDescription className="capitalize">{plano.duracao}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-2xl font-bold text-primary">
                                    {formatarMoeda(plano.valor)}
                                </div>

                                <div className="text-sm space-y-2 text-muted-foreground border-t pt-4">
                                    <p>• {plano.aulasPorSemana} aula(s) por semana</p>
                                    {plano.descricao && (
                                        <p className="line-clamp-2 mt-2">{plano.descricao}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
