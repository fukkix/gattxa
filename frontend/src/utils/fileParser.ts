import * as XLSX from 'xlsx'
import mammoth from 'mammoth'

export interface ParsedData {
  headers: string[]
  rows: any[][]
  sheetName?: string
}

// 解析 Excel 文件
export const parseExcel = async (file: File): Promise<ParsedData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })

        const sheets: ParsedData[] = []

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length > 0) {
            const headers = jsonData[0] as string[]
            const rows = jsonData.slice(1) as any[][]

            sheets.push({
              sheetName,
              headers,
              rows: rows.filter(row => row.some(cell => cell !== undefined && cell !== '')),
            })
          }
        })

        resolve(sheets)
      } catch (error) {
        reject(new Error(`Excel 解析失败: ${error}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsBinaryString(file)
  })
}

// 解析 Word 文件
export const parseWord = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const result = await mammoth.extractRawText({ arrayBuffer })

        // 简单的表格提取（基于换行和制表符）
        const lines = result.value.split('\n').filter(line => line.trim())
        const rows = lines.map(line => line.split('\t'))

        if (rows.length > 0) {
          resolve({
            headers: rows[0],
            rows: rows.slice(1),
          })
        } else {
          reject(new Error('Word 文档中未找到表格数据'))
        }
      } catch (error) {
        reject(new Error(`Word 解析失败: ${error}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 解析 CSV 文件
export const parseCSV = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())

        const rows = lines.map(line => {
          // 简单的 CSV 解析（不处理引号内的逗号）
          return line.split(',').map(cell => cell.trim())
        })

        if (rows.length > 0) {
          resolve({
            headers: rows[0],
            rows: rows.slice(1),
          })
        } else {
          reject(new Error('CSV 文件为空'))
        }
      } catch (error) {
        reject(new Error(`CSV 解析失败: ${error}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// 统一的文件解析入口
export const parseFile = async (file: File): Promise<ParsedData[]> => {
  const ext = file.name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'xlsx':
    case 'xls':
      return parseExcel(file)
    case 'docx':
      const wordData = await parseWord(file)
      return [wordData]
    case 'csv':
      const csvData = await parseCSV(file)
      return [csvData]
    default:
      throw new Error(`不支持的文件类型: ${ext}`)
  }
}

// 将解析后的数据转换为文本格式（用于发送给 AI）
export const convertToText = (data: ParsedData[]): string => {
  let text = ''

  data.forEach((sheet, index) => {
    if (sheet.sheetName) {
      text += `\n## Sheet: ${sheet.sheetName}\n\n`
    } else if (data.length > 1) {
      text += `\n## 数据表 ${index + 1}\n\n`
    }

    // 表头
    text += sheet.headers.join('\t') + '\n'

    // 数据行
    sheet.rows.forEach(row => {
      text += row.join('\t') + '\n'
    })
  })

  return text
}
