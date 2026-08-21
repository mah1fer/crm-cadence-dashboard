import React from 'react'
import { Contact, CadenceStage, ResponseStatus, STAGES_CONFIG } from '../types/crm'
import { 
  getWhatsAppLink, 
  getInitials, 
  getAvatarColor, 
  getFollowUpStatus,
  formatPhoneNumber 
} from '../lib/utils'
import { 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  Plus
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

interface ContactKanbanProps {
  contacts: Contact[];
  onSelectContact: (contact) => void;
  onUpdateStage: (contactId: string, newStage: CadenceStage) => void;
  onUpdateResponse?: (contactId: string, responseStatus: ResponseStatus) => void;
  onOpenNewContact: () => void;
}

const STAGE_ORDER: CadenceStage[] = [
  'novo',
  'primeiro_contato',
  'followup_1',
  'followup_2',
  'respondeu_qualificando',
  'interessado',
  'fechado',
  'perdido'
]

export const ContactKanban: React.FC<ContactKanbanProps> = ({
  contacts,
  onSelectContact,
  onUpdateStage,
  onUpdateResponse,
  onOpenNewContact
}) => {
  
  const handleMoveStage = (contact: Contact, direction: 'next' | 'prev') => {
    const currentIndex = STAGE_ORDER.indexOf(contact.stage)
    if (currentIndex === -1) return

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < STAGE_ORDER.length) {
      const targetStage = STAGE_ORDER[newIndex]
      
      // Celebrate if moved to 'fechado'
      if (targetStage === 'fechado') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        toast.success(`🎉 Parabéns! ${contact.name} foi movido para FECHADO!`)
      } else {
        toast.success(`${contact.name} movido para ${STAGES_CONFIG[targetStage].name}!`)
      }

      onUpdateStage(contact.id, targetStage)
    }
  }

  const handleQuickMarkReplied = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onUpdateResponse) {
      const newStatus = contact.responseStatus === 'respondeu' ? 'aguardando' : 'respondeu'
      onUpdateResponse(contact.id, newStatus)
      if (newStatus === 'respondeu' && (contact.stage === 'novo' || contact.stage === 'primeiro_contato' || contact.stage === 'followup_1')) {
        onUpdateStage(contact.id, 'respondeu_qualificando')
      }
      toast.success(newStatus === 'respondeu' ? `"${contact.name}" marcado como Respondeu!` : `"${contact.name}" marcado como Aguardando`)
    }
  }

  const total = contacts.length || 1

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 min-h-[620px] snap-x">
      {STAGE_ORDER.map((stageKey) => {
        const stageInfo = STAGES_CONFIG[stageKey]
        const stageContacts = contacts.filter((c) => c.stage === stageKey)
        const percentage = Math.round((stageContacts.length / total) * 100)

        return (
          <div
            key={stageKey}
            className="flex-shrink-0 w-80 bg-secondary/30 rounded-2xl border border-border/70 flex flex-col max-h-[calc(100vh-220px)] shadow-sm"
          >
            
            {/* Column Header */}
            <div className="p-3.5 border-b border-border/60 bg-card/60 rounded-t-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stageInfo.color.replace('text-', 'bg-')}`} />
                  <h4 className="font-heading font-semibold text-xs text-foreground truncate max-w-[160px]">
                    {stageInfo.name}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-secondary text-secondary-foreground border border-border/80">
                  {stageContacts.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stageInfo.color.replace('text-', 'bg-')}`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Column Content / Cards */}
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              {stageContacts.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-border/40 rounded-xl">
                  <p className="text-xs text-muted-foreground">Nenhum contato nesta etapa</p>
                </div>
              ) : (
                stageContacts.map((contact) => {
                  const followUp = getFollowUpStatus(contact)
                  const waUrl = getWhatsAppLink(contact.cleanPhone || contact.phone, contact.name)
                  const currentIndex = STAGE_ORDER.indexOf(contact.stage)
                  const isReplied = contact.responseStatus === 'respondeu'

                  return (
                    <div
                      key={contact.id}
                      onClick={() => onSelectContact(contact)}
                      className={`bg-card hover:bg-card/90 border p-3.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
                        isReplied ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : 'border-border/80 hover:border-primary/50'
                      }`}
                    >
                      
                      {/* Top Row: Name & Quick Reply / Interest */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${getAvatarColor(contact.name)} flex items-center justify-center font-bold text-xs shrink-0 text-white`}>
                            {getInitials(contact.name)}
                          </div>
                          <div>
                            <h5 className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                              {contact.name}
                            </h5>
                            {contact.referrer && (
                              <p className="text-[10px] text-violet-300 truncate max-w-[130px] flex items-center gap-0.5 mt-0.5">
                                <UserCheck className="w-2.5 h-2.5 text-violet-400" />
                                {contact.referrer}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Quick Mark Replied Toggle */}
                          <button
                            onClick={(e) => handleQuickMarkReplied(contact, e)}
                            className={`p-1 rounded-md transition-all ${
                              isReplied 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={isReplied ? 'Marcar como Aguardando' : 'Marcar como Respondeu'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {contact.interestLevel === 'alto' && (
                            <span className="p-1 rounded bg-rose-500/10 text-rose-400" title="Alto Interesse">
                              <Flame className="w-3.5 h-3.5 fill-rose-500/40" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Phone with WhatsApp trigger */}
                      <div className="bg-secondary/40 rounded-lg p-2 mb-2.5 flex items-center justify-between">
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {formatPhoneNumber(contact.phone)}
                        </div>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all active:scale-95"
                          title="Conversar no WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 fill-current" />
                          Whats
                        </a>
                      </div>

                      {/* Motivation / Notes snippet */}
                      {(contact.motivation || contact.notes) && (
                        <p className="text-[11px] text-muted-foreground/90 italic line-clamp-2 mb-2.5 bg-muted/30 p-1.5 rounded border border-border/40">
                          "{contact.motivation || contact.notes}"
                        </p>
                      )}

                      {/* Bottom Row: Follow-up & Navigation buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${followUp.badgeClass}`}>
                          <Clock className="w-2.5 h-2.5" />
                          {followUp.label}
                        </span>

                        {/* Step Navigation Controls */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {currentIndex > 0 && (
                            <button
                              onClick={() => handleMoveStage(contact, 'prev')}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                              title="Voltar etapa"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {currentIndex < STAGE_ORDER.length - 1 && (
                            <button
                              onClick={() => handleMoveStage(contact, 'next')}
                              className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-bold"
                              title="Avançar para próxima etapa"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  )
                })
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}
