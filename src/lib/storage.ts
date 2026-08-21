import { Contact } from '../types/crm'
import { INITIAL_CONTACTS } from '../data/initialContacts'

const STORAGE_KEY = 'morf_pro_crm_contacts_v3'
const BACKUP_KEY = 'morf_pro_crm_backup_v1'
const LAST_SAVED_KEY = 'morf_pro_crm_last_saved'
const LEGACY_KEYS = [
  'morf_pro_crm_contacts_v3',
  'morf_pro_crm_contacts_v2',
  'morf_pro_crm_contacts_v1',
  'crm_cadence_contacts_v1'
]

// Load contacts with automatic multi-version migration and merge
export function loadContacts(): Contact[] {
  try {
    // 1. Check primary key first
    const raw = localStorage.getItem(STORAGE_KEY)
    let parsedContacts: Contact[] | null = null

    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedContacts = parsed
        }
      } catch (e) {
        console.warn('Erro ao parsear dados primários:', e)
      }
    }

    // 2. Check all legacy storage keys to find any previous user updates (like 'respondeu', stage changes, notes)
    const userUpdatesMap = new Map<string, Partial<Contact>>()

    for (const key of LEGACY_KEYS) {
      const legacyRaw = localStorage.getItem(key)
      if (legacyRaw) {
        try {
          const legacyParsed: Contact[] = JSON.parse(legacyRaw)
          if (Array.isArray(legacyParsed)) {
            legacyParsed.forEach(c => {
              if (c) {
                // Key by name, phone, cleanPhone, or email
                const matchKeys = [
                  c.id,
                  c.email?.toLowerCase().trim(),
                  c.cleanPhone?.replace(/\D/g, ''),
                  c.phone?.replace(/\D/g, ''),
                  c.name?.toLowerCase().trim()
                ].filter(Boolean) as string[]

                matchKeys.forEach(k => {
                  if (!userUpdatesMap.has(k)) {
                    userUpdatesMap.set(k, {
                      stage: c.stage,
                      responseStatus: c.responseStatus,
                      interestLevel: c.interestLevel,
                      nextFollowUpDate: c.nextFollowUpDate,
                      notes: c.notes,
                      interactionHistory: c.interactionHistory
                    })
                  }
                })
              }
            })
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }

    // 3. If we have contacts already in v3, make sure they are merged with any legacy marks
    if (parsedContacts && parsedContacts.length > 0) {
      const merged = parsedContacts.map(c => {
        const userUpdate = 
          userUpdatesMap.get(c.id) ||
          userUpdatesMap.get(c.email?.toLowerCase().trim()) ||
          userUpdatesMap.get(c.cleanPhone?.replace(/\D/g, '')) ||
          userUpdatesMap.get(c.name?.toLowerCase().trim())

        if (userUpdate) {
          return {
            ...c,
            // prioritize user's active marked state if they marked 'respondeu' or changed stage
            stage: (c.stage !== 'novo' ? c.stage : userUpdate.stage) || c.stage,
            responseStatus: (c.responseStatus !== 'aguardando' ? c.responseStatus : userUpdate.responseStatus) || c.responseStatus,
            interestLevel: userUpdate.interestLevel || c.interestLevel,
            nextFollowUpDate: userUpdate.nextFollowUpDate || c.nextFollowUpDate,
            notes: c.notes || userUpdate.notes,
            interactionHistory: c.interactionHistory?.length ? c.interactionHistory : (userUpdate.interactionHistory || [])
          }
        }
        return c
      })

      // Also ensure all 31 INITIAL_CONTACTS are present (in case any were missed)
      const existingIds = new Set(merged.map(c => c.id))
      const missingInitial = INITIAL_CONTACTS.filter(c => !existingIds.has(c.id))
      const fullList = [...merged, ...missingInitial]

      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullList))
      localStorage.setItem(BACKUP_KEY, JSON.stringify(fullList))
      return fullList
    }

    // 4. If v3 is empty, seed from INITIAL_CONTACTS merged with any user updates found in legacy keys!
    const mergedInitial = INITIAL_CONTACTS.map(init => {
      const userUpdate = 
        userUpdatesMap.get(init.id) ||
        userUpdatesMap.get(init.email?.toLowerCase().trim()) ||
        userUpdatesMap.get(init.cleanPhone?.replace(/\D/g, '')) ||
        userUpdatesMap.get(init.name?.toLowerCase().trim())

      if (userUpdate) {
        return {
          ...init,
          stage: userUpdate.stage || init.stage,
          responseStatus: userUpdate.responseStatus || init.responseStatus,
          interestLevel: userUpdate.interestLevel || init.interestLevel,
          nextFollowUpDate: userUpdate.nextFollowUpDate || init.nextFollowUpDate,
          notes: userUpdate.notes || init.notes,
          interactionHistory: userUpdate.interactionHistory?.length ? userUpdate.interactionHistory : init.interactionHistory
        }
      }
      return init
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedInitial))
    localStorage.setItem(BACKUP_KEY, JSON.stringify(mergedInitial))
    return mergedInitial

  } catch (err) {
    console.error('Erro ao ler contatos do localStorage:', err)
    return INITIAL_CONTACTS
  }
}

// Save contacts with double-backup and timestamp
export function saveContacts(contacts: Contact[]): void {
  try {
    const jsonStr = JSON.stringify(contacts)
    localStorage.setItem(STORAGE_KEY, jsonStr)
    localStorage.setItem(BACKUP_KEY, jsonStr) // double backup
    
    const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    localStorage.setItem(LAST_SAVED_KEY, nowStr)

    window.dispatchEvent(new CustomEvent('crm_contacts_updated', { detail: { savedAt: nowStr } }))
  } catch (err) {
    console.error('Erro ao salvar contatos no localStorage:', err)
  }
}

export function getLastSavedTime(): string {
  try {
    return localStorage.getItem(LAST_SAVED_KEY) || 'Agora'
  } catch {
    return 'Agora'
  }
}

// Reset / Re-seed contacts back to clean state
export function resetToDefaultContacts(): Contact[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS))
    localStorage.setItem(BACKUP_KEY, JSON.stringify(INITIAL_CONTACTS))
    window.dispatchEvent(new Event('crm_contacts_updated'))
    return INITIAL_CONTACTS
  } catch (err) {
    console.error('Erro ao restaurar contatos padrão:', err)
    return INITIAL_CONTACTS
  }
}

export function exportContactsAsJSON(contacts: Contact[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `morf_pro_contatos_${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportContactsAsCSV(contacts: Contact[]): void {
  const headers = ['Nome', 'Telefone', 'Email', 'Instagram', 'Como Conheceu / Indicação', 'Motivação Imersão', 'Critério de Sucesso', 'Empresa', 'Cargo', 'Estágio', 'Status Resposta', 'Interesse', 'Próximo Follow-up', 'Notas']
  const rows = contacts.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.instagram || '').replace(/"/g, '""')}"`,
    `"${(c.referrer || '').replace(/"/g, '""')}"`,
    `"${(c.motivation || '').replace(/"/g, '""')}"`,
    `"${(c.successCriteria || '').replace(/"/g, '""')}"`,
    `"${(c.company || '').replace(/"/g, '""')}"`,
    `"${(c.role || '').replace(/"/g, '""')}"`,
    `"${c.stage}"`,
    `"${c.responseStatus}"`,
    `"${c.interestLevel}"`,
    `"${c.nextFollowUpDate || ''}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ])

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `morf_pro_contatos_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
