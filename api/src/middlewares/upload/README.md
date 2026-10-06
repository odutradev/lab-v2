# Middleware: File Upload (`@middlewares/upload`)

O `@middlewares/upload` provê um controle simplificado, tipado e isolado sobre o recebimento e validação de arquivos binários no servidor usando a biblioteca `multer` em requisições de formato `multipart/form-data`.

---

## 1. Filosofia de "Zero Desperdício de Disco"

Para assegurar alta performance e mitigar o esgotamento de armazenamento no servidor, o fluxo de arquivos funciona sob a premissa de descarte imediato:

1. O arquivo binário enviado pelo cliente é retido temporariamente dentro da pasta `cache-upload-files/`.
2. O arquivo é registrado na chave `file` dentro do contexto do `manageRequest`.
3. A lógica de negócio processa o arquivo (ex: faz upload para um bucket S3 ou converte o binário).
4. No fechamento da requisição, o wrapper `manageRequest` executa automaticamente a rotina de exclusão `deleteUploadedFile` no bloco `finally`, independentemente do sucesso ou falha da Action.

*Nota:* Se você precisar utilizar este middleware fora de uma Action instanciada pelo `defineAction`, será obrigatório chamar explicitamente `deleteUploadedFile(path)` para não reter resíduos no disco local.

---

## 2. API de Configuração (`UploadConfig`)

A função factory `createUploadMiddleware` gera o middleware customizado aceitando as seguintes propriedades de restrição:

| Parâmetro | Tipo | Descrição | Padrão |
| :--- | :--- | :--- | :--- |
| `fieldName` | `string` | Nome do campo multipart esperado no payload. | `'file'` |
| `allowedMimeTypes` | `string[]` | Array contendo os MimeTypes aceitos para upload. | `undefined` (Aceita todos) |
| `maxSizeInBytes` | `number` | Tamanho máximo permitido em bytes para o arquivo. | `undefined` (Sem limites) |

---

## 3. Tratamento de Erros e Documentação Automática

- **Validações de Payload:** Se o cliente submeter um arquivo que exceda o tamanho parametrizado ou com formato incorreto, o middleware interrompe o fluxo de imediato e responde com `validation_error` (HTTP 422), listando a falha específica associada ao campo.
- **Acoplamento Swagger:** O middleware possui metadados de documentação estáticos integrados. Ao ser acoplado em uma rota via `defineAction`, a resposta `400` associada a falhas de upload é incluída automaticamente na documentação OpenAPI gerada pelo sistema.

---

## 4. Exemplo de Implementação de Rota com Upload

Abaixo está o padrão correto para declarar uma rota multipart e associar o middleware:

```typescript
import { createUploadMiddleware } from '@middlewares/upload'
import defineAction from '@factories/defineAction'

import { imageUploadResponseSchema } from './schemas'

const avatarUploadMiddleware = createUploadMiddleware({
  fieldName: 'avatar',
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  maxSizeInBytes: 5 * 1024 * 1024
})

export const uploadAvatar = defineAction({
  method: 'post',
  path: '/users/avatar',
  summary: 'Altera imagem de perfil do usuário',
  tags: ['Users'],
  authenticate: true,
  requestFormat: 'multipart',
  uploadFieldName: 'avatar',
  middlewares: [avatarUploadMiddleware]
}, async ({ file, manageError }) => {
  if (!file) {
    return manageError({ code: 'bad_request' })
  }
  return {
    tempPath: file.path,
    size: file.size
  }
})