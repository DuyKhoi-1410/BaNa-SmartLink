import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp']
const QUALITY = 85

export async function optimizeImage(filePath: string, mimetype: string): Promise<{ path: string; mimetype: string }> {
  if (!IMAGE_MIMETYPES.includes(mimetype)) return { path: filePath, mimetype }

  const optimizedPath = filePath + '.optimized'

  let pipeline = sharp(filePath).rotate()

  if (mimetype === 'image/jpeg') {
    pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true })
  } else if (mimetype === 'image/png') {
    pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 8 })
  } else if (mimetype === 'image/webp') {
    pipeline = pipeline.webp({ quality: QUALITY })
  }

  await pipeline.toFile(optimizedPath)

  fs.unlinkSync(filePath)
  fs.renameSync(optimizedPath, filePath)

  return { path: filePath, mimetype }
}
