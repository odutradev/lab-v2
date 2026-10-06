# Factory: Pagination (`@factories/pagination`)

Este módulo é responsável por padronizar a paginação de registros em endpoints de listagem do sistema, gerando as coordenadas de limite e offset corretas e devolvendo a resposta estruturada com metadados.

## Query Parameters Suportados

Qualquer rota paginada do sistema lê e valida automaticamente os seguintes Query Parameters:

- `page` *(number)*: Define a página atual da listagem. O valor mínimo aceito é `1` (padrão: `1`).
- `limit` *(number)*: Define a quantidade de itens retornados por página. O limite máximo é `100` (padrão: `10`).

---

## Formato de Resposta Paginada

A resposta retornada ao cliente segue rigorosamente a estrutura padrão `{ meta, data }`:

```json
{
  "meta": {
    "total": 50,
    "totalPages": 5,
    "limit": 10,
    "page": 1
  },
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ]
}
```

---

## Estrutura do Módulo

- `index.ts`: Funções de processamento.
  - `getPaginationOptions(query)`: Calcula `limit`, `offset` e `page` baseado nos parâmetros informados, respeitando os limites da aplicação.
  - `buildPaginatedResponse(data, page, limit)`: Formata a estrutura final contendo metadados (`meta`) e os resultados (`data`).
- `schemas.ts`:
  - `paginationQuerySchema`: Validação do Zod para os query params.
  - `createPaginatedSchema(schema, name)`: Helper para construir e documentar schemas paginados no Swagger.
- `types.ts`: Tipagens estruturais (`PaginationQuery`, `PaginatedData`, `PaginatedResponse`).

---

## Como Utilizar

### 1. Configurando o Schema de Validação e Swagger

No arquivo `schemas.ts` do contexto da Action, mescle os parâmetros de paginação e registre a resposta no Swagger:

```typescript
import { createPaginatedSchema, paginationQuerySchema } from '@factories/pagination/schemas'
import { z } from 'zod'

export const itemResponseSchema = z.object({
  id: z.string(),
  title: z.string()
})

export const listItemsQuerySchema = z.object({
  category: z.string().optional()
}).merge(paginationQuerySchema)

export const paginatedItemsResponseSchema = createPaginatedSchema(itemResponseSchema, 'PaginatedItems')
```

### 2. Lógica da Action

Utilize os helpers de paginação para extrair opções e formatar a resposta:

```typescript
import { buildPaginatedResponse, getPaginationOptions } from '@factories/pagination'
import defineAction from '@factories/defineAction'

import { listItemsQuerySchema, paginatedItemsResponseSchema } from './schemas'
import itemRepository from '../../repositories/item'

export const listItems = defineAction({
  method: 'get',
  path: '/items',
  summary: 'Lista itens com paginação',
  tags: ['Items'],
  schema: {
    query: listItemsQuerySchema
  },
  responses: {
    200: {
      description: 'Lista paginada de itens',
      schema: paginatedItemsResponseSchema
    }
  }
}, async ({ query }) => {
  const { limit, offset, page } = getPaginationOptions(query)
  const result = await itemRepository.list({ limit, offset, category: query.category })
  return buildPaginatedResponse(result, page, limit)
})
```

### 3. Integração na Camada de Repositório

O repositório do Mongoose deve retornar o total de registros (`count`) e a fatia correspondente (`rows`):

```typescript
import { ItemModel } from './model'

import type { PaginatedData } from '@factories/pagination/types'

export const itemRepository = {
  list: async ({ limit, offset, category }: { limit: number; offset: number; category?: string }): Promise<PaginatedData<unknown>> => {
    const filter = category ? { category } : {}
    const [count, rows] = await Promise.all([
      ItemModel.countDocuments(filter),
      ItemModel.find(filter).skip(offset).limit(limit).lean()
    ])
    return { count, rows }
  }
}