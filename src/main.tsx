import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler
window.addEventListener('error', (e) => {
  console.error('[Repote Global Error]', e.error || e.message)
  const root = document.getElementById('root')
  if (root && !root.querySelector('.error-boundary')) {
    root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a0a0f;color:#f5f5f7;padding:24px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
        <div style="text-align:center;max-width:320px;">
          <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
          <h1 style="font-size:20px;font-weight:600;margin-bottom:8px;">Algo salió mal</h1>
          <p style="font-size:14px;color:#8e8e93;margin-bottom:24px;">${e.error?.message || 'Error inesperado'}</p>
          <button onclick="location.reload()" style="background:#3b82f6;color:white;border:none;padding:10px 24px;border-radius:12px;font-size:14px;cursor:pointer;">Reintentar</button>
        </div>
      </div>
    `
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
