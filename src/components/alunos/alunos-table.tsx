'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Aluno } from '@/types'

interface AlunosTableProps {
    alunosIniciais: Aluno[]
}

export function AlunosTable({ alunosIniciais }: AlunosTableProps) {
    const [busca, setBusca] = useState('')

    const alunosFiltrados = alunosIniciais.filter(aluno =>
        aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.instrumentos.some(i => i.toLowerCase().includes(busca.toLowerCase()))
    )

    const variantByStatus: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        ativo: 'default',
        inativo: 'secondary',
        trancado: 'destructive'
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome ou instrumento..."
                        className="pl-8"
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {/* Futuramente, filtros por dropdown podem entrar aqui */}
                    <Button asChild>
                        <Link href="/alunos/novo">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Aluno
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Instrumentos</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alunosFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum aluno encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            alunosFiltrados.map(aluno => (
                                <TableRow key={aluno.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/alunos/${aluno.id}`} className="hover:underline">
                                            {aluno.nome}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {aluno.instrumentos.map(inst => (
                                                <Badge key={inst} variant="outline" className="capitalize">
                                                    {inst}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variantByStatus[aluno.status] || 'default'} className="capitalize">
                                            {aluno.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{aluno.telefone || '—'}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/alunos/${aluno.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/alunos/${aluno.id}/editar`}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                                    </Link>
                                                </DropdownMenuItem>
                                                {/* Ação de inativar movida para a página de detalhes para evitar acidentes */}
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
