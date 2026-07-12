import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { query } from './repositories/db.js'
import authRouter from './api/auth.js'
import usersRouter from './api/users.js'
import householdsRouter from './api/households.js'
import periodsRouter from './api/periods.js'
import declarationsRouter from './api/declarations.js'
import villageDeclarationsRouter from './api/villageDeclarations.js'
import notificationsRouter from './api/notifications.js'
import reportsRouter from './api/reports.js'
import evidenceRouter from './api/evidence.js'
import attachmentsRouter from './api/attachments.js'
import nhanKhauRouter from './api/nhanKhau.js'
import { nhacHanNop } from './services/thongBaoService.js'
import { errorHandler } from './utils/response.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3636

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }))
app.use(express.json({ limit: '10mb' }))

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.get('/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW() AS now')
    res.json({ status: 'ok', timestamp: result.rows[0].now })
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message })
  }
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/households', householdsRouter)
app.use('/api/v1/periods', periodsRouter)
app.use('/api/v1/declarations', declarationsRouter)
app.use('/api/v1/village-declarations', villageDeclarationsRouter)
app.use('/api/v1/notifications', notificationsRouter)
app.use('/api/v1/reports', reportsRouter)
app.use('/api/v1/evidence', evidenceRouter)
app.use('/api/v1/attachments', attachmentsRouter)
app.use('/api/v1/nhan-khau', nhanKhauRouter)

// Xu ly loi tap trung: envelope chuan FastAPI + ton trong err.status
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)

  // Cron nhắc hạn nộp — chạy mỗi 12 giờ, lần đầu sau 30 giây khởi động
  setTimeout(() => {
    nhacHanNop().catch(err => console.error('Loi cron nhac han:', err.message))
  }, 30_000)
  setInterval(() => {
    nhacHanNop().catch(err => console.error('Loi cron nhac han:', err.message))
  }, 12 * 60 * 60 * 1000)
})
