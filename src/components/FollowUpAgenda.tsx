import React from 'react'
import { Contact, CadenceStage, STAGES_CONFIG } from '../types/crm'
import { 
  getWhatsAppLink, 
  getInitials, 
  getAvatarColor, 
  getFollowUpStatus,
  formatPhoneNumber,
  addDaysToToday
} from '../lib/utils'
import { 
  CalendarClock, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  CalendarPlus, 
  Flame, 
  Phone, 
  Eye, 
  Check 
} from 'lucide-react'
import { toast } from 'sonner'

interface FollowUpAgendaProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onAdvanceFollowUp: (contactId: string, days: number) => void;
  onUpdateStage: (contactId: string, newStage: CadenceStage) => void;
  onQuickMarkReplied: (contactId: string) => void;
}

export const FollowUpAgenda: React.FC<FollowUpAgendaProps> = ({
  contacts,
  onSelectContact,
  onAdvanceFollowUp,
  onUpdateStage,
  onQuickMarkReplied
}) => {
  const todayStr = new Date().toISOString().split('T')[0]

  const activeContacts = contacts.filter(
    c => c.stage !== 'fechado' && c.stage !== 'perdido'
  )

  const overdue = activeContacts.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate < todayStr
  )

  const today = activeContacts.filter(
    c => c.nextFollowUpDate === todayStr
  )

  const upcoming = activeContacts.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate > todayStr
  ).sort((a, b) => (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || ''))

  const renderAgendaCard = (contact: Contact, isOverdue: boolean = false) => {
    const stageInfo = STAGES_CONFIG[contact.stage] || STAGES_CONFIG.novo
    const followUp = getFollowUpStatus(contact)
    
    // Preset friendly WhatsApp template message based on current stage
    let waMessage = `Olá ${contact.name.split(' ')[0]}, tudo bem? Passando para dar um retorno sobre nosso contato.`
    if (contact.stage === 'primeiro_contato') {
      waMessage = `Olá ${contact.name.split(' ')[0]}! Tudo bem? Conseguiu ver a mensagem anterior que te enviei? Fico à disposição!`
    } else if (contact.stage === 'followup_1') {
      waMessage = `Olá ${contact.name.split(' ')[0]}! Gostaria de saber se você teve um tempinho para avaliar o que conversamos. Faz sentido para você?`
    } else if (contact.stage === 'interessado') {
      waMessage = `Olá ${contact.name.split(' ')[0]}! Tudo bem? Conforme combinamos, estou entrando em contato para alinharmos os próximos passos da nossa parceria.`
    }

    const waUrl = getWhatsAppLink(contact.cleanPhone || contact.phone, contact.name, waMessage)

    return (
      <div
        key={contact.id}
        onClick={() => onSelectContact(contact)}
        className={`p-4 rounded-xl border transition-all cursor-pointer group bg-card hover:bg-card/90 shadow-sm ${
          isOverdue 
            ? 'border-rose-500/40 hover:border-rose-500/70 bg-rose-500/5' 
            : 'border-border/80 hover:border-primary/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: Contact Info */}
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${getAvatarColor(contact.name)} flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
              {getInitials(contact.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                  {contact.name}
                </h4>
                {contact.interestLevel === 'alto' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                    Quente
                  </span>
                )}
                <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${stageInfo.badgeBg}`}>
                  {stageInfo.name}
                </span>
              </div>

              {/* Phone & Email */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                <span className="font-mono font-bold text-emerald-400">
                  {formatPhoneNumber(contact.phone)}
                </span>
                {contact.email && (
                  <span className="text-muted-foreground">
                    {contact.email}
                  </span>
                )}
                {contact.company && (
                  <span className="text-muted-foreground/80 font-medium">
                    🏢 {contact.company}
                  </span>
                )}
              </div>

              {/* Note Snippet */}
              {contact.notes && (
                <p className="text-xs text-muted-foreground italic mt-2 bg-secondary/50 p-2 rounded-lg border border-border/50">
                  "{contact.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Action Triggers */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
            
            {/* Direct WhatsApp Trigger */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
              title="Abrir WhatsApp com template de follow-up"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Chamar no Whats</span>
            </a>

            {/* Quick Mark as Replied */}
            {contact.responseStatus !== 'respondeu' && (
              <button
                onClick={() => onQuickMarkReplied(contact.id)}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 transition-all"
                title="Marcar como 'Respondeu'"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Respondeu</span>
              </button>
            )}

            {/* Postpone +3 days */}
            <button
              onClick={() => onAdvanceFollowUp(contact.id, 3)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 transition-all"
              title="Reagendar follow-up para daqui a 3 dias"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>+3 dias</span>
            </button>

            {/* View Details */}
            <button
              onClick={() => onSelectContact(contact)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              title="Abrir detalhes"
            >
              <Eye className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* 1. ATENÇÃO: ATRASADOS */}
      {overdue.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-rose-400">
              Follow-ups Atrasados ({overdue.length})
            </h3>
            <span className="text-xs text-muted-foreground">Necessitam de atenção prioritária</span>
          </div>
          <div className="grid gap-3">
            {overdue.map(c => renderAgendaCard(c, true))}
          </div>
        </section>
      )}

      {/* 2. PROGRAMADOS PARA HOJE */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-base text-foreground">
            Follow-ups Para Hoje ({today.length})
          </h3>
          <span className="text-xs text-muted-foreground">Sua meta de contatos para o dia</span>
        </div>
        {today.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border/70 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">Nenhum follow-up agendado para hoje</p>
            <p className="text-xs text-muted-foreground mt-1">Todos os contatos do dia foram atualizados!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {today.map(c => renderAgendaCard(c, false))}
          </div>
        )}
      </section>

      {/* 3. PRÓXIMOS DIAS */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-base text-foreground">
            Próximos Follow-ups ({upcoming.length})
          </h3>
          <span className="text-xs text-muted-foreground">Contatos agendados para os próximos dias</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-6 text-center bg-card/60 border border-border/60 rounded-xl">
            <p className="text-xs text-muted-foreground">Nenhum follow-up futuro cadastrado.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.slice(0, 10).map(c => renderAgendaCard(c, false))}
          </div>
        )}
      </section>

    </div>
  )
}
