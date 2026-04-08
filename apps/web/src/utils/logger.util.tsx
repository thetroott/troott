import type { LogRequestDTO } from '@/dtos/system.dto'

class Logger {
  private getTimestamp(): string {
    const now = new Date()
    return now.toLocaleTimeString()
  }

  public log(payload: LogRequestDTO) {
    const { data, label, type } = payload
    if (!data) return

    const timestamp = this.getTimestamp()
    const prefix = label ? `[${label}]` : ''
    const base = `%c${prefix} ${timestamp} → ${data}`

    let style = `
      color: #fff;
      font-weight: regular;
      padding: 2px 6px;
      border-radius: 4px;
    `

    switch (type) {
      case 'error':
        style += 'background: #e63946;'
        break
      case 'success':
        style += 'background: #2a9d8f;'
        break
      case 'info':
        style += 'background: #457b9d;'
        break
      case 'warning':
        style += 'background: #f4a261;'
        break
      default:
        style += 'background: #6c757d;'
    }

    console.log(base, style)
  }
}

export default new Logger()
