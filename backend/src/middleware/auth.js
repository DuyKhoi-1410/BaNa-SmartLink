import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token khong hop le hoac thieu' })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token het han hoac khong hop le' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.vai_tro)) {
      return res.status(403).json({ error: 'Khong co quyen truy cap' })
    }
    next()
  }
}
