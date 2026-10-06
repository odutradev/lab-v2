import { enrichTemplate } from '@email/utils'

const visitCanceledTemplate = enrichTemplate({
  subject: 'Visita cancelada - Segunda Casa 🏡',
  markdownBody: `# Visita Cancelada

Olá, {{ recipientName }}!

A visita agendada ao imóvel **{{ propertyTitle }}** foi cancelada pelo {{ canceledBy }}.

**Detalhes do Cancelamento:**
- **Data original:** {{ date }}
- **Horário original:** das {{ startTime }} às {{ endTime }}
- **Motivo do cancelamento:** {{ reason }}

{{ actionText }}

Com carinho,
**Equipe Segunda Casa** 🏡`
})

export default visitCanceledTemplate