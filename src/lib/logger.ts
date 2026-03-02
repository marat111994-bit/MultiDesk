import fs from 'fs'
import path from 'path'

const logFile = path.join(process.cwd(), 'logs', 'app.log')

// Создать папку если нет
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Ротация: если файл > 5MB, переименовать в app.log.bak
function rotateIfNeeded() {
  if (fs.existsSync(logFile)) {
    const stats = fs.statSync(logFile)
    if (stats.size > 5 * 1024 * 1024) {
      fs.renameSync(logFile, logFile + '.bak')
    }
  }
}

function write(level: string, message: string, data?: any) {
  rotateIfNeeded()
  
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    data: data || null
  }) + '\n'
  
  fs.appendFileSync(logFile, line)
  // Дублировать в консоль тоже
  console.log(`[${level}] ${message}`, data || '')
}

export const logger = {
  info:  (msg: string, data?: any) => write('INFO',  msg, data),
  error: (msg: string, data?: any) => write('ERROR', msg, data),
  warn:  (msg: string, data?: any) => write('WARN',  msg, data),
}
