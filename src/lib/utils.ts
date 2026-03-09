import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar valor monetário
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

// Formatar data ISO para exibição
export function formatarData(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(isoDate))
}

// Formatar data e hora
export function formatarDataHora(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(isoDate))
}

// Calcular data fim do contrato baseado na duração do plano
export function calcularDataFimContrato(dataInicio: string, duracao: string): string {
  const data = new Date(dataInicio)
  const meses = { mensal: 1, trimestral: 3, semestral: 6, anual: 12 }
  data.setMonth(data.getMonth() + (meses[duracao as keyof typeof meses] ?? 1))
  return data.toISOString().slice(0, 10)
}

// Gerar referência de mensalidade
export function gerarReferenciaMensalidade(nomeAluno: string, mes: number, ano: number): string {
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(ano, mes - 1))
  return `Mensalidade ${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${ano} — ${nomeAluno}`
}

// Verificar se uma data está atrasada
export function estaAtrasado(vencimento: string): boolean {
  return new Date(vencimento) < new Date()
}
