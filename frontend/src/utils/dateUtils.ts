import dayjs from 'dayjs'

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const getDaysBetween = (start: string | Date, end: string | Date): number => {
  return dayjs(end).diff(dayjs(start), 'day')
}

export const addDays = (date: string | Date, days: number): string => {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD')
}

export const isWeekend = (date: string | Date): boolean => {
  const day = dayjs(date).day()
  return day === 0 || day === 6
}

export const getDateRange = (start: string | Date, end: string | Date): Date[] => {
  const dates: Date[] = []
  let current = dayjs(start)
  const endDate = dayjs(end)

  while (current.isBefore(endDate) || current.isSame(endDate)) {
    dates.push(current.toDate())
    current = current.add(1, 'day')
  }

  return dates
}

export const getWeekNumber = (date: string | Date): number => {
  return dayjs(date).week()
}

export const getMonthName = (date: string | Date): string => {
  return dayjs(date).format('YYYY年MM月')
}

export const isToday = (date: string | Date): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}
