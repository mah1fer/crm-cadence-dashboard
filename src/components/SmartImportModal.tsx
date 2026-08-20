import React, { useState } from 'react'
import { Contact, CadenceStage, InterestLevel, STAGES_CONFIG } from '../types/crm'
import { parseRawContactsText, convertPreviewsToContacts, ParsedContactPreview } from '../lib/parser'
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  User,
  ListPlus,
  HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBatch: (newContacts: Contact[]) => void;
}

export const SmartImportModal: React.FC<SmartImportModalProps> = ({
  isOpen,
  onClose,
  onImportBatch
}) => {
  const [rawText, setRawText] = useState('')
  const [defaultStage, setDefaultStage] = useState<CadenceStage>('novo')
  const [defaultInterest, setDefaultInterest] = useState<InterestLevel>('medio')
  const [previews, setPreviews] = useState<ParsedContactPreview[]>([])

  if (!isOpen) return null

  const handleTextChange = (text: string) => {
    setRawText(text)
    if (!text.trim()) {
      setPreviews([])
      return
    }
    const parsed = parseRawContactsText(text)
    setPreviews(parsed)
  }

  const handleSampleLoad = () => {
    const sample = `Guilherme Santos - 11987654321 - guilherme@tech.com\nBruna Lima; (21) 99888-1122; bruna@empresa.com.br\nRicardo Mendes | 31988887777\nNome: Camila Rocha Telefone: 41 99123-4567 Email: camila@startup.io`
    handleTextChange(sample)
  }

  const handleConfirmImport = () => {
    const validPreviews = previews.filter(p => p.isValid)
    if (validPreviews.length === 0) {
      toast.error('Nenhum contato válido encontrado para importar.')
      return
    }

    const contacts = convertPreviewsToContacts(validPreviews, defaultStage, defaultInterest)
    onImportBatch(contacts)
    toast.success(`${contacts.length} contatos importados com sucesso para o CRM!`)
    setRawText('')
    setPreviews([])
    onClose()
  }

  const validCount = previews.filter(p => p.isValid).length
  const invalidCount = previews.length - validCount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                Importador Inteligente de Lista
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3 h-3 text-blue-400" /> Auto-Parser
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Cole sua lista de contatos em qualquer formato (planilha, WhatsApp, texto)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Cole aqui a lista de contatos:
              </label>
              <button
                type="button"
                onClick={handleSampleLoad}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Carregar Exemplo de Teste
              </button>
            </div>

            <textarea
              rows={5}
              placeholder={`Exemplo de formatos aceitos:\nJoão Silva - (11) 99888-7766 - joao@empresa.com\nMaria Santos | 21988887777 | maria@gmail.com\nPedro Rocha	19987654321	pedro@tech.com`}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full p-3.5 text-xs font-mono rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
            />
          </div>

          {/* Configurações Iniciais da Importação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-secondary/30 rounded-xl border border-border/80">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Estágio Inicial da Cadência
              </label>
              <select
                value={defaultStage}
                onChange={(e) => setDefaultStage(e.target.value as CadenceStage)}
                className="w-full p-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none"
              >
                {Object.entries(STAGES_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>{cfg.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Nível de Interesse Inicial
              </label>
              <select
                value={defaultInterest}
                onChange={(e) => setDefaultInterest(e.target.value as InterestLevel)}
                className="w-full p-2 text-xs rounded-lg bg-card border border-border text-foreground focus:outline-none"
              >
                <option value="alto">🔥 Alto Interesse</option>
                <option value="medio">⚡ Médio Interesse</option>
                <option value="baixo">❄️ Baixo Interesse</option>
              </select>
            </div>
          </div>

          {/* Live Preview of parsed contacts */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ListPlus className="w-4 h-4 text-primary" />
                  Prévia dos Contatos Identificados ({validCount} válidos)
                </span>
                {invalidCount > 0 && (
                  <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {invalidCount} linha(s) ignoradas
                  </span>
                )}
              </div>

              <div className="border border-border rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-secondary/60 text-muted-foreground sticky top-0 border-b border-border">
                    <tr>
                      <th className="p-2.5">Nome Separado</th>
                      <th className="p-2.5 text-emerald-400">Telefone / WhatsApp ⭐</th>
                      <th className="p-2.5">E-mail</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {previews.map((item, idx) => (
                      <tr key={idx} className={item.isValid ? 'hover:bg-secondary/20' : 'bg-rose-500/5'}>
                        <td className="p-2.5 font-semibold text-foreground">
                          {item.name}
                        </td>
                        <td className="p-2.5 font-mono text-emerald-400">
                          {item.phone || <span className="text-rose-400 italic">Ausente</span>}
                        </td>
                        <td className="p-2.5 text-muted-foreground">
                          {item.email || <span className="text-muted-foreground/40">-</span>}
                        </td>
                        <td className="p-2.5 text-right">
                          {item.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Pronto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-medium" title={item.error}>
                              <AlertCircle className="w-3.5 h-3.5" /> {item.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {validCount > 0 ? `${validCount} contato(s) prontos para envio.` : 'Cole a lista acima.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-40"
            >
              Importar {validCount > 0 ? `${validCount} Contatos` : ''}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
