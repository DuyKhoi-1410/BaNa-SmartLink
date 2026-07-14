import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import * as refreshTokenRepo from '../repositories/refreshTokenRepo.js'

const ACCESS_SECRET = process.env.JWT_SECRET as string
const REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '30m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'

export interface JwtPayload {
  id: number
  ho_ten: string
  vai_tro: 'dan' | 'thon' | 'xa'
  thon_id: number | null
}

interface UserLike {
  id: number
  ho_ten: string
  vai_tro: string
  thon_id: number | null
}

export function taoAccessToken(user: UserLike): string {
  return jwt.sign(
    { id: user.id, ho_ten: user.ho_ten, vai_tro: user.vai_tro, thon_id: user.thon_id, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES as any }
  )
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Tao refresh token (JWT co jti) + luu hash vao DB de co the thu hoi
export async function taoRefreshToken(
  user: UserLike,
  ctx?: { ip?: string | null; userAgent?: string | null }
): Promise<string> {
  const jti = crypto.randomUUID()
  const token = jwt.sign({ id: user.id, jti, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES as any,
  })
  const decoded = jwt.decode(token) as { exp: number }
  await refreshTokenRepo.taoMoi({
    nguoi_dung_id: user.id,
    token_hash: hashToken(token),
    het_han: new Date(decoded.exp * 1000),
    ip_address: ctx?.ip || null,
    user_agent: ctx?.userAgent || null,
  })
  return token
}

// Tao ca cap token
export async function taoCapToken(
  user: UserLike,
  ctx?: { ip?: string | null; userAgent?: string | null }
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = taoAccessToken(user)
  const refreshToken = await taoRefreshToken(user, ctx)
  return { accessToken, refreshToken }
}

export function xacThucAccessToken(token: string): JwtPayload & { exp: number; iat: number } {
  return jwt.verify(token, ACCESS_SECRET) as any
}

// Xac thuc refresh token: kiem tra chu ky JWT + con trong DB + chua thu hoi + chua het han
export async function xacThucRefreshToken(token: string): Promise<{ userId: number; tokenHash: string }> {
  let decoded: any
  try {
    decoded = jwt.verify(token, REFRESH_SECRET)
  } catch {
    throw { status: 401, code: 'REFRESH_INVALID', message: 'Refresh token khong hop le hoac da het han' }
  }
  if (decoded.type !== 'refresh') {
    throw { status: 401, code: 'REFRESH_INVALID', message: 'Token khong phai refresh token' }
  }
  const tokenHash = hashToken(token)
  const row = await refreshTokenRepo.timTheoHash(tokenHash)
  if (!row || row.da_thu_hoi) {
    throw { status: 401, code: 'REFRESH_REVOKED', message: 'Phien dang nhap da bi thu hoi' }
  }
  if (new Date(row.het_han).getTime() < Date.now()) {
    throw { status: 401, code: 'REFRESH_EXPIRED', message: 'Phien dang nhap da het han' }
  }
  return { userId: decoded.id, tokenHash }
}

// Xoay vong: thu hoi token cu, tra token moi (chong tai su dung)
export async function xoayRefreshToken(
  oldTokenHash: string,
  user: UserLike,
  ctx?: { ip?: string | null; userAgent?: string | null }
): Promise<{ accessToken: string; refreshToken: string }> {
  await refreshTokenRepo.thuHoiTheoHash(oldTokenHash)
  return taoCapToken(user, ctx)
}

export async function thuHoiRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token)
  await refreshTokenRepo.thuHoiTheoHash(tokenHash)
}
