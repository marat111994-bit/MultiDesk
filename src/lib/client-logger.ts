async function sendToServer(level: string, message: string, data?: any) {
  try {
    await fetch('/api/client-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        url: window.location.href,
        data
      })
    })
  } catch {}
}

export const clientLogger = {
  info:  (msg: string, data?: any) => sendToServer('INFO',  msg, data),
  error: (msg: string, data?: any) => sendToServer('ERROR', msg, data),
}

// Перехват глобальных ошибок браузера
if (typeof window !== 'undefined') {
  window.onerror = (message, source, line, col, error) => {
    sendToServer('JS_ERROR', String(message), { source, line, col, stack: error?.stack })
    return false
  }
  window.onunhandledrejection = (event) => {
    sendToServer('PROMISE_ERROR', String(event.reason), { stack: event.reason?.stack })
  }
}
