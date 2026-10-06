import { UserModel } from '@domains/users/repositories/user/model'

import type { UserModelTypeWithPassword, CreateUserPayload, UpdateUserPayload, AccountReadiness, UserModelType, BankDetails, FindAllUsersParams, UserStatsResponse } from '@domains/users/repositories/user/types'
import type { PaginatedData } from '@factories/pagination/types'

const userRepository = {
  create: async (payload: CreateUserPayload): Promise<UserModelType> => {
    return UserModel.create({
      name: payload.name,
      email: payload.email,
      password: payload.passwordHash,
      isTenant: payload.isTenant,
      isOwner: payload.isOwner,
      document: payload.document,
      birthDate: payload.birthDate,
      phone: payload.phone,
      referralSource: payload.referralSource,
      academicData: payload.academicData
    })
  },
  update: async (id: string, payload: UpdateUserPayload): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, payload, { new: true })
  },
  updatePassword: async (id: string, password: string): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { password }, { new: true })
  },
  updateAccountStatus: async (id: string, status: 'active' | 'blocked'): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { accountStatus: status }, { new: true })
  },
  updateBankDetails: async (id: string, bankDetails: BankDetails): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { bankDetails }, { new: true })
  },
  findByEmail: async (email: string, select?: string): Promise<UserModelType | null> => {
    const query = UserModel.findOne({ email })
    if (select) query.select(select)
    const user = await query.lean()
    if (!user) return null
    return { ...user, id: user._id.toString() } as unknown as UserModelType
  },
  findByEmailWithPassword: async (email: string): Promise<UserModelTypeWithPassword | null> => {
    const user = await UserModel.findOne({ email }).select('+password').lean()
    if (!user) return null
    return { ...user, id: user._id.toString() } as unknown as UserModelTypeWithPassword
  },
  findById: async (id: string, select?: string): Promise<UserModelType | null> => {
    const query = UserModel.findById(id)
    if (select) query.select(select)
    const user = await query.lean()
    if (!user) return null
    return { ...user, id: user._id.toString() } as unknown as UserModelType
  },
  findAll: async ({ limit, offset, search, filters, sort }: FindAllUsersParams): Promise<PaginatedData<UserModelType>> => {
    const query: Record<string, any> = {}

    if (search) {
      const cleanSearch = search.trim()
      const searchRegex = new RegExp(cleanSearch, 'i')
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { document: searchRegex }
      ]
    }

    if (filters) {
      if (filters.role === 'tenant') query.isTenant = true
      if (filters.role === 'owner') query.isOwner = true
      if (filters.role === 'superAdmin') query.superAdmin = true

      if (filters.accountStatus) query.accountStatus = filters.accountStatus
      if (typeof filters.isEmailVerified === 'boolean') query.isEmailVerified = filters.isEmailVerified

      if (filters.tenantDocumentStatus) {
        query['documents.tenant.status'] = filters.tenantDocumentStatus
      }
      if (filters.ownerDocumentStatus) {
        query['documents.owner.status'] = filters.ownerDocumentStatus
      }
    }

    const sortOption = sort || { createdAt: -1 }

    const [count, rows] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query).sort(sortOption).skip(offset).limit(limit).lean()
    ])

    const formattedRows = rows.map((u) => ({
      ...u,
      id: u._id.toString()
    })) as unknown as UserModelType[]

    return { count, rows: formattedRows }
  },
  getStats: async (): Promise<UserStatsResponse> => {
    const [
      total,
      active,
      blocked,
      tenants,
      owners,
      superAdmins,
      pendingTenantVerifications,
      pendingOwnerVerifications
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ accountStatus: 'active' }),
      UserModel.countDocuments({ accountStatus: 'blocked' }),
      UserModel.countDocuments({ isTenant: true }),
      UserModel.countDocuments({ isOwner: true }),
      UserModel.countDocuments({ superAdmin: true }),
      UserModel.countDocuments({ 'documents.tenant.status': 'pending' }),
      UserModel.countDocuments({ 'documents.owner.status': 'pending' })
    ])

    return {
      total,
      active,
      blocked,
      tenants,
      owners,
      superAdmins,
      pendingTenantVerifications,
      pendingOwnerVerifications
    }
  },
  updateSuperAdmin: async (id: string, superAdmin: boolean): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { superAdmin }, { new: true })
  },
  listPendingDocuments: async ({ limit, offset, type = 'all' }: { limit: number; offset: number; type?: 'tenant' | 'owner' | 'all' }): Promise<PaginatedData<unknown>> => {
    let query: Record<string, unknown> = {}

    if (type === 'tenant') {
      query = { 'documents.tenant.status': 'pending' }
    } else if (type === 'owner') {
      query = { 'documents.owner.status': 'pending' }
    } else {
      query = {
        $or: [
          { 'documents.tenant.status': 'pending' },
          { 'documents.owner.status': 'pending' }
        ]
      }
    }

    const [count, rows] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query).sort({ updatedAt: 1 }).skip(offset).limit(limit).lean()
    ])
    return { count, rows }
  },
  updateUserDocument: async (
    id: string,
    role: 'tenant' | 'owner',
    documentType: string,
    documentUrl: string,
    isResubmit: boolean = false
  ): Promise<UserModelType | null> => {
    const user = await UserModel.findById(id)
    
    if (!user) return null

    if (!user.documents) {
      user.documents = {
        tenant: { status: 'not_submitted' },
        owner: { status: 'not_submitted' }
      }
    }

    const roleDocs = user.documents[role] as unknown as Record<string, any>
    const currentResubmitCount = roleDocs?.[documentType]?.resubmitCount || 0
    const newResubmitCount = isResubmit ? currentResubmitCount + 1 : 0

    const newDocument = {
      reference: documentUrl,
      sentAt: new Date(),
      status: 'pending' as const,
      resubmitCount: newResubmitCount,
      updatedAt: new Date()
    }

    const requiredTenantDocs = ['identityFront', 'identityBack', 'selfie', 'enrollmentProof']
    const requiredOwnerDocs = ['identityFront', 'identityBack', 'selfie', 'residencyProof']

    const evaluateOverallStatus = (docs: Record<string, any>, requiredList: string[]) => {
      const hasAllDocs = requiredList.every((doc) => !!docs[doc])
      if (!hasAllDocs) return 'incomplete_documentation'

      const hasAnyRejected = requiredList.some((doc) => docs[doc]?.status === 'rejected')
      if (hasAnyRejected) return 'rejected'

      const hasAllApproved = requiredList.every((doc) => docs[doc]?.status === 'approved')
      if (hasAllApproved) return 'approved'

      return 'pending'
    }

    if (role === 'tenant') {
      if (!user.documents.tenant) user.documents.tenant = { status: 'not_submitted' }
      
      const tenantDocs = user.documents.tenant as unknown as Record<string, any>
      tenantDocs[documentType] = newDocument
      
      user.documents.tenant.status = evaluateOverallStatus(tenantDocs, requiredTenantDocs)
    } else {
      if (!user.documents.owner) user.documents.owner = { status: 'not_submitted' }
      
      const ownerDocs = user.documents.owner as unknown as Record<string, any>
      ownerDocs[documentType] = newDocument
      
      user.documents.owner.status = evaluateOverallStatus(ownerDocs, requiredOwnerDocs)
    }

    user.markModified('documents')
    
    return user.save()
  },
  reviewUserDocument: async (
    id: string,
    role: 'tenant' | 'owner',
    documentType: string,
    status: 'approved' | 'rejected',
    reviewer: { id: string; name: string }
  ): Promise<UserModelType | null> => {
    const user = await UserModel.findById(id)

    if (!user || !user.documents || !user.documents[role]) return null

    const roleDocs = user.documents[role] as unknown as Record<string, any>
    const targetDoc = roleDocs[documentType]

    if (!targetDoc) return null

    targetDoc.status = status
    targetDoc.reviewedBy = reviewer
    targetDoc.updatedAt = new Date()

    const requiredTenantDocs = [
      'identityFront',
      'identityBack',
      'selfie',
      'enrollmentProof'
    ]
    
    const requiredOwnerDocs = [
      'identityFront',
      'identityBack',
      'selfie',
      'residencyProof'
    ]

    const requiredDocs = role === 'tenant' ? requiredTenantDocs : requiredOwnerDocs

    if (status === 'rejected') {
      user.documents[role]!.status = 'rejected'
    } else {
      const hasAllDocsApproved = requiredDocs.every((doc) => {
        const d = roleDocs[doc]
        return d && d.status === 'approved'
      })
      
      if (hasAllDocsApproved) {
        user.documents[role]!.status = 'approved'
      }
    }

    user.markModified(`documents.${role}`)

    return user.save()
  },
  updateOwnerContract: async (id: string, reference: string): Promise<UserModelType | null> => {
    const user = await UserModel.findById(id)

    if (!user) return null

    if (!user.documents) {
      user.documents = {
        tenant: { status: 'not_submitted' },
        owner: { status: 'not_submitted' }
      }
    }

    if (!user.documents.owner) {
      user.documents.owner = { status: 'not_submitted' }
    }

    const ownerDocs = user.documents.owner as unknown as Record<string, any>

    ownerDocs.contract = {
      reference,
      sentAt: new Date(),
      updatedAt: new Date()
    }

    user.markModified('documents.owner')

    return user.save()
  },
  checkAccountReadiness: async (id: string, role: 'tenant' | 'owner'): Promise<AccountReadiness | null> => {
    const user = await UserModel.findById(id).lean()

    if (!user) return null

    const issues: string[] = []

    if (user.accountStatus === 'blocked') issues.push('account_blocked')

    if (role === 'tenant') {
      if (!user.isTenant) issues.push('not_registered_as_tenant')
      if (user.documents?.tenant?.status !== 'approved') issues.push('tenant_documents_pending_or_rejected')
    }

    if (role === 'owner') {
      if (!user.isOwner) issues.push('not_registered_as_owner')
      if (user.documents?.owner?.status !== 'approved') issues.push('owner_documents_pending_or_rejected')
      if (!user.documents?.owner?.contract?.reference) issues.push('owner_contract_missing')
    }

    return {
      isReady: !user.superAdmin ? issues.length === 0 : true,
      issues
    }
  }
}

export default userRepository