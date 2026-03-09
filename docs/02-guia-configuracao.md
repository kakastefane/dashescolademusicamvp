# 02 — Guia de Configuração: Notion API + Ambiente

## 1. Criar a Notion Integration

1. Acesse [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Clique em **"New integration"**
3. Preencha:
   - **Name:** `Escola de Música MVP`
   - **Associated workspace:** seu workspace
   - **Type:** Internal
4. Em **Capabilities**, marque:
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
5. Clique em **Save** e copie o **Internal Integration Secret** — esse é o `NOTION_API_KEY`

---

## 2. Criar as Databases no Notion

Crie cada database como **Full page** (não inline). Após criar, copie o ID da URL:

```
https://notion.so/seu-workspace/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...
                                └─────────────── ID ───────────────┘
```

### 2.1 Database: Planos

| Campo | Tipo | Opções/Config |
|---|---|---|
| Nome do Plano | **Title** | — |
| Duração | **Select** | mensal, trimestral, semestral, anual |
| Aulas por semana | **Number** | Formato: Number |
| Valor | **Number** | Formato: R$ (BRL) |
| Descrição | **Text** | — |

> Crie este primeiro pois Contratos vai referenciar ele.

---

### 2.2 Database: Professores

| Campo | Tipo | Opções/Config |
|---|---|---|
| Nome | **Title** | — |
| Instrumentos | **Multi-select** | violao, guitarra, baixo, bateria, piano, teclado, canto, violino, flauta, saxofone, outro |
| Telefone | **Phone** | — |
| Disponibilidade | **Text** | — |
| Status | **Select** | ativo, inativo |

---

### 2.3 Database: Alunos

| Campo | Tipo | Opções/Config |
|---|---|---|
| Nome | **Title** | — |
| Telefone | **Phone** | — |
| Email | **Email** | — |
| Responsável | **Text** | Para menores de idade |
| Instrumentos | **Multi-select** | (mesmas opções de Professores) |
| Status | **Select** | ativo, inativo, trancado |
| Data Início | **Date** | — |
| Observações | **Text** | — |

---

### 2.4 Database: Contratos

| Campo | Tipo | Opções/Config |
|---|---|---|
| Título | **Title** | Ex: "João Silva — Plano Mensal" |
| Aluno | **Relation** | → Database: Alunos |
| Plano | **Relation** | → Database: Planos |
| Data Início | **Date** | — |
| Data Fim | **Date** | — |
| Status | **Select** | ativo, expirado, cancelado |
| Valor Mensal | **Rollup** | Relation: Plano → Field: Valor → Calculate: Sum |

---

### 2.5 Database: Pagamentos

| Campo | Tipo | Opções/Config |
|---|---|---|
| Referência | **Title** | Ex: "Mensalidade Março/2026 — João" |
| Aluno | **Relation** | → Database: Alunos |
| Valor | **Number** | Formato: R$ (BRL) |
| Vencimento | **Date** | — |
| Data Pagamento | **Date** | — |
| Status | **Select** | pendente, pago, atrasado, cancelado |
| Forma de Pagamento | **Select** | pix, dinheiro, cartao_debito, cartao_credito, boleto |
| Observações | **Text** | — |

---

### 2.6 Database: Aulas

| Campo | Tipo | Opções/Config |
|---|---|---|
| Título | **Title** | Gerado automaticamente pela app |
| Aluno | **Relation** | → Database: Alunos |
| Professor | **Relation** | → Database: Professores |
| Data e Hora | **Date** | Incluir horário: sim |
| Duração (min) | **Number** | Formato: Number |
| Instrumento | **Select** | (mesmas opções) |
| Status | **Select** | agendada, realizada, cancelada, faltou, reposicao |
| Tipo | **Select** | fixa, avulsa, reposicao |
| Observações | **Text** | — |
| Aula Origem | **Relation** | → Database: Aulas (self-relation, para reposições) |

---

## 3. Conectar as Databases à Integration

Para **cada uma das 6 databases**:

1. Abra a database no Notion
2. Clique em **"..."** (menu superior direito)
3. Vá em **"Connections"** → **"Add connections"**
4. Busque e selecione **"Escola de Música MVP"**
5. Confirme

> ⚠️ Este passo é obrigatório. Sem ele, a API retorna 404 mesmo com o token correto.

---

## 4. Configurar o Projeto Next.js

### 4.1 Criar o projeto

```bash
npx create-next-app@latest escola-musica \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 4.2 Instalar dependências

```bash
# Cliente Notion
npm install @notionhq/client

# shadcn/ui (inicializar)
npx shadcn@latest init

# Componentes shadcn que vamos usar
npx shadcn@latest add button badge table dialog input select
npx shadcn@latest add form card separator skeleton toast
```

### 4.3 Criar o `.env.local`

```bash
cp .env.example .env.local
```

Preencha com os valores reais:
- `NOTION_API_KEY` → o secret copiado no passo 1
- Cada `NOTION_DB_*` → o ID copiado da URL de cada database

### 4.4 Criar o cliente Notion (`src/lib/notion/client.ts`)

```typescript
import { Client } from '@notionhq/client'

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})
```

### 4.5 Mapear IDs das databases (`src/lib/notion/databases.ts`)

```typescript
export const DB = {
  alunos:      process.env.NOTION_DB_ALUNOS!,
  professores: process.env.NOTION_DB_PROFESSORES!,
  aulas:       process.env.NOTION_DB_AULAS!,
  pagamentos:  process.env.NOTION_DB_PAGAMENTOS!,
  contratos:   process.env.NOTION_DB_CONTRATOS!,
  planos:      process.env.NOTION_DB_PLANOS!,
} as const
```

---

## 5. Testar a Conexão

Crie um arquivo temporário `src/app/api/test-notion/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { notion } from '@/lib/notion/client'
import { DB } from '@/lib/notion/databases'

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: DB.alunos,
      page_size: 1,
    })
    return NextResponse.json({
      ok: true,
      totalResultados: response.results.length,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
```

Acesse `http://localhost:3000/api/test-notion` — deve retornar `{ "ok": true }`.

> Remova este endpoint antes de fazer deploy.

---

## 6. Boas Práticas com a Notion API

### Rate Limit
A Notion API limita em **3 requisições por segundo**. Para o MVP isso raramente será problema, mas evite:
- Fazer múltiplas queries em paralelo em componentes de listagem
- Loops que chamam a API em cada iteração

### Paginação
A Notion API retorna no máximo **100 itens** por query. Para listar todos os alunos:

```typescript
async function queryAll(database_id: string) {
  const results = []
  let cursor: string | undefined

  do {
    const response = await notion.databases.query({
      database_id,
      start_cursor: cursor,
      page_size: 100,
    })
    results.push(...response.results)
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return results
}
```

### Segurança
- O `NOTION_API_KEY` **nunca** deve ser usado no cliente. Use sempre Server Components ou Server Actions.
- Não exponha os IDs das databases em variáveis `NEXT_PUBLIC_*`.
