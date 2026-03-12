import { format, parseISO } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

const JAKARTA_TIMEZONE = 'Asia/Jakarta'

export const formatDateJakarta = (date: string | Date, formatStr: string = 'dd/MM/yyyy HH:mm') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const jakartaTime = utcToZonedTime(dateObj, JAKARTA_TIMEZONE)
  return format(jakartaTime, formatStr)
}

export const getCurrentJakartaTime = () => {
  return utcToZonedTime(new Date(), JAKARTA_TIMEZONE)
}

export const convertToJakartaTime = (date: Date) => {
  return zonedTimeToUtc(date, JAKARTA_TIMEZONE)
}

export const getCurrentPeriod = (): '08-10' | '10-12' | '13-15' | '15-17' => {
  const now = getCurrentJakartaTime()
  const hour = now.getHours()
  
  if (hour >= 8 && hour < 10) return '08-10'
  if (hour >= 10 && hour < 12) return '10-12'
  if (hour >= 13 && hour < 15) return '13-15'
  if (hour >= 15 && hour < 17) return '15-17'
  
  // Default to next available period
  if (hour < 8) return '08-10'
  if (hour < 10) return '10-12'
  if (hour < 13) return '13-15'
  if (hour < 15) return '13-15'
  if (hour < 17) return '15-17'
  return '15-17' // After hours
}

export const isOvertimePeriod = (period: string): boolean => {
  const now = getCurrentJakartaTime()
  const hour = now.getHours()
  return hour >= 16 && period === '15-17'
}

export const generateWhatsAppReport = (report: any, projects: any[]) => {
  const emoji = {
    location: report.location === 'Al-Wustho' ? '🏢' : report.location === 'WFA' ? '🏠' : '🏗️',
    time: '🕒',
    person: '👨‍💻',
    project: '📌',
    issue: '⚠️',
    plan: '📋'
  }

  let text = `${emoji.person} Progress Report\n`
  text += `${emoji.time} Periode: ${report.period}\n`
  text += `${emoji.location} Lokasi: ${report.location}\n\n`

  projects.forEach((project, index) => {
    text += `${emoji.project} Project ${index + 1}: ${project.project_name}\n`
    text += `Progress: ${project.progress}\n`
    if (project.issues) {
      text += `${emoji.issue} Kendala: ${project.issues}\n`
    }
    text += '\n'
  })

  text += `${emoji.plan} Rencana Selanjutnya:\n${report.future_plan}`

  return text
}

export const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
  const imageCompression = (await import('browser-image-compression')).default
  
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }
  
  return await imageCompression(file, options)
}

export const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export const getFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }
  return null
}

export const removeFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
}