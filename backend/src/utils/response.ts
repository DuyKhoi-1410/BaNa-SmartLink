import type { Request, Response, NextFunction, RequestHandler } from 'express'

// ===== Chuan hoa response kieu FastAPI =====
// Thanh cong: { success: true, data: ... }
// Loi:        { success: false, error: { code, message, detail? } }

export class AppError extends Error {
  status: number
  code: string
  detail?: unknown

  constructor(status: number, message: string, code?: string, detail?: unknown) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code || defaultCode(status)
    this.detail = detail
  }
}

function defaultCode(status: number): string {
  switch (status) {
    case 400: return 'BAD_REQUEST'
    case 401: return 'UNAUTHORIZED'
    case 403: return 'FORBIDDEN'
    case 404: return 'NOT_FOUND'
    case 409: return 'CONFLICT'
    case 422: return 'VALIDATION_ERROR'
    default: return status >= 500 ? 'INTERNAL_ERROR' : 'ERROR'
  }
}

// Cac helper nem loi ngan gon
export const loi = {
  xau: (msg: string, detail?: unknown) => new AppError(400, msg, 'BAD_REQUEST', detail),
  chuaDangNhap: (msg = 'Chua dang nhap') => new AppError(401, msg, 'UNAUTHORIZED'),
  camTruyCap: (msg = 'Khong co quyen truy cap') => new AppError(403, msg, 'FORBIDDEN'),
  khongThay: (msg = 'Khong tim thay du lieu') => new AppError(404, msg, 'NOT_FOUND'),
  trung: (msg: string) => new AppError(409, msg, 'CONFLICT'),
  kiemTra: (msg: string, detail?: unknown) => new AppError(422, msg, 'VALIDATION_ERROR', detail),
}

// Tra ve thanh cong
export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data })
}

// Bao boc async handler: tu dong bat loi -> next(err) -> errorHandler
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Middleware xu ly loi tap trung: ton trong err.status, format envelope
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Loi validation dang mang string (tu cac validate* cu)
  if (err && Array.isArray(err.errors)) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Du lieu khong hop le', detail: err.errors },
    })
  }

  // Loi multer (file qua lon / sai loai)
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: 'File vuot qua dung luong cho phep' },
    })
  }

  const status = Number(err?.status) || 500
  const code = err?.code || defaultCode(status)
  const message = err?.message || 'Loi he thong'

  if (status >= 500) {
    console.error('[ERROR]', status, message, err?.stack || err)
  }

  const body: any = { success: false, error: { code, message } }
  if (err?.detail !== undefined) body.error.detail = err.detail
  return res.status(status).json(body)
}
