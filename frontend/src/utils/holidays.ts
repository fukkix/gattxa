import dayjs, { Dayjs } from 'dayjs'

// 中国大陆法定节假日配置（2026年）
// 注意：实际使用时应该从 API 获取或定期更新
export const CHINA_HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': '元旦',
  '2026-01-02': '元旦',
  '2026-01-03': '元旦',
  '2026-02-17': '春节',
  '2026-02-18': '春节',
  '2026-02-19': '春节',
  '2026-02-20': '春节',
  '2026-02-21': '春节',
  '2026-02-22': '春节',
  '2026-02-23': '春节',
  '2026-04-04': '清明节',
  '2026-04-05': '清明节',
  '2026-04-06': '清明节',
  '2026-05-01': '劳动节',
  '2026-05-02': '劳动节',
  '2026-05-03': '劳动节',
  '2026-05-04': '劳动节',
  '2026-05-05': '劳动节',
  '2026-06-25': '端午节',
  '2026-06-26': '端午节',
  '2026-06-27': '端午节',
  '2026-10-01': '国庆节',
  '2026-10-02': '国庆节',
  '2026-10-03': '国庆节',
  '2026-10-04': '国庆节',
  '2026-10-05': '国庆节',
  '2026-10-06': '国庆节',
  '2026-10-07': '国庆节',
  '2026-10-08': '国庆节',
}

// 调休工作日（需要上班的周末）
export const CHINA_WORKDAYS_2026: string[] = [
  '2026-02-15', // 春节调休
  '2026-02-28', // 春节调休
  '2026-09-27', // 国庆调休
  '2026-10-10', // 国庆调休
]

/**
 * 判断是否为中国法定节假日
 */
export function isChinaHoliday(date: Dayjs): boolean {
  const dateStr = date.format('YYYY-MM-DD')
  return dateStr in CHINA_HOLIDAYS_2026
}

/**
 * 获取节假日名称
 */
export function getHolidayName(date: Dayjs): string | null {
  const dateStr = date.format('YYYY-MM-DD')
  return CHINA_HOLIDAYS_2026[dateStr] || null
}

/**
 * 判断是否为调休工作日
 */
export function isWorkday(date: Dayjs): boolean {
  const dateStr = date.format('YYYY-MM-DD')
  return CHINA_WORKDAYS_2026.includes(dateStr)
}

/**
 * 判断是否为休息日（周末或节假日，但不包括调休工作日）
 */
export function isRestDay(date: Dayjs): boolean {
  // 如果是调休工作日，不算休息日
  if (isWorkday(date)) {
    return false
  }
  
  // 如果是节假日，算休息日
  if (isChinaHoliday(date)) {
    return true
  }
  
  // 如果是周末，算休息日
  const day = date.day()
  return day === 0 || day === 6
}

/**
 * 获取日期显示信息
 */
export function getDateInfo(date: Dayjs): {
  isHoliday: boolean
  isWeekend: boolean
  isWorkday: boolean
  isRestDay: boolean
  holidayName: string | null
} {
  const isHoliday = isChinaHoliday(date)
  const isWeekendDay = date.day() === 0 || date.day() === 6
  const isWorkdayAdjusted = isWorkday(date)
  
  return {
    isHoliday,
    isWeekend: isWeekendDay,
    isWorkday: isWorkdayAdjusted,
    isRestDay: isRestDay(date),
    holidayName: getHolidayName(date),
  }
}
