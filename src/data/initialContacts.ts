import { Contact } from '../types/crm'
import { addDaysToToday } from '../lib/utils'

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'lead_1',
    name: 'Carlos Henrique Albuquerque',
    phone: '(11) 98765-4321',
    cleanPhone: '5511987654321',
    email: 'carlos.albuquerque@techsolucoes.com.br',
    company: 'Tech Soluções',
    role: 'Diretor Comercial',
    stage: 'interessado',
    responseStatus: 'respondeu',
    interestLevel: 'alto',
    nextFollowUpDate: addDaysToToday(0), // Hoje
    nextFollowUpTime: '14:30',
    notes: 'Pediu para enviar a proposta revisada até às 14h. Demonstrou grande interesse no plano anual.',
    tags: ['Decisor', 'Proposta Enviada', 'WhatsApp'],
    interactionHistory: [
      {
        id: 'log_1_1',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        type: 'whatsapp',
        content: 'Primeiro contato enviado apresentando a solução.'
      },
      {
        id: 'log_1_2',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        type: 'whatsapp',
        content: 'Cliente respondeu: "Gostei bastante da apresentação. Podemos agendar uma reunião hoje às 14:30?"'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_2',
    name: 'Mariana Duarte Souza',
    phone: '(21) 99123-8899',
    cleanPhone: '5521991238899',
    email: 'mariana.duarte@nexusgroup.com',
    company: 'Nexus Group',
    role: 'Gerente de Operações',
    stage: 'respondeu_qualificando',
    responseStatus: 'respondeu',
    interestLevel: 'medio',
    nextFollowUpDate: addDaysToToday(1), // Amanhã
    nextFollowUpTime: '10:00',
    notes: 'Respondeu perguntando sobre o prazo de implementação e integração com o sistema atual.',
    tags: ['Qualificação', 'Inbound'],
    interactionHistory: [
      {
        id: 'log_2_1',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        type: 'whatsapp',
        content: 'Enviada mensagem inicial pelo WhatsApp.'
      },
      {
        id: 'log_2_2',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        type: 'note',
        content: 'Mariana respondeu querendo tirar dúvidas técnicas sobre a plataforma.'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_3',
    name: 'Roberto Miranda',
    phone: '(31) 98844-5566',
    cleanPhone: '5531988445566',
    email: 'roberto.miranda@logisticaagil.com.br',
    company: 'Logística Ágil',
    role: 'Sócio Fundador',
    stage: 'followup_1',
    responseStatus: 'nao_respondeu',
    interestLevel: 'medio',
    nextFollowUpDate: addDaysToToday(0), // Hoje
    nextFollowUpTime: '16:00',
    notes: 'Enviada 1ª mensagem há 2 dias. Hora de enviar o primeiro reforço amigável.',
    tags: ['Follow-up Pendente'],
    interactionHistory: [
      {
        id: 'log_3_1',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        type: 'whatsapp',
        content: '1º contato enviado. Mensagem recebida mas não respondida.'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_4',
    name: 'Juliana Fernandes Costa',
    phone: '(41) 99876-1122',
    cleanPhone: '5541998761122',
    email: 'juliana.costa@vanguardaservicos.com',
    company: 'Vanguarda Serviços',
    role: 'Supervisora de Vendas',
    stage: 'novo',
    responseStatus: 'aguardando',
    interestLevel: 'alto',
    nextFollowUpDate: addDaysToToday(0),
    nextFollowUpTime: '11:00',
    notes: 'Lead quente recebido por indicação. Fazer primeiro contato via WhatsApp.',
    tags: ['Indicação', 'Novo'],
    interactionHistory: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_5',
    name: 'Lucas Barreto Silva',
    phone: '(19) 98111-2233',
    cleanPhone: '5519981112233',
    email: 'lucas.barreto@inovare.io',
    company: 'Inovare Soluções Digitais',
    role: 'CEO',
    stage: 'fechado',
    responseStatus: 'respondeu',
    interestLevel: 'alto',
    nextFollowUpDate: addDaysToToday(30),
    notes: 'Contrato assinado! Início do onboarding previsto para a próxima semana.',
    tags: ['Cliente Ativo', 'Contrato Fechado 🚀'],
    interactionHistory: [
      {
        id: 'log_5_1',
        timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        type: 'whatsapp',
        content: 'Contato inicial.'
      },
      {
        id: 'log_5_2',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        type: 'cadence_change',
        content: 'Status alterado para Fechado / Ganho 🎉'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_6',
    name: 'Fernanda Vasconcelos',
    phone: '(71) 99222-3344',
    cleanPhone: '5571992223344',
    email: 'fernanda@vasconcelosadv.com.br',
    company: 'Vasconcelos Advocacia',
    role: 'Sócia',
    stage: 'followup_2',
    responseStatus: 'nao_respondeu',
    interestLevel: 'baixo',
    nextFollowUpDate: addDaysToToday(-1), // Atrasado (ontem)
    notes: 'Sem resposta após 2 tentativas. Enviar último toque de break-up.',
    tags: ['Atrasado', 'Cadência Final'],
    interactionHistory: [
      {
        id: 'log_6_1',
        timestamp: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
        type: 'whatsapp',
        content: 'Contato inicial enviado.'
      },
      {
        id: 'log_6_2',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        type: 'whatsapp',
        content: 'Follow-up 1 enviado.'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  }
];
