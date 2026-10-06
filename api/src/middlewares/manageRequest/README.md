# Middleware: Manage Request (`@middlewares/manageRequest`)

O `manageRequest` é o orquestrador unificado de ciclo de vida das requisições HTTP da API. Ele atua como um wrapper universal em torno das funções de serviço (Actions), garantindo que todas as requisições passem por validações estruturadas de entrada, extração tipada de contexto, injeção de cabeçalhos institucionais e limpeza pós-processamento.

---

## 1. Responsabilidades do Ciclo de Vida

O wrapper automatiza as etapas críticas de execução de uma rota Express em um único fluxo seguro:

```text
[Cliente] -> [Express Router] -> [manageRequest Wrapper]
                                          |
                        +-----------------+-----------------+
                        |                                   |
              [1. Validação Zod]                  [4. Execução da Action]
                        |                                   |
              [2. Extração Contexto]              [5. Envio da Resposta (200)]
                        |                                   |
               [2. Extração Contexto]              [5. Hook finally (Cleanup)]
```

1. **Validação Estrita via Zod:** Intercepta a requisição e valida de forma independente `body`, `query` e `params` contra os esquemas definidos na Action. Se falhar, aborta e responde imediatamente com `validation_error` (HTTP 422).
2. **Construção do Contexto Unificado:** Extrai informações do Express e injeta no parâmetro `requestBody` da Action de forma organizada, abstraindo o acesso direto a objetos de baixo nível do Express.
3. **Tratamento Global de Exceções:** Captura qualquer falha não tratada de runtime na execução das regras de negócio, registra o rastro com `@utils/localLogger` e responde com `internal_error` (HTTP 500) para evitar que a aplicação caia.
4. **Limpeza Automatizada (Cleanup):** No bloco `finally`, detecta se houve arquivos temporários armazenados na requisição (via `req.file`) e executa a exclusão de disco para evitar vazamento de memória e acúmulo de cache local.

---

## 2. Estrutura Interna e Arquivos

O recurso está estruturado de forma coesa seguindo as diretrizes arquiteturais de responsabilidade única:

- `index.ts`: Ponto de entrada que exporta a função `manageRequest` e gerencia o fluxo `try-catch-finally`.
- `context.ts`: Constrói o payload tipado que a Action consome, populando propriedades como `ids.userId`, `data`, `params` e `query`.
- `validation.ts`: Executa os testes lógicos do Zod para cada bloco da requisição (`safeParse`) e reatribui os valores purificados de volta ao Express.
- `types.ts`: Define as interfaces estritas para esquemas, payloads e as assinaturas da função de serviço (`ServiceFunction`).

---

## 3. Interfaces de Tipagem Base

### `ManageRequestBody<T>`
Este é o formato de dados que a sua Action receberá no primeiro argumento do handler.

```typescript
export type ManageRequestBody<T extends ManageRequestSchema = ManageRequestSchema> = {
  manageError: (data: ManageErrorParams) => void
  defaultExpress: DefaultExpressContext
  ids: RequestIdentifiers
  params: T['params']
  query: T['query']
  data: T['body']
  file?: FileData
}
```

- `ids.userId`: O identificador único do usuário autenticado (extraído previamente pelo middleware de autenticação).
- `data`: O payload do corpo da requisição já validado, sanitizado e tipado pelo Zod.
- `manageError`: Callback especializado para interromper o fluxo com uma assinatura de erro catalogada no sistema.

---

## 4. Exemplo Prático de Integração

O wrapper é injetado de forma transparente por meio da factory `defineAction`.

```typescript
import { z } from 'zod'

import defineAction from '@factories/defineAction'

const updateSchema = z.object({
  name: z.string().min(3)
})

export const updateProfile = defineAction({
  method: 'put',
  path: '/profile',
  summary: 'Atualiza o perfil do usuário logado',
  tags: ['Profile'],
  authenticate: true,
  schema: {
    body: updateSchema
  }
}, async ({ data, ids, manageError }) => {
  const user = await userRepository.findById(ids.userId)
  if (!user) {
    return manageError({ code: 'user_not_found' })
  }
  const updated = await userRepository.update(ids.userId, data)
  return updated
})