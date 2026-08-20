import React from 'react'
import { Contact, CadenceStage, STAGES_CONFIG } from '../types/crm'
import { 
  getWhatsAppLink, 
  getInitials, 
  getAvatarColor, 
  getFollowUpStatus,
  formatPhoneNumber 
} from '../lib/utils'
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Copy, 
  CalendarPlus, 
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
  Sparkles
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
  onAdvanceFollowUp: (contactId: string, days: number) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onUpdateStage,
  onAdvanceFollowUp
}) => {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado com sucesso!`)
  }

  const renderInterestBadge = (level: Contact['interestLevel']) => {
    switch (level) {
      case 'alto':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400 fill-rose-400/30" />
            Alto
          </span>
        )
      case 'medio':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Zap className="w-3 h-3 text-amber-400" />
            Médio
          </span>
        )
      case 'baixo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Snowflake className="w-3 h-3 text-blue-400" />
            Baixo
          </span>
        )
      case 'nenhum':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-700/30">
            <Ban className="w-3 h-3 text-slate-400" />
            Nenhum
          </span>
        )
    }
  }

  const renderResponseStatusBadge = (status: Contact['responseStatus']) => {
    switch (status) {
      case 'respondeu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Respondeu
          </span>
        )
      case 'aguardando':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Clock className="w-3 h-3 text-blue-400" />
            Aguardando
          </span>
        )
      case 'nao_respondeu':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/15 text-slate-400 border border-slate-700/30">
            Sem Resposta
          </span>
        )
      case 'ligar_depois':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Phone className="w-3 h-3 text-amber-400" />
            Ligar Depois
          </span>
        )
    }
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
    <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          
          {/* Table Header */}
          <thead>
            <tr className="border-b border-border/70 bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Nome do Contato</th>
              <th className="py-3.5 px-4 font-bold text-foreground">Telefone / WhatsApp ⭐</th>
              <th className="py-3.5 px-4">E-mail</th>
              <th className="py-3.5 px-4">Como Conheceu / Indicação</th>
              <th className="py-3.5 px-4">Cadência</th>
              <th className="py-3.5 px-4">Resposta</th>
              <th className="py-3.5 px-4">Interesse</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/50">
            {contacts.map((contact) => {
              const followUp = getFollowUpStatus(contact)
              const stageInfo = STAGES_CONFIG[contact.stage] || STAGES_CONFIG.novo
              const waUrl = getWhatsAppLink(contact.cleanPhone || contact.phone, contact.name)
              const igHandle = contact.instagram ? contact.instagram.replace(/['@]/g, '').replace('https://www.instagram.com/', '').replace('/', '') : ''

              return (
                <tr 
                  key={contact.id} 
                  className="hover:bg-secondary/30 transition-colors group cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('select')) {
                      return
                    }
                    onSelectContact(contact)
                  }}
                >
                  
                  {/* 1. NOME DA PESSOA (EM DESTAQUE REAL) */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getAvatarColor(contact.name)} flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
                        {getInitials(contact.name)}
                      </div>
                      <div>
                        <div className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                          {contact.name}
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
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                              · {contact.company}
                            </span>
                          )}
                        </div>

                        {contact.motivation && (
                          <p className="text-[11px] text-muted-foreground/80 italic line-clamp-1 max-w-[220px] mt-0.5">
                            "{contact.motivation}"
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. NÚMERO DA PESSOA / WHATSAPP (MUITO IMPORTANTE & DESTACADO) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
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
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/40 transition-all shadow-sm"
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
                              title="Ligar para contato"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 3. E-MAIL DA PESSOA */}
                  <td className="py-4 px-4">
                    {contact.email ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:underline hover:text-blue-400 truncate max-w-[180px]"
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

                  {/* 4. COMO CONHECEU / QUEM INDICOU */}
                  <td className="py-4 px-4">
                    {contact.referrer ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/25 truncate max-w-[180px]" title={contact.referrer}>
                          <UserCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          {contact.referrer}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">Inscrição Direta</span>
                    )}
                  </td>

                  {/* 5. CADÊNCIA & ESTÁGIO */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={contact.stage}
                        onChange={(e) => onUpdateStage(contact.id, e.target.value as CadenceStage)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${stageInfo.badgeBg}`}
                      >
                        {Object.entries(STAGES_CONFIG).map(([key, config]) => (
                          <option key={key} value={key} className="bg-popover text-popover-foreground">
                            {config.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* 6. RESPOSTA */}
                  <td className="py-4 px-4">
                    {renderResponseStatusBadge(contact.responseStatus)}
                  </td>

                  {/* 7. INTERESSE */}
                  <td className="py-4 px-4">
                    {renderInterestBadge(contact.interestLevel)}
                  </td>

                  {/* 8. AÇÕES */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      
                      {/* View Details */}
                      <button
                        onClick={() => onSelectContact(contact)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        title="Ver detalhes da imersão e anotações"
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
                          if (confirm(`Deseja realmente remover o contato "${contact.name}"?`)) {
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
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="py-3 px-6 bg-secondary/20 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Exibindo <strong>{contacts.length}</strong> contatos organizados como Novos Leads</span>
        <span className="text-[11px] text-muted-foreground/80">💡 Clique em qualquer linha para ver os dados completos da Imersão</span>
      </div>
    </div>
  )
}
