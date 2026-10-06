# Middlewares do Domínio: Usuários (`@domains/users/middlewares`)

Este diretório agrupa os middlewares fundamentais responsáveis pela segurança, controle de acesso e validação de regras de negócio estritas atreladas à sessão do usuário. Eles são projetados para atuar de forma nativa com o wrapper `defineAction`, acoplando de maneira automática suas respostas de erro à documentação interativa (Swagger).

---

## 1. authMiddleware (`/auth`)

Responsável por interceptar requisições protegidas, decodificar e validar o token JWT (Bearer) enviado nos cabeçalhos e extrair a identidade do cliente em execução.

- **Injeção de Contexto:** Caso o token seja comprovado, o `userId` contido no payload é injetado localmente no objeto do Express (`res.locals.userId`). A partir daí, o middleware `manageRequest` fará a ponte entregando-o em `ids.userId` diretamente para sua Action.
- **Integração Simplificada:** Para rotas comuns, basta setar a propriedade `authenticate: true` na configuração do `defineAction`.
- **Precedência de Execução (IMPORTANTE):** Se você utilizar middlewares encadeados no array `middlewares` que dependem da existência prévia do `res.locals.userId` (como `superAdminMiddleware` ou `accountReadiness`), a chave `authenticate: true` não é suficiente para garantir a ordem. Você **DEVE** declarar o `authMiddlewareWithDocs` explicitamente como o primeiro item do seu array.
- **Auto-Documentação Swagger:** Injeta automaticamente o status HTTP `401` informando sobre token ausente, expirado ou com assinatura corrompida.

---

## 2. superAdminMiddleware (`/superAdmin`)

Atua como uma barreira de restrição administrativa, bloqueando acessos a qualquer rota protegida por ele de clientes que não possuam o privilégio booleano administrativo global.

- **Pré-requisito Crítico:** Por consultar o banco buscando a flag `superAdmin`, ele obrigatoriamente depende da execução do `authMiddleware` antes para saber **quem** é o usuário logado (`res.locals.userId`).
- **Como Utilizar:** Adicione o middleware na propriedade `middlewares` da `defineAction`. Lembre-se de adicionar o `authMiddlewareWithDocs` antes dele na lista.
- **Auto-Documentação Swagger:** Injeta automaticamente as respostas `401` (Não Autorizado) e `403` (Acesso negado por falta de privilégios).

---

## 3. createAccountReadinessMiddleware (`/accountReadiness`)

Implementa o padrão *Higher-Order Function* (função que retorna um middleware). Seu papel é barrar o acesso à funcionalidades críticas por contas que ainda não concluíram o fluxo de *onboarding* / cadastro completo com base no perfil.

- **Comportamento e Dependências:** Assim como o administrador, depende do `authMiddleware`. Ele consulta o método `checkAccountReadiness` do `userRepository` repassando a `role` solicitada (`tenant` ou `owner`).
- **Detalhamento do Erro:** Caso o usuário possua restrições (ex: sem documento validado), o acesso é bloqueado e as pendências são listadas dentro da chave `details` no payload do erro (Status 403).
- **Auto-Documentação Swagger:** Injeta automaticamente o retorno `403` atrelado ao bloqueio de perfil incompleto.

---

## Exemplo Prático de Consumo

O acoplamento destes utilitários com a Action ocorre de forma elegante, mas a ordem de declaração no array de `middlewares` é crítica sempre que há interdependência:

```typescript
import defineAction from '@factories/defineAction'

import { createAccountReadinessMiddleware } from '@domains/users/middlewares/accountReadiness'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import superAdminMiddleware from '@domains/users/middlewares/superAdmin'

export const createLeaseIntent = defineAction({
  method: 'post',
  path: '/leases/intent',
  summary: 'Cria uma intenção de locação',
  tags: ['Leases'],
  authenticate: true,
  middlewares: [
    authMiddlewareWithDocs,
    createAccountReadinessMiddleware('tenant')
  ]
}, async ({ ids, data }) => {})

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