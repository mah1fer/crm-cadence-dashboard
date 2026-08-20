import React from 'react'
import { CadenceStage, ResponseStatus, InterestLevel, FollowUpFilter, STAGES_CONFIG } from '../types/crm'
import { Filter, X, Calendar, AlertTriangle, Flame, CheckCircle2, Clock } from 'lucide-react'

interface CadenceFilterProps {
  activeFilter: FollowUpFilter;
  setActiveFilter: (filter: FollowUpFilter) => void;
  selectedStage: CadenceStage | 'all';
  setSelectedStage: (stage: CadenceStage | 'all') => void;
  selectedResponse: ResponseStatus | 'all';
  setSelectedResponse: (resp: ResponseStatus | 'all') => void;
  selectedInterest: InterestLevel | 'all';
  setSelectedInterest: (interest: InterestLevel | 'all') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const CadenceFilter: React.FC<CadenceFilterProps> = ({
  activeFilter,
  setActiveFilter,
  selectedStage,
  setSelectedStage,
  selectedResponse,
  setSelectedResponse,
  selectedInterest,
  setSelectedInterest,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/70 rounded-xl p-3.5 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'all' && selectedStage === 'all' && selectedResponse === 'all' && selectedInterest === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border border-border/50'
            }`}
          >
            Todos os Contatos
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'today' ? 'all' : 'today')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'today'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
            }`}
          >
            <Calendar className="w-3 h-3" />
            Follow-up Hoje
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'overdue'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Atrasados
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'hot' ? 'all' : 'hot')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'hot'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                : 'bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 border border-orange-500/30'
            }`}
          >
            <Flame className="w-3 h-3 text-orange-400" />
            Alto Interesse 🔥
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'replied' ? 'all' : 'replied')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'replied'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Respondeu
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'upcoming' ? 'all' : 'upcoming')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'upcoming'
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30'
            }`}
          >
            <Clock className="w-3 h-3 text-blue-400" />
            Próximos 7 dias
          </button>

        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Stage Dropdown */}
          <div className="relative">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as CadenceStage | 'all')}
              aria-label="Filtrar por estágio da cadência"
              className="px-2.5 py-1 text-xs rounded-lg bg-secondary/70 border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Todos os Estágios</option>
              {Object.entries(STAGES_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* Response Status Dropdown */}
          <div className="relative">
            <select
              value={selectedResponse}
              onChange={(e) => setSelectedResponse(e.target.value as ResponseStatus | 'all')}
              aria-label="Filtrar por status de resposta"
              className="px-2.5 py-1 text-xs rounded-lg bg-secondary/70 border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Todas as Respostas</option>
              <option value="respondeu">✅ Respondeu</option>
              <option value="aguardando">⏳ Aguardando Resposta</option>
              <option value="nao_respondeu">❌ Não Respondeu</option>
              <option value="ligar_depois">📞 Pediu para Retornar</option>
            </select>
          </div>

          {/* Interest Level Dropdown */}
          <div className="relative">
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value as InterestLevel | 'all')}
              aria-label="Filtrar por nível de interesse"
              className="px-2.5 py-1 text-xs rounded-lg bg-secondary/70 border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Todos os Interesses</option>
              <option value="alto">🔥 Alto Interesse</option>
              <option value="medio">⚡ Médio Interesse</option>
              <option value="baixo">❄️ Baixo Interesse</option>
              <option value="nenhum">⛔ Sem Interesse</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/90 transition-all border border-border/40"
              title="Limpar todos os filtros"
            >
              <X className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}

        </div>

      </div>
    </div>
  )
}
