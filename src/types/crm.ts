export type CadenceStage = 
  | 'novo'
  | 'primeiro_contato'
  | 'followup_1'
  | 'followup_2'
  | 'respondeu_qualificando'
  | 'interessado'
  | 'fechado'
  | 'perdido';

export type ResponseStatus = 
  | 'aguardando'
  | 'respondeu'
  | 'nao_respondeu'
  | 'ligar_depois';

export type InterestLevel = 
  | 'alto'
  | 'medio'
  | 'baixo'
  | 'nenhum';

export interface InteractionLog {
  id: string;
  timestamp: string;
  type: 'whatsapp' | 'email' | 'call' | 'note' | 'cadence_change' | 'system';
  content: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  cleanPhone: string; // apenas dígitos para wa.me
  email: string;
  instagram?: string;
  referrer?: string; // Como nos conheceu / Quem indicou
  motivation?: string; // Por que participar dessa imersão é importante
  successCriteria?: string; // O que precisa acontecer para valer a pena
  company?: string;
  role?: string;
  stage: CadenceStage;
  responseStatus: ResponseStatus;
  interestLevel: InterestLevel;
  lastContactAt?: string;
  nextFollowUpDate?: string; // YYYY-MM-DD
  nextFollowUpTime?: string; // HH:mm
  notes?: string;
  tags: string[];
  interactionHistory: InteractionLog[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'table' | 'kanban' | 'agenda';

export type FollowUpFilter = 'all' | 'today' | 'overdue' | 'upcoming' | 'replied' | 'hot';

export interface StageDefinition {
  id: CadenceStage;
  name: string;
  shortName: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  defaultFollowUpDays: number;
  description: string;
}

export const STAGES_CONFIG: Record<CadenceStage, StageDefinition> = {
  novo: {
    id: 'novo',
    name: 'Novo Lead',
    shortName: 'Novo',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-600/40',
    borderColor: 'border-blue-500/30',
    defaultFollowUpDays: 0,
    description: 'Contato recém-adicionado, aguardando envio da 1ª mensagem.'
  },
  primeiro_contato: {
    id: 'primeiro_contato',
    name: '1º Contato Enviado',
    shortName: '1º Contato',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-700/50',
    borderColor: 'border-indigo-500/30',
    defaultFollowUpDays: 2,
    description: 'Primeira mensagem enviada, aguardando resposta.'
  },
  followup_1: {
    id: 'followup_1',
    name: 'Follow-up 1 (Dia 2)',
    shortName: 'FUP 1',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-700/50',
    borderColor: 'border-purple-500/30',
    defaultFollowUpDays: 2,
    description: 'Lead não respondeu ao 1º contato. Envio do 1º reforço.'
  },
  followup_2: {
    id: 'followup_2',
    name: 'Follow-up 2 (Dia 4)',
    shortName: 'FUP 2',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-700/50',
    borderColor: 'border-amber-500/30',
    defaultFollowUpDays: 3,
    description: 'Última tentativa de contato antes de congelar.'
  },
  respondeu_qualificando: {
    id: 'respondeu_qualificando',
    name: 'Respondeu / Qualificando',
    shortName: 'Qualificando',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-700/50',
    borderColor: 'border-cyan-500/30',
    defaultFollowUpDays: 1,
    description: 'O lead respondeu e a conversa está em andamento.'
  },
  interessado: {
    id: 'interessado',
    name: 'Interessado (Proposta/Reunião)',
    shortName: 'Interessado',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-700/50',
    borderColor: 'border-emerald-500/30',
    defaultFollowUpDays: 1,
    description: 'Lead com interesse claro, em negociação de proposta.'
  },
  fechado: {
    id: 'fechado',
    name: 'Fechado / Ganho 🎉',
    shortName: 'Fechado',
    color: 'text-green-400',
    badgeBg: 'bg-green-500/20 text-green-300 border-green-500/50',
    borderColor: 'border-green-500/40',
    defaultFollowUpDays: 30,
    description: 'Negócio fechado com sucesso.'
  },
  perdido: {
    id: 'perdido',
    name: 'Sem Interesse / Perdido',
    shortName: 'Perdido',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-700/50',
    borderColor: 'border-rose-500/30',
    defaultFollowUpDays: 0,
    description: 'Lead informou não ter interesse ou não respondeu após a cadência.'
  }
};
