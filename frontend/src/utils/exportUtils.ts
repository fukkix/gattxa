import { Task } from '../types'
import { jsPDF } from 'jspdf'
import dayjs from 'dayjs'

// 导出为 PNG
export async function exportToPNG(canvasElement: HTMLCanvasElement, filename: string = 'gantt-chart.png') {
  try {
    // 创建高分辨率 canvas（2x）
    const scale = 2
    const tempCanvas = document.createElement('canvas')
    const ctx = tempCanvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('无法创建 canvas 上下文')
    }

    tempCanvas.width = canvasElement.width * scale
    tempCanvas.height = canvasElement.height * scale
    
    // 绘制白色背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // 缩放并绘制原始 canvas
    ctx.scale(scale, scale)
    ctx.drawImage(canvasElement, 0, 0)

    // 转换为 blob 并下载
    tempCanvas.toBlob(blob => {
      if (!blob) {
        throw new Error('无法生成图片')
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    console.error('导出 PNG 失败:', error)
    throw error
  }
}

// 导出为 CSV
export function exportToCSV(tasks: Task[], filename: string = 'tasks.csv') {
  try {
    // CSV 表头
    const headers = ['任务名称', '阶段', '负责方', '开始日期', '结束日期', '是否里程碑', '说明']
    
    // CSV 数据行
    const rows = tasks.map(task => [
      task.name,
      task.phase || '',
      task.assignee || '',
      task.startDate,
      task.endDate,
      task.isMilestone ? '是' : '否',
      task.description || '',
    ])

    // 组合 CSV 内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // 添加 BOM 以支持中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出 CSV 失败:', error)
    throw error
  }
}

// 导出为 JSON
export function exportToJSON(
  projectName: string,
  tasks: Task[],
  filename: string = 'project.json'
) {
  try {
    const data = {
      projectName,
      exportDate: new Date().toISOString(),
      tasks: tasks.map(task => ({
        name: task.name,
        phase: task.phase,
        assignee: task.assignee,
        startDate: task.startDate,
        endDate: task.endDate,
        isMilestone: task.isMilestone,
        description: task.description,
        dependencies: task.dependencies,
      })),
    }

    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出 JSON 失败:', error)
    throw error
  }
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    throw error
  }
}

// 导出为 PDF
export async function exportToPDF(
  projectName: string,
  tasks: Task[],
  canvasElement: HTMLCanvasElement,
  filename: string = 'gantt-chart.pdf'
) {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // 添加标题
    pdf.setFontSize(20)
    pdf.text(projectName, 15, 15)
    
    // 添加导出日期
    pdf.setFontSize(10)
    pdf.text(`导出日期: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 15, 25)

    // 添加甘特图图片
    const imgData = canvasElement.toDataURL('image/png')
    const imgWidth = 270 // A4 横向宽度 - 边距
    const imgHeight = (canvasElement.height * imgWidth) / canvasElement.width
    
    // 如果图片太高，分页显示
    let yPosition = 35
    if (imgHeight > 160) {
      // 分多页显示
      const pageHeight = 160
      let remainingHeight = imgHeight
      let sourceY = 0
      
      while (remainingHeight > 0) {
        const currentHeight = Math.min(pageHeight, remainingHeight)
        const sourceHeight = (currentHeight / imgHeight) * canvasElement.height
        
        // 创建临时 canvas 截取部分图片
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvasElement.width
        tempCanvas.height = sourceHeight
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          tempCtx.drawImage(
            canvasElement,
            0, sourceY,
            canvasElement.width, sourceHeight,
            0, 0,
            canvasElement.width, sourceHeight
          )
          
          const partialImgData = tempCanvas.toDataURL('image/png')
          pdf.addImage(partialImgData, 'PNG', 15, yPosition, imgWidth, currentHeight)
        }
        
        remainingHeight -= currentHeight
        sourceY += sourceHeight
        
        if (remainingHeight > 0) {
          pdf.addPage()
          yPosition = 15
        }
      }
    } else {
      pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight)
    }

    // 添加任务列表页
    pdf.addPage()
    pdf.setFontSize(16)
    pdf.text('任务列表', 15, 15)
    
    // 表格表头
    pdf.setFontSize(10)
    let y = 25
    const lineHeight = 7
    const colWidths = [60, 30, 30, 30, 30, 30]
    const headers = ['任务名称', '阶段', '负责人', '开始日期', '结束日期', '里程碑']
    
    // 绘制表头
    pdf.setFillColor(240, 240, 240)
    pdf.rect(15, y - 5, colWidths.reduce((a, b) => a + b, 0), lineHeight, 'F')
    
    let x = 15
    headers.forEach((header, i) => {
      pdf.text(header, x + 2, y)
      x += colWidths[i]
    })
    
    y += lineHeight

    // 绘制任务行
    tasks.forEach((task, index) => {
      // 检查是否需要换页
      if (y > 190) {
        pdf.addPage()
        y = 15
        
        // 重新绘制表头
        pdf.setFillColor(240, 240, 240)
        pdf.rect(15, y - 5, colWidths.reduce((a, b) => a + b, 0), lineHeight, 'F')
        
        x = 15
        headers.forEach((header, i) => {
          pdf.text(header, x + 2, y)
          x += colWidths[i]
        })
        
        y += lineHeight
      }
      
      // 交替行背景
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(15, y - 5, colWidths.reduce((a, b) => a + b, 0), lineHeight, 'F')
      }
      
      // 绘制单元格内容
      const row = [
        task.name.length > 30 ? task.name.substring(0, 30) + '...' : task.name,
        task.phase || '-',
        task.assignee || '-',
        task.startDate,
        task.endDate || '进行中',
        task.isMilestone ? '是' : '否'
      ]
      
      x = 15
      row.forEach((cell, i) => {
        pdf.text(cell, x + 2, y)
        x += colWidths[i]
      })
      
      y += lineHeight
    })

    // 添加页脚
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.text(
        `第 ${i} 页，共 ${pageCount} 页`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    // 保存 PDF
    pdf.save(filename)
  } catch (error) {
    console.error('导出 PDF 失败:', error)
    throw error
  }
}
