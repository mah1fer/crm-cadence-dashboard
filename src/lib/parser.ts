import { Contact, CadenceStage, InterestLevel, ResponseStatus } from '../types/crm'
import { cleanPhoneNumber, formatPhoneNumber, addDaysToToday } from './utils'

export interface ParsedContactPreview {
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  raw: string;
  isValid: boolean;
  error?: string;
}

/**
 * Parser inteligente para converter texto livre, CSV, TSV ou mensagens coladas em contatos estruturados
 */
export function parseRawContactsText(text: string): ParsedContactPreview[] {
  if (!text || !text.trim()) return []

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const results: ParsedContactPreview[] = []

  // Regex helpers
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  // Detecta números com 8 a 13 dígitos com possíveis parênteses, traços, espaços e +55
  const phoneRegex = /(\+?55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})/g

  for (const line of lines) {
    // Ignora cabeçalhos comuns se a pessoa colar de tabela
    if (/^(nome|name|contato|telefone|phone|e-?mail)/i.test(line) && line.includes(',')) {
      continue
    }

    let rawLine = line
    let foundEmail = ''
    let foundPhone = ''
    let foundName = ''
    let foundCompany = ''

    // 1. Extrair e-mail
    const emailMatch = rawLine.match(emailRegex)
    if (emailMatch) {
      foundEmail = emailMatch[1]
      rawLine = rawLine.replace(emailMatch[0], ' ')
    }

    // 2. Extrair telefone
    // Encontrar todos os padrões que parecem telefone
    const phoneMatches = [...line.matchAll(phoneRegex)]
    if (phoneMatches && phoneMatches.length > 0) {
      // Pega o match mais longo/completo
      const bestMatch = phoneMatches.reduce((prev, curr) => (curr[0].length > prev[0].length ? curr : prev), phoneMatches[0])
      foundPhone = bestMatch[0].trim()
      // Remove o telefone do rawLine para isolar o nome
      rawLine = rawLine.replace(bestMatch[0], ' ')
    }

    // 3. O que sobrar com separadores comuns (-, |, ;, , ou tab) é o nome e possivelmente empresa/cargo
    // Limpar prefixos comuns tipo "Nome:", "Tel:", "Cel:", "Email:"
    rawLine = rawLine
      .replace(/(nome|name|tel|cel|telefone|celular|contato|empresa|email):/gi, '')
      .replace(/[-|;,]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Se houver texto restante, este é o nome
    foundName = rawLine

    // Se o nome estiver vazio mas temos telefone
    if (!foundName && foundPhone) {
      foundName = `Lead ${foundPhone.slice(-4)}`
    }

    const clean = cleanPhoneNumber(foundPhone)
    const isValid = Boolean(foundName.length >= 2 && clean.length >= 8)

    results.push({
      name: foundName || 'Contato sem nome',
      phone: foundPhone ? formatPhoneNumber(foundPhone) : '',
      email: foundEmail || '',
      company: foundCompany,
      raw: line,
      isValid,
      error: !isValid ? (clean.length < 8 ? 'Telefone inválido ou ausente' : 'Nome inválido') : undefined
    })
  }

  return results
}

/**
 * Converte a lista de prévias validadas em objetos Contact prontos para salvar no CRM
 */
export function convertPreviewsToContacts(
  previews: ParsedContactPreview[],
  defaultStage: CadenceStage = 'novo',
  defaultInterest: InterestLevel = 'medio'
): Contact[] {
  const now = new Date().toISOString()
  
  return previews
    .filter(p => p.isValid)
    .map(p => {
      const clean = cleanPhoneNumber(p.phone)
      return {
        id: 'lead_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        name: p.name.trim(),
        phone: formatPhoneNumber(p.phone),
        cleanPhone: clean,
        email: p.email.trim(),
        company: p.company?.trim() || '',
        stage: defaultStage,
        responseStatus: 'aguardando' as ResponseStatus,
        interestLevel: defaultInterest,
        nextFollowUpDate: addDaysToToday(0), // Hoje
        notes: p.notes || '',
        tags: ['Lista Importada'],
        interactionHistory: [
          {
            id: 'log_' + Math.random().toString(36).substring(2, 9),
            timestamp: now,
            type: 'system',
            content: 'Contato adicionado via importação de lista.'
          }
        ],
        createdAt: now,
        updatedAt: now
      }
    })
}
