# Middlewares do Domínio: Usuários (`@domains/users/middlewares`)

Este diretório agrupa os middlewares fundamentais responsáveis pela segurança, controle de acesso e validação de regras de negócio estritas atreladas à sessão do usuário. Eles são projetados para atuar de forma nativa com o wrapper `defineAction`, acoplando de maneira automática suas respostas de erro à documentação interativa (Swagger).

---

## 1. authMiddleware (`/auth`)

Responsável por interceptar requisições protegidas, decodificar e validar o token JWT (Bearer) enviado nos cabeçalhos e extrair a identidade do cliente em execução.

- **Injeção de Contexto:** Caso o token seja comprovado, o `userId` contido no payload é injetado localmente no objeto do Express (`res.locals.userId`). A partir daí, o middleware `manageRequest` fará a ponte entregando-o em `ids.userId` diretamente para sua Action.
- **Integração Simplificada:** Para rotas comuns, basta setar a propriedade `authenticate: true` na configuração do `defineAction`.
- **Precedência de Execução (IMPORTANTE):** Se você utilizar middlewares encadeados no array `middlewares` que dependem da existência prévia do `res.locals.userId` (como `superAdminMiddleware`), a chave `authenticate: true` não é suficiente para garantir a ordem. Você **DEVE** declarar o `authMiddlewareWithDocs` explicitamente como o primeiro item do seu array.
- **Auto-Documentação Swagger:** Injeta automaticamente o status HTTP `401` informando sobre token ausente, expirado ou com assinatura corrompida.

---

## 2. superAdminMiddleware (`/superAdmin`)

Atua como uma barreira de restrição administrativa, bloqueando acessos a qualquer rota protegida por ele de clientes que não possuam o privilégio booleano administrativo global.

- **Pré-requisito Crítico:** Por consultar o banco buscando a flag `superAdmin`, ele obrigatoriamente depende da execução do `authMiddleware` antes para saber **quem** é o usuário logado (`res.locals.userId`).
- **Como Utilizar:** Adicione o middleware na propriedade `middlewares` da `defineAction`. Lembre-se de adicionar o `authMiddlewareWithDocs` antes dele na lista.
- **Auto-Documentação Swagger:** Injeta automaticamente as respostas `401` (Não Autorizado) e `403` (Acesso negado por falta de privilégios).

---

## Exemplo Prático de Consumo

O acoplamento destes utilitários com a Action ocorre de forma elegante, mas a ordem de declaração no array de `middlewares` é crítica sempre que há interdependência:

```typescript
import defineAction from '@factories/defineAction'

import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import superAdminMiddleware from '@domains/users/middlewares/superAdmin'

export const banUserPlatform = defineAction({
  method: 'post',
  path: '/admin/users/:userId/ban',
  summary: 'Aplica banimento ao usuário na plataforma',
  tags: ['Admin'],
  authenticate: true,
  middlewares: [
    authMiddlewareWithDocs,
    superAdminMiddleware
  ]
}, async ({ params }) => {})
```