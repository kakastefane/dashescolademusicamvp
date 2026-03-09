'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, Users, Calendar,
    DollarSign, FileText, Music
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icone: LayoutDashboard },
    { href: '/alunos', label: 'Alunos', icone: Users },
    { href: '/agenda', label: 'Agenda', icone: Calendar },
    { href: '/financeiro', label: 'Financeiro', icone: DollarSign },
    { href: '/contratos', label: 'Contratos', icone: FileText },
    { href: '/planos', label: 'Planos', icone: Music },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-56 min-h-screen bg-card flex flex-col">
            <div className="p-6">
                <h1 className="font-bold text-lg text-foreground">CMSolutions</h1>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {navItems.map(item => {
                    const ativo = pathname.startsWith(item.href)
                    const Icon = item.icone
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-2xl text-sm transition-colors',
                                ativo
                                    ? 'bg-secondary text-foreground font-medium'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
