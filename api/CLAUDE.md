# Project standards guide

This guide defines this project's architecture, structure and code rules. Following it is **mandatory**.

**Directive:** before creating or refactoring any code, read this guide and follow exactly the structure and standards described here. When a standard is not covered, follow the closest reference example at the end of this document.

## 1. Stack

| Item | Choice |
| :--- | :--- |
| Project type | Backend |
| Language | TypeScript (strict) |
| HTTP framework | Express |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Tests | No tests |

## 2. Architecture: Domains + Actions

Modules per domain where each endpoint is a self-contained action (schemas, types and handler), with shared infrastructure in root folders.

**Rules:**

- Each domain lives in `src/domains/<domain>` and exports a `DomainModule` from `index.ts` (name, actions and environment variables).
- Each feature in `actions/<feature>` has exactly three files: `schemas.ts`, `types.ts` and `index.ts`.
- Endpoints are created with the `defineAction` factory, which holds method, route, schemas, middlewares, docs and handler.
- Data access lives in `repositories/<entity>` with `model.ts`, `types.ts` and `index.ts`. Actions never import the model.
- Shared infrastructure lives in root folders (`factories`, `middlewares`, `database`, `storage`, `email`, `utils`, `config`).
- A domain never touches another domain's models: it imports the repository that domain exposes.

**Folder structure:**

```text
.
└── src/
    ├── config/
    │   └── cors.ts
    ├── database/
    │   └── connect.ts
    ├── domains/
    │   └── users/
    │       ├── actions/
    │       │   └── user/
    │       │       ├── index.ts  # defineAction
    │       │       ├── schemas.ts  # schemas Zod
    │       │       └── types.ts  # z.infer
    │       ├── repositories/
    │       │   └── user/
    │       │       ├── index.ts  # métodos de acesso
    │       │       ├── model.ts  # model do banco
    │       │       └── types.ts  # payloads
    │       └── index.ts  # DomainModule
    ├── factories/
    │   ├── defineAction/
    │   │   └── index.ts
    │   └── errors/
    │       └── index.ts  # catálogo de erros
    ├── middlewares/
    │   └── manageRequest/
    │       └── index.ts
    ├── storage/
    │   └── utils.ts
    └── utils/
        └── logger/
            └── index.ts
```

## 3. Naming

- **Identifier language:** English. Variables, functions, types, object keys, tables and fields are written in English.
- Names must be descriptive. No abbreviations (`usr`, `tmp`, `data2`).

| Element | Standard | Example |
| :--- | :--- | :--- |
| Variables | camelCase | `foundUser, userId` |
| Functions and methods | camelCase | `getUserById()` |
| Classes | PascalCase | `class UserNotFoundError extends Error {}` |
| Types and interfaces | PascalCase | `interface UserResponse { id: string }` |
| Enums | PascalCase | `enum UserStatus {}` |
| Enum members | camelCase | `UserStatus.active` |
| Constants and static data | PascalCase | `const MaxLoginAttempts = 5` |
| Codes and catalog keys | snake_case | `manageError({ code: 'user_not_found' })` |
| Files | camelCase | `userRepository/index.ts` |
| Folders | camelCase | `useCases/` |
| Tables and collections | camelCase | `users` |
| Columns and fields | camelCase | `createdAt` |
| Route segments | kebab-case | `/user-profiles` |
| Type prefix | No prefix | `UserResponse` |
| Booleans | With a verb (is, has, should) | `isActive` |
| Organization | Folder + index.ts | `userRepository/index.ts` |
| Table number | Plural | `users` |
| Environment variables | SCREAMING_SNAKE | `DATABASE_URL` |

## 4. Code style

- **Paradigm:** Functions and objects. Modules export functions or object literals with methods.
- **Functions:** Arrow functions. Functions declared as constants.
- **Exports:** Mixed. Default for the file's main module (repositories, domains, factories) and named for schemas, types and actions.
- **Semicolons:** No semicolons.
- **Quotes:** Single quotes.
- **Comments:** Zero comments. `//`, `/* */` and JSDoc are forbidden. Code must explain itself.

### Imports

- **Paths:** Alias per folder. One alias for each root folder of the project.
- **Organization:** 3 blocks, longest to shortest. External, internal and `import type`, separated by a blank line and sorted from longest to shortest. Destructuring always on one line.

```typescript
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import userRepository from '@domains/users/repositories/user'
import defineAction from '@factories/defineAction'

import type { UserResponse } from './types'
```

### Error handling

Error code catalog. Errors are codes from a central catalog, with standard status and message, returned through a helper.

```typescript
if (!user) return manageError({ code: 'user_not_found' })
```

### Validation

Zod. Schemas with types inferred via `z.infer`.

```typescript
const userSchema = z.object({ name: z.string().min(1) })
type User = z.infer<typeof userSchema>
```

### Routes and API docs

- **Routes:** Explicit action in the URL. The route says what the operation does.

```text
POST   /properties/create
PATCH  /properties/:id/update
DELETE /users/favorites/:id/remove
```

- **Docs:** OpenAPI generated from schemas. Swagger at `/docs`, built from each endpoint definition.

## 5. Required principles

### Early returns

Validate and exit early, with no nested `if/else`.

✅ Do:
```typescript
if (!user) return manageError({ code: 'not_found' })
return user
```

❌ Don't:
```typescript
if (user) {
  return user
} else {
  return error
}
```

### Immutability

No `let`, `for` or `while`. Use `map`, `filter`, `reduce` and spread.

✅ Do:
```typescript
const names = users.map((user) => user.name)
```

❌ Don't:
```typescript
let names = []
for (const user of users) names.push(user.name)
```

### Strict typing

`any` is forbidden. Types come from schemas and interfaces.

✅ Do:
```typescript
type User = z.infer<typeof userSchema>
```

❌ Don't:
```typescript
const user: any = req.body
```

### Logger instead of console.log

No `console.log` in production. Use the project's logger.

✅ Do:
```typescript
const logger = createLocalLogger('users')
logger.error(error)
```

❌ Don't:
```typescript
console.log(error)
```

### Parallel async

`Promise.all` for calls that do not depend on each other.

✅ Do:
```typescript
const [user, plans] = await Promise.all([findUser(id), listPlans()])
```

❌ Don't:
```typescript
const user = await findUser(id)
const plans = await listPlans()
```

### Lean responses

No redundant messages and no echoing the payload. The HTTP status already reports the result.

✅ Do:
```typescript
return { id: newUser.id }
```

❌ Don't:
```typescript
return { message: 'Criado com sucesso', ...data }
```

### Database isolated in repositories

Handlers never import models. Other domains use the exposed repository.

✅ Do:
```typescript
import userRepository from '@domains/users/repositories/user'
```

❌ Don't:
```typescript
import UserModel from '@domains/users/repositories/user/model'
```

### Audit on mutations

Every create, update or delete writes an audit log.

✅ Do:
```typescript
await createAuditLog({ actorId, action: 'create_user', entity: 'User', entityId })
```

### Standard pagination

Lists take `page` and `limit` and respond with `{ meta, data }`.

✅ Do:
```typescript
{ "meta": { "total": 45, "totalPages": 5, "limit": 10, "page": 1 }, "data": [] }
```

### Don't reinvent utilities

Before writing a helper, look for an equivalent in the project's core.

✅ Do:
```typescript
import { formatDateBR } from '@utils/date'
```

❌ Don't:
```typescript
const format = (d: Date) => d.toLocaleDateString()
```

## 6. Tests

This project does not require automated tests.

## 7. Commits and Git

Defined in the monorepo guide at the repository root. Follow the rules there.

## 8. Docker and deploy

Defined in the monorepo guide at the repository root. Follow the rules there.

## 9. Publishing

Defined in the monorepo guide at the repository root. Follow the rules there.

## 10. Reference example

Use these files as a template. They follow every rule above.

### `src/domains/users/actions/user/index.ts`

```typescript
import { getUserByIdParamsSchema, userResponseSchema } from './schemas'
import userRepository from '@domains/users/repositories/user'
import defineAction from '@factories/defineAction'

import type { GetUserByIdParams } from './types'

export const getUserByIdAction = defineAction(
  {
    method: 'get',
    path: '/users/:id/details',
    summary: 'Finds a user by id',
    tags: ['Users'],
    schema: { params: getUserByIdParamsSchema },
    responses: {
      200: { description: 'User found', schema: userResponseSchema }
    }
  },
  async ({ params, manageError }) => {
    const { id } = params as GetUserByIdParams
    const foundUser = await userRepository.findById(id)

    if (!foundUser) return manageError({ code: 'user_not_found' })

    return foundUser
  }
)
```

### `src/domains/users/actions/user/schemas.ts`

```typescript
import { z } from 'zod'

export const MaxNameLength = 120

export enum UserStatus {
  active = 'active',
  inactive = 'inactive'
}

export const getUserByIdParamsSchema = z.object({
  id: z.string().min(1)
})

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string().max(MaxNameLength),
  status: z.nativeEnum(UserStatus),
  isActive: z.boolean()
})
```

### `src/domains/users/actions/user/types.ts`

```typescript
import type { getUserByIdParamsSchema, userResponseSchema } from './schemas'
import type { z } from 'zod'

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
```

### `src/domains/users/repositories/user/index.ts`

```typescript
import UserModel from './model'

import type { UserDocument } from './types'

const findById = async (id: string): Promise<UserDocument | null> => {
  return UserModel.findById(id).lean()
}

const userRepository = {
  findById
}

export default userRepository
```

## 11. Checklist before delivering

- [ ] Names follow the naming table and are in English.
- [ ] Files are in the right folder for the architecture.
- [ ] Imports follow "Alias per folder" and "3 blocks, longest to shortest".
- [ ] Errors follow "Error code catalog".
- [ ] All external input is validated (Zod).
- [ ] No comments in the code.
- [ ] Principle "Early returns" applied.
- [ ] Principle "Immutability" applied.
- [ ] Principle "Strict typing" applied.
- [ ] Principle "Logger instead of console.log" applied.
- [ ] Principle "Parallel async" applied.
- [ ] Principle "Lean responses" applied.
- [ ] Principle "Database isolated in repositories" applied.
- [ ] Principle "Audit on mutations" applied.
- [ ] Principle "Standard pagination" applied.
- [ ] Principle "Don't reinvent utilities" applied.
