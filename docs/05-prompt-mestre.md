# PROMPT MESTRE — Escola de Música MVP

> Leia este arquivo inteiro antes de escrever qualquer código.
> Ele define o projeto, as decisões técnicas, as convenções e o que NÃO fazer.

---

## O que é este projeto

Sistema de gestão para uma escola de música. Permite gerenciar alunos, agenda de aulas, pagamentos, contratos e planos. É um MVP interno usado pelo dono da escola.

**Usuário:** administrador único (dono da escola).  
**Acesso:** protegido por login com e-mail e senha.  
**Escopo:** web, responsivo, mas otimizado para desktop.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| IDE | Antigravity (Google) | — |
| Framework | Next.js | 15 (App Router) |
| Linguagem | TypeScript | strict mode |
| Estilização | Tailwind CSS | v3 |
| Componentes | shadcn/ui | latest |
| Banco de dados | Notion API | via @notionhq/client |
| Auth | NextAuth.js | v5 |
| Deploy | Vercel | — |

---

## Estrutura de arquivos importantes

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   └── (app)/
│       ├── layout.tsx              ← layout com sidebar
│       ├── dashboard/page.tsx
│       ├── alunos/
│       ├── agenda/
│       ├── financeiro/
│       ├── contratos/
│       └── planos/
├── components/
│   ├── ui/                         ← gerado pelo shadcn, NUNCA editar manualmente
│   ├── layout/sidebar.tsx
│   └── [modulo]/                   ← componentes específicos por módulo
├── lib/
│   └── notion/
│       ├── client.ts               ← instância única do Client
│       ├── databases.ts            ← IDs das databases
│       ├── alunos.ts
│       ├── aulas.ts
│       ├── pagamentos.ts
│       ├── contratos.ts
│       ├── planos.ts
│       └── professores.ts
├── actions/                        ← Server Actions, um arquivo por módulo
└── types/
    ├── index.ts                    ← tipos de domínio
    └── notion.ts                   ← helpers de extração do Notion
```

---

## Regras absolutas (NUNCA violar)

1. **NUNCA usar `NEXT_PUBLIC_` para variáveis do Notion.** O token e os IDs das databases só existem no servidor.
2. **NUNCA chamar a Notion API diretamente em Client Components.** Use Server Components ou Server Actions.
3. **NUNCA editar arquivos em `src/components/ui/`.** Eles são gerados pelo shadcn/ui.
4. **NUNCA usar `any` em TypeScript.** Se não souber o tipo, use `unknown` e trate.
5. **NUNCA fazer fetch sem tratamento de erro.** Toda chamada à Notion API deve ter try/catch.
6. **NUNCA criar um novo componente shadcn manualmente.** Use sempre `npx shadcn@latest add [componente]`.
7. **NUNCA usar `<form>` com action direta.** Use sempre `useActionState` ou `startTransition` com Server Actions.

---

## Convenções de código

### Nomenclatura
- Arquivos de componentes: `kebab-case.tsx` (ex: `aluno-card.tsx`)
- Arquivos de lib/actions: `kebab-case.ts`
- Tipos e interfaces: `PascalCase`
- Funções e variáveis: `camelCase`
- Constantes globais: `UPPER_SNAKE_CASE`

### Componentes
- Prefira **Server Components** por padrão
- Adicione `'use client'` apenas quando necessário (hooks, eventos, estado)
- Props sempre tipadas com `interface`, nunca `type` inline em componentes
- Componentes de página não recebem props — usam `params` e `searchParams` do Next.js

### Server Actions
```typescript
// Padrão de Server Action
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function criarAluno(formData: AlunoFormData) {
  try {
    await notion.pages.create({ ... })
    revalidatePath('/alunos')
    redirect('/alunos')
  } catch (error) {
    // Nunca deixar o erro silencioso
    console.error('[criarAluno]', error)
    throw new Error('Erro ao criar aluno. Tente novamente.')
  }
}
```

### Queries Notion
```typescript
// Padrão de query na lib/notion/
export async function listarAlunos(filtros?: AlunoFiltros) {
  const response = await notion.databases.query({
    database_id: DB.alunos,
    filter: filtros?.status ? {
      property: 'Status',
      select: { equals: filtros.status }
    } : undefined,
    sorts: [{ property: 'Nome', direction: 'ascending' }],
    page_size: 100,
  })
  return response.results.map(mapearAluno)
}

// Sempre mapear para o tipo de domínio — NUNCA retornar PageObjectResponse cru
function mapearAluno(page: PageObjectResponse): Aluno {
  return {
    id: page.id,
    nome: getTitle(page, 'Nome'),
    // ...
  }
}
```

---

## Banco de dados — Nomes exatos das propriedades no Notion

> Use estes nomes EXATAMENTE ao fazer queries. Diferença de maiúscula/minúscula quebra a API.

### Database: Alunos
| Campo no código | Nome no Notion | Tipo |
|---|---|---|
| nome | `Nome` | title |
| telefone | `Telefone` | phone |
| email | `Email` | email |
| responsavel | `Responsável` | rich_text |
| instrumentos | `Instrumentos` | multi_select |
| status | `Status` | select |
| dataInicio | `Data Início` | date |
| observacoes | `Observações` | rich_text |

### Database: Aulas
| Campo no código | Nome no Notion | Tipo |
|---|---|---|
| alunoId | `Aluno` | relation |
| professorId | `Professor` | relation |
| dataHora | `Data e Hora` | date |
| duracaoMinutos | `Duração (min)` | number |
| instrumento | `Instrumento` | select |
| status | `Status` | select |
| tipo | `Tipo` | select |
| observacoes | `Observações` | rich_text |
| aulaOrigemId | `Aula Origem` | relation |

### Database: Pagamentos
| Campo no código | Nome no Notion | Tipo |
|---|---|---|
| referencia | `Referência` | title |
| alunoId | `Aluno` | relation |
| valor | `Valor` | number |
| vencimento | `Vencimento` | date |
| dataPagamento | `Data Pagamento` | date |
| status | `Status` | select |
| formaPagamento | `Forma de Pagamento` | select |
| observacoes | `Observações` | rich_text |

### Database: Contratos
| Campo no código | Nome no Notion | Tipo |
|---|---|---|
| titulo | `Título` | title |
| alunoId | `Aluno` | relation |
| planoId | `Plano` | relation |
| dataInicio | `Data Início` | date |
| dataFim | `Data Fim` | date |
| status | `Status` | select |
| valorMensal | `Valor Mensal` | rollup |

### Database: Planos
| Campo no código | Nome no Notion | Tipo |
|---|---|---|
| nome | `Nome do Plano` | title |
| duracao | `Duração` | select |
| aulasPorSemana | `Aulas por semana` | number |
| valor | `Valor` | number |
| descricao | `Descrição` | rich_text |

### Database: Professores
| Campo no código | Nome no Notion | Tipo |
|---|---|---|
| nome | `Nome` | title |
| instrumentos | `Instrumentos` | multi_select |
| telefone | `Telefone` | phone |
| disponibilidade | `Disponibilidade` | rich_text |
| status | `Status` | select |

---

## IDs e variáveis de ambiente

```bash
# Todas as variáveis necessárias:
NOTION_API_KEY=
NOTION_DB_ALUNOS=
NOTION_DB_PROFESSORES=
NOTION_DB_AULAS=
NOTION_DB_PAGAMENTOS=
NOTION_DB_CONTRATOS=
NOTION_DB_PLANOS=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXTAUTH_ADMIN_EMAIL=
NEXTAUTH_ADMIN_PASSWORD=
```

---

## O que cada módulo faz (resumo)

- **Alunos:** CRUD completo. Status: ativo/inativo/trancado. Cada aluno tem um contrato ativo que define o plano.
- **Agenda:** Aulas têm data/hora, professor, aluno, status. Tipos: fixa (semanal recorrente), avulsa, reposição.
- **Financeiro:** Pagamentos mensais por aluno. Geração em batch. Status: pendente/pago/atrasado/cancelado.
- **Contratos:** Vínculo entre aluno e plano com vigência. Ao criar contrato, gerar primeiro pagamento automaticamente.
- **Planos:** Tabela de preços. Define duração, aulas/semana e valor mensal.
- **Dashboard:** Métricas do mês + alertas de inadimplência e contratos vencendo.

---

## Limitações conhecidas do Notion API

- Rate limit: **3 req/segundo**. Nunca fazer chamadas em loop sem delay.
- Máximo de **100 itens** por query. Para listar tudo, use paginação com `start_cursor`.
- Relações retornam apenas os IDs — para obter os dados do item relacionado, fazer uma segunda query.
- Rollups são somente leitura — não podem ser criados/atualizados via API.
- Não há transações — se uma operação falhar na metade, o estado pode ficar inconsistente. Trate isso nos casos de borda.

---

## Contexto de negócio importante

- Aulas têm duração padrão de **50 minutos**
- Mensalidades vencem todo dia **10** de cada mês por padrão
- Uma reposição só pode ser criada se houver uma aula com status **"faltou"** vinculada ao aluno
- Ao **arquivar um aluno** (status → inativo), o contrato ativo deve ser marcado como **cancelado**
- Ao **criar um contrato**, calcular `dataFim` automaticamente: mensal = +1 mês, trimestral = +3 meses, semestral = +6 meses, anual = +12 meses
- **Não deletar** registros no Notion — sempre arquivar/cancelar. Isso preserva o histórico.
