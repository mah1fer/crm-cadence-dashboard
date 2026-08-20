import React, { useState, useEffect } from 'react'
import { Contact, CadenceStage, ResponseStatus, InterestLevel, STAGES_CONFIG } from '../types/crm'
import { cleanPhoneNumber, formatPhoneNumber, addDaysToToday } from '../lib/utils'
import { X, User, Phone, Mail, Building, Tag, Calendar, MessageSquare, Flame } from 'lucide-react'
import { toast } from 'sonner'

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Partial<Contact>) => void;
  initialContact?: Contact | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContact
}) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [stage, setStage] = useState<CadenceStage>('novo')
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>('aguardando')
  const [interestLevel, setInterestLevel] = useState<InterestLevel>('medio')
  const [nextFollowUpDate, setNextFollowUpDate] = useState(addDaysToToday(0))
  const [nextFollowUpTime, setNextFollowUpTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (initialContact) {
      setName(initialContact.name)
      setPhone(initialContact.phone)
      setEmail(initialContact.email || '')
      setCompany(initialContact.company || '')
      setRole(initialContact.role || '')
      setStage(initialContact.stage)
      setResponseStatus(initialContact.responseStatus)
      setInterestLevel(initialContact.interestLevel)
      setNextFollowUpDate(initialContact.nextFollowUpDate || addDaysToToday(0))
      setNextFollowUpTime(initialContact.nextFollowUpTime || '10:00')
      setNotes(initialContact.notes || '')
      setTags(initialContact.tags || [])
    } else {
      setName('')
      setPhone('')
      setEmail('')
      setCompany('')
      setRole('')
      setStage('novo')
      setResponseStatus('aguardando')
      setInterestLevel('medio')
      setNextFollowUpDate(addDaysToToday(0))
      setNextFollowUpTime('10:00')
      setNotes('')
      setTags([])
    }
  }, [initialContact, isOpen])

  if (!isOpen) return null

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Por favor, informe o nome do contato.')
      return
    }

    const clean = cleanPhoneNumber(phone)
    if (!phone.trim() || clean.length < 8) {
      toast.error('Por favor, informe um telefone válido com DDD.')
      return
    }

    onSave({
      name: name.trim(),
      phone: formatPhoneNumber(phone),
      cleanPhone: clean,
      email: email.trim(),
      company: company.trim(),
      role: role.trim(),
      stage,
      responseStatus,
      interestLevel,
      nextFollowUpDate,
      nextFollowUpTime,
      notes: notes.trim(),
      tags
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">
              {initialContact ? 'Editar Contato' : 'Novo Contato do CRM'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nome Completo (Obrigatório) */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Nome da Pessoa *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder="Ex: João Victor Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Telefone & WhatsApp (Obrigatório) + E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                Telefone / WhatsApp * ⭐
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  required
                  placeholder="(11) 99888-7766"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-secondary/50 border border-emerald-500/30 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>

          {/* Empresa e Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Empresa
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nome da Empresa"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Cargo / Função
              </label>
              <input
                type="text"
                placeholder="Ex: Diretor Comercial, Gerente"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-1.5 text-sm rounded-xl bg-secondary/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Estágio da Cadência, Resposta e Interesse */}
          <div className="p-3.5 bg-secondary/30 rounded-xl border border-border/80 space-y-3">
            <span className="text-xs font-bold text-foreground block">
              Cadência de Follow-up & Qualificação
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Estágio */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Estágio no Funil
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as CadenceStage)}
                  className="w-full p-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.entries(STAGES_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>

              {/* Status de Resposta */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Respondeu?
                </label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value as ResponseStatus)}
                  className="w-full p-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="aguardando">⏳ Aguardando Resposta</option>
                  <option value="respondeu">✅ Respondeu</option>
                  <option value="nao_respondeu">❌ Não Respondeu</option>
                  <option value="ligar_depois">📞 Pediu para Retornar</option>
                </select>
              </div>

              {/* Nível de Interesse */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Nível de Interesse
                </label>
                <select
                  value={interestLevel}
                  onChange={(e) => setInterestLevel(e.target.value as InterestLevel)}
                  className="w-full p-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="alto">🔥 Alto Interesse</option>
                  <option value="medio">⚡ Médio Interesse</option>
                  <option value="baixo">❄️ Baixo Interesse</option>
                  <option value="nenhum">⛔ Sem Interesse</option>
                </select>
              </div>

            </div>

            {/* Agendamento do Próximo Follow-up */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Data Próximo Follow-up
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Horário Previsto
                </label>
                <input
                  type="time"
                  value={nextFollowUpTime}
                  onChange={(e) => setNextFollowUpTime(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

          </div>

          {/* Anotações Iniciais */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Anotações & Detalhes do Lead
            </label>
            <textarea
              rows={2}
              placeholder="Ex: O cliente tem interesse no serviço e pediu para ligar após as 14h..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Tags / Etiquetas
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Decisor, Indicação, Proposta..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-secondary/50 border border-border text-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg border border-border"
              >
                Adicionar Tag
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-secondary text-foreground border border-border"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all"
            >
              {initialContact ? 'Salvar Alterações' : 'Adicionar Contato'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
