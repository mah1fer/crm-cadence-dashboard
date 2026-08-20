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
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Send, 
  Copy, 
  Building, 
  Edit2, 
  Trash2, 
  ExternalLink,
  History,
  Sparkles,
  UserCheck,
  Target,
  Trophy,
  HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

interface ContactDrawerProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onAddNote: (contactId: string, noteText: string) => void;
  onUpdateStage: (contactId: string, stage: CadenceStage) => void;
  onUpdateFollowUp: (contactId: string, date: string, time?: string) => void;
  onUpdateResponse: (contactId: string, responseStatus: ResponseStatus) => void;
  onUpdateInterest: (contactId: string, interest: InterestLevel) => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddNote,
  onUpdateStage,
  onUpdateFollowUp,
  onUpdateResponse,
  onUpdateInterest
}) => {
  const [newNote, setNewNote] = useState('')
  const [quickTemplate, setQuickTemplate] = useState<string>('')

  if (!isOpen || !contact) return null

  const stageInfo = STAGES_CONFIG[contact.stage] || STAGES_CONFIG.novo
  const followUp = getFollowUpStatus(contact)
  const igHandle = contact.instagram ? contact.instagram.replace(/['@]/g, '').replace('https://www.instagram.com/', '').replace('/', '') : ''

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    onAddNote(contact.id, newNote.trim())
    setNewNote('')
    toast.success('Anotação registrada no histórico!')
  }

  const firstName = contact.name.split(' ')[0]

  const templates = [
    {
      title: 'Boas-vindas Imersão',
      msg: `Olá ${firstName}! Tudo bem? Vi que você se inscreveu para a imersão${contact.referrer ? ` (por indicação: ${contact.referrer})` : ''}. Gostaria de dar as boas-vindas e me colocar à total disposição!`
    },
    {
      title: 'Foco no Objetivo',
      msg: `Olá ${firstName}! Tudo bem? Vi que seu foco principal é ${contact.motivation ? `"${contact.motivation}"` : 'aplicar novas ferramentas'}. Vamos alinhar como podemos acelerar isso na prática?`
    },
    {
      title: 'Follow-up de Reforço',
      msg: `Olá ${firstName}! Tudo bem? Conseguiu dar uma olhada no material e nas orientações que te enviei? Fico à disposição para tirar qualquer dúvida!`
    },
    {
      title: 'Agendar Alinhamento',
      msg: `Olá ${firstName}! Que tal marcarmos um bate-papo rápido de 10 minutos para alinharmos os próximos passos da sua participação?`
    }
  ]

  const currentWaUrl = getWhatsAppLink(
    contact.cleanPhone || contact.phone,
    contact.name,
    quickTemplate || undefined
  )

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-slide-in-right">
          
          {/* Header */}
          <div className="p-6 border-b border-border/80 bg-secondary/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarColor(contact.name)} flex items-center justify-center font-bold text-base text-white shadow-md`}>
                  {getInitials(contact.name)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    {contact.name}
                  </h3>
                  
                  {/* Instagram & Empresa */}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {contact.instagram && (
                      <a
                        href={`https://instagram.com/${igHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-pink-400 hover:underline font-mono bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                        @{igHandle}
                      </a>
                    )}
                    {(contact.company || contact.role) && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        {contact.role ? `${contact.role} · ` : ''}{contact.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onEdit(contact)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  title="Editar Contato"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja excluir "${contact.name}"?`)) {
                      onDelete(contact.id)
                      onClose()
                    }
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Excluir Contato"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Direct Highlight Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              
              {/* Telefone / WhatsApp */}
              <div className="bg-card p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Telefone / WhatsApp ⭐
                  </span>
                  <span className="font-mono font-bold text-sm text-foreground">
                    {formatPhoneNumber(contact.phone)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {contact.phone && (
                    <button
                      onClick={() => handleCopy(contact.phone, 'Telefone')}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary"
                      title="Copiar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {contact.cleanPhone && (
                    <a
                      href={`tel:${contact.cleanPhone}`}
                      className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10"
                      title="Ligar"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="bg-card p-3 rounded-xl border border-border flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    E-mail
                  </span>
                  <span className="text-xs text-foreground truncate block">
                    {contact.email || 'Não informado'}
                  </span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(contact.email, 'E-mail')}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary"
                      title="Copiar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`mailto:${contact.email}`}
                      className="p-1.5 rounded text-blue-400 hover:bg-blue-500/10"
                      title="Enviar Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Drawer Body / Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* 1. DADOS ESPECÍFICOS DA IMERSÃO */}
            <div className="bg-violet-500/10 p-4 rounded-xl border border-violet-500/30 space-y-3">
              <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Dados da Imersão & Origem
              </span>

              {/* Como conheceu / Quem indicou */}
              {contact.referrer && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-violet-400" />
                    Como conheceu / Quem indicou:
                  </span>
                  <p className="text-xs font-medium text-foreground bg-card/60 p-2 rounded-lg border border-violet-500/20">
                    {contact.referrer}
                  </p>
                </div>
              )}

              {/* Por que participar é importante */}
              {contact.motivation && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Por que participar dessa imersão é importante:
                  </span>
                  <p className="text-xs text-foreground/90 bg-card/60 p-2.5 rounded-lg border border-border/80 leading-relaxed italic">
                    "{contact.motivation}"
                  </p>
                </div>
              )}

              {/* Critério de sucesso */}
              {contact.successCriteria && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    O que precisa acontecer para valer a pena:
                  </span>
                  <p className="text-xs text-foreground/90 bg-card/60 p-2.5 rounded-lg border border-border/80 leading-relaxed">
                    {contact.successCriteria}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Cadência & Status do Lead */}
            <div className="bg-secondary/20 p-4 rounded-xl border border-border/80 space-y-3">
              <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                Controle de Cadência & Follow-up
              </span>

              {/* Estágio Atual */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Estágio no Funil:</span>
                <select
                  value={contact.stage}
                  onChange={(e) => onUpdateStage(contact.id, e.target.value as CadenceStage)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer ${stageInfo.badgeBg}`}
                >
                  {Object.entries(STAGES_CONFIG).map(([k, cfg]) => (
                    <option key={k} value={k} className="bg-popover text-popover-foreground">{cfg.name}</option>
                  ))}
                </select>
              </div>

              {/* Status de Resposta */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status de Resposta:</span>
                <select
                  value={contact.responseStatus}
                  onChange={(e) => onUpdateResponse(contact.id, e.target.value as ResponseStatus)}
                  className="text-xs font-medium px-2 py-1 rounded-lg bg-card border border-border text-foreground"
                >
                  <option value="aguardando">⏳ Aguardando Resposta</option>
                  <option value="respondeu">✅ Respondeu</option>
                  <option value="nao_respondeu">❌ Não Respondeu</option>
                  <option value="ligar_depois">📞 Pediu para Retornar</option>
                </select>
              </div>

              {/* Nível de Interesse */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Interesse:</span>
                <select
                  value={contact.interestLevel}
                  onChange={(e) => onUpdateInterest(contact.id, e.target.value as InterestLevel)}
                  className="text-xs font-medium px-2 py-1 rounded-lg bg-card border border-border text-foreground"
                >
                  <option value="alto">🔥 Alto Interesse</option>
                  <option value="medio">⚡ Médio Interesse</option>
                  <option value="baixo">❄️ Baixo Interesse</option>
                  <option value="nenhum">⛔ Sem Interesse</option>
                </select>
              </div>

              {/* Próximo Follow-up */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Próximo Follow-up:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={contact.nextFollowUpDate || ''}
                    onChange={(e) => onUpdateFollowUp(contact.id, e.target.value, contact.nextFollowUpTime)}
                    className="text-xs p-1 rounded bg-card border border-border text-foreground cursor-pointer"
                  />
                  <button
                    onClick={() => onUpdateFollowUp(contact.id, addDaysToToday(3), contact.nextFollowUpTime)}
                    className="text-[11px] px-2 py-1 bg-secondary hover:bg-secondary/80 rounded border border-border"
                    title="+3 dias"
                  >
                    +3d
                  </button>
                </div>
              </div>

            </div>

            {/* 3. Disparador Rápido de WhatsApp com Modelos */}
            {contact.cleanPhone && (
              <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 fill-emerald-400/20" />
                    Modelos de Mensagem WhatsApp
                  </span>
                  <span className="text-[10px] text-muted-foreground">Clique para carregar</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => setQuickTemplate(tpl.msg)}
                      className="p-2 text-left rounded-lg bg-card/60 hover:bg-card border border-border/80 hover:border-emerald-500/40 text-xs text-muted-foreground hover:text-foreground transition-all"
                    >
                      <span className="font-semibold block text-[11px] text-emerald-300 truncate">
                        {tpl.title}
                      </span>
                    </button>
                  ))}
                </div>

                {quickTemplate && (
                  <div className="relative mt-2">
                    <textarea
                      rows={3}
                      value={quickTemplate}
                      onChange={(e) => setQuickTemplate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-lg bg-card border border-emerald-500/30 text-foreground resize-none focus:outline-none"
                    />
                  </div>
                )}

                <a
                  href={currentWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Abrir Conversa no WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* 4. Anotações Rápidas & Histórico */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-primary" />
                  Histórico de Interações & Notas
                </h4>
                <span className="text-xs text-muted-foreground">
                  {contact.interactionHistory.length} registros
                </span>
              </div>

              {/* Add note input */}
              <form onSubmit={handleSendNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Registrar anotação ou resumo do contato..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* History list */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {contact.interactionHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center">
                    Nenhuma anotação registrada ainda.
                  </p>
                ) : (
                  contact.interactionHistory.slice().reverse().map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-secondary/30 border border-border/50 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span className="font-semibold uppercase tracking-wider text-primary">
                          {log.type}
                        </span>
                        <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {log.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>Cadastrado em: {new Date(contact.createdAt).toLocaleDateString('pt-BR')}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 border border-border font-medium"
            >
              Fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
