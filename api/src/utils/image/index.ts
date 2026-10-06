import sharp from 'sharp'

export const optimizeImage = async (buffer: Buffer, size: number = 400): Promise<Buffer> => {
  return sharp(buffer)
    .resize({
      width: size,
      height: size,
      fit: 'cover',
      position: 'entropy'
    })
    .webp({ quality: 80 })
    .toBuffer()
}
