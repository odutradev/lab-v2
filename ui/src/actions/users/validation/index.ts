import api from "@utils/api";

import type {
  RequestCodePayload,
  VerifyCodePayload,
  VerificationResponse,
  ValidationPurpose
} from "@actions/users/validation/types";

export const requestCodeAction = async (
  purpose: ValidationPurpose,
  payload: RequestCodePayload
): Promise<VerificationResponse> => {
  const response = await api.post<VerificationResponse>(`/users/validation/request/${purpose}`, payload, {
    skipAuth: true
  });
  return response.data;
};

export const verifyCodeAction = async (
  purpose: ValidationPurpose,
  payload: VerifyCodePayload
): Promise<VerificationResponse> => {
  const response = await api.post<VerificationResponse>(`/users/validation/verify/${purpose}`, payload, {
    skipAuth: true
  });
  return response.data;
};
