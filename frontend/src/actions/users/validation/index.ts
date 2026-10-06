import apiClient from '@api/client'

import type { RequestCodePayload, VerifyCodePayload, VerificationResponse, ValidationPurpose } from './types'

export const requestCodeAction = async (
  purpose: ValidationPurpose,
  payload: RequestCodePayload
): Promise<VerificationResponse> => {
  return apiClient.post<VerificationResponse>(`/users/validation/request/${purpose}`, payload, { skipAuth: true })
}

export const verifyCodeAction = async (
  purpose: ValidationPurpose,
  payload: VerifyCodePayload
): Promise<VerificationResponse> => {
  return apiClient.post<VerificationResponse>(`/users/validation/verify/${purpose}`, payload, { skipAuth: true })
}

const validationActions = {
  requestCode: requestCodeAction,
  verifyCode: verifyCodeAction
}

export default validationActions
