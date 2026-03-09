'use client'

import { useState } from "react"
import Link from "next/link"
import { Search, Plus, MoreHorizontal, Pencil, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Professor } from "@/types"

interface ProfessoresTableProps {
    professores: Professor[]
}

export function ProfessoresTable({ professores }: ProfessoresTableProps) {
    const [busca, setBusca] = useState("")

    const filtrados = professores.filter(prof => {
        const termo = busca.toLowerCase()
        return (
            prof.nome.toLowerCase().includes(termo) ||
            prof.instrumentos.some(i => i.toLowerCase().includes(termo))
        )
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar professor ou instrumento..."
                        className="pl-8"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/professores/novo" className="gap-2">
                        <Plus className="h-4 w-4" /> Novo Professor
                    </Link>
                </Button>
            </div>

            <div className="border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Instrumentos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Nenhum professor encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtrados.map((prof) => (
                                <TableRow key={prof.id}>
                                    <TableCell className="font-medium">{prof.nome}</TableCell>
                                    <TableCell>{prof.telefone || '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {prof.instrumentos.map(inst => (
                                                <Badge key={inst} variant="secondary" className="capitalize text-xs">
                                                    {inst}
                                                </Badge>
                                            ))}
                                            {prof.instrumentos.length === 0 && <span className="text-muted-foreground text-sm">—</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={prof.status === 'ativo' ? 'default' : 'secondary'} className="capitalize">
                                            {prof.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/professores/${prof.id}/editar`} className="cursor-pointer">
                                                        <Pencil className="h-4 w-4 mr-2" /> Editar
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
