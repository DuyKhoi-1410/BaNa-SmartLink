import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

// Mo rong Request de gan req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Token khong hop le hoac thieu' },
    })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    req.user = decoded
    next()
  } catch (err: any) {
    // Phan biet het han vs sai chu ky de FE biet khi nao nen refresh
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Access token da het han' },
      })
    }
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Token khong hop le' },
    })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.vai_tro)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Khong co quyen truy cap' },
      })
    }
    next()
  }
}
