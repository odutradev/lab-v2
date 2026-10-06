# Módulo: Database (`@database`)

Este módulo gerencia a infraestrutura de conexão principal com o banco de dados MongoDB (via Mongoose) e provê utilitários auxiliares estritamente tipados para manipulação de identificadores e documentos. 

**DIRETRIZ PARA IA:** Este módulo encapsula as rotinas de inicialização de infraestrutura. Se você precisar manipular o banco de dados dentro de uma lógica de negócio (Action), **NÃO** importe nada daqui diretamente. As Actions devem conversar EXCLUSIVAMENTE com os Repositórios do Domínio (ex: `userRepository`). Utilize os utilitários daqui (`@database/utils`) apenas quando houver necessidade de conversão ou validação de tipos do MongoDB (`ObjectId`).

---

## 1. Responsabilidades e Arquitetura

O encapsulamento de banco de dados neste projeto abandona conexões globais soltas em prol de um módulo inicializador seguro. O fluxo é desenhado para:
- Interromper a inicialização da API (via `process.exit(1)`) caso as variáveis de ambiente obrigatórias não existam.
- Registrar metadados globais (`clusterName`) para injeção automática de Headers nas respostas das Actions (gerenciado por `@middlewares/manageRequest`).
- Padronizar conversões entre `string` e `Types.ObjectId`.

---

## 2. Estrutura Interna

- `connect.ts`: Inicializa o cliente Mongoose conectando à variável `MONGO_URI`. Aplica o padrão estrito de consultas `strictQuery` e configuração padrão de escrita (`writeConcern: 'majority'`).
- `utils.ts`: Utilitários puros para validação e parseamento de ObjectIds e manipulação de objetos retornados do Mongoose.

---

## 3. Utilitários Disponíveis (`@database/utils`)

Sempre que trabalhar com validações manuais ou transformações de chaves primárias do MongoDB, use estas funções. É proibido instanciar `new Types.ObjectId()` solto nas lógicas de domínio sem usar o wrapper.

| Função | Retorno | Descrição |
| :--- | :--- | :--- |
| `isValidObjectId(id: string)` | `boolean` | Valida com segurança se uma string é um ObjectId válido, prevenindo crashes no parser. |
| `toObjectId(id: string)` | `Types.ObjectId` | Converte uma string primária purificada em uma instância estrita do Mongoose. |

---

## 4. Exemplo de Uso (Utilitários)

Em casos raros onde a validação dinâmica de esquema não foi suficiente e é necessário converter o ObjectId:

```typescript
import { toObjectId, isValidObjectId } from '@database/utils'

const handleSpecificMongoLogic = (id: string) => {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid ID')
  }
  
  const objectId = toObjectId(id)
  // ... envio para repositório base que exija type Types.ObjectId
}