# Factory: Define Action (`@factories/defineAction`)

Este módulo é o único ponto de entrada para a criação, registro e documentação de rotas e controllers da API. Ele integra a execução lógica do serviço com a geração automática do Swagger através do OpenAPI de forma totalmente transparente.

## Comportamento de Respostas Automáticas

A fábrica `defineAction` simplifica a declaração de endpoints injetando automaticamente as respostas HTTP mais comuns no Swagger. Você não precisa declará-las manualmente para cada rota.

### 1. Respostas Padrão (Sempre Inclusas)
Toda rota registrada via `defineAction` herda automaticamente as seguintes respostas na documentação:

| Código | Descrição | Schema / Payload |
| :--- | :--- | :--- |
| `200` | Sucesso | Retorno do handler / Customizado |
| `400` | Requisição inválida | Vazio ou customizado |
| `422` | Erro de validação dos dados | `errorResponseSchema` (Zod validation errors) |
| `500` | Erro interno | Mensagem de erro genérica |

### 2. Acoplamento de Documentação de Middlewares
Se você passar middlewares que possuem a propriedade estática `responses` ou `authenticate` definida, o `defineAction` irá varrer esses middlewares e acoplar automaticamente suas especificações ao Swagger da rota correspondente:
- **Respostas de Erro (`responses`):** Ex: `createUploadMiddleware()` expõe uma resposta `400` específica para falhas de upload.
- **Autenticação Automática (`authenticate: true`):** Middlewares como `authMiddleware` ou `superAdminMiddleware` definem `authenticate: true`, ativando automaticamente o esquema de segurança Bearer JWT (`security: [{ bearerAuth: [] }]`) no OpenAPI da rota.

---

## Como Criar uma Nova Rota

A declaração deve ser feita no arquivo `index.ts` de um contexto específico de domínio utilizando a função `defineAction`.

```typescript
import { z } from 'zod'

import authMiddleware from '@domains/users/middlewares/auth'
import defineAction from '@factories/defineAction'

import { createProductSchema, productResponseSchema } from './schemas'
import productRepository from '../../repositories/product'

import type { CreateProductBody } from './types'

export const createProduct = defineAction<CreateProductBody>({
  method: 'post',
  path: '/products',
  summary: 'Cadastra um novo produto',
  tags: ['Products'],
  schema: {
    body: createProductSchema
  },
  responses: {
    200: {
      description: 'Produto criado com sucesso',
      schema: productResponseSchema
    }
  },
  middlewares: [authMiddleware]
}, async ({ data, ids, manageError }) => {
  const productExists = await productRepository.findBySku(data.sku)
  if (productExists) {
    return manageError({ code: 'product_already_exists' })
  }
  const newProduct = await productRepository.create({
    ...data,
    userId: ids.userId
  })
  return newProduct
})
```

---

## Parâmetros de Configuração (`ActionMetadata`)

| Parâmetro | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `method` | `'get' \| 'post' \| 'put' \| 'delete' \| 'patch'` | **Sim** | Método HTTP utilizado pelo endpoint. |
| `path` | `string` | **Sim** | Caminho da rota (ex: `'/users/:id'`). |
| `summary` | `string` | **Sim** | Breve descrição da utilidade para exibição no Swagger. |
| `tags` | `string[]` | **Sim** | Agrupamento visual de rotas no Swagger. |
| `authenticate` | `boolean` | Não | Sobrescreve/habilita segurança Bearer JWT (inferido automaticamente se houver middleware de auth). |
| `schema` | `RouteSchema` | Não | Contém os validadores Zod para `body`, `query` ou `params`. |
| `requestFormat` | `'json' \| 'multipart'` | Não | Define o Content-Type esperado da requisição. |
| `uploadFieldName` | `string` | Não | Nome do campo do arquivo quando utilizado multipart (padrão: `file`). |
| `middlewares` | `RequestHandler[]` | Não | Array de middlewares do Express executados antes do handler (ativa docs e auth automaticamente). |
| `responses` | `Record<string, ResponseConfig>` | Não | Respostas customizadas documentadas no OpenAPI. |