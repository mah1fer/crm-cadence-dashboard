import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Contact } from '../types/crm'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Limpa o telefone para formato numérico padrão internacional (Brasil 55...)
 */
export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  
  // Se tem 10 ou 11 dígitos (DDD + 8 ou 9 dígitos), adiciona DDI 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  
  // Se tem 12 ou 13 dígitos e começa com 55, mantém
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    return digits
  }

  return digits
}

/**
 * Formata o telefone visualmente de forma limpa: (XX) XXXXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return phone

  // Remove o DDI 55 se estiver no início para formatar localmente
  let localDigits = digits
  if (digits.startsWith('55') && digits.length >= 12) {
    localDigits = digits.substring(2)
  }

  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`
  } else if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`
  } else if (localDigits.length === 9) {
    return `${localDigits.slice(0, 5)}-${localDigits.slice(5)}`
  } else if (localDigits.length === 8) {
    return `${localDigits.slice(0, 4)}-${localDigits.slice(4)}`
  }

  return phone
}

/**
 * Cria o link direto para iniciar conversa no WhatsApp
 */
export function getWhatsAppLink(phone: string, name?: string, customMessage?: string): string {
  const clean = cleanPhoneNumber(phone)
  if (!clean) return '#'

  let message = customMessage
  if (!message) {
    const firstName = name ? name.split(' ')[0] : 'tudo bem?'
    message = `Olá ${firstName}! Tudo bem? Gostaria de dar um retorno sobre o nosso contato.`
  }

  const encoded = encodeURIComponent(message)
  return `https://wa.me/${clean}?text=${encoded}`
}

/**
 * Extrai as iniciais do nome para o avatar
 */
export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Gera uma cor de fundo sutil baseada no nome
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'from-blue-600 to-indigo-600 text-white',
    'from-emerald-600 to-teal-600 text-white',
    'from-violet-600 to-purple-600 text-white',
    'from-amber-600 to-orange-600 text-white',
    'from-rose-600 to-pink-600 text-white',
    'from-cyan-600 to-blue-600 text-white'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Analisa a data de follow-up do contato em relação à data atual
 */
export function getFollowUpStatus(contact: Contact): {
  type: 'today' | 'overdue' | 'upcoming' | 'none';
  label: string;
  badgeClass: string;
} {
  if (!contact.nextFollowUpDate || contact.stage === 'fechado' || contact.stage === 'perdido') {
    return {
      type: 'none',
      label: 'Sem agendamento',
      badgeClass: 'text-slate-500 bg-slate-500/10 border-slate-700/30'
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const targetDateStr = contact.nextFollowUpDate

  if (targetDateStr === todayStr) {
    return {
      type: 'today',
      label: `Hoje ${contact.nextFollowUpTime ? 'às ' + contact.nextFollowUpTime : ''}`,
      badgeClass: 'text-amber-300 bg-amber-500/20 border-amber-500/40 animate-pulse'
    }
  } else if (targetDateStr < todayStr) {
    const diffDays = Math.round((new Date(todayStr).getTime() - new Date(targetDateStr).getTime()) / (1000 * 3600 * 24))
    return {
      type: 'overdue',
      label: `Atrasado (${diffDays}d atrás)`,
      badgeClass: 'text-rose-300 bg-rose-500/20 border-rose-500/40 font-semibold'
    }
  } else {
    const [year, month, day] = targetDateStr.split('-')
    return {
      type: 'upcoming',
      label: `${day}/${month}/${year} ${contact.nextFollowUpTime ? 'às ' + contact.nextFollowUpTime : ''}`,
      badgeClass: 'text-blue-300 bg-blue-500/10 border-blue-500/30'
    }
  }
}

/**
 * Adiciona X dias a partir de hoje e retorna YYYY-MM-DD
 */
export function addDaysToToday(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
