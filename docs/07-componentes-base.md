# 07 — Componentes Base com Exemplos

> Estes são os padrões que o agente deve seguir ao criar novos componentes.
> Cada exemplo é funcional e pode ser adaptado diretamente.

---

## Padrão 1: Server Component de Listagem

```typescript
// src/app/(app)/alunos/page.tsx
import { listarAlunos } from '@/lib/notion/alunos'
import { AlunosTable } from '@/components/alunos/alunos-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AlunosPage() {
  const alunos = await listarAlunos({ status: 'ativo' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-sm text-muted-foreground">{alunos.length} alunos ativos</p>
        </div>
        <Button asChild>
          <Link href="/alunos/novo">+ Novo Aluno</Link>
        </Button>
      </div>

      <AlunosTable alunos={alunos} />
    </div>
  )
}
```

---

## Padrão 2: Client Component de Tabela com Filtro

```typescript
// src/components/alunos/alunos-table.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import Link from 'next/link'
import type { Aluno } from '@/types'

interface AlunosTableProps {
  alunos: Aluno[]
}

const statusConfig = {
  ativo:    { label: 'Ativo',    variant: 'default'     },
  inativo:  { label: 'Inativo',  variant: 'secondary'   },
  trancado: { label: 'Trancado', variant: 'destructive' },
} as const

export function AlunosTable({ alunos }: AlunosTableProps) {
  const [busca, setBusca] = useState('')

  const filtrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nome..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Instrumento(s)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map(aluno => (
                <TableRow key={aluno.id}>
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell>{aluno.instrumentos.join(', ')}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[aluno.status].variant}>
                      {statusConfig[aluno.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(aluno.dataInicio).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/alunos/${aluno.id}`}>Ver</Link>
                    </Button>
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
```

---

## Padrão 3: Formulário com Server Action

```typescript
// src/components/alunos/aluno-form.tsx
'use client'

import { useActionState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { criarAluno } from '@/actions/alunos'
import type { Aluno } from '@/types'

interface AlunoFormProps {
  aluno?: Aluno // se passado, modo edição
}

export function AlunoForm({ aluno }: AlunoFormProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await criarAluno({
        nome: formData.get('nome') as string,
        telefone: formData.get('telefone') as string,
        email: formData.get('email') as string || undefined,
        instrumentos: (formData.get('instrumentos') as string).split(',').map(s => s.trim()) as any,
        status: 'ativo',
        dataInicio: formData.get('dataInicio') as string,
        observacoes: formData.get('observacoes') as string || undefined,
      })
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          name="nome"
          defaultValue={aluno?.nome}
          required
          placeholder="Nome completo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            name="telefone"
            defaultValue={aluno?.telefone}
            required
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={aluno?.email}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataInicio">Data de Início *</Label>
        <Input
          id="dataInicio"
          name="dataInicio"
          type="date"
          defaultValue={aluno?.dataInicio ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          defaultValue={aluno?.observacoes}
          placeholder="Informações adicionais..."
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
```

---

## Padrão 4: Server Action

```typescript
// src/actions/alunos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { criarAluno as criarAlunoNotion, atualizarAluno, arquivarAluno } from '@/lib/notion/alunos'
import { buscarContratoAtivo, atualizarStatusContrato } from '@/lib/notion/contratos'
import type { AlunoFormData } from '@/types'

export async function criarAluno(data: AlunoFormData) {
  try {
    const aluno = await criarAlunoNotion(data)
    revalidatePath('/alunos')
    redirect(`/alunos/${aluno.id}`)
  } catch (error) {
    console.error('[Action: criarAluno]', error)
    throw new Error('Não foi possível criar o aluno. Tente novamente.')
  }
}

export async function editarAluno(id: string, data: Partial<AlunoFormData>) {
  try {
    await atualizarAluno(id, data)
    revalidatePath(`/alunos/${id}`)
    revalidatePath('/alunos')
    redirect(`/alunos/${id}`)
  } catch (error) {
    console.error('[Action: editarAluno]', error)
    throw new Error('Não foi possível atualizar o aluno.')
  }
}

export async function inativarAluno(id: string) {
  try {
    // Inativar aluno
    await arquivarAluno(id)

    // Cancelar contrato ativo, se existir
    const contrato = await buscarContratoAtivo(id)
    if (contrato) {
      await atualizarStatusContrato(contrato.id, 'cancelado')
    }

    revalidatePath('/alunos')
    redirect('/alunos')
  } catch (error) {
    console.error('[Action: inativarAluno]', error)
    throw new Error('Não foi possível inativar o aluno.')
  }
}
```

---

## Padrão 5: Metric Card do Dashboard

```typescript
// src/components/dashboard/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  titulo: string
  valor: string | number
  descricao?: string
  icone?: React.ReactNode
  destaque?: 'normal' | 'alerta' | 'sucesso'
}

const destaqueClasses = {
  normal:  '',
  alerta:  'border-destructive/50 bg-destructive/5',
  sucesso: 'border-green-500/50 bg-green-50',
}

export function MetricCard({ titulo, valor, descricao, icone, destaque = 'normal' }: MetricCardProps) {
  return (
    <Card className={destaqueClasses[destaque]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {titulo}
        </CardTitle>
        {icone && <div className="text-muted-foreground">{icone}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        {descricao && (
          <p className="text-xs text-muted-foreground mt-1">{descricao}</p>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Padrão 6: Sidebar de Navegação

```typescript
// src/components/layout/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Calendar,
  DollarSign, FileText, Music
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',   icone: LayoutDashboard },
  { href: '/alunos',     label: 'Alunos',       icone: Users },
  { href: '/agenda',     label: 'Agenda',       icone: Calendar },
  { href: '/financeiro', label: 'Financeiro',   icone: DollarSign },
  { href: '/contratos',  label: 'Contratos',    icone: FileText },
  { href: '/planos',     label: 'Planos',       icone: Music },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg">🎵 Escola</h1>
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
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                ativo
                  ? 'bg-primary text-primary-foreground font-medium'
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
```

---

## Padrão 7: Layout Autenticado

```typescript
// src/app/(app)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

---

## Padrão 8: Empty State e Loading Skeleton

```typescript
// Skeleton para tabelas (usar em Suspense)
import { Skeleton } from '@/components/ui/skeleton'

export function TabelaSkeleton({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: linhas }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

// Empty state genérico
interface EmptyStateProps {
  mensagem: string
  acao?: { label: string; href: string }
}

export function EmptyState({ mensagem, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-muted-foreground">{mensagem}</p>
      {acao && (
        <a href={acao.href} className="mt-4 text-sm text-primary underline-offset-4 hover:underline">
          {acao.label}
        </a>
      )}
    </div>
  )
}
```
