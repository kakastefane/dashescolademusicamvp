export const DB = {
    alunos: process.env.NOTION_DB_ALUNOS!,
    professores: process.env.NOTION_DB_PROFESSORES!,
    aulas: process.env.NOTION_DB_AULAS!,
    pagamentos: process.env.NOTION_DB_PAGAMENTOS!,
    contratos: process.env.NOTION_DB_CONTRATOS!,
    planos: process.env.NOTION_DB_PLANOS!,
} as const
