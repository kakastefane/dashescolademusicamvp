# 09 — Casos de Borda e Comportamentos Especiais

> Estes são os cenários não-óbvios que o agente deve tratar corretamente.
> Cada caso descreve o que acontece, por que acontece e como resolver.

---

## Notion API

### Rate Limit (3 req/segundo)

**Quando ocorre:** Múltiplas queries simultâneas — ex: carregar dashboard com 5 métricas ao mesmo tempo.

**Sintoma:** Erro `APIResponseError: rate_limited` ou status 429.

**Solução para o MVP:** Usar `Promise.all` apenas para queries independentes. Para casos críticos, adicionar delay:

```typescript
// ✅ Correto — queries independentes em paralelo (até 3)
const [alunos, aulas, pagamentos] = await Promise.all([
  listarAlunos(),
  listarAulasHoje(),
  listarPagamentosMes(),
])

// ❌ Evitar — loop que chama API em cada iteração
for (const aluno of alunos) {
  await buscarContratoAtivo(aluno.id) // dispara uma query por aluno
}

// ✅ Alternativa para o loop — buscar tudo de uma vez e filtrar
const contratos = await listarContratos()
const contratosPorAluno = Object.fromEntries(
  contratos.map(c => [c.alunoId, c])
)
```

---

### Aluno sem contrato ativo

**Quando ocorre:** Aluno recém-cadastrado, ou com contrato expirado/cancelado.

**Comportamento esperado:**
- Na tela de detalhe do aluno: exibir aviso "Sem contrato ativo" com botão "Criar Contrato"
- Na geração de mensalidades: **pular** este aluno (não criar pagamento)
- No dashboard: não contar na receita prevista

```typescript
const contrato = await buscarContratoAtivo(aluno.id)

if (!contrato) {
  // Mostrar aviso, não lançar erro
  return <SemContratoAlert alunoId={aluno.id} />
}
```

---

### Geração de mensalidade duplicada

**Quando ocorre:** Admin clica em "Gerar Mensalidades" mais de uma vez no mesmo mês.

**Comportamento esperado:** Não criar duplicata. Verificar antes de criar.

```typescript
// Em actions/pagamentos.ts
export async function gerarMensalidadesMes(mes: number, ano: number) {
  const alunosAtivos = await listarAlunos({ status: 'ativo' })
  const resultados = { criados: 0, pulados: 0, erros: 0 }

  for (const aluno of alunosAtivos) {
    const contrato = await buscarContratoAtivo(aluno.id)
    if (!contrato) { resultados.pulados++; continue }

    const jaExiste = await verificarPagamentoExistente(aluno.id, mes, ano)
    if (jaExiste) { resultados.pulados++; continue }

    try {
      const vencimento = `${ano}-${String(mes).padStart(2, '0')}-10`
      await criarPagamento({
        referencia: gerarReferenciaMensalidade(aluno.nome, mes, ano),
        alunoId: aluno.id,
        valor: contrato.valorMensal,
        vencimento,
      })
      resultados.criados++
    } catch {
      resultados.erros++
    }
  }

  revalidatePath('/financeiro')
  return resultados
}
```

---

### Reposição de aula

**Quando ocorre:** Aluno faltou e precisa de uma aula de reposição.

**Regra de negócio:**
1. Só pode criar reposição se houver aula com status `faltou` vinculada ao aluno
2. A reposição referencia a aula original (`aulaOrigemId`)
3. Status inicial da reposição: `agendada`
4. Status `tipo`: `reposicao`

**No formulário de nova aula:**
```typescript
// Buscar aulas com status "faltou" do aluno selecionado
const aulasFaltadas = aulasPorAluno.filter(a => a.status === 'faltou')

// Se nenhuma, desabilitar a opção "Reposição" no select de tipo
// e mostrar tooltip: "O aluno não tem faltas pendentes de reposição"
```

---

### Inativar aluno com pagamentos pendentes

**Quando ocorre:** Admin tenta inativar aluno que tem pagamentos em aberto.

**Comportamento esperado:** Alertar o admin, mas permitir a inativação após confirmação.

```typescript
// Antes de inativar, verificar
const pagamentosPendentes = await listarPagamentos({
  alunoId: id,
  status: 'pendente'
})

if (pagamentosPendentes.length > 0) {
  // Mostrar AlertDialog de confirmação:
  // "Este aluno tem X pagamento(s) pendente(s). Deseja continuar?"
  // Botões: "Cancelar" e "Confirmar inativação"
}
```

---

### Contrato expirado mas aluno ainda tem aulas

**Quando ocorre:** Contrato chegou na data fim mas o aluno continua tendo aulas.

**Comportamento esperado:**
- Exibir badge "Contrato Expirado" no detalhe do aluno
- Exibir alerta no dashboard em "Contratos Vencendo" (se ainda não venceu) ou em log de avisos
- **Não bloquear** o agendamento de aulas — isso é decisão do admin
- Na geração de mensalidades: pular aluno sem contrato ativo

---

### Notion API retorna relação vazia

**Quando ocorre:** Página foi criada mas a relação ainda não foi preenchida, ou foi desvinculada manualmente no Notion.

**Sintoma:** `getRelationIds(page, 'Aluno')` retorna `[]`, causando `alunoId = ''`.

**Tratamento:**

```typescript
function mapearAula(page: PageObjectResponse): Aula {
  const alunoIds = getRelationIds(page, 'Aluno')

  // Nunca deixar passar com ID vazio — pode causar queries inválidas
  if (alunoIds.length === 0) {
    console.warn(`[mapearAula] Aula ${page.id} sem aluno vinculado`)
  }

  return {
    id: page.id,
    alunoId: alunoIds[0] ?? '',
    // ...
  }
}

// Na UI, tratar alunoId vazio:
{aula.alunoId
  ? <Link href={`/alunos/${aula.alunoId}`}>{aula.aluno?.nome ?? 'Ver aluno'}</Link>
  : <span className="text-muted-foreground">Aluno não vinculado</span>
}
```

---

### Paginação (mais de 100 registros)

**Quando ocorre:** Escola com muitos alunos ou histórico extenso de pagamentos.

**Implementação para o MVP — carregar tudo de uma vez:**

```typescript
// src/lib/notion/_queryAll.ts
import { notion } from './client'

export async function queryAll(
  database_id: string,
  queryParams: Omit<Parameters<typeof notion.databases.query>[0], 'database_id' | 'start_cursor'>
) {
  const results = []
  let cursor: string | undefined

  do {
    const response = await notion.databases.query({
      ...queryParams,
      database_id,
      start_cursor: cursor,
      page_size: 100,
    })
    results.push(...response.results)
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return results
}
```

> Para o MVP, usar isso apenas nas listagens principais (alunos, pagamentos). Em páginas de detalhe, `page_size: 10` é suficiente.

---

### Rollup `Valor Mensal` no Contrato

**Como funciona:** O campo `Valor Mensal` no Notion é um Rollup que puxa o `Valor` do Plano relacionado.

**Limitação:** Rollups são somente leitura pela API. Ao criar um contrato via API, o Rollup será calculado automaticamente pelo Notion após a criação — não precisa passar o valor.

**Ao ler:** O rollup vem como `type: 'rollup'` com `rollup.type: 'number'`.

```typescript
export function getRollupNumber(page: NotionPage, field: string): number | null {
  const prop = page.properties[field]
  if (prop?.type === 'rollup' && prop.rollup.type === 'number') {
    return prop.rollup.number
  }
  return null
}

// Em contratos.ts, usar getRollupNumber em vez de getNumber para 'Valor Mensal'
valorMensal: getRollupNumber(page, 'Valor Mensal') ?? 0,
```

---

### Erro de autenticação Notion (401/403)

**Causas comuns:**
1. `NOTION_API_KEY` incorreto ou expirado
2. Database não conectada à Integration (passo obrigatório no Notion)
3. ID da database incorreto no `.env`

**Mensagem de erro amigável:**

```typescript
// Em qualquer lib/notion/*.ts, envolver com:
try {
  const response = await notion.databases.query(...)
  // ...
} catch (error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('Could not find database')) {
      throw new Error('Database não encontrada. Verifique se ela está conectada à Integration no Notion.')
    }
    if (error.message.includes('Unauthorized')) {
      throw new Error('Chave da API Notion inválida. Verifique o NOTION_API_KEY no .env.')
    }
  }
  throw error
}
```

---

### Middleware de autenticação

**Rotas protegidas:** tudo em `/(app)/`  
**Rotas públicas:** `/login`

```typescript
// src/middleware.ts
import { auth } from '@/auth' // NextAuth v5
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname === '/login'

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Resumo rápido dos casos críticos

| Situação | Comportamento |
|---|---|
| Aluno sem contrato | Aviso na UI + pular na geração de mensalidades |
| Mensalidade já gerada | Verificar antes de criar — nunca duplicar |
| Rate limit Notion | Não fazer loops de queries — buscar em batch |
| Inativar aluno | Cancelar contrato ativo automaticamente |
| Rollup de valor | Usar `getRollupNumber`, não `getNumber` |
| Relação vazia | Log de warning + tratar na UI sem quebrar |
| Reposição sem falta | Desabilitar opção no formulário |
| Contrato expirado | Alertar admin, não bloquear fluxo |
