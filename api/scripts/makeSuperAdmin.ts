import 'dotenv/config'
import mongoose from 'mongoose'

import connectMongoose from '@database/connect'
import { UserModel } from '@domains/users/repositories/user/model'

const makeSuperAdmin = async (): Promise<void> => {
  const rawEmail = process.argv[2]

  if (!rawEmail) {
    console.error('Error: Please provide the user email as a parameter.')
    console.info('Usage: npm run make:superadmin <email> or npx tsx scripts/makeSuperAdmin.ts <email>')
    process.exit(1)
  }

  const email = rawEmail.trim()

  try {
    await connectMongoose()

    const user = await UserModel.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      { superAdmin: true },
      { new: true }
    )

    if (!user) {
      console.error(`Error: User with email "${email}" not found.`)
      process.exit(1)
    }

    console.info(`Success: User ${user.name} (${user.email}) is now a Super Admin.`)
  } catch (error) {
    console.error('Error: Failed to execute script', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

makeSuperAdmin()