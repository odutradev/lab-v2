import { enrichTemplate } from '@email/utils'

const visitConfirmedTemplate = enrichTemplate({
  subject: 'Visita Confirmada! - Segunda Casa 🏡',
  markdownBody: `# Visita Confirmada! 🎉

Olá, {{ tenantName }}!

A sua visita ao imóvel **{{ propertyTitle }}** foi confirmada com sucesso!

**Informações da Visita:**
- **Data:** {{ date }}
- **Horário:** das {{ startTime }} às {{ endTime }}{{ extraInfo }}

Prepare-se para conhecer o seu próximo lar!

Com carinho,
**Equipe Segunda Casa** 🏡`
})

export default visitConfirmedTemplate