import { enrichTemplate } from '@email/utils'

const visitRescheduledOwnerNotificationTemplate = enrichTemplate({
  subject: 'Visita Reagendada - Necessita Aprovação - Segunda Casa 🏡',
  markdownBody: `# Visita Reagendada 📅

Olá, {{ ownerName }}!

O visitante **{{ tenantName }}** solicitou o reagendamento de uma visita para o imóvel **{{ propertyTitle }}**.

**Novos Detalhes Solicitados:**
- **Nova Data:** {{ date }}
- **Novo Horário:** das {{ startTime }} às {{ endTime }}

A visita retornou para o status de **pendente**. Por favor, acesse a plataforma para aprovar ou rejeitar o novo horário.

Com carinho,
**Equipe Segunda Casa** 🏡`
})

export default visitRescheduledOwnerNotificationTemplate