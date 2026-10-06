# Factory: Filters (`@factories/filters`)

Este módulo gerencia o tratamento, parseamento e aplicação de filtros de consulta dinâmicos recebidos via Query Parameters em endpoints de listagem. Ele permite desacoplar a definição de busca do banco de dados e aplicar regras uniformes.

## Formato do Query Parameter `filters`

Os filtros são passados na URL do cliente em uma única string, usando vírgulas para separar as chaves e os valores de forma encadeada.

- **Formato:** `?filters=chave1,valor1,chave2,valor2`
- **Exemplo Real:** `?filters=username,admin,role,editor`

---

## Estrutura do Módulo

- `index.ts`: Funções de processamento.
  - `parseFilters`: Valida a string recebida e extrai chaves aceitas para exact/partial matching.
  - `applyInMemoryFilters`: Aplica os filtros em um array de objetos em memória (útil para testes ou mocks).
- `schemas.ts`: `createFilterQuerySchema` gera o esquema do Zod documentando quais chaves exatas e parciais a rota aceita.
- `types.ts`: Definições de tipo para configurações de filtro (`FilterConfig`).

---

## Como Utilizar

### 1. Configurando Filtros na Action e no Schema

Ao definir uma rota de listagem que aceita filtros, crie o esquema de validação estendido com `createFilterQuerySchema` e passe a configuração do que é pesquisável:

```typescript
import { createFilterQuerySchema } from '@factories/filters/schemas'
import { z } from 'zod'

export const listPropertiesConfig = {
  exact: ['status', 'city'],
  partial: ['title', 'description']
}

export const listPropertiesQuerySchema = z.object({})
  .merge(createFilterQuerySchema(listPropertiesConfig))
```

Em seguida, utilize-o na declaração da Action usando `defineAction`:

```typescript
import defineAction from '@factories/defineAction'

import { listPropertiesQuerySchema, listPropertiesConfig } from './schemas'
import propertyRepository from '../../repositories/property'

export const listProperties = defineAction({
  method: 'get',
  path: '/properties',
  summary: 'Lista propriedades cadastradas',
  tags: ['Properties'],
  schema: {
    query: listPropertiesQuerySchema
  }
}, async ({ query }) => {
  const properties = await propertyRepository.list({
    filters: query.filters,
    config: listPropertiesConfig
  })
  return properties
})
```

### 2. Implementação no Repositório (Banco de Dados Mongoose)

Na camada do repositório, faça o parse da string de filtros com `parseFilters` e monte a query do Mongoose dinamicamente:

```typescript
import { parseFilters } from '@factories/filters'
import { PropertyModel } from './model'

import type { FilterConfig } from '@factories/filters/types'

export const propertyRepository = {
  list: async ({ filters, config }: { filters?: string; config?: FilterConfig }) => {
    const parsed = parseFilters(filters, config)
    const query: Record<string, unknown> = {}

    Object.entries(parsed).forEach(([key, value]) => {
      if (config?.exact?.includes(key)) {
        query[key] = value
      } else if (config?.partial?.includes(key)) {
        query[key] = { $regex: value, $options: 'i' }
      }
    })

    const rows = await PropertyModel.find(query).lean()
    return rows
  }
}