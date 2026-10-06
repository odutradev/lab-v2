# Módulo: Email Service (`@email`)

O módulo `@email` abstrai toda a lógica de configuração, envio e renderização de correio eletrônico utilizando `nodemailer` associado ao plugin `nodemailer-markdown`. 

**DIRETRIZ PARA IA:** Nunca crie templates HTML complexos ou inicialize transportes de email dentro das lógicas de negócio. Sempre armazene as mensagens na subpasta `/templates` usando a fábrica `enrichTemplate`. Para enviar emails, chame o método `.send()` diretamente do template exportado.

---

## 1. Filosofia e Funcionalidades

Para manter a simplicidade e leveza, o sistema abandona engines pesados (como Pug, EJS ou Handlebars). A construção visual das mensagens se baseia em **Markdown**, processado e interpolado com variáveis no momento do disparo.

- **Singleton Provider:** A conexão SMTP é instanciada apenas quando solicitada via `getInstance()`.
- **Markdown & Variáveis:** Suporta parseamento natural do Nodemailer Markdown, convertendo sintaxe `## Título` para tags nativas HTML. Variáveis locais são lidas como `{{ chave }}`.
- **Enrichment de Templates:** A função `enrichTemplate` encapsula templates em objetos dinâmicos que herdam as funções tipadas de disparo (com parâmetros de `to` e `variables`).

---

## 2. Estrutura Interna

- `connect.ts`: Inicializa de forma assíncrona o `transporter` validando credenciais vitais (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`).
- `utils.ts`: Expõe o orquestrador `sendEmail` e o injetor abstrato `enrichTemplate`. 
- `types.ts`: Concentra contratos, garantindo que variáveis como `EmailTemplateVariables` suportem primitivos sem complexidade profunda.
- `/templates`: Repositório de arquivos `.ts` individuais, onde cada arquivo representa estritamente um layout de email (ex: `welcome.ts`, `verificationCode.ts`).

---

## 3. Gestão e Criação de Templates

Qualquer novo email a ser disparado no projeto deve ser adicionado na pasta `/templates` seguindo a estrutura padronizada.

**1. Criação (`/templates/resetPassword.ts`):**
```typescript
import { enrichTemplate } from '@email/utils'

const resetPasswordTemplate = enrichTemplate({
  subject: 'Recuperação de Senha - Segunda Casa 🏡',
  markdownBody: `# Solicitação de Nova Senha

Olá, {{ name }}!

Recebemos um pedido para alterar a senha da sua conta. Utilize o link seguro abaixo:

**[Redefinir Senha]({{ link }})**

Se você não fez essa requisição, apenas ignore este e-mail.
`
})

export default resetPasswordTemplate
```

---

## 4. Exemplo de Consumo (Actions/Domínios)

A invocação na Action/Controller não precisa saber sobre transportes, SMTP ou processadores; ela apenas invoca a injeção do template correspondente.

```typescript
import welcomeTemplate from '@email/templates/welcome'

const sendWelcomeFlow = async (userEmail: string, userName: string) => {
  const result = await welcomeTemplate.send({
    to: userEmail,
    variables: {
      name: userName
    }
  })

  if (!result.success) {
    // Tratar falha silenciosa de e-mail, se necessário.
  }
}