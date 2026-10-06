# Módulo: Storage (`@storage`)

Este módulo serve como um adaptador de alto nível para os recursos de armazenamento de arquivos em nuvem baseados no Firebase Admin (Google Cloud Storage). 

**DIRETRIZ PARA IA:** Nunca inicialize buckets ou gerencie o SDK do Firebase de forma manual/local dentro das Actions. Todas as manipulações de mídia (upload de imagens, obtenção de URIs assinadas e deleções) devem ser despachadas através dos métodos purificados em `@storage/utils`.

---

## 1. Filosofia e Responsabilidades

Este recurso atua isolando os detalhes técnicos do Bucket da infraestrutura de Domínio, assegurando:
- Ocultamento das chaves privadas e escopos de credencial do Firebase (via `connect.ts`).
- Uma biblioteca segura de interações (CRUD binário) por meio de abstração de funções.
- Tipagem estrita de Retornos: Todos os utils devolvem referências diretas de URL formatada e metadados auxiliares em Promises estruturadas.

---

## 2. Estrutura Interna e Inicialização

- `connect.ts`: Fabrica o wrapper assíncrono. Avalia variáveis como `FIREBASE_PRIVATE_KEY` e injeta na memória global (`getApps`). Executa a formatação das chaves rsa `\n` automaticamente.
- `utils.ts`: Exporta operações focadas em "o que fazer" e não em "como fazer".
- `types.ts`: Consolida os parâmetros aceitos por cada utilitário, como tempos de expiração e buffers (NodeJs).

---

## 3. Utilitários de Gerenciamento (`@storage/utils`)

| Função | Retorno Principal | Descrição |
| :--- | :--- | :--- |
| `uploadFile(UploadFileParams)` | `{ url: string, bucket: Bucket }` | Recebe um Buffer Node, empurra para o Google Cloud definindo o MimeType e lida automaticamente com acl público se requisitado. |
| `deleteFile(DeleteFileParams)` | `{ success: boolean }` | Localiza e deleta o arquivo no path estipulado sem disparar falhas agressivas na stack. |
| `getSignedUrl(GetSignedUrlParams)` | `{ signedUrl: string, expiresAt: Date }` | Gera um token seguro e efêmero para visualização (ou force download) de mídias restritas na nuvem. |
| `moveFile(MoveFileParams)` | `{ success: boolean }` | Transfere um objeto para outra pasta interna do bucket sem a necessidade de re-upload manual. |
| `getFile(GetFileParams)` | `{ buffer: Buffer, metadata: unknown }` | Resgata o binário físico do bucket e repassa para manipulação backend imediata. |

---

## 4. Exemplo de Fluxo Integrado

A integração do `@storage` é frequentemente executada em sintonia com o `@middlewares/upload` na captura de mídias pelo cliente.

```typescript
import fs from 'fs'
import { uploadFile } from '@storage/utils'
import { deleteUploadedFile } from '@middlewares/upload'

const processAvatarUpload = async (tempPath: string, userId: string, mimeType: string) => {
  // 1. Lê o binário armazenado em disco temporário pelo Middleware
  const buffer = fs.readFileSync(tempPath)
  
  // 2. Faz upload pro Bucket do Firebase
  const { url } = await uploadFile({
    path: `users/${userId}/avatar.png`,
    buffer,
    mimeType,
    isPublic: true
  })

  // OBS: O manageRequest gerenciará a remoção do tempPath automaticamente
  // através do finally { deleteUploadedFile }
  
  return url
}