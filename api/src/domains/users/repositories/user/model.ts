import { Schema, model } from 'mongoose'

import type { UserDocument } from '@domains/users/repositories/user/types'

const academicDataSchema = new Schema(
  {
    institution: { type: String, required: true },
    course: { type: String, required: true },
    degreeLevel: { type: String, enum: ['undergraduate', 'master', 'doctorate'], required: true },
    courseStart: { type: String, required: true },
    courseEnd: { type: String, required: true },
    enrollmentId: { type: String, required: true }
  },
  { _id: false }
)

const documentItemSchema = new Schema(
  {
    reference: { type: String, required: true },
    sentAt: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: {
      type: {
        id: { type: String, required: true },
        name: { type: String, required: true }
      },
      required: false,
      _id: false
    },
    documentType: { type: String, required: false },
    resubmitCount: { type: Number, default: 0, required: true },
    updatedAt: { type: Date, required: true }
  },
  { _id: false }
)

const contractItemSchema = new Schema(
  {
    reference: { type: String, required: true },
    sentAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true }
  },
  { _id: false }
)

const tenantProfileDocumentsSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['not_submitted', 'incomplete_documentation', 'pending', 'approved', 'rejected'],
      default: 'not_submitted'
    },
    identityFront: { type: documentItemSchema, required: false },
    identityBack: { type: documentItemSchema, required: false },
    selfie: { type: documentItemSchema, required: false },
    enrollmentProof: { type: documentItemSchema, required: false }
  },
  { _id: false }
)

const ownerProfileDocumentsSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['not_submitted', 'incomplete_documentation', 'pending', 'approved', 'rejected'],
      default: 'not_submitted'
    },
    identityFront: { type: documentItemSchema, required: false },
    identityBack: { type: documentItemSchema, required: false },
    selfie: { type: documentItemSchema, required: false },
    residencyProof: { type: documentItemSchema, required: false },
    contract: { type: contractItemSchema, required: false }
  },
  { _id: false }
)

const userDocumentsSchema = new Schema(
  {
    tenant: {
      type: tenantProfileDocumentsSchema,
      required: false,
      default: () => ({ status: 'not_submitted' })
    },
    owner: {
      type: ownerProfileDocumentsSchema,
      required: false,
      default: () => ({ status: 'not_submitted' })
    }
  },
  { _id: false }
)

const bankDetailsSchema = new Schema(
  {
    bankName: { type: String, required: true },
    pixKeyType: { type: String, enum: ['cpf', 'cnpj', 'email', 'phone', 'random'], required: true },
    pixKey: { type: String, required: true },
    accountHolder: { type: String, required: true }
  },
  { _id: false }
)

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, required: false },
    superAdmin: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isTenant: { type: Boolean, required: true },
    isOwner: { type: Boolean, required: true },
    document: { type: String, required: true },
    birthDate: { type: String, required: true },
    phone: { type: String, required: true },
    referralSource: { type: String, required: true },
    accountStatus: { type: String, enum: ['active', 'blocked'], default: 'active', required: true },
    academicData: { type: academicDataSchema, required: false },
    ownerType: { type: String, enum: ['individual', 'legal_entity'], required: false },
    documents: {
      type: userDocumentsSchema,
      required: false,
      default: () => ({
        tenant: { status: 'not_submitted' },
        owner: { status: 'not_submitted' }
      })
    },
    bankDetails: { type: bankDetailsSchema, required: false }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password
        return ret
      }
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password
        return ret
      }
    }
  }
)

userSchema.index({ 'documents.tenant.status': 1, updatedAt: 1 })
userSchema.index({ 'documents.owner.status': 1, updatedAt: 1 })

export const UserModel = model<UserDocument>('User', userSchema)