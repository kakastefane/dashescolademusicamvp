# 03 — Especificação Funcional das Telas

## Convenções

- **Rota:** path no App Router
- **Tipo:** Server Component (SC) ou Client Component (CC)
- **Dados:** queries necessárias à Notion API
- **Ações:** mutations (Server Actions)

---

## 🏠 Dashboard

**Rota:** `/dashboard`  
**Tipo:** SC com islands de CC para interatividade

### Layout
- Grid de 4 metric cards no topo
- Seção "Aulas de Hoje" (lista compacta)
- Seção "Alertas" (inadimplentes + contratos vencendo)

### Metric Cards
| Card | Dado | Fonte |
|---|---|---|
| Alunos Ativos | COUNT alunos com status=ativo | DB Alunos |
| Aulas Hoje | COUNT aulas com data=hoje e status=agendada | DB Aulas |
| Receita do Mês | SUM pagamentos pago no mês atual | DB Pagamentos |
| Inadimplentes | COUNT pagamentos atrasados (distintos por aluno) | DB Pagamentos |

### Seção Alertas
- Lista de alunos com pagamento **atrasado** → link para `/financeiro?status=atrasado`
- Lista de contratos que **vencem nos próximos 30 dias** → link para `/contratos/[id]`

---

## 👥 Alunos

### `/alunos` — Listagem
**Tipo:** SC

**Elementos:**
- Barra de busca por nome (CC — filtra client-side após load)
- Filtro por status (ativo / inativo / trancado)
- Filtro por instrumento
- Botão "Novo Aluno" → `/alunos/novo`
- Tabela com colunas: Nome, Instrumento(s), Status, Plano Atual, Pagamentos Pendentes, Ações

**Dados:** `notion.databases.query(DB.alunos)` com filtro de status se aplicável

---

### `/alunos/novo` — Cadastro
**Tipo:** CC (formulário)

**Campos:**
- Nome* (text)
- Telefone* (text)
- Email (text)
- Responsável (text — exibir se marcar "menor de idade")
- Instrumentos* (multi-select)
- Data de Início* (date)
- Observações (textarea)

**Ação ao salvar:** Server Action `criarAluno()` → `notion.pages.create()` → redirect para `/alunos/[id]`

---

### `/alunos/[id]` — Detalhe
**Tipo:** SC

**Seções:**
1. **Header:** Nome, status badge, instrumentos, data de início — botão "Editar"
2. **Contrato Atual:** plano, vigência, valor — botão "Ver Contrato"
3. **Próximas Aulas:** lista das próximas 5 aulas agendadas
4. **Histórico de Pagamentos:** últimos 6 meses com status de cada um
5. **Observações**

**Dados:**
- `notion.pages.retrieve(id)` — dados do aluno
- `notion.databases.query(DB.aulas, filter: alunoId)` — próximas aulas
- `notion.databases.query(DB.pagamentos, filter: alunoId)` — pagamentos

---

### `/alunos/[id]/editar` — Edição
**Tipo:** CC  
Mesmo formulário de `/alunos/novo` pré-preenchido.  
**Ação:** Server Action `atualizarAluno()` → `notion.pages.update()`

---

## 🗓️ Agenda

### `/agenda` — Visualização Semanal
**Tipo:** CC (navegação entre semanas é client-side)

**Layout:**
- Navegação de semana (← semana anterior | semana atual | semana seguinte →)
- Grade de 7 colunas (dias da semana) × horários (08h–20h)
- Cada aula aparece como card colorido na grade
- Cor por professor (definir paleta fixa)

**Filtros:**
- Por professor (select)
- Por status (toggle: mostrar canceladas sim/não)

**Botão:** "Nova Aula" → `/agenda/nova-aula`

**Dados:** `notion.databases.query(DB.aulas, filter: dataHora entre inicio e fim da semana)`

---

### `/agenda/nova-aula` — Cadastrar Aula
**Tipo:** CC

**Campos:**
- Aluno* (select com busca — lista alunos ativos)
- Professor* (select — lista professores ativos)
- Data* (date)
- Horário* (time)
- Duração* (select: 30min, 45min, 60min)
- Instrumento* (select)
- Tipo* (fixa / avulsa / reposição)
- Se reposição: Aula de origem (select — lista aulas com status=faltou do aluno)
- Observações (textarea)

**Ação:** Server Action `criarAula()` → redirect para `/agenda`

---

### `/agenda/[id]` — Detalhe da Aula
**Tipo:** CC

**Elementos:**
- Dados completos da aula
- Botões de status (realizar ✓ | cancelar ✗ | marcar falta !)
- Se faltou: botão "Agendar Reposição" → `/agenda/nova-aula?origem=[id]&alunoId=[alunoId]`

**Ação:** Server Action `atualizarStatusAula(id, status)`

---

## 💰 Financeiro

### `/financeiro` — Listagem de Pagamentos
**Tipo:** SC

**Filtros:**
- Status (pendente / pago / atrasado / cancelado)
- Mês de referência (select mês/ano)
- Busca por nome do aluno

**Tabela:**
| Coluna | Dado |
|---|---|
| Aluno | Nome com link para `/alunos/[id]` |
| Referência | Ex: "Mensalidade Março/2026" |
| Valor | Formatado em R$ |
| Vencimento | Data formatada + ícone de alerta se atrasado |
| Status | Badge colorido |
| Forma Pagamento | Ícone + label |
| Ações | Marcar como pago / Ver detalhes |

**Botão:** "Gerar Mensalidades" → abre dialog de confirmação

**Ação "Gerar Mensalidades":** Server Action `gerarMensalidadesMes(mes, ano)`:
1. Busca todos os alunos ativos com contrato ativo
2. Para cada um, verifica se já existe pagamento naquele mês
3. Cria pagamento pendente para quem não tem

---

### `/financeiro/inadimplentes` — Alunos em Atraso
**Tipo:** SC

**Layout:**
- Tabela com: Aluno, Quantidade de pagamentos em atraso, Valor total em atraso, Último pagamento
- Botão por linha: "Ver pagamentos" → `/financeiro?alunoId=[id]&status=atrasado`

---

## 📄 Contratos

### `/contratos` — Listagem
**Tipo:** SC

**Tabela:**
| Coluna | Dado |
|---|---|
| Aluno | Nome com link |
| Plano | Nome do plano |
| Vigência | Data início → data fim |
| Status | Badge: ativo / expirado / cancelado |
| Valor Mensal | R$ |
| Ações | Ver / Editar |

**Alerta visual** para contratos que vencem em ≤ 30 dias (linha com cor de aviso).

---

### `/contratos/novo` — Novo Contrato
**Tipo:** CC

**Campos:**
- Aluno* (select com busca)
- Plano* (select — lista planos cadastrados com valor exibido)
- Data Início* (date — default: hoje)
- Data Fim* (date — calculada automaticamente baseada na duração do plano)
- Status* (default: ativo)

**Ação:** Server Action `criarContrato()` → também cria o primeiro pagamento pendente

---

## 🎵 Planos

### `/planos` — Listagem e Gerenciamento
**Tipo:** SC + CC (modal de criação inline)

**Layout:**
- Cards de planos existentes com: nome, duração, aulas/semana, valor
- Botão "Novo Plano" → abre dialog

**Dialog Novo Plano:**
- Nome* (text)
- Duração* (select)
- Aulas por semana* (number: 1, 2 ou 3)
- Valor* (number — R$)
- Descrição (textarea)

**Ação:** Server Action `criarPlano()`

---

## 🔐 Autenticação

### `/login`
**Tipo:** CC

**Layout simples:**
- Logo / nome da escola
- Campo de e-mail e senha
- Botão entrar

**Estratégia MVP:** Usuário único hardcoded via `NEXTAUTH_ADMIN_EMAIL` e `NEXTAUTH_ADMIN_PASSWORD` no `.env.local`, usando NextAuth com `CredentialsProvider`.

> Para v2: múltiplos usuários com perfis (admin, professor).

---

## Fluxo de Navegação

```
Login
  └── Dashboard
        ├── Alunos ──────── Novo Aluno
        │     └── [Detalhe] ── Editar
        │                  ── Ver Contrato
        │
        ├── Agenda ──────── Nova Aula
        │     └── [Detalhe] ── Atualizar Status
        │                  ── Agendar Reposição
        │
        ├── Financeiro ───── Inadimplentes
        │     └── Gerar Mensalidades (dialog)
        │
        ├── Contratos ────── Novo Contrato
        │     └── [Detalhe] ── Editar
        │
        └── Planos ──────── Novo Plano (dialog inline)
```
