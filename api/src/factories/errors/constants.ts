export const ResponseErrors = {
  internal_error: { message: 'Erro interno no servidor', statusCode: 500 },
  validation_error: { message: 'Erro de validação dos dados', statusCode: 422 },
  unauthorized: { message: 'Acesso não autorizado', statusCode: 401 },
  forbidden: { message: 'Acesso negado', statusCode: 403 },
  bad_request: { message: 'Requisição malformada', statusCode: 400 },
  not_found: { message: 'Recurso não encontrado', statusCode: 404 },
  conflict: { message: 'Conflito de dados', statusCode: 409 },
  no_token: { message: 'Token de autenticação não fornecido', statusCode: 401 },
  token_is_not_valid: { message: 'Token de autenticação inválido ou expirado', statusCode: 401 },
  no_credentials_send: { message: 'Credenciais não enviadas na requisição', statusCode: 400 },
  invalid_credentials: { message: 'Credenciais inválidas', statusCode: 401 },
  user_not_found: { message: 'Usuário não localizado no sistema', statusCode: 404 },
  invalid_token: { message: 'Token inválido ou expirado', statusCode: 401 },
  invalid_verification_code: { message: 'Código de verificação inválido ou expirado', statusCode: 400 },
  account_not_ready: { message: 'A conta não atende aos requisitos mínimos para esta ação', statusCode: 403 },
  too_many_requests: { message: 'Muitas requisições. Tente novamente mais tarde', statusCode: 429 }
} as const