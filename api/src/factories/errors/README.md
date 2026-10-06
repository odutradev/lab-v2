# Factory: Errors (`@factories/errors`)

Este módulo gerencia o tratamento centralizado de erros da aplicação, assegurando consistência nas respostas HTTP enviadas ao cliente e padronização das mensagens retornadas por falhas de domínio ou de validação.

## Componentes do Módulo

- `constants.ts`: Dicionário global unificado (`ResponseErrors`) mapeando chaves semânticas para seus respectivos HTTP Status Codes e mensagens padronizadas em português.
- `index.ts`: Handler centralizado `sendError` responsável por interceptar erros, registrá-los através de `@utils/localLogger` e responder de forma consistente.
- `schemas.ts`: Esquemas do Zod registrados no OpenAPI para documentar a resposta de erro no Swagger.
- `types.ts`: Tipagens estruturais e interfaces do ecossistema de erros.

---

## Formato Padrão de Resposta de Erro (HTTP 4xx / 5xx)

Toda resposta de falha disparada pelo sistema segue rigorosamente o seguinte formato JSON:

```json
{
  "success": false,
  "code": "user_not_found",
  "message": "Usuário não localizado no sistema",
  "details": []
}
```

---

## Dicionário de Erros (`ResponseErrors`)

O dicionário `ResponseErrors` contém erros comuns do sistema pré-configurados:

| Chave | Status Code | Mensagem de Resposta |
| :--- | :--- | :--- |
| `internal_error` | `500` | Erro interno no servidor |
| `validation_error` | `422` | Erro de validação dos dados |
| `unauthorized` | `401` | Acesso não autorizado |
| `forbidden` | `403` | Acesso negado |
| `bad_request` | `400` | Requisição malformada |
| `not_found` | `404` | Recurso não encontrado |
| `conflict` | `409` | Conflito de dados |
| `no_token` | `401` | Token de autenticação não fornecido |
| `token_is_not_valid` | `401` | Token de autenticação inválido ou expirado |
| `invalid_credentials` | `401` | Credenciais inválidas |
| `user_not_found` | `404` | Usuário não localizado no sistema |

---

## Como Utilizar

### 1. Tratamento Manual (Middlewares Customizados)

Para fluxos que operam fora da fábrica `defineAction` (como middlewares nativos do Express), o utilitário `sendError` deve ser disparado manualmente:

```typescript
import sendError from '@factories/errors'
import { Router } from 'express'

import type { Response, Request, NextFunction } from 'express'

const checkCustomHeader = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['x-custom-header']
  if (!header) {
    sendError({ code: 'bad_request', res, local: 'checkCustomHeader' })
    return
  }
  next()
}
```

### 2. Tratamento Automático (Camada de Actions)

Dentro das ações encapsuladas por `defineAction`, o tratamento de interrupção com erro deve ser feito invocando a propriedade `manageError` injetada diretamente no handler da Action:

```typescript
import defineAction from '@factories/defineAction'

export const getProfile = defineAction({
  method: 'get',
  path: '/users/profile',
  summary: 'Obtém dados do usuário autenticado',
  tags: ['Users'],
  authenticate: true
}, async ({ ids, manageError }) => {
  const user = await userRepository.findById(ids.userId)
  if (!user) {
    return manageError({ code: 'user_not_found' })
  }
  return user
})