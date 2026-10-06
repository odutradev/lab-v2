import { enrichTemplate } from '@email/utils'

const automaticVisitOwnerNotificationTemplate = enrichTemplate({
  subject: 'Nova Visita Agendada Automaticamente! - Segunda Casa 🏡',
  markdownBody: `# Nova Visita Agendada! 📅

Olá, {{ ownerName }}!

Uma nova visita para o seu imóvel **{{ propertyTitle }}** foi agendada automaticamente pelo sistema.

**Detalhes do Agendamento:**
- **Data:** {{ date }}
- **Horário:** das {{ startTime }} às {{ endTime }}
- **Visitante:** {{ tenantName }}{{ extraInfo }}

Com carinho,
**Equipe Segunda Casa** 🏡`
})

export default automaticVisitOwnerNotificationTemplate