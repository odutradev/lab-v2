import 'dotenv/config'
import mongoose from 'mongoose'

import { UserModel } from '@domains/users/repositories/user/model'

const makeSuperAdmin = async (): Promise<void> => {
  const email = process.argv[2]

  if (!email) {
    console.error('Error: Please provide the user email as a parameter.')
    console.info('Usage: npx tsx scripts/makeSuperAdmin.ts <email>')
    process.exit(1)
  }

  try {
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
      console.error('Error: MONGO_URI is missing in your environment variables.')
      process.exit(1)
    }

    await mongoose.connect(mongoUri)

    const user = await UserModel.findOneAndUpdate(
      { email },
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