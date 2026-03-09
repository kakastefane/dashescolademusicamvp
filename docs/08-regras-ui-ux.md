# 08 — Regras de UI/UX

> O agente deve seguir estas regras ao criar qualquer tela ou componente visual.
> O objetivo é consistência — não inventar padrões novos a cada componente.

---

## Paleta de Cores (via Tailwind + shadcn)

Use sempre as variáveis semânticas do shadcn/ui. **Não use cores hardcoded** como `text-blue-500`.

| Uso | Classe Tailwind |
|---|---|
| Texto principal | `text-foreground` |
| Texto secundário / labels | `text-muted-foreground` |
| Fundo de página | `bg-background` |
| Fundo de card | `bg-card` |
| Bordas | `border` (usa `border-border`) |
| Cor de destaque (botão primário) | `bg-primary text-primary-foreground` |
| Erro / alerta crítico | `text-destructive` / `bg-destructive/10` |
| Sucesso | `text-green-600` / `bg-green-50` |
| Aviso | `text-yellow-600` / `bg-yellow-50` |

---

## Badges de Status

Use sempre `<Badge>` do shadcn com variant semântico:

```typescript
// Alunos
ativo    → <Badge>Ativo</Badge>                        // variant="default"
inativo  → <Badge variant="secondary">Inativo</Badge>
trancado → <Badge variant="destructive">Trancado</Badge>

// Pagamentos
pendente  → <Badge variant="outline">Pendente</Badge>
pago      → <Badge className="bg-green-100 text-green-700 border-green-200">Pago</Badge>
atrasado  → <Badge variant="destructive">Atrasado</Badge>
cancelado → <Badge variant="secondary">Cancelado</Badge>

// Aulas
agendada  → <Badge variant="outline">Agendada</Badge>
realizada → <Badge className="bg-green-100 text-green-700 border-green-200">Realizada</Badge>
cancelada → <Badge variant="secondary">Cancelada</Badge>
faltou    → <Badge variant="destructive">Faltou</Badge>
reposicao → <Badge className="bg-blue-100 text-blue-700 border-blue-200">Reposição</Badge>

// Contratos
ativo    → <Badge>Ativo</Badge>
expirado → <Badge variant="secondary">Expirado</Badge>
cancelado → <Badge variant="destructive">Cancelado</Badge>
```

---

## Layout de Páginas

### Estrutura padrão de página de listagem

```
┌─ Sidebar (w-56, fixo) ────┬─ Main (flex-1, p-8) ────────────────────────┐
│                            │  [H1 + subtítulo]         [Botão Ação]       │
│  Dashboard                 │                                               │
│  Alunos              ◄─   │  [Filtros / busca]                            │
│  Agenda                    │                                               │
│  Financeiro                │  [Tabela / Cards]                             │
│  Contratos                 │                                               │
│  Planos                    │                                               │
└────────────────────────────┴───────────────────────────────────────────────┘
```

### Header de página
```typescript
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold">Título da Página</h1>
    <p className="text-sm text-muted-foreground">subtítulo opcional</p>
  </div>
  <Button>Ação Principal</Button>
</div>
```

### Estrutura de formulário
- Formulários dentro de `<Card>` com `<CardContent className="pt-6">`
- Max width: `max-w-lg` para formulários simples, `max-w-2xl` para formulários complexos
- Campos obrigatórios marcados com `*` no label
- Botões ao final: primário à esquerda, cancelar à direita
- Espaçamento entre campos: `space-y-4` ou `space-y-6`
- Campos em grid quando fizerem sentido lado a lado: `grid grid-cols-2 gap-4`

---

## Componentes shadcn — qual usar em cada situação

| Situação | Componente |
|---|---|
| Listagem de dados | `Table` |
| Cartões de métricas | `Card` + `CardHeader` + `CardContent` |
| Formulários | `Input`, `Label`, `Select`, `Textarea` |
| Confirmação de ação destrutiva | `AlertDialog` |
| Formulário em overlay | `Dialog` (não Sheet) |
| Toasts de feedback | `toast` (via `useToast`) |
| Datas | `Input type="date"` (não instalar date-picker por ora) |
| Loading inline | `Skeleton` |
| Separadores visuais | `Separator` |
| Abas de conteúdo | `Tabs` |

---

## Feedback de Ações (UX)

### Sempre mostrar feedback após Server Actions

```typescript
// Em Client Components que chamam Server Actions:
const [isPending, startTransition] = useTransition()

// Botão de submit:
<Button disabled={isPending}>
  {isPending ? 'Salvando...' : 'Salvar'}
</Button>

// Toast de sucesso (após redirect não é necessário — a mudança de página é o feedback)
// Toast de erro:
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()
// ...
toast({
  title: 'Erro ao salvar',
  description: 'Verifique os dados e tente novamente.',
  variant: 'destructive',
})
```

### Estados obrigatórios em toda listagem

1. **Loading:** `<TabelaSkeleton />` dentro de `<Suspense>`
2. **Empty:** `<EmptyState mensagem="Nenhum aluno cadastrado" acao={{ label: '+ Novo Aluno', href: '/alunos/novo' }} />`
3. **Erro:** mostrar mensagem descritiva, nunca stack trace

---

## Tipografia

| Elemento | Classe |
|---|---|
| Título de página (H1) | `text-2xl font-bold` |
| Título de seção (H2) | `text-lg font-semibold` |
| Título de card | `text-sm font-medium` |
| Corpo de texto | padrão (herda do body) |
| Label de campo | `text-sm font-medium` (via `<Label>`) |
| Texto de apoio | `text-sm text-muted-foreground` |
| Valor monetário | `font-mono` (ex: R$ 350,00) |
| Datas | `text-sm` |

---

## Tabelas

- Sempre com `<div className="rounded-md border">` envolvendo o `<Table>`
- Coluna de ações sempre `text-right`
- Coluna de valor monetário: `text-right font-mono`
- Coluna de status: centralizada
- Linhas clicáveis usam `hover:bg-muted/50 cursor-pointer`
- Máximo de 6 colunas visíveis — omitir menos importantes em telas menores

---

## Responsividade

O sistema é primariamente desktop. Responsividade mínima:
- Sidebar colapsa em mobile (botão hamburguer no header)
- Tabelas com `overflow-x-auto`
- Formulários: single column em mobile (`grid-cols-1 sm:grid-cols-2`)
- Cards do dashboard: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

## Ícones

Use sempre `lucide-react` (já vem com shadcn/ui).

| Módulo | Ícone |
|---|---|
| Dashboard | `LayoutDashboard` |
| Alunos | `Users` |
| Agenda / Aula | `Calendar` |
| Financeiro | `DollarSign` |
| Contratos | `FileText` |
| Planos | `Music` |
| Editar | `Pencil` |
| Arquivar / Inativar | `Archive` |
| Pago / Sucesso | `CheckCircle` |
| Atrasado / Alerta | `AlertCircle` |
| Ver detalhe | `ChevronRight` |
| Fechar / Cancelar | `X` |

---

## O que NÃO fazer

- ❌ Não instalar bibliotecas de UI além do shadcn sem necessidade (ex: MUI, Chakra, Mantine)
- ❌ Não criar CSS customizado — use apenas Tailwind
- ❌ Não usar cores hardcoded (`text-blue-500`) — use variáveis semânticas
- ❌ Não usar `style={{}}` inline para layout — use classes Tailwind
- ❌ Não criar modais sem usar o componente `Dialog` do shadcn
- ❌ Não deixar estados de loading/empty sem tratamento
- ❌ Não criar componentes duplicados — verificar se já existe em `src/components/` antes de criar
