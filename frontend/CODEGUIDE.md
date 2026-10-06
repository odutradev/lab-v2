# Guia de Padrões e Arquitetura Frontend (Code Guide)

Este documento define as regras arquiteturais, estruturais e de padronização de código do projeto no Frontend. A conformidade com este guia é **obrigatória**. Ele espelha as diretrizes de Clean Code e pragmatismo estabelecidas no Backend (`api/CODEGUIDE.md`) e define a arquitetura em React com TypeScript.

---

## 1. Regras Fundamentais de Código e Estilo (Clean Code)

### 1.1. Nomenclatura e Idioma
- **Inglês Obrigatório:** Todo o código fonte (variáveis, funções, tipagens, componentes, hooks, chaves de objetos e rotas) deve ser escrito estritamente em **Inglês**. Apenas textos apresentados na interface do usuário (UI) e mensagens para o usuário final devem estar em português (pt-BR).
- **Formatação de Pastas e Arquivos:**
  - Pastas de módulos e hooks de negócio usam **camelCase** (ex: `useAuth`, `useForm`, `auth`, `profile`).
  - Pastas e arquivos de Componentes React e Páginas usam **PascalCase** (ex: `Button`, `Input`, `Card`, `AuthPage`, `HomePage`).
  - Cada pasta de componente, hook, action ou contexto deve ser um módulo autocontido contendo seu ponto de entrada `index.ts` (ou `index.tsx`) e seu arquivo de tipagens dedicado `types.ts`.
- **Zero Comentários no Código:** É expressamente proibido o uso de comentários (`//`, `/* */`, JSDoc) na lógica de código. O código deve ser declarativo, semântico e autodocumentado.

### 1.2. Export Default Obrigatório
- **Padrão Exclusivo:** Todo módulo funcional, componente, hook, contexto, cliente de API e página deve expor sua implementação principal através de **`export default`**.
- **Consumo:** Os arquivos consumidores devem importar os módulos diretamente usando importações padrão (default imports):
  ```typescript
  import Button from '@components/ui/Button'
  import useAuth from '@hooks/useAuth'
  import apiClient from '@api/client'
  ```
- Sub-elementos ou utilitários complementares (como `CardHeader`, `CardTitle`) podem ser acoplados diretamente ao objeto padrão (`Card.Header = CardHeader`) ou exportados nominalmente junto ao `export default`.

### 1.3. Proibição de Barrel Files Genéricos
- É expressamente proibido criar arquivos `index.ts` que sirvam exclusivamente para reexportar múltiplos submódulos (`export * from './...'`).
- Cada funcionalidade deve ser importada diretamente de sua pasta específica. Isso garante *tree-shaking* eficiente, elimina riscos de dependência circular e acelera a compilação do Vite.

### 1.4. Mapeamento de Aliases e Organização de Imports

#### Aliases Configurados no Projeto (`tsconfig.app.json` e `vite.config.ts`):
- `@actions/*`: `./src/actions/*`
- `@components/*`: `./src/components/*`
- `@hooks/*`: `./src/hooks/*`
- `@context/*`: `./src/context/*`
- `@api/*`: `./src/api/*`
- `@projectTypes/*`: `./src/types/*`
- `@pages/*`: `./src/pages/*`
- `@styles/*`: `./src/styles/*`

> **Nota:** O alias de tipos utiliza `@projectTypes/*` para espelhar a convenção do Backend e evitar conflitos com o escopo `@types` reservado pelo TypeScript.

#### Regras de Importação (Regra dos 3 Blocos):
A organização dos imports deve seguir exatamente **três blocos** separados por uma linha em branco, ordenados visualmente do **MAIOR** (mais caracteres) para o **MENOR** (menos caracteres) dentro de cada bloco:

1. **Bibliotecas Externas:** (ex: `react`, `lucide-react`)
2. **Módulos Internos:** (ex: `@components/...`, `@hooks/...`, `@context/...`, `@actions/...`)
3. **Tipagens:** (ex: `import type { ... }`)

**Regra de Linha Única:** É proibido quebrar linhas dentro de chaves de desestruturação nos imports.

```typescript
import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'

import { STORAGE_KEYS } from '@api/config'
import apiClient from '@api/client'

import type { SignInPayload, SignUpPayload } from '@actions/users/auth/types'
import type { UseFormOptions, UseFormReturn } from './types'
```

### 1.5. Estruturas e Padrões de Escrita
- **Arrow Functions:** Utilize Arrow Functions para a declaração de componentes, hooks e actions.
- **Early Returns:** Evite aninhamentos desnecessários de `if/else`. Aborte fluxos antecipadamente validando estados de carregamento, erros ou ausência de dados.
- **Imutabilidade:** O uso de `let` é desencorajado. Mantenha o estado React estritamente imutável utilizando setters com callback funcional quando dependente do estado anterior (`prev => ...`).
- **Tipagem Estrita:** O uso de `any` é terminantemente proibido. Todas as props, retornos de hooks e payloads de actions devem ser tipados em seus respectivos arquivos `types.ts`.
- **Console Log Proibido:** É proibido manter instruções de `console.log` no código final de produção.

---

## 2. Padrão Arquitetural: Self-Contained Module Pattern

A arquitetura do frontend estrutura cada elemento da aplicação em fatias isoladas e autocontidas:

```text
src/
├── actions/              # Actions HTTP isoladas por domínio
│   └── users/
│       ├── auth/
│       │   ├── index.ts  # Implementação das actions (signIn, signUp, refresh)
│       │   └── types.ts  # Payloads e respostas tipadas
│       └── profile/
│           ├── index.ts  # Implementação das actions (getProfile, updateProfile)
│           └── types.ts  # Payloads e respostas de perfil
├── api/                  # Infraestrutura de comunicação HTTP
│   ├── client.ts         # Instância e métodos do ApiHttpClient
│   └── config.ts         # URLs base e chaves de armazenamento local
├── components/           # Componentes reutilizáveis
│   ├── forms/            # Formulários autocontidos com lógica e tipagem
│   │   ├── LoginForm/
│   │   │   ├── index.tsx
│   │   │   └── types.ts
│   │   └── RegisterForm/
│   │       ├── index.tsx
│   │       └── types.ts
│   ├── layout/           # Componentes estruturais de layout
│   │   ├── Navbar/
│   │   │   ├── index.tsx
│   │   │   └── Navbar.module.css
│   │   └── PageContainer/
│   │       ├── index.tsx
│   │       ├── types.ts
│   │       └── PageContainer.module.css
│   └── ui/               # Componentes atômicos de interface
│       ├── Button/
│       │   ├── index.tsx
│       │   ├── types.ts
│       │   └── Button.module.css
│       ├── Input/
│       │   ├── index.tsx
│       │   ├── types.ts
│       │   └── Input.module.css
│       ├── Select/
│       │   ├── index.tsx
│       │   ├── types.ts
│       │   └── Select.module.css
│       ├── Card/
│       │   ├── index.tsx
│       │   ├── types.ts
│       │   └── Card.module.css
│       ├── Badge/
│       │   ├── index.tsx
│       │   ├── types.ts
│       │   └── Badge.module.css
│       └── Toast/
│           ├── index.tsx
│           ├── types.ts
│           └── ToastContainer.module.css
├── context/              # Contextos globais do React
│   ├── auth/
│   │   ├── index.tsx     # AuthProvider (export default) e AuthContext
│   │   └── types.ts      # AuthContextType
│   └── toast/
│       ├── index.tsx     # ToastProvider (export default) e ToastContext
│       └── types.ts      # ToastContextType, ToastMessage, ToastType
├── hooks/                # Custom hooks reutilizáveis
│   ├── useAuth/
│   │   ├── index.ts      # useAuth (export default)
│   │   └── types.ts
│   ├── useForm/
│   │   ├── index.ts      # useForm (export default)
│   │   └── types.ts
│   └── useToast/
│       ├── index.ts      # useToast (export default)
│       └── types.ts
├── pages/                # Telas da aplicação
│   ├── AuthPage/
│   │   ├── index.tsx     # AuthPage (export default)
│   │   └── AuthPage.module.css
│   └── HomePage/
│       ├── index.tsx     # HomePage (export default)
│       └── HomePage.module.css
├── styles/               # Tokens de design e variáveis globais
│   └── design-system.css
├── types/                # Tipos globais e transversais do projeto
│   ├── api.ts
│   └── user.ts
├── App.tsx               # Orquestrador raiz com roteamento condicional
├── index.css             # Importação do design system e reset raiz
└── main.tsx              # Ponto de entrada React DOM
```

---

## 3. Catálogo das Camadas e Recursos

### 3.1. Actions por Domínio (`@actions/<domain>/<action>`)
- Cada pasta de action representa um subdomínio de operações HTTP alinhadas à API.
- O arquivo `index.ts` exporta as funções individuais e também um objeto padrão via `export default`.
- O arquivo `types.ts` concentra os contratos de payload e resposta esperados.

### 3.2. Cliente HTTP (`@api/client` e `@api/config`)
- `apiClient`: Instância singleton de `ApiHttpClient` exportada como `export default`.
- Métodos disponíveis: `.get<T>()`, `.post<T>()`, `.put<T>()`, `.delete<T>()`.
- Injeção automática de header `Authorization: Bearer <token>` a partir do `localStorage`.
- Opção `skipAuth: true` para rotas públicas (como `/users/signin` e `/users/signup`).
- Normalização uniforme de erros na interface `ApiError`.

### 3.3. Custom Hooks
- **`useAuth`**: Acesso simplificado ao estado de autenticação, usuário logado, ações de login, cadastro, logout e refresh.
- **`useForm`**: Hook genérico para gerenciamento de formulários controlados, com suporte a regras de validação por campo, validação geral no submit, estado `touched` e controle de loading (`isSubmitting`).
- **`useToast`**: Disparo de notificações contextuais flutuantes (`success`, `error`, `warning`, `info`) com auto-fechamento cronometrado.

### 3.4. Sistema de Design e Estilização
- **Tokens Centrais (`@styles/design-system.css`):** Paleta visual moderna, tipografia Inter/Plus Jakarta Sans, cores primárias, superfícies em modo escuro com glassmorphism, sombras e bordas padronizadas.
- **CSS Modules:** Todos os componentes utilizam arquivos `*.module.css` dedicados para isolamento completo de escopo e evitar vazamento de estilos globais.
