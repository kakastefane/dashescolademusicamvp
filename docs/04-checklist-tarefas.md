# 04 — Checklist de Tarefas por Fase

> Use este arquivo como backlog. Cada item é uma tarefa independente e implementável.
> Copie para o Notion, Linear, ou GitHub Issues conforme preferir.

---

## Fase 01 — Setup & Infraestrutura
**Estimativa: ~3 dias**

### Ambiente
- [ ] Criar projeto Next.js 15 com TypeScript, Tailwind e App Router
- [ ] Inicializar shadcn/ui (`npx shadcn@latest init`)
- [ ] Instalar `@notionhq/client`
- [ ] Criar `.env.example` com todas as variáveis necessárias
- [ ] Criar `.env.local` com valores reais (não versionar)
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Inicializar repositório Git

### Notion
- [ ] Criar Notion Integration "Escola de Música MVP"
- [ ] Criar database **Planos** com todos os campos
- [ ] Criar database **Professores** com todos os campos
- [ ] Criar database **Alunos** com todos os campos
- [ ] Criar database **Contratos** com todos os campos e relações
- [ ] Criar database **Pagamentos** com todos os campos e relações
- [ ] Criar database **Aulas** com todos os campos e relações
- [ ] Conectar as 6 databases à Integration
- [ ] Copiar os IDs das databases para o `.env.local`
- [ ] Criar dados de teste: 2 planos, 1 professor, 2 alunos, 2 aulas, 2 pagamentos

### Código Base
- [ ] Criar `src/lib/notion/client.ts` (instância do Client)
- [ ] Criar `src/lib/notion/databases.ts` (mapeamento de IDs)
- [ ] Criar `src/types/index.ts` com todas as tipagens de domínio
- [ ] Criar `src/types/notion.ts` com helpers de extração
- [ ] Criar endpoint de teste `/api/test-notion` e validar conexão
- [ ] Remover endpoint de teste após validação
- [ ] Criar layout raiz `src/app/layout.tsx`
- [ ] Criar layout autenticado `src/app/(app)/layout.tsx` com Sidebar

---

## Fase 02 — Módulo Alunos + Planos
**Estimativa: ~5 dias**

### Lib / Serviço
- [ ] Criar `src/lib/notion/alunos.ts`:
  - [ ] `listarAlunos(filtros?)` — query com filtros opcionais
  - [ ] `buscarAluno(id)` — retrieve de uma página
  - [ ] `criarAluno(data)` — pages.create
  - [ ] `atualizarAluno(id, data)` — pages.update
  - [ ] `arquivarAluno(id)` — atualizar status para inativo
- [ ] Criar `src/lib/notion/planos.ts`:
  - [ ] `listarPlanos()`
  - [ ] `criarPlano(data)`

### Server Actions
- [ ] Criar `src/actions/alunos.ts` com `criarAluno`, `atualizarAluno`, `arquivarAluno`
- [ ] Criar `src/actions/planos.ts` com `criarPlano`

### Telas
- [ ] Instalar componentes shadcn: `table`, `badge`, `input`, `select`, `form`, `dialog`, `card`
- [ ] Criar página `/alunos` com tabela de listagem
- [ ] Criar componente `AlunosTable` com filtro client-side por nome
- [ ] Criar página `/alunos/novo` com formulário completo
- [ ] Criar página `/alunos/[id]` com detalhe do aluno (sem aulas/pagamentos ainda)
- [ ] Criar página `/alunos/[id]/editar`
- [ ] Criar página `/planos` com cards de planos
- [ ] Criar dialog de novo plano dentro de `/planos`
- [ ] Adicionar links de navegação na Sidebar para Alunos e Planos

---

## Fase 03 — Módulo Agenda
**Estimativa: ~5 dias**

### Lib / Serviço
- [ ] Criar `src/lib/notion/professores.ts`:
  - [ ] `listarProfessores()`
- [ ] Criar `src/lib/notion/aulas.ts`:
  - [ ] `listarAulasDaSemana(dataInicio, dataFim)`
  - [ ] `listarAulasPorAluno(alunoId, limite?)`
  - [ ] `buscarAula(id)`
  - [ ] `criarAula(data)`
  - [ ] `atualizarStatusAula(id, status)`

### Server Actions
- [ ] Criar `src/actions/aulas.ts` com `criarAula`, `atualizarStatusAula`

### Telas
- [ ] Criar componente `AgendaSemana` (grade de horários — CC)
- [ ] Criar navegação de semana (← →) com estado client-side
- [ ] Criar componente `AulaCard` (card colorido por professor na grade)
- [ ] Criar página `/agenda` com a grade semanal
- [ ] Criar página `/agenda/nova-aula` com formulário
  - [ ] Select de aluno com busca
  - [ ] Select de professor
  - [ ] Lógica de data/hora/duração
  - [ ] Campo condicional para reposição
- [ ] Criar página `/agenda/[id]` com detalhe + botões de status
- [ ] Implementar Server Action `atualizarStatusAula`
- [ ] Adicionar link de Agenda na Sidebar
- [ ] Atualizar `/alunos/[id]` para exibir próximas aulas do aluno

---

## Fase 04 — Módulo Financeiro + Contratos
**Estimativa: ~5 dias**

### Lib / Serviço
- [ ] Criar `src/lib/notion/pagamentos.ts`:
  - [ ] `listarPagamentos(filtros?)`
  - [ ] `listarPagamentosPorAluno(alunoId)`
  - [ ] `listarInadimplentes()` — alunos com pagamento atrasado
  - [ ] `criarPagamento(data)`
  - [ ] `atualizarStatusPagamento(id, status, formaPagamento?)`
  - [ ] `verificarPagamentoExistente(alunoId, mes, ano)`
- [ ] Criar `src/lib/notion/contratos.ts`:
  - [ ] `listarContratos(filtros?)`
  - [ ] `listarContratosVencendo(dias)` — contratos que vencem em X dias
  - [ ] `buscarContratoAtivo(alunoId)`
  - [ ] `criarContrato(data)`
  - [ ] `atualizarContrato(id, data)`

### Server Actions
- [ ] Criar `src/actions/pagamentos.ts`:
  - [ ] `marcarComoPago(id, formaPagamento)`
  - [ ] `gerarMensalidadesMes(mes, ano)` — batch creation
- [ ] Criar `src/actions/contratos.ts` com `criarContrato`, `atualizarContrato`

### Telas
- [ ] Criar página `/financeiro` com tabela filtrada
- [ ] Criar componente `StatusPagamentoBadge` com cores por status
- [ ] Implementar ação "Marcar como pago" inline na tabela
- [ ] Criar dialog "Gerar Mensalidades" com confirmação
- [ ] Criar página `/financeiro/inadimplentes`
- [ ] Criar página `/contratos` com tabela + alertas visuais
- [ ] Criar página `/contratos/novo` com formulário
  - [ ] Auto-calcular data fim baseada na duração do plano selecionado
- [ ] Criar página `/contratos/[id]`
- [ ] Atualizar `/alunos/[id]` para exibir histórico de pagamentos
- [ ] Adicionar links de Financeiro e Contratos na Sidebar

---

## Fase 05 — Dashboard & Auth
**Estimativa: ~4 dias**

### Dashboard
- [ ] Criar queries de métricas em `src/lib/notion/`:
  - [ ] `contarAlunosAtivos()`
  - [ ] `contarAulasHoje()`
  - [ ] `calcularReceitaMes(mes, ano)` — prevista vs recebida
  - [ ] `contarInadimplentes()`
  - [ ] `listarContratosVencendo(30)`
- [ ] Criar componente `MetricCard`
- [ ] Criar componente `AlertasVencimento`
- [ ] Criar componente `ListaInadimplentes` (top 5)
- [ ] Montar página `/dashboard` com todos os componentes
- [ ] Criar redirect de `/` para `/dashboard`

### Autenticação
- [ ] Instalar `next-auth`
- [ ] Criar `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Configurar `CredentialsProvider` com email/senha do `.env`
- [ ] Adicionar variáveis `NEXTAUTH_ADMIN_EMAIL` e `NEXTAUTH_ADMIN_PASSWORD` ao `.env.example`
- [ ] Criar página `/login`
- [ ] Adicionar middleware de proteção de rotas (`src/middleware.ts`)
- [ ] Adicionar botão de logout na Sidebar

### Polimento
- [ ] Adicionar loading skeletons nas tabelas (componente `Skeleton` do shadcn)
- [ ] Adicionar toast de sucesso/erro nas Server Actions
- [ ] Tratar erros 404 nas páginas de detalhe (`notFound()`)
- [ ] Revisar responsividade da Sidebar (mobile: menu hamburguer)
- [ ] Adicionar `<title>` e `<meta description>` em cada página

---

## Fase 06 — Deploy & Validação
**Estimativa: ~3 dias**

### Deploy
- [ ] Criar repositório no GitHub
- [ ] Criar projeto na Vercel e conectar ao repositório
- [ ] Adicionar todas as variáveis de ambiente na Vercel
- [ ] Fazer primeiro deploy e validar em produção
- [ ] Configurar domínio customizado (opcional para MVP)

### Validação
- [ ] Testar fluxo completo: cadastrar aluno → criar contrato → agendar aula → marcar pago
- [ ] Testar geração de mensalidades
- [ ] Testar filtros de inadimplentes
- [ ] Testar em dispositivo móvel
- [ ] Validar com dados reais da escola

### Ajustes Pós-Validação
- [ ] Coletar feedback do uso real
- [ ] Corrigir bugs encontrados
- [ ] Ajustes de UX conforme necessidade
- [ ] Remover endpoints de teste se ainda existirem

---

## Backlog v2 (pós-MVP)

- [ ] Portal do aluno (view read-only de aulas e pagamentos)
- [ ] Notificação por WhatsApp para cobranças (Twilio ou Z-API)
- [ ] Geração de boleto (Asaas ou Pagar.me)
- [ ] Automação de geração de mensalidades via cron (Vercel Cron Jobs)
- [ ] Perfil de professor (login + visualização da própria agenda)
- [ ] Relatório mensal em PDF
- [ ] Exportação de dados para planilha
