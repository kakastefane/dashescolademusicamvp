import Link from 'next/link'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Aula } from '@/types'

// Cores predefinidas para os cards baseadas no ID do professor para manter consistência
const PROFESSOR_COLORS = [
    'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
    'bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200',
    'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
    'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200',
]

function getColorForProfessor(professorId: string) {
    // Hash simples do ID para escolher uma cor
    let hash = 0
    for (let i = 0; i < professorId.length; i++) {
        hash = professorId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % PROFESSOR_COLORS.length
    return PROFESSOR_COLORS[index]
}

interface AulaCardProps {
    aula: Aula
    // Para posicionar via CSS puro na grade (opcional se usar Flex)
    style?: React.CSSProperties
    className?: string
}

export function AulaCard({ aula, style, className }: AulaCardProps) {
    const colorClass = getColorForProfessor(aula.professorId)

    // Opacidade reduzida para aulas canceladas
    const isCancelada = aula.status === 'cancelada'
    const isRealizada = aula.status === 'realizada'
    const isFalta = aula.status === 'faltou'

    return (
        <Link
            href={`/agenda/${aula.id}`}
            style={style}
            className={cn(
                'block p-1.5 text-xs rounded-md border shadow-sm transition-colors overflow-hidden',
                colorClass,
                isCancelada && 'opacity-50 line-through',
                isFalta && 'border-red-400 border-2',
                isRealizada && 'opacity-70',
                className
            )}
            title={`${aula.alunoNome} - ${aula.instrumento} (${aula.status})`}
        >
            <div className="font-semibold truncate">{aula.alunoNome}</div>
            <div className="flex items-center justify-between mt-0.5 opacity-90">
                <span className="capitalize truncate">{aula.instrumento}</span>
                {aula.tipo === 'reposicao' && (
                    <span className="text-[10px] bg-white/40 px-1 rounded font-medium">REP</span>
                )}
            </div>
            <div className="flex items-center gap-1 mt-1 opacity-75">
                <Clock className="h-3 w-3" />
                <span>{aula.duracaoMinutos}m</span>
            </div>
        </Link>
    )
}
