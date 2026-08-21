import React, { useState, useEffect, useMemo } from 'react'
import { Contact, CadenceStage, ResponseStatus, InterestLevel, ViewMode, FollowUpFilter } from './types/crm'
import { loadContacts, saveContacts, resetToDefaultContacts, exportContactsAsCSV, exportContactsAsJSON } from './lib/storage'
import { addDaysToToday } from './lib/utils'
import { Navbar } from './components/Navbar'
import { MetricsCards } from './components/MetricsCards'
import { CadenceFilter } from './components/CadenceFilter'
import { ContactTable } from './components/ContactTable'
import { ContactKanban } from './components/ContactKanban'
import { FollowUpAgenda } from './components/FollowUpAgenda'
import { ContactModal } from './components/ContactModal'
import { ContactDrawer } from './components/ContactDrawer'
import { SmartImportModal } from './components/SmartImportModal'
import { Toaster, toast } from 'sonner'
import confetti from 'canvas-confetti'

export function App() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FollowUpFilter>('all')
  const [selectedStage, setSelectedStage] = useState<CadenceStage | 'all'>('all')
  const [selectedResponse, setSelectedResponse] = useState<ResponseStatus | 'all'>('all')
  const [selectedInterest, setSelectedInterest] = useState<InterestLevel | 'all'>('all')
  const [selectedDDD, setSelectedDDD] = useState<string>('all')
  const [darkMode, setDarkMode] = useState(true)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [drawerContact, setDrawerContact] = useState<Contact | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Load initial contacts and listen for sync
  useEffect(() => {
    const loaded = loadContacts()
    setContacts(loaded)

    const handleUpdate = () => {
      setContacts(loadContacts())
    }
    window.addEventListener('crm_contacts_updated', handleUpdate)
    return () => window.removeEventListener('crm_contacts_updated', handleUpdate)
  }, [])

  // Dark Mode toggle on <html>
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  // Sync drawer contact if contacts update
  useEffect(() => {
    if (drawerContact) {
      const updated = contacts.find(c => c.id === drawerContact.id)
      if (updated) setDrawerContact(updated)
    }
  }, [contacts])

  // Extract available DDDs dynamically
  const availableDDDs = useMemo(() => {
    const dddSet = new Set<string>()
    contacts.forEach(c => {
      const digits = (c.phone || '').replace(/\D/g, '')
      let ddd = ''
      if (digits.startsWith('55') && digits.length >= 12) {
        ddd = digits.substring(2, 4)
      } else if (digits.length >= 10) {
        ddd = digits.substring(0, 2)
      }
      if (ddd && ddd.length === 2) {
        dddSet.add(ddd)
      }
    })
    return Array.from(dddSet).sort((a, b) => a.localeCompare(b))
  }, [contacts])

  // Save contacts helper with automatic storage sync
  const handleSaveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts)
    saveContacts(newContacts)
  }

  // Create or Update Contact
  const handleSaveContact = (contactData: Partial<Contact>) => {
    const now = new Date().toISOString()
    if (editingContact) {
      // Update existing
      const updated = contacts.map(c => {
        if (c.id === editingContact.id) {
          return {
            ...c,
            ...contactData,
            updatedAt: now,
            interactionHistory: [
              ...c.interactionHistory,
              {
                id: 'log_' + Math.random().toString(36).substring(2, 9),
                timestamp: now,
                type: 'system' as const,
                content: 'Dados do contato atualizados.'
              }
            ]
          } as Contact
        }
        return c
      })
      handleSaveContacts(updated)
      toast.success('Contato atualizado e salvo com sucesso!')
    } else {
      // Create new
      const newContact: Contact = {
        id: 'lead_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        name: contactData.name || '',
        phone: contactData.phone || '',
        cleanPhone: contactData.cleanPhone || '',
        email: contactData.email || '',
        company: contactData.company || '',
        role: contactData.role || '',
        stage: contactData.stage || 'novo',
        responseStatus: contactData.responseStatus || 'aguardando',
        interestLevel: contactData.interestLevel || 'medio',
        nextFollowUpDate: contactData.nextFollowUpDate || addDaysToToday(0),
        nextFollowUpTime: contactData.nextFollowUpTime || '10:00',
        notes: contactData.notes || '',
        tags: contactData.tags || [],
        interactionHistory: [
          {
            id: 'log_' + Math.random().toString(36).substring(2, 9),
            timestamp: now,
            type: 'system' as const,
            content: 'Contato cadastrado no CRM.'
          }
        ],
        createdAt: now,
        updatedAt: now
      }
      handleSaveContacts([newContact, ...contacts])
      toast.success('Novo contato adicionado ao CRM!')
    }
  }

  // Delete Contact
  const handleDeleteContact = (id: string) => {
    const filtered = contacts.filter(c => c.id !== id)
    handleSaveContacts(filtered)
    if (drawerContact?.id === id) setDrawerContact(null)
    toast.info('Contato removido.')
  }

  // Update Stage
  const handleUpdateStage = (contactId: string, newStage: CadenceStage) => {
    const now = new Date().toISOString()
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        if (newStage === 'fechado') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        }
        return {
          ...c,
          stage: newStage,
          updatedAt: now,
          interactionHistory: [
            ...c.interactionHistory,
            {
              id: 'log_' + Math.random().toString(36).substring(2, 9),
              timestamp: now,
              type: 'cadence_change' as const,
              content: `Estágio alterado para: ${newStage}`
            }
          ]
        }
      }
      return c
    })
    handleSaveContacts(updated)
  }

  // Update Response Status
  const handleUpdateResponse = (contactId: string, responseStatus: ResponseStatus) => {
    const now = new Date().toISOString()
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        const autoStage = (responseStatus === 'respondeu' && (c.stage === 'novo' || c.stage === 'primeiro_contato' || c.stage === 'followup_1'))
          ? 'respondeu_qualificando'
          : c.stage

        return {
          ...c,
          responseStatus,
          stage: autoStage as CadenceStage,
          updatedAt: now,
          interactionHistory: [
            ...c.interactionHistory,
            {
              id: 'log_' + Math.random().toString(36).substring(2, 9),
              timestamp: now,
              type: 'whatsapp' as const,
              content: `Status de resposta atualizado para: ${responseStatus}`
            }
          ]
        }
      }
      return c
    })
    handleSaveContacts(updated)
  }

  // Update Interest Level
  const handleUpdateInterest = (contactId: string, interestLevel: InterestLevel) => {
    const now = new Date().toISOString()
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          interestLevel,
          updatedAt: now
        }
      }
      return c
    })
    handleSaveContacts(updated)
  }

  // Bulk update stage
  const handleBulkUpdateStage = (contactIds: string[], newStage: CadenceStage) => {
    const now = new Date().toISOString()
    const idSet = new Set(contactIds)
    const updated = contacts.map(c => {
      if (idSet.has(c.id)) {
        return {
          ...c,
          stage: newStage,
          updatedAt: now
        }
      }
      return c
    })
    handleSaveContacts(updated)
  }

  // Bulk mark replied
  const handleBulkMarkReplied = (contactIds: string[]) => {
    const now = new Date().toISOString()
    const idSet = new Set(contactIds)
    const updated = contacts.map(c => {
      if (idSet.has(c.id)) {
        return {
          ...c,
          responseStatus: 'respondeu' as ResponseStatus,
          stage: (c.stage === 'novo' || c.stage === 'primeiro_contato' || c.stage === 'followup_1') ? 'respondeu_qualificando' as CadenceStage : c.stage,
          updatedAt: now
        }
      }
      return c
    })
    handleSaveContacts(updated)
  }

  // Quick Advance Follow-up (+X days)
  const handleAdvanceFollowUp = (contactId: string, days: number) => {
    const newDate = addDaysToToday(days)
    const now = new Date().toISOString()
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          nextFollowUpDate: newDate,
          updatedAt: now,
          interactionHistory: [
            ...c.interactionHistory,
            {
              id: 'log_' + Math.random().toString(36).substring(2, 9),
              timestamp: now,
              type: 'note' as const,
              content: `Follow-up reagendado para daqui a ${days} dias (${newDate}).`
            }
          ]
        }
      }
      return c
    })
    handleSaveContacts(updated)
    toast.success(`Follow-up reagendado para ${newDate}!`)
  }

  // Quick Mark Replied
  const handleQuickMarkReplied = (contactId: string) => {
    handleUpdateResponse(contactId, 'respondeu')
    toast.success('Contato marcado como "Respondeu"!')
  }

  // Add Note to contact
  const handleAddNote = (contactId: string, noteText: string) => {
    const now = new Date().toISOString()
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          notes: noteText,
          updatedAt: now,
          interactionHistory: [
            ...c.interactionHistory,
            {
              id: 'log_' + Math.random().toString(36).substring(2, 9),
              timestamp: now,
              type: 'note' as const,
              content: noteText
            }
          ]
        }
      }
      return c
    })
    handleSaveContacts(updated)
  }

  // Update follow-up from drawer
  const handleUpdateFollowUp = (contactId: string, date: string, time?: string) => {
    const now = new Date().toISOString()
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          nextFollowUpDate: date,
          nextFollowUpTime: time || c.nextFollowUpTime,
          updatedAt: now
        }
      }
      return c
    })
    handleSaveContacts(updated)
    toast.success('Data de follow-up atualizada!')
  }

  // Batch import from modal
  const handleImportBatch = (newBatch: Contact[]) => {
    handleSaveContacts([...newBatch, ...contacts])
  }

  // Reset to default
  const handleResetDefault = () => {
    if (confirm('Deseja restaurar a lista inicial de contatos da Imersão? Suas anotações personalizadas serão redefinidas.')) {
      const resetList = resetToDefaultContacts()
      setContacts(resetList)
      toast.success('Lista restaurada com sucesso!')
    }
  }

  // Filtered contacts calculation with Enhanced Phone Search
  const todayStr = new Date().toISOString().split('T')[0]

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      // 1. Search Query (Enhanced for Phone Digits, DDD, Formatted and Clean numbers)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const qDigits = searchQuery.replace(/\D/g, '')

        const matchName = (c.name || '').toLowerCase().includes(q)
        const matchEmail = (c.email || '').toLowerCase().includes(q)
        const matchCompany = (c.company || '').toLowerCase().includes(q)
        const matchReferrer = (c.referrer || '').toLowerCase().includes(q)
        const matchInstagram = (c.instagram || '').toLowerCase().includes(q)
        const matchTags = c.tags.some(t => t.toLowerCase().includes(q))
        
        // Deep Phone Match:
        const cPhoneRaw = (c.phone || '').toLowerCase()
        const cPhoneDigits = (c.phone || '').replace(/\D/g, '')
        const cCleanPhone = (c.cleanPhone || '')
        
        const matchPhone = 
          cPhoneRaw.includes(q) ||
          (qDigits.length > 0 && (cPhoneDigits.includes(qDigits) || cCleanPhone.includes(qDigits)))

        if (!matchName && !matchPhone && !matchEmail && !matchCompany && !matchReferrer && !matchInstagram && !matchTags) {
          return false
        }
      }

      // 2. DDD Filter
      if (selectedDDD !== 'all') {
        const digits = (c.phone || '').replace(/\D/g, '')
        let ddd = ''
        if (digits.startsWith('55') && digits.length >= 12) {
          ddd = digits.substring(2, 4)
        } else if (digits.length >= 10) {
          ddd = digits.substring(0, 2)
        }
        if (ddd !== selectedDDD) {
          return false
        }
      }

      // 3. Stage Filter
      if (selectedStage !== 'all' && c.stage !== selectedStage) {
        return false
      }

      // 4. Response Status Filter
      if (selectedResponse !== 'all' && c.responseStatus !== selectedResponse) {
        return false
      }

      // 5. Interest Filter
      if (selectedInterest !== 'all' && c.interestLevel !== selectedInterest) {
        return false
      }

      // 6. Follow-up Filter Badges
      if (activeFilter === 'today') {
        return c.nextFollowUpDate === todayStr && c.stage !== 'fechado' && c.stage !== 'perdido'
      } else if (activeFilter === 'overdue') {
        return c.nextFollowUpDate && c.nextFollowUpDate < todayStr && c.stage !== 'fechado' && c.stage !== 'perdido'
      } else if (activeFilter === 'upcoming') {
        return c.nextFollowUpDate && c.nextFollowUpDate > todayStr && c.stage !== 'fechado' && c.stage !== 'perdido'
      } else if (activeFilter === 'replied') {
        return c.responseStatus === 'respondeu'
      } else if (activeFilter === 'hot') {
        return c.interestLevel === 'alto' && c.stage !== 'fechado' && c.stage !== 'perdido'
      }

      return true
    })
  }, [contacts, searchQuery, selectedDDD, selectedStage, selectedResponse, selectedInterest, activeFilter, todayStr])

  const hasActiveFilters = 
    activeFilter !== 'all' || 
    selectedStage !== 'all' || 
    selectedResponse !== 'all' || 
    selectedInterest !== 'all' || 
    selectedDDD !== 'all' ||
    Boolean(searchQuery)

  const handleClearFilters = () => {
    setActiveFilter('all')
    setSelectedStage('all')
    setSelectedResponse('all')
    setSelectedInterest('all')
    setSelectedDDD('all')
    setSearchQuery('')
  }

  const repliedCount = contacts.filter(c => c.responseStatus === 'respondeu').length

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewContact={() => {
          setEditingContact(null)
          setIsModalOpen(true)
        }}
        onOpenImport={() => setIsImportModalOpen(true)}
        onExportCSV={() => exportContactsAsCSV(contacts)}
        onExportJSON={() => exportContactsAsJSON(contacts)}
        onResetDefault={handleResetDefault}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        totalContacts={contacts.length}
        repliedCount={repliedCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Metrics */}
        <MetricsCards
          contacts={contacts}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        {/* Filters */}
        <CadenceFilter
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          selectedResponse={selectedResponse}
          setSelectedResponse={setSelectedResponse}
          selectedInterest={selectedInterest}
          setSelectedInterest={setSelectedInterest}
          selectedDDD={selectedDDD}
          setSelectedDDD={setSelectedDDD}
          availableDDDs={availableDDDs}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Views */}
        {viewMode === 'table' && (
          <ContactTable
            contacts={filteredContacts}
            onSelectContact={(c) => setDrawerContact(c)}
            onEditContact={(c) => {
              setEditingContact(c)
              setIsModalOpen(true)
            }}
            onDeleteContact={handleDeleteContact}
            onUpdateStage={handleUpdateStage}
            onUpdateResponse={handleUpdateResponse}
            onUpdateInterest={handleUpdateInterest}
            onAdvanceFollowUp={handleAdvanceFollowUp}
            onBulkUpdateStage={handleBulkUpdateStage}
            onBulkMarkReplied={handleBulkMarkReplied}
          />
        )}

        {viewMode === 'kanban' && (
          <ContactKanban
            contacts={filteredContacts}
            onSelectContact={(c) => setDrawerContact(c)}
            onUpdateStage={handleUpdateStage}
            onUpdateResponse={handleUpdateResponse}
            onOpenNewContact={() => {
              setEditingContact(null)
              setIsModalOpen(true)
            }}
          />
        )}

        {viewMode === 'agenda' && (
          <FollowUpAgenda
            contacts={contacts}
            onSelectContact={(c) => setDrawerContact(c)}
            onAdvanceFollowUp={handleAdvanceFollowUp}
            onUpdateStage={handleUpdateStage}
            onQuickMarkReplied={handleQuickMarkReplied}
          />
        )}

      </main>

      {/* Modals & Drawers */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        initialContact={editingContact}
      />

      <ContactDrawer
        contact={drawerContact}
        isOpen={Boolean(drawerContact)}
        onClose={() => setDrawerContact(null)}
        onEdit={(c) => {
          setEditingContact(c)
          setIsModalOpen(true)
        }}
        onDelete={handleDeleteContact}
        onAddNote={handleAddNote}
        onUpdateStage={handleUpdateStage}
        onUpdateFollowUp={handleUpdateFollowUp}
        onUpdateResponse={handleUpdateResponse}
        onUpdateInterest={handleUpdateInterest}
      />

      <SmartImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportBatch={handleImportBatch}
      />

    </div>
  )
}
export default App
