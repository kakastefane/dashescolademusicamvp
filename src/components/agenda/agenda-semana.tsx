'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    addWeeks,
    subWeeks,
    startOfWeek,
    format,
    addDays,
    isSameDay,
    parseISO
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AulaCard } from './aula-card'
import type { Aula, Professor } from '@/types'

// Horário de funcionamento: 08:00 às 22:00 (15 slots de 1 hora)
const START_HOUR = 8
const END_HOUR = 22
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

interface AgendaSemanaProps {
    aulasIniciais: Aula[]
    professores: Professor[]
}

export function AgendaSemana({ aulasIniciais, professores }: AgendaSemanaProps) {
    // Controle de navegação da semana
    const [currentDate, setCurrentDate] = useState(new Date())
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }) // Começa na segunda

    // Aulas listadas na tela
    // *Em uma aplicação real pesada, a mudança de datas dispararia um novo fetch.
    // Como é um MVP e estamos puxando do cache inicial ou refetching,
    // vamos assumir que aulasIniciais tem os dados da semana correta se o componente for server-driven,
    // mas aqui vamos filtrar client-side apenas para a exibição do que já foi carregado.
    // Para MVP simplificado: o Server manda TUDO ou a gente navega via URL (ex: ?week=...).
    // Vamos implementar a navegação via estado local se tivermos todas as aulas, 
    // senão precisaria ser ?date= no router. Para ficar responsivo e o Server Action já traz tudo, filtramos local.

    // Filtros
    const [professorId, setProfessorId] = useState<string>('todos')
    const [mostrarCanceladas, setMostrarCanceladas] = useState(true)

    // Gerar dias da semana
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const today = () => setCurrentDate(new Date())

    // Filtrar aulas a serem exibidas na grade
    const aulasFiltradas = aulasIniciais.filter(aula => {
        // Filtro de Professor
        if (professorId !== 'todos' && aula.professorId !== professorId) return false
        // Filtro de canceladas
        if (!mostrarCanceladas && aula.status === 'cancelada') return false

        // Opcional: filtrar apenas aulas que pertencem a view da semana atual (para desempenho)
        // const aulaDate = parseISO(aula.dataHora)
        // if (aulaDate < startOfCurrentWeek || aulaDate > addDays(startOfCurrentWeek, 7)) return false

        return true
    })

    // Agrupar aulas por dia e hora
    function getAulasParaSlot(date: Date, hour: number) {
        return aulasFiltradas.filter(aula => {
            const aulaDate = parseISO(aula.dataHora)
            return isSameDay(aulaDate, date) && aulaDate.getHours() === hour
        })
    }

    const tituloSemana = `${format(startOfCurrentWeek, "dd 'de' MMMM", { locale: ptBR })} — ${format(addDays(startOfCurrentWeek, 6), "dd 'de' MMMM", { locale: ptBR })}`

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-card border rounded-md p-1">
                    <Button variant="ghost" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={today} className="font-medium text-sm px-4">
                        Hoje
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold ml-2 capitalize pr-4">{tituloSemana}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={professorId} onValueChange={setProfessorId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Professor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os Professores</SelectItem>
                                {professores.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 text-sm border-l pl-4">
                        <Switch
                            id="canceladas"
                            checked={mostrarCanceladas}
                            onCheckedChange={setMostrarCanceladas}
                        />
                        <Label htmlFor="canceladas" className="text-xs font-normal cursor-pointer">
                            Exibir canceladas
                        </Label>
                    </div>

                    <Button asChild>
                        <Link href={`/agenda/nova-aula?data=${format(currentDate, 'yyyy-MM-dd')}`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Aula
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Calendário Grid */}
            <div className="border rounded-md bg-card overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Cabeçalho dos dias */}
                    <div className="grid grid-cols-8 border-b divide-x">
                        <div className="p-3 flex items-center justify-center text-sm font-medium text-muted-foreground bg-muted/30">
                            Horário
                        </div>
                        {daysOfWeek.map(day => (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "p-3 text-center",
                                    isSameDay(day, new Date()) ? "bg-primary/5" : ""
                                )}
                            >
                                <div className="text-sm font-semibold capitalize">
                                    {format(day, 'EEEE', { locale: ptBR }).split('-')[0]}
                                </div>
                                <div className={cn(
                                    "text-2xl mt-1 font-light",
                                    isSameDay(day, new Date()) ? "text-primary font-medium" : "text-muted-foreground"
                                )}>
                                    {format(day, 'dd')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Linhas de Horários */}
                    <div className="divide-y border-b">
                        {HOURS.map(hour => (
                            <div key={hour} className="grid grid-cols-8 divide-x h-[100px]">
                                {/* Coluna do Horário */}
                                <div className="p-2 flex items-center justify-center text-sm font-medium text-muted-foreground bg-muted/10 h-full border-b">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>

                                {/* Slots dos Dias */}
                                {daysOfWeek.map(day => {
                                    const aulasNoSlot = getAulasParaSlot(day, hour)

                                    return (
                                        <div
                                            key={`${day.toISOString()}-${hour}`}
                                            className={cn(
                                                "relative transition-colors hover:bg-muted/30 border-b",
                                                isSameDay(day, new Date()) ? "bg-primary/[0.02]" : ""
                                            )}
                                        >
                                            {/* Linha guia de meia hora opcional */}
                                            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-muted-foreground/20 pointer-events-none" />

                                            {aulasNoSlot.map(aula => {
                                                const min = parseISO(aula.dataHora).getMinutes()
                                                const topRaw = (min / 60) * 100
                                                const heightRaw = (aula.duracaoMinutos / 60) * 100

                                                return (
                                                    <AulaCard
                                                        key={aula.id}
                                                        aula={aula}
                                                        style={{
                                                            position: 'absolute',
                                                            top: `${topRaw}%`,
                                                            height: `calc(${heightRaw}% - 2px)`,
                                                            left: '2px',
                                                            right: '2px',
                                                            zIndex: 10
                                                        }}
                                                    />
                                                )
                                            })}

                                            {!aulasNoSlot.length && (
                                                <Link
                                                    href={`/agenda/nova-aula?data=${format(day, 'yyyy-MM-dd')}&hora=${hour.toString().padStart(2, '0')}:00`}
                                                    className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground z-0 transition-opacity"
                                                    title="Agendar neste horário"
                                                >
                                                    <Plus className="h-6 w-6" />
                                                </Link>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
