import { Contact } from '../types/crm'
import { INITIAL_CONTACTS } from '../data/initialContacts'

const STORAGE_KEY = 'crm_cadence_contacts_v1'

export function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS))
      return INITIAL_CONTACTS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CONTACTS
  } catch (err) {
    console.error('Erro ao ler contatos do localStorage:', err)
    return INITIAL_CONTACTS
  }
}

export function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
    window.dispatchEvent(new Event('crm_contacts_updated'))
  } catch (err) {
    console.error('Erro ao salvar contatos no localStorage:', err)
  }
}

export function exportContactsAsJSON(contacts: Contact[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `crm_contatos_backup_${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

export function exportContactsAsCSV(contacts: Contact[]): void {
  const headers = ['Nome', 'Telefone', 'Email', 'Empresa', 'Estagio Cadencia', 'Status Resposta', 'Interesse', 'Proximo Follow-up', 'Notas']
  const rows = contacts.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.company || '').replace(/"/g, '""')}"`,
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
  link.setAttribute('download', `crm_contatos_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
