# Google Service

Módulo responsável pela autenticação OAuth 2.0 e integração com a Google Calendar API.

## Variáveis de Ambiente Necessárias

- `GOOGLE_CLIENT_ID`: ID do cliente OAuth 2.0 obtido no Google Cloud Console.
- `GOOGLE_CLIENT_SECRET`: Segredo do cliente OAuth 2.0.
- `GOOGLE_REDIRECT_URI`: URI de redirecionamento autorizada para o callback OAuth.

## Principais Funções

- `generateGoogleAuthUrl(options)`: Cria o link de consentimento com escopos do Google Calendar e perfil.
- `exchangeCodeForTokens(code)`: Troca o código retornado pelo consentimento por `access_token` e `refresh_token`.
- `createGoogleCalendarClient(refreshToken)`: Cria uma instância autenticada da API de calendário pronta para operações.
- `createCalendarEvent(refreshToken, event)`: Cria um evento no calendário primário do usuário.
- `revokeGoogleToken(token)`: Revoga permissões e tokens no Google.
