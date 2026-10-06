import { enrichTemplate } from '@email/utils'

const verificationCodeTemplate = enrichTemplate({
  subject: 'Código de Verificação - Lab',
  markdownBody: `# Seu Código de Verificação 🔑

Olá!

Você solicitou um código de verificação para a sua conta no **Lab**.

Use o código de 6 dígitos abaixo para prosseguir com a sua solicitação:

## **{{ code }}**

Este código é temporário e expirará em **15 minutos**. Se você não solicitou este código, por favor ignore este e-mail.

Com carinho,  
**Equipe Lab**`
})

export default verificationCodeTemplate