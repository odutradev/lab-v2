import { VerificationCodeModel } from '@domains/users/repositories/verificationCode/model'

import type { CreateVerificationCodePayload, VerificationCodeModelType } from '@domains/users/repositories/verificationCode/types'

const verificationCodeRepository = {
  create: async (payload: CreateVerificationCodePayload): Promise<VerificationCodeModelType> => {
    return VerificationCodeModel.create(payload)
  },
  findValidCode: async (email: string, code: string, purpose: string, select?: string): Promise<VerificationCodeModelType | null> => {
    const query = VerificationCodeModel.findOne({
      email,
      code,
      purpose,
      expiresAt: { $gt: new Date() }
    })
    if (select) query.select(select)
    const result = await query.lean()
    if (!result) return null
    return { ...result, id: result._id.toString() } as unknown as VerificationCodeModelType
  },
  deleteCode: async (id: string): Promise<void> => {
    await VerificationCodeModel.findByIdAndDelete(id)
  },
  deleteExpiredCodes: async (email: string, purpose: string): Promise<void> => {
    await VerificationCodeModel.deleteMany({ email, purpose })
  }
}

export default verificationCodeRepository