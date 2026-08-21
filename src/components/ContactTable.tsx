import React, { useState } from 'react'
import { Contact, CadenceStage, ResponseStatus, InterestLevel, STAGES_CONFIG } from '../types/crm'
import { 
  getWhatsAppLink, 
  getInitials, 
  getAvatarColor, 
  getFollowUpStatus,
  formatPhoneNumber,
  addDaysToToday
} from '../lib/utils'
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Copy, 
  Flame, 
  Zap, 
  Snowflake, 
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  Sparkles,
  ChevronDown,
  Calendar,
  CheckSquare,
  Square,
  ArrowRight,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

const InstagramIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

interface ContactTableProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onUpdateStage: (contactId: string, newStage: CadenceStage) => void;
  onUpdateResponse: (contactId: string, responseStatus: ResponseStatus) => void;
  onUpdateInterest: (contactId: string, interestLevel: InterestLevel) => void;
  onAdvanceFollowUp: (contactId: string, days: number) => void;
  onBulkUpdateStage?: (contactIds: string[], newStage: CadenceStage) => void;
  onBulkMarkReplied?: (contactIds: string[]) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onUpdateStage,
  onUpdateResponse,
  onUpdateInterest,
  onAdvanceFollowUp,
  onBulkUpdateStage,
  onBulkMarkReplied
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado com sucesso!`)
  }

  // Multi-select handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(contacts.map(c => c.id))
    }
  }

  const handleBulkRepliedAction = () => {
    if (selectedIds.length === 0) return
    if (onBulkMarkReplied) {
      onBulkMarkReplied(selectedIds)
    } else {
      selectedIds.forEach(id => onUpdateResponse(id, 'respondeu'))
    }
    toast.success(`${selectedIds.length} contatos marcados como "Respondeu"!`)
    setSelectedIds([])
  }

  const handleBulkStageAction = (stage: CadenceStage) => {
    if (selectedIds.length === 0) return
    if (onBulkUpdateStage) {
      onBulkUpdateStage(selectedIds, stage)
    } else {
      selectedIds.forEach(id => onUpdateStage(id, stage))
    }
    toast.success(`${selectedIds.length} contatos movidos para ${STAGES_CONFIG[stage].name}!`)
    setSelectedIds([])
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
          Nenhum contato encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Não há contatos correspondentes aos filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      
      {/* Table Card */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border/70 bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-3 w-10 text-center">
                  <button 
                    onClick={handleSelectAll}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    title={selectedIds.length === contacts.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  >
                    {selectedIds.length === contacts.length && contacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4 sm:px-5">Nome do Contato</th>
                <th className="py-3.5 px-4 font-bold text-foreground">Telefone / WhatsApp ⭐</th>
                <th className="py-3.5 px-4">E-mail</th>
                <th className="py-3.5 px-4">Origem / Indicação</th>
                <th className="py-3.5 px-4">Cadência (Estágio)</th>
                <th className="py-3.5 px-4">Resposta (Status)</th>
                <th className="py-3.5 px-4">Interesse</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/50">
              {contacts.map((contact) => {
                const isSelected = selectedIds.includes(contact.id)
                const isExpanded = expandedId === contact.id
                const stageInfo = STAGES_CONFIG[contact.stage] || STAGES_CONFIG.novo
                const waUrl = getWhatsAppLink(contact.cleanPhone || contact.phone, contact.name)
                const igHandle = contact.instagram ? contact.instagram.replace(/['@]/g, '').replace('https://www.instagram.com/', '').replace('/', '') : ''

                return (
                  <React.Fragment key={contact.id}>
                    <tr 
                      className={`hover:bg-secondary/30 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      } ${contact.responseStatus === 'respondeu' ? 'bg-emerald-500/[0.03]' : ''}`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('select') || (e.target as HTMLElement).closest('input')) {
                          return
                        }
                        onSelectContact(contact)
                      }}
                    >
                      
                      {/* 0. CHECKBOX MULTI-SELECT */}
                      <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(contact.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>

                      {/* 1. NOME DA PESSOA */}
                      <td className="py-4 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(contact.name)} flex items-center justify-center font-bold text-xs shadow-sm shrink-0 text-white`}>
                            {getInitials(contact.name)}
                          </div>
                          <div>
                            <div className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                              {contact.name}
                              {contact.responseStatus === 'respondeu' && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                  ✓ Respondeu
                                </span>
                              )}
                            </div>

                            {/* Instagram ou Empresa */}
                            <div className="flex items-center gap-2 mt-0.5">
                              {contact.instagram && (
                                <a
                                  href={`https://instagram.com/${igHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-pink-400 hover:underline flex items-center gap-1 font-mono"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <InstagramIcon className="w-3 h-3" />
                                  @{igHandle}
                                </a>
                              )}
                              {contact.company && (
                                <span className="text-xs text-muted-foreground truncate max-w-[130px]">
                                  · {contact.company}
                                </span>
                              )}
                            </div>

                            {/* Quick Motivation Peek Toggle */}
                            {(contact.motivation || contact.successCriteria) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedId(isExpanded ? null : contact.id)
                                }}
                                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 mt-0.5 transition-colors"
                              >
                                <Info className="w-2.5 h-2.5" />
                                {isExpanded ? 'Ocultar detalhes' : 'Ver motivação/objetivo'}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. NÚMERO DA PESSOA / WHATSAPP ⭐ */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-sm text-emerald-400 tracking-tight flex items-center gap-1.5">
                            {formatPhoneNumber(contact.phone)}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            {contact.cleanPhone ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/40 transition-all shadow-sm active:scale-95"
                                title="Abrir WhatsApp Web / App"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageSquare className="w-3 h-3 fill-current" />
                                WhatsApp
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60 italic">Sem WhatsApp</span>
                            )}

                            {contact.phone && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopy(contact.phone, 'Telefone')
                                }}
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                                title="Copiar Telefone"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}

                            {contact.cleanPhone && (
                              <a
                                href={`tel:${contact.cleanPhone}`}
                                className="p-1 rounded text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                title="Ligar"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. E-MAIL */}
                      <td className="py-4 px-4">
                        {contact.email ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:underline hover:text-blue-400 truncate max-w-[170px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {contact.email}
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(contact.email, 'E-mail')
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-foreground transition-all"
                              title="Copiar E-mail"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">Não informado</span>
                        )}
                      </td>

                      {/* 4. ORIGEM / INDICAÇÃO */}
                      <td className="py-4 px-4">
                        {contact.referrer ? (
                          <span 
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/25 truncate max-w-[180px]" 
                            title={contact.referrer}
                          >
                            <UserCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            {contact.referrer}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">Inscrição Direta</span>
                        )}
                      </td>

                      {/* 5. CADÊNCIA & ESTÁGIO (INTERATIVO) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={contact.stage}
                            onChange={(e) => onUpdateStage(contact.id, e.target.value as CadenceStage)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all ${stageInfo.badgeBg}`}
                          >
                            {Object.entries(STAGES_CONFIG).map(([key, config]) => (
                              <option key={key} value={key} className="bg-popover text-popover-foreground">
                                {config.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* 6. RESPOSTA (STATUS INTERATIVO 1-CLIQUE ⭐) */}
                      <td className="py-4 px-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={contact.responseStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value as ResponseStatus
                              onUpdateResponse(contact.id, newStatus)
                              toast.success(`Status alterado para: ${newStatus === 'respondeu' ? '✅ Respondeu' : newStatus}`)
                            }}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none transition-all shadow-sm ${
                              contact.responseStatus === 'respondeu'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                                : contact.responseStatus === 'aguardando'
                                ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
                                : contact.responseStatus === 'ligar_depois'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-slate-500/10 text-slate-400 border-slate-700/30 hover:bg-slate-500/20'
                            }`}
                          >
                            <option value="aguardando" className="bg-popover text-popover-foreground">⏳ Aguardando</option>
                            <option value="respondeu" className="bg-popover text-popover-foreground font-bold text-emerald-400">✅ Respondeu</option>
                            <option value="ligar_depois" className="bg-popover text-popover-foreground">📞 Ligar Depois</option>
                            <option value="nao_respondeu" className="bg-popover text-popover-foreground">❌ Não Respondeu</option>
                          </select>
                        </div>
                      </td>

                      {/* 7. INTERESSE (INTERATIVO) */}
                      <td className="py-4 px-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={contact.interestLevel}
                            onChange={(e) => {
                              onUpdateInterest(contact.id, e.target.value as InterestLevel)
                              toast.success('Interesse atualizado!')
                            }}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border border-border bg-secondary/50 text-foreground cursor-pointer focus:outline-none"
                          >
                            <option value="alto" className="bg-popover text-popover-foreground">🔥 Alto</option>
                            <option value="medio" className="bg-popover text-popover-foreground">⚡ Médio</option>
                            <option value="baixo" className="bg-popover text-popover-foreground">❄️ Baixo</option>
                            <option value="nenhum" className="bg-popover text-popover-foreground">⛔ Nenhum</option>
                          </select>
                        </div>
                      </td>

                      {/* 8. AÇÕES */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Quick Mark Replied Button (se ainda não respondeu) */}
                          {contact.responseStatus !== 'respondeu' && (
                            <button
                              onClick={() => {
                                onUpdateResponse(contact.id, 'respondeu')
                                toast.success(`"${contact.name}" marcado como respondeu!`)
                              }}
                              className="p-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all font-semibold text-xs flex items-center gap-1"
                              title="Marcar rapidamente como Respondeu"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Respondeu</span>
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => onSelectContact(contact)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            title="Ver ficha completa da imersão"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditContact(contact)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                            title="Editar contato"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente remover "${contact.name}"?`)) {
                                onDeleteContact(contact.id)
                              }
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Excluir contato"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>

                    {/* EXPANDED ROW (PEEK DETAILS) */}
                    {isExpanded && (
                      <tr className="bg-secondary/15 border-b border-border/50">
                        <td colSpan={9} className="py-3 px-8 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-card/80 p-3.5 rounded-xl border border-border/80">
                            <div>
                              <span className="font-bold text-violet-400 flex items-center gap-1 mb-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                Motivação para a Imersão:
                              </span>
                              <p className="text-foreground/90 italic">
                                {contact.motivation ? `"${contact.motivation}"` : 'Não informada no formulário.'}
                              </p>
                            </div>
                            <div>
                              <span className="font-bold text-amber-400 flex items-center gap-1 mb-1">
                                🏆 Critério de Sucesso (O que precisa acontecer):
                              </span>
                              <p className="text-foreground/90">
                                {contact.successCriteria || 'Aplicação prática das ferramentas.'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="py-3 px-6 bg-secondary/20 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Exibindo <strong>{contacts.length}</strong> contatos ({contacts.filter(c => c.responseStatus === 'respondeu').length} responderam)</span>
          <span className="text-[11px] text-muted-foreground/80">
            💡 Dica: Você pode alterar o <strong>Status de Resposta</strong> e o <strong>Estágio</strong> com 1 clique diretamente na tabela!
          </span>
        </div>
      </div>

      {/* FLOATING BULK ACTIONS BAR (AÇÕES EM LOTE) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-primary/40 shadow-2xl rounded-2xl p-3 px-5 flex items-center gap-4 animate-slide-up backdrop-blur-md">
          <div className="flex items-center gap-2 font-semibold text-xs text-foreground pr-3 border-r border-border">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {selectedIds.length}
            </span>
            <span>selecionado(s)</span>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Bulk Mark Replied */}
            <button
              onClick={handleBulkRepliedAction}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marcar como Respondeu
            </button>

            {/* Bulk Move to Qualificando */}
            <button
              onClick={() => handleBulkStageAction('respondeu_qualificando')}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all"
            >
              Mover p/ Qualificando
            </button>

            {/* Bulk Move to Interessado */}
            <button
              onClick={() => handleBulkStageAction('interessado')}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all"
            >
              Mover p/ Interessado
            </button>

            {/* Cancel / Clear Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              Cancelar
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
