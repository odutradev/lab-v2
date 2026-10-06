import bcrypt from 'bcryptjs'

export const hashData = (data: string): string => {
  return bcrypt.hashSync(data, 10)
}

export const compareHash = (data: string, hash: string): boolean => {
  return bcrypt.compareSync(data, hash)
}
