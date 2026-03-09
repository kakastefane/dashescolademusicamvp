// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type StatusAluno = 'ativo' | 'inativo' | 'trancado'

export type StatusAula =
    | 'agendada'
    | 'realizada'
    | 'cancelada'
    | 'faltou'
    | 'reposicao'

export type TipoAula = 'fixa' | 'avulsa' | 'reposicao'

export type StatusPagamento = 'pendente' | 'pago' | 'atrasado' | 'cancelado'

export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'boleto'

export type DuracaoPlano = 'mensal' | 'trimestral' | 'semestral' | 'anual'

export type StatusContrato = 'ativo' | 'expirado' | 'cancelado'

export type Instrumento =
    | 'violao'
    | 'guitarra'
    | 'baixo'
    | 'bateria'
    | 'piano'
    | 'teclado'
    | 'canto'
    | 'violino'
    | 'flauta'
    | 'saxofone'
    | 'outro'

// ─── ENTIDADES ────────────────────────────────────────────────────────────────

export interface Aluno {
    id: string                        // ID da página no Notion
    nome: string
    telefone: string
    email?: string
    responsavel?: string              // Para alunos menores
    instrumentos: Instrumento[]
    status: StatusAluno
    dataInicio: string                // ISO date string
    observacoes?: string
    // Relações (opcionais — podem não vir em todas as queries)
    contratoAtual?: Contrato
    pagamentosPendentes?: number      // Contagem via rollup
}

export interface Professor {
    id: string
    nome: string
    telefone?: string
    instrumentos: Instrumento[]
    status: 'ativo' | 'inativo'
    disponibilidade?: string
}

export interface Plano {
    id: string
    nome: string
    duracao: DuracaoPlano
    aulasPorSemana: number
    valor: number                     // Em reais
    descricao?: string
}

export interface Contrato {
    id: string
    titulo: string
    alunoId: string
    aluno?: Pick<Aluno, 'id' | 'nome'>
    alunoNome?: string
    planoId: string
    plano?: Plano
    planoNome?: string
    dataInicio: string
    dataFim: string
    status: StatusContrato
    valorMensal: number
}

export interface Aula {
    id: string
    alunoId: string
    aluno?: Pick<Aluno, 'id' | 'nome'>
    alunoNome?: string
    professorId: string
    professor?: Pick<Professor, 'id' | 'nome'>
    professorNome?: string
    dataHora: string                  // ISO datetime string
    duracaoMinutos: number
    instrumento: Instrumento
    status: StatusAula
    tipo: TipoAula
    observacoes?: string
    aulaOrigemId?: string             // Se for reposição, referencia a aula original
}

export interface Pagamento {
    id: string
    referencia: string                // Ex: "Mensalidade Março/2026"
    alunoId: string
    aluno?: Pick<Aluno, 'id' | 'nome'>
    alunoNome?: string
    valor: number
    vencimento: string                // ISO date string
    dataPagamento?: string
    status: StatusPagamento
    formaPagamento?: FormaPagamento
    observacoes?: string
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
    totalAlunosAtivos: number
    aulaHoje: number
    aulaSemana: number
    receitaPrevistaMes: number
    receitaRecebidaMes: number
    totalInadimplentes: number
    contratosVencendoEm30Dias: number
}

// ─── FORMS ────────────────────────────────────────────────────────────────────

export type AlunoFormData = Omit<Aluno, 'id' | 'contratoAtual' | 'pagamentosPendentes'>
export type AulaFormData = Omit<Aula, 'id' | 'aluno' | 'professor'>
export type PagamentoFormData = Omit<Pagamento, 'id' | 'aluno'>
export type ContratoFormData = Omit<Contrato, 'id' | 'aluno' | 'plano'>

// ─── API / NOTION ──────────────────────────────────────────────────────────────

// Resultado paginado (Notion usa cursor-based pagination)
export interface PaginatedResult<T> {
    items: T[]
    hasMore: boolean
    nextCursor?: string
}

// Filtros comuns para listagens
export interface AlunoFiltros {
    status?: StatusAluno
    instrumento?: Instrumento
    busca?: string
}

export interface AulaFiltros {
    alunoId?: string
    professorId?: string
    status?: StatusAula
    dataInicio?: string
    dataFim?: string
}

export interface PagamentoFiltros {
    alunoId?: string
    status?: StatusPagamento
    mes?: number  // 1–12
    ano?: number
}
