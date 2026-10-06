# Factory: Docs (`@factories/docs`)

Este módulo é responsável por ler de forma reativa os endpoints declarados pelo sistema, consolidar as especificações utilizando o gerador OpenAPI V3, e expor a documentação Swagger interativa na aplicação.

## Arquitetura e Estrutura de Arquivos

- `registry.ts`: Instancia e exporta o `OpenAPIRegistry` global. Declara configurações transversais de segurança como o esquema `bearerAuth` (JWT).
- `generator.ts`: Compila todas as definições registradas e injeta metadados estruturais como a descrição geral do sistema, o suporte nativo a paginação e o formato de filtros dinâmicos.
- `index.ts`: Configura o servidor Express para servir a documentação gráfica do Swagger no path `/docs` e expor a especificação pura no formato JSON no path `/swagger.json`.

---

## Integração de Segurança

O sistema configura o `bearerAuth` por padrão no arquivo `registry.ts`. Se uma rota for cadastrada com `authenticate: true` através do `defineAction`, ela receberá automaticamente o fluxo de autenticação e o ícone de cadeado no Swagger, consumindo a autenticação configurada abaixo:

```typescript
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const registry = new OpenAPIRegistry()

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
})
```

---

## Utilização no Ciclo de Vida da Aplicação

A inicialização é feita no arquivo principal de montagem do servidor Express (`app.ts`).

```typescript
import express from 'express'

import configureDocs from '@factories/docs'

const app = express()
configureDocs(app)
```

Uma vez configurada, a rota `/docs` fornecerá toda a interface necessária para testes rápidos da API.