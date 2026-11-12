import '@config/environment'

import mongoose from 'mongoose'

import userRepository from '@domains/users/repositories/user'
import createLocalLogger from '@utils/localLogger'
import connectMongoose from '@database/connect'

const logger = createLocalLogger('make-super-admin')

const makeSuperAdmin = async (): Promise<void> => {
  const rawEmail = process.argv[2]

  if (!rawEmail) {
    logger.error('Please provide the user email as a parameter.')
    logger.info('Usage: npm run make:superadmin <email> or npx tsx scripts/makeSuperAdmin.ts <email>')
    process.exit(1)
  }

  const email = rawEmail.trim()

  try {
    await connectMongoose()

    const user = await userRepository.promoteSuperAdminByEmail(email)

    if (!user) {
      logger.error(`User with email "${email}" not found.`)
      process.exit(1)
    }

    logger.success(`User ${user.name} (${user.email}) is now a Super Admin.`)
  } catch (error) {
    logger.error('Failed to execute script', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

makeSuperAdmin()
