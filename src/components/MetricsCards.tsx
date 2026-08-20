import React from 'react'
import { Contact, FollowUpFilter } from '../types/crm'
import { CalendarClock, Flame, MessageSquareCheck, Hourglass, Trophy } from 'lucide-react'

interface MetricsCardsProps {
  contacts: Contact[];
  activeFilter: FollowUpFilter;
  setActiveFilter: (filter: FollowUpFilter) => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  contacts,
  activeFilter,
  setActiveFilter
}) => {
  const todayStr = new Date().toISOString().split('T')[0]

  const total = contacts.length
  const todayFollowUps = contacts.filter(
    c => c.nextFollowUpDate === todayStr && c.stage !== 'fechado' && c.stage !== 'perdido'
  ).length

  const overdueFollowUps = contacts.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate < todayStr && c.stage !== 'fechado' && c.stage !== 'perdido'
  ).length

  const repliedCount = contacts.filter(c => c.responseStatus === 'respondeu').length
  const repliedPercentage = total > 0 ? Math.round((repliedCount / total) * 100) : 0

  const hotLeads = contacts.filter(
    c => c.interestLevel === 'alto' && c.stage !== 'fechado' && c.stage !== 'perdido'
  ).length

  const waitingReply = contacts.filter(
    c => (c.responseStatus === 'aguardando' || c.responseStatus === 'nao_respondeu') &&
         c.stage !== 'fechado' && c.stage !== 'perdido'
  ).length

  const closedDeals = contacts.filter(c => c.stage === 'fechado').length

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Follow-up Hoje & Atrasados */}
      <button
        onClick={() => setActiveFilter(activeFilter === 'today' ? 'all' : 'today')}
        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
          activeFilter === 'today'
            ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
            : 'bg-card/70 border-border/70 hover:border-amber-500/40 hover:bg-amber-500/5'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-amber-400 transition-colors">
            Follow-up Hoje
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-heading text-foreground">
            {todayFollowUps}
          </span>
          {overdueFollowUps > 0 && (
            <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              +{overdueFollowUps} atrasados
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {todayFollowUps === 0 && overdueFollowUps === 0 ? 'Tudo em dia!' : 'Clique para filtrar'}
        </p>
      </button>

      {/* 2. Leads Quentes */}
      <button
        onClick={() => setActiveFilter(activeFilter === 'hot' ? 'all' : 'hot')}
        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
          activeFilter === 'hot'
            ? 'bg-rose-500/10 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
            : 'bg-card/70 border-border/70 hover:border-rose-500/40 hover:bg-rose-500/5'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-rose-400 transition-colors">
            Leads Quentes
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-heading text-foreground">
            {hotLeads}
          </span>
          <span className="text-xs font-medium text-rose-400">
            Alto Interesse 🔥
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Prioridade máxima
        </p>
      </button>

      {/* 3. Taxa de Resposta */}
      <button
        onClick={() => setActiveFilter(activeFilter === 'replied' ? 'all' : 'replied')}
        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
          activeFilter === 'replied'
            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
            : 'bg-card/70 border-border/70 hover:border-emerald-500/40 hover:bg-emerald-500/5'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-emerald-400 transition-colors">
            Respostas
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <MessageSquareCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-heading text-foreground">
            {repliedPercentage}%
          </span>
          <span className="text-xs font-medium text-emerald-400">
            ({repliedCount}/{total})
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Leads que responderam
        </p>
      </button>

      {/* 4. Aguardando Resposta */}
      <div className="p-4 rounded-xl border bg-card/70 border-border/70 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Em Cadência
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Hourglass className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-heading text-foreground">
            {waitingReply}
          </span>
          <span className="text-xs font-medium text-blue-400">
            Aguardando
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Acompanhamento ativo
        </p>
      </div>

      {/* 5. Fechados / Ganhos */}
      <div className="p-4 rounded-xl border bg-card/70 border-border/70 text-left col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Fechados 🎉
          </span>
          <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-heading text-foreground">
            {closedDeals}
          </span>
          <span className="text-xs font-medium text-green-400">
            Ganhos
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Vendas concretizadas
        </p>
      </div>

    </div>
  )
}
