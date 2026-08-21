import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  UploadCloud, 
  Download, 
  Sun, 
  Moon, 
  Search, 
  LayoutList, 
  Kanban, 
  Calendar,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  RotateCcw
} from 'lucide-react'
import { ViewMode } from '../types/crm'
import { getLastSavedTime } from '../lib/storage'
import { toast } from 'sonner'

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewContact: () => void;
  onOpenImport: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onResetDefault: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  totalContacts: number;
  repliedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onOpenNewContact,
  onOpenImport,
  onExportCSV,
  onExportJSON,
  onResetDefault,
  darkMode,
  setDarkMode,
  totalContacts,
  repliedCount
}) => {
  const [lastSaved, setLastSaved] = useState<string>(getLastSavedTime())
  const [savePing, setSavePing] = useState(false)

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const savedTime = e?.detail?.savedAt || getLastSavedTime()
      setLastSaved(savedTime)
      setSavePing(true)
      setTimeout(() => setSavePing(false), 2000)
    }

    window.addEventListener('crm_contacts_updated', handleUpdate)
    return () => window.removeEventListener('crm_contacts_updated', handleUpdate)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  MORF PRO
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30 tracking-wide uppercase">
                  CRM Cadência
                </span>
              </div>
              
              {/* Live Save Status Indicator */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium transition-all ${
                  savePing ? 'text-emerald-300 scale-105' : 'text-emerald-400/90'
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Salvo ({lastSaved})
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  • {totalContacts} leads ({repliedCount} responderam)
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por telefone (ex: 11, 19, 99003), nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-secondary/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded bg-muted/60"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Visualização em Tabela"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabela</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Visualização em Funil / Kanban"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Funil</span>
            </button>

            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'agenda'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Agenda de Follow-up do Dia"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hoje</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            
            {/* Import Button */}
            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 transition-all"
              title="Colar ou Importar Lista de Contatos"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Importar</span>
            </button>

            {/* Export Dropdown / Button */}
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60 transition-all"
              title="Exportar contatos em CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Exportar</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              aria-label="Alternar tema claro/escuro"
              title={darkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* New Contact Button */}
            <button
              onClick={onOpenNewContact}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="py-2.5 md:hidden border-t border-border/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-secondary/50 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

      </div>
    </header>
  )
}
