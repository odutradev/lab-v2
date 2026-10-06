# Guia de Padrões e Arquitetura (Code Guide)

Este documento define as regras arquiteturais, estruturais e de padronização de código do projeto no Backend. A conformidade com este guia é **obrigatória**. Ele é baseado na arquitetura limpa e pragmática estabelecida nas pastas raízes de infraestrutura e utilitários (`@factories`, `@middlewares`, `@database`, `@storage`, `@email`, `@utils`, `@config`) e orquestrada pelos módulos de domínio (`@domains`).

**DIRETRIZ OBRIGATÓRIA PARA A IA:** Este arquivo é o seu ponto de partida absoluto. Ao receber um prompt para construir ou refatorar endpoints, fluxos de negócio ou lógicas de domínio, você deve refletir EXATAMENTE a estrutura descrita neste guia ANTES de gerar qualquer código. NUNCA recrie utilitários que já estão documentados aqui.

---

## 1. Regras Fundamentais de Código e Estilo (Clean Code)

### 1.1. Nomenclatura e Idioma
- **Inglês Obrigatório:** Todo o código fonte (variáveis, funções, tipagens, chaves de objetos, coleções e campos de banco) deve ser escrito estritamente em **Inglês**. Mensagens de erro visíveis via API podem ser em português se retornadas pela camada de Error Handler, mas as chaves (`code`) devem ser em inglês.
- **Formatação de Pastas e Arquivos:** O padrão **camelCase** é OBRIGATÓRIO para pastas e arquivos de negócio. Exemplos: `userRepository/index.ts`, `auth/index.ts`. Arquivos que exportam componentes centrais do módulo devem usar `index.ts`. Entidades, Models, Tipagens e Schemas usam **PascalCase** ou **camelCase** para objetos schemas (`userSchema`, `UserResponse`).
- **Zero Comentários:** É expressamente proibido o uso de comentários (`//`, `/* */`, JSDoc) na lógica principal do código fonte. O código deve ser semântico e autodocumentável por si só.

### 1.2. Mapeamento de Aliases e Organização de Imports

#### Aliases Configurados no Projeto (`tsconfig.json`):
- `@createAuditLog`: `./src/domains/system/utils/createAuditLog.ts`
- `@domains/*`: `./src/domains/*`
- `@middlewares/*`: `./src/middlewares/*`
- `@projectTypes/*`: `./src/types/*`
- `@factories/*`: `./src/factories/*`
- `@database/*`: `./src/database/*`
- `@email/*`: `./src/email/*`
- `@storage/*`: `./src/storage/*`
- `@config/*`: `./src/config/*`
- `@utils/*`: `./src/utils/*`

#### Regras de Importação:
A organização dos `imports` deve seguir exatamente **três blocos** separados por uma linha em branco, ordenados visualmente do **MAIOR** (mais caracteres) para o **MENOR** (menos caracteres) dentro de cada bloco:

1. **Bibliotecas Externas:** (ex: `express`, `mongoose`, `zod`, `jsonwebtoken`)
2. **Módulos Internos:** (ex: `@domains/...`, `@factories/...`, `@middlewares/...`, caminhos relativos `../`)
3. **Tipagens:** (ex: `import type { ... }`)

**Regra de Linha Única:** É estritamente proibido quebrar linhas dentro de chaves de desestruturação nos imports.

```typescript
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { userResponseSchema } from '@domains/users/actions/user/schemas'
import userRepository from '@domains/users/repositories/user'

import type { UserResponse } from '@domains/users/actions/user/types'
```

### 1.3. Estruturas e Padrões de Escrita
- **Arrow Functions:** Use Arrow Functions para a declaração de actions, utilitários e repositórios.
- **Retornos Antecipados (Early Returns):** Evite blocos `if/else` aninhados. Aborte a execução o mais cedo possível validando erros ou ausência de dados.
- **Imutabilidade:** O uso de `let` é desencorajado. Utilize `.map`, `.filter`, `.reduce` e *Spread Operator*. Evite laços de repetição tradicionais (`for`, `while`) e mutações diretas de objetos.
- **Tipagem Estrita:** Uso de `any` é terminantemente proibido. Validações dinâmicas devem ser inferidas usando esquemas do Zod e interfaces do TypeScript.
- **Console Log Proibido:** É ESTRITAMENTE PROIBIDO usar `console.log` no código de produção. Utilize sempre a fábrica `@utils/localLogger`.

---

## 2. Visão Geral da Arquitetura e Fluxo de Requisição

A API adota uma arquitetura modular por Domínios que abandona Controllers/Services monolíticos. Cada requisição HTTP percorre uma pipeline padronizada de execução:

```text
[Cliente HTTP]
     │
     ▼
[Express Server / app.ts]  ──► (Institutional Headers, Cors, JSON parser, Swagger /docs)
     │
     ▼
[registerActions]          ──► (Mapeia as Actions exportadas pelo DomainModule)
     │
     ▼
[manageRequest Wrapper]    ──► (1. Sanitização & Validação Zod de body/query/params)
     │                         (2. Extração de Contexto: ids.userId, data, file)
     ▼
[Middlewares da Action]    ──► (Ex: authMiddleware, superAdminMiddleware, uploadMiddleware)
     │
     ▼
[Handler da Action]        ──► (Regras de negócio da Action em src/domains/*/actions)
     │
     ├───────────────────────► [Domain Repositories]  ──► [MongoDB / Mongoose]
     ├───────────────────────► [System Audit Log]     ──► [createAuditLog]
     ├───────────────────────► [Cloud Storage]        ──► [Firebase Admin / GCS]
     └───────────────────────► [Email Service]        ──► [Nodemailer Markdown]
     │
     ▼
[Resposta HTTP 200/201]    ──► (Retorno enxuto) + Block `finally` (Cleanup de Temp Files)
```

---

## 3. O Catálogo Completo dos Recursos do Core

Antes de implementar qualquer funcionalidade de infraestrutura ou utilitário genérico, consulte este catálogo. **É estritamente proibido reinventar a roda.**

### 3.1. Routing, Registration & OpenAPI (`@factories/defineAction` e `@factories/docs`)

- **`defineAction<TData>`** (`@factories/defineAction`):
  Fábrica central para criação de endpoints. Concentra OpenAPI, Zod Schemas, Middlewares e o Handler da rota.
  - Métodos aceitos: `'get' | 'post' | 'put' | 'delete' | 'patch'`.
  - Configuração `ActionMetadata`:
    - `method`: Método HTTP.
    - `path`: Caminho descritivo da rota.
    - `summary`: Descrição curta para o Swagger.
    - `tags`: Agrupamento funcional no Swagger.
    - `authenticate`: Boolean opcional. Se omitido, a presença de um middleware de autenticação (ex: `authMiddleware`) define a rota automaticamente como autenticada no Swagger.
    - `schema`: Objeto contendo validações Zod (`body`, `query`, `params`).
    - `requestFormat`: `'json' | 'multipart'`.
    - `uploadFieldName`: Nome do campo de arquivo (padrão: `'file'`).
    - `rateLimit`: Booleano ou objeto `RateLimitConfig` opcional (`{ windowMs, max, keyGenerator }`). Aplica um rate limiter exclusivo para o endpoint.
    - `middlewares`: Array de middlewares Express a serem executados. Middlewares com a propriedade `authenticate: true` (ex: `authMiddleware`, `superAdminMiddleware`) ativam automaticamente a segurança Bearer JWT (`security: [{ bearerAuth: [] }]`) no Swagger OpenAPI.
    - `responses`: Documentação OpenAPI das respostas customizadas de sucesso/erro.

- **`registerActions(actionsModule, domainName, domainRateLimit)`** (`@factories/defineAction/register`):
  Utilitário que recebe um conjunto de actions exportadas por um domínio e as registra no `Router` do Express. Quando `domainName` é fornecido, aplica automaticamente o Rate Limiter por domínio no `Router` compartilhando a cota por IP (`${ip}:${domainName}`).

- **`configureDocs(app)`** (`@factories/docs`):
  Compila automaticamente todas as rotas declaradas via `defineAction` em um documento OpenAPI/Swagger e serve as rotas `/docs` (Swagger UI) e `/swagger.json`.

---

### 3.2. Ciclo de Vida da Requisição (`@middlewares/manageRequest`)

O `manageRequest` é o wrapper que encapsula todas as Actions registradas:
1. **Validação Zod Sanitizada:** Valida `body`, `query` e `params`. Se falhar, retorna HTTP 422 (`validation_error`) contendo os detalhes do Zod.
2. **Contexto Unificado:** Passa para a Action o objeto `requestBody` com:
   - `data`: Corpo da requisição validado e tipado.
   - `params`: Parâmetros da URL validados.
   - `query`: Parâmetros de busca validados.
   - `ids`: Identificadores extraídos (ex: `ids.userId`).
   - `file`: Dados de arquivo upload (se houver).
   - `manageError`: Helper para interrupção limpa com códigos de erro catalogados.
   - `defaultExpress`: Acesso direto a `{ req, res, next }` se estritamente necessário.
3. **Tratamento Global de Erros:** Exceções não capturadas geram log de erro e retornam HTTP 500 (`internal_error`).
4. **Cleanup no `finally`:** Se um arquivo temporário foi enviado na requisição, ele é deletado do disco local automaticamente via `deleteUploadedFile`.

---

### 3.3. Central Global de Erros (`@factories/errors`)

Todas as falhas tratadas na aplicação devem utilizar códigos definidos na constante global `ResponseErrors`.

- **Uso na Action:** Invoque `return manageError({ code: 'nome_do_codigo' })` disponível no parâmetro de entrada da Action.
- **Códigos Catalogados em `ResponseErrors` (`constants.ts`):**

| Código | Status HTTP | Mensagem Padronizada |
| :--- | :---: | :--- |
| `internal_error` | 500 | Erro interno no servidor |
| `validation_error` | 422 | Erro de validação dos dados |
| `unauthorized` | 401 | Acesso não autorizado |
| `forbidden` | 403 | Acesso negado |
| `bad_request` | 400 | Requisição malformada |
| `not_found` | 404 | Recurso não encontrado |
| `conflict` | 409 | Conflito de dados |
| `no_token` | 401 | Token de autenticação não fornecido |
| `token_is_not_valid` | 401 | Token de autenticação inválido ou expirado |
| `no_credentials_send` | 400 | Credenciais não enviadas na requisição |
| `invalid_credentials` | 401 | Credenciais inválidas |
| `user_not_found` | 404 | Usuário não localizado no sistema |
| `invalid_token` | 401 | Token inválido ou expirado |
| `invalid_verification_code` | 400 | Código de verificação inválido ou expirado |
| `account_not_ready` | 403 | A conta não atende aos requisitos mínimos para esta ação |
| `too_many_requests` | 429 | Muitas requisições. Tente novamente mais tarde |

---

### 3.4. Processamento de Paginação (`@factories/pagination`)

Fornece padronização unificada para buscas listadas:
- **`getPaginationOptions(query)`**: Extrai `page` (default: 1) e `limit` (default: 10, max: 100), retornando `{ page, limit, offset }`.
- **`buildPaginatedResponse({ count, rows }, page, limit)`**: Devolve a estrutura padrão de resposta paginada:
  ```json
  {
    "meta": {
      "total": 45,
      "totalPages": 5,
      "limit": 10,
      "page": 1
    },
    "data": [ ... ]
  }
  ```
- **Schemas Zod:** `paginationQuerySchema` e `createPaginatedSchema(itemSchema, name)`.

---

### 3.5. Sistema de Filtros Lógicos (`@factories/filters`)

- **`parseFilters(filtersString, config)`**: Converte a querystring de filtros `?filters=chave1,valor1,chave2,valor2` em um objeto legível baseando-se nas regras declaradas:
  - `exact`: Campos de comparação exata (ex: `status`, `type`, `userId`).
  - `partial`: Campos de comparação por regex case-insensitive (ex: `name`, `title`).
- **`applyInMemoryFilters(data, filters, config)`**: Aplica filtros declarados em arrays de dados em memória.
- **Schema Zod:** `createFilterQuerySchema(config)`.

---

### 3.6. Upload de Arquivos (`@middlewares/upload`)

Integrado com Multer, armazena arquivos temporários na pasta `cache-upload-files/`.
- **`createUploadMiddleware(options)`**: Retorna um middleware Express configurado com:
  - `fieldName`: Nome do campo no multipart (default: `'file'`).
  - `allowedMimeTypes`: Array de tipos permitidos (ex: `['image/jpeg', 'image/png', 'application/pdf']`).
  - `maxSizeInBytes`: Tamanho máximo em bytes.
- **`deleteUploadedFile(filePath)`**: Deleta o arquivo temporário do disco local. Invocado automaticamente pelo `manageRequest` no bloco `finally`.

---

### 3.7. Infraestrutura de Banco de Dados (`@database`)

- **`connectMongoose()`** (`@database/connect`): Inicializa a conexão com MongoDB usando `MONGO_URI`. Ativa `strictQuery` e `writeConcern: 'majority'`.
- **Utilitários (`@database/utils`):**

| Função | Retorno | Descrição |
| :--- | :---: | :--- |
| `isValidObjectId(id)` | `boolean` | Valida se a string tem formato válido de ObjectId. |
| `toObjectId(id)` | `Types.ObjectId` | Converte string em instância estrita `Types.ObjectId`. |

---

### 3.8. Servidor de Armazenamento na Nuvem (`@storage`)

Adaptador Firebase Admin / Google Cloud Storage. **Proibido inicializar o SDK do Firebase manualmente nas Actions.**

- **`connectStorage()`** (`@storage/connect`): Inicializa a app Firebase com credenciais `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` e `FIREBASE_STORAGE_BUCKET`.
- **Utilitários (`@storage/utils`):**

| Função | Retorno | Descrição |
| :--- | :--- | :--- |
| `uploadFile({ path, buffer, mimeType, isPublic })` | `{ url: string, bucket: Bucket }` | Salva o buffer Node no bucket e retorna a URL pública ou formato `gs://`. |
| `deleteFile({ path })` | `{ success: boolean, bucket: Bucket }` | Remove o arquivo do bucket Cloud. |
| `getSignedUrl({ path, expiresInMinutes, forceDownload, filename })` | `{ signedUrl: string, expiresAt: Date }` | Gera URL assinada temporária para acesso seguro. |
| `moveFile({ sourcePath, destinationPath })` | `{ success: boolean, bucket: Bucket }` | Move objeto entre diretórios no bucket. |
| `getFile({ path })` | `{ buffer: Buffer, metadata: unknown, bucket: Bucket }` | Baixa o binário do arquivo para o servidor. |

---

### 3.9. Serviço de Email (`@email`)

Serviço SMTP baseado em Nodemailer e Markdown.

- **`connectEmail()`** (`@email/connect`): Inicializa o transporte validando `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.
- **Fábrica de Templates (`enrichTemplate`)**: Armazene novos layouts em `@email/templates/`.
- **Exemplo de Criação de Template (`@email/templates/welcome.ts`):**
  ```typescript
  import { enrichTemplate } from '@email/utils'

  const welcomeTemplate = enrichTemplate({
    subject: 'Bem-vindo ao Segunda Casa! 🏡',
    markdownBody: `# Olá, {{ name }}!
  
  Sua conta foi criada com sucesso.
  `
  })

  export default welcomeTemplate
  ```
- **Disparo no Domínio:** Invoque diretamente `welcomeTemplate.send({ to: user.email, variables: { name: user.name } })`.

---

### 3.10. Utilitários Gerais (`@utils`)

- **Sistema de Logs (`@utils/localLogger`)**:
  - `createLocalLogger(context: string)`: Retorna uma instância do logger.
  - Métodos: `logger.info()`, `logger.success()`, `logger.warn()`, `logger.error()`.
- **Manipulação de Datas (`@utils/date`)**:
  - `formatTimestamp(date?)`: Formato banco `YYYY-MM-DD HH:MM:SS`.
  - `formatDateBR(date)`: Formato pt-BR `DD/MM/YYYY`.
  - `addDays(date, days)`: Adiciona N dias a uma data.
  - `isPast(date)`: Verifica se a data é anterior ao momento atual.
  - `isDateValid(dateStr)`: Valida se a string YYYY-MM-DD é válida (hoje até +30 dias).
  - `getDayName(dateStr)`: Nome do dia em inglês (ex: `'monday'`).
  - `timeToMins(timeStr)`: Converte `'HH:mm'` para minutos totais desde meia-noite.
  - `minsToTime(totalMins)`: Converte minutos para string `'HH:mm'`.
- **Criptografia e Hashes (`@utils/crypto`)**:
  - `hashData(data)`: Gera hash bcrypt.
  - `compareHash(data, hash)`: Compara string pura com hash bcrypt.
- **Processamento de Imagens (`@utils/image`)**:
  - Utilitários de otimização de imagens.
- **Configurações Gerais (`@config`)**:
  - `cors.ts`: Configura CORS baseado em `process.env.CORS_ORIGIN`.
  - `defaultConfig.ts`: Variáveis padrão da aplicação.
  - `rateLimit.ts`: Configurações de Rate Limiting (`defaultRateLimitConfig` e `sensitiveEndpointRateLimitConfig`).

---

### 3.11. Proteção contra Força Bruta e Rate Limiting (`@middlewares/rateLimit`)

O sistema adota uma estratégia híbrida de Rate Limiting baseada em `express-rate-limit`:

1. **Rate Limiting por Domínio (Padrão do Sistema):**
   - Aplicado automaticamente pelo `registerActions(actions, domainName)` na inicialização de cada módulo (`system`, `users`, `properties`).
   - Agrupa todas as requisições enviadas para um mesmo domínio sob uma chave por IP (`${ip}:${domainName}`).
   - Cota padrão: 100 requisições a cada 15 minutos por IP por domínio.

2. **Rate Limiting por Endpoint (Customização Fina):**
   - Declarado diretamente no `defineAction` através da propriedade `rateLimit`.
   - Pode receber um objeto `RateLimitConfig` ou `sensitiveEndpointRateLimitConfig` (5 requisições por 15 minutos).
   - Utilizado em rotas sensíveis como `/users/signup`, `/users/signin`, `/users/validation/request/:purpose` e `/users/profile/reset-password`.

3. **Resposta de Excesso de Requisições:**
   - Requisições excedentes são interrompidas com HTTP status `429 Too Many Requests` utilizando o padrão `sendError` (`code: 'too_many_requests'`).

---

## 4. Padrões de Desenvolvimento nos Domínios (`src/domains/`)

### 4.1. Estrutura Padrão de um Módulo de Domínio

Cada módulo de domínio em `src/domains/nomeDoDominio` deve exportar um `DomainModule` em seu `index.ts`:

```typescript
import * as favoriteActions from '@domains/properties/actions/favorite'
import * as propertyActions from '@domains/properties/actions/property'

import type { DomainModule } from '@projectTypes/domain'

const propertiesDomain: DomainModule = {
  name: 'properties',
  actions: [
    propertyActions,
    favoriteActions
  ],
  envVariables: ['MONGO_URI']
}

export default propertiesDomain
```

### 4.2. Estrutura da Camada de Actions (`/actions/funcionalidade`)

Cada funcionalidade dentro de `actions` DEVE conter estritamente a tríade de arquivos:

1. **`schemas.ts`**: Define esquemas Zod estritos para `body`, `query`, `params` e a documentação OpenAPI das respostas de sucesso/erro.
2. **`types.ts`**: Deriva e exporta tipos TypeScript usando `z.infer<typeof schema>`.
3. **`index.ts`**: Instancia e exporta as rotas criadas via `defineAction`.

#### Exemplo de Action Completa:

`schemas.ts`:
```typescript
import { z } from 'zod'

export const addFavoriteParamsSchema = z.object({
  type: z.enum(['property', 'room'])
})

export const addFavoriteBodySchema = z.object({
  entityId: z.string().min(1)
})

export const favoriteResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  entityId: z.string(),
  entityType: z.enum(['property', 'room']),
  name: z.string()
})
```

`types.ts`:
```typescript
import type { addFavoriteParamsSchema, addFavoriteBodySchema } from './schemas'
import type { z } from 'zod'

export type AddFavoriteParams = z.infer<typeof addFavoriteParamsSchema>
export type AddFavoriteBody = z.infer<typeof addFavoriteBodySchema>
```

`index.ts`:
```typescript
import { addFavoriteParamsSchema, addFavoriteBodySchema, favoriteResponseSchema } from './schemas'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import favoriteRepository from '../../repositories/favorite'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type { AddFavoriteParams, AddFavoriteBody } from './types'

export const addFavoriteAction = defineAction(
  {
    method: 'post',
    path: '/users/favorites/add/:type',
    summary: 'Adiciona um imóvel ou quarto à lista de favoritos do usuário',
    tags: ['Favorites'],
    authenticate: true,
    schema: {
      params: addFavoriteParamsSchema,
      body: addFavoriteBodySchema
    },
    responses: {
      201: {
        description: 'Favorito adicionado com sucesso',
        schema: favoriteResponseSchema
      },
      409: {
        description: 'Item já está nos favoritos do usuário'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { type } = params as AddFavoriteParams
    const { entityId } = data as AddFavoriteBody

    const existing = await favoriteRepository.findByUserAndEntity(ids.userId, entityId)
    if (existing) return manageError({ code: 'conflict' })

    const newFavorite = await favoriteRepository.create({
      userId: ids.userId,
      entityId,
      entityType: type
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'add_favorite',
      entity: 'Favorite',
      entityId: newFavorite.id,
      summary: 'Item adicionado aos favoritos.',
      details: { entityId, entityType: type }
    })

    return newFavorite
  }
)
```

---

### 4.3. Design de Rotas e URLs Descritivas

As rotas (`path`) na `defineAction` devem ser explícitas e descritivas quanto à operação realizada:
- **Ação explícita na URL:** Inclua o verbo ou contexto operacional na rota.
  - **✅ Certo:** `POST /properties/create` | `PATCH /properties/:id/update` | `POST /users/favorites/add/:type` | `DELETE /users/favorites/:id/remove`
  - **❌ Errado:** `POST /properties` | `PATCH /properties/:id` | `POST /users/favorites`
- **Contexto Semântico:** URLs hierárquicas e previsíveis (ex: `/users/profile/update-avatar`, `/users/profile/reset-password`).

---

### 4.4. Pragmatismo nos Retornos das Actions (Responses)

- **Sem mensagens redundantes:** Não retorne `{ message: 'Atualizado com sucesso' }`. O HTTP Status Code (`200` ou `201`) é o indicador semântico.
- **Não ecoe o payload:** Em updates (`PUT`/`PATCH`), não devolva os mesmos campos enviados pelo cliente no body. Devolva apenas se o backend adicionou dados calculados/enriquecidos.
- **Confirmações simples:** Se for operação confirmatória, devolva objeto minimalista: `{ success: true }`, o `id` do recurso afetado ou a `url` final.

---

### 4.5. Camada de Repositórios (`/repositories/entidade`)

Toda a comunicação com Mongoose é isolada na pasta `repositories`. A Action NUNCA importa o Model do Mongoose diretamente.

- **`model.ts`**: Declara o `new Schema` e exporta o `Model` compilado do Mongoose.
- **`types.ts`**: Declara interfaces dos payloads de entrada (ex: `CreateFavoritePayload`) e o tipo do documento formatado.
- **`index.ts`**: Exporta um objeto literal contendo métodos limpos (ex: `create`, `findById`, `update`, `delete`, `list`).

---

### 4.6. Middlewares de Autenticação e Segurança (`@domains/users/middlewares`)

- **`authMiddleware`**: Valida o token JWT Bearer, popula `ids.userId`.
  - **REGRA MANDATÓRIA:** Se sua rota utiliza outros middlewares no array `middlewares` que dependem do `userId` (ex: `superAdminMiddleware` ou `createAccountReadinessMiddleware`), você **DEVE** declarar o `authMiddleware` explicitamente como o primeiro item do array `middlewares`.
- **`superAdminMiddleware`**: Restringe a execução exclusivamente a administradores globais (`user.superAdmin`).
- **`createAccountReadinessMiddleware(role)`**: Verifica se o perfil (`tenant` ou `owner`) concluiu os requisitos de onboarding. Caso contrário, interrompe com HTTP 403 (`account_not_ready`).

---

### 4.7. Trilha de Auditoria (`@createAuditLog`)

Qualquer operação de mutação (criação, edição ou exclusão) DEVE disparar o log de auditoria via `@createAuditLog`.

```typescript
import createAuditLog from '@createAuditLog'

await createAuditLog({
  actorId: ids.userId,
  action: 'create_property',
  entity: 'Property',
  entityId: newProperty.id,
  summary: `Propriedade "${newProperty.title}" criada.`,
  details: { title: newProperty.title }
})
```

---

### 4.8. Comunicação Interdomínios e Concorrência

- **Isolamento de Banco:** Um domínio `A` JAMAIS acessa Models de um domínio `B`. Se o domínio `A` precisa de dados do domínio `B`, importa a função do repositório exposto de `B` (ex: `import userRepository from '@domains/users/repositories/user'`).
- **Assincronismo Inteligente:** Use `Promise.all` para chamadas independentes ao banco ou serviços externos. Evite `await` sequencial sem dependência de dados entre os passos.

---

## 5. Variáveis de Ambiente Obrigatórias

| Variável | Módulo Principal | Descrição |
| :--- | :--- | :--- |
| `PORT` | `server.ts` | Porta de execução do servidor Express (default: `3000`). |
| `CORS_ORIGIN` | `@config/cors` | Domínios liberados para requisições cross-origin. |
| `MONGO_URI` | `@database` | URI de conexão com a instância/cluster do MongoDB. |
| `JWT_SECRET` | `@domains/users` | Segredo para assinatura e validação dos tokens JWT. |
| `FIREBASE_PROJECT_ID` | `@storage` | ID do projeto no Google Cloud / Firebase. |
| `FIREBASE_CLIENT_EMAIL` | `@storage` | Email da Service Account do Firebase. |
| `FIREBASE_PRIVATE_KEY` | `@storage` | Chave privada RSA da Service Account do Firebase. |
| `FIREBASE_STORAGE_BUCKET` | `@storage` | Nome do bucket de armazenamento GCS. |
| `EMAIL_HOST` | `@email` | Host do servidor SMTP de disparo de email. |
| `EMAIL_PORT` | `@email` | Porta do servidor SMTP. |
| `EMAIL_USER` | `@email` | Usuário de autenticação SMTP. |
| `EMAIL_PASS` | `@email` | Senha de autenticação SMTP. |
| `EMAIL_FROM` | `@email` | Endereço do remetente padrão de e-mails. |
