import * as XLSX from 'xlsx'

export interface ExportOptions {
  filename: string
  sheetName?: string
}

export interface TransactionExport {
  id: string
  date: string
  type: string
  amount: number
  fee: number
  status: string
  txHash: string
  driver: string
  requestId?: string
}

export interface RequestExport {
  id: string
  requestDate: string
  driver: string
  fuelType: string
  liters: number
  requestedAmount: number
  approvedAmount: number | null
  status: string
  location: string
  reason: string
}

export interface DriverExport {
  id: string
  name: string
  email: string
  stellarWallet: string
  creditLimit: number
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
}

export interface MonthlyReportExport {
  period: string
  company: string
  totalFunds: number
  totalReleased: number
  totalFees: number
  numTransactions: number
  numRequests: number
  numApprovedRequests: number
  numRejectedRequests: number
  activeDrivers: number
}

export function exportTransactions(data: TransactionExport[], options: ExportOptions): Buffer {
  const workbook = XLSX.utils.book_new()
  
  const wsData = [
    ['ID', 'Date', 'Type', 'Amount (USDC)', 'Fee (USDC)', 'Status', 'TX Hash', 'Driver', 'Request ID'],
    ...data.map(t => [
      t.id,
      t.date,
      t.type,
      t.amount,
      t.fee,
      t.status,
      t.txHash || '-',
      t.driver,
      t.requestId || '-',
    ])
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(wsData)
  
  const totalAmount = data.reduce((sum, t) => sum + t.amount, 0)
  const totalFee = data.reduce((sum, t) => sum + t.fee, 0)
  
  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['SUMMARY'],
    ['Total Transactions', data.length],
    ['Total Amount', totalAmount],
    ['Total Fee', totalFee],
    ['Net Amount', totalAmount - totalFee],
  ], { origin: -1 })

  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Transactions')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

export function exportRequests(data: RequestExport[], options: ExportOptions): Buffer {
  const workbook = XLSX.utils.book_new()
  
  const wsData = [
    ['ID', 'Request Date', 'Driver', 'Fuel Type', 'Liters', 'Requested Amount', 'Approved Amount', 'Status', 'Location', 'Reason'],
    ...data.map(p => [
      p.id,
      p.requestDate,
      p.driver,
      p.fuelType,
      p.liters,
      p.requestedAmount,
      p.approvedAmount || '-',
      p.status,
      p.location,
      p.reason || '-',
    ])
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(wsData)
  
  const totalRequested = data.reduce((sum, p) => sum + p.requestedAmount, 0)
  const totalApproved = data.reduce((sum, p) => sum + (p.approvedAmount || 0), 0)
  const pending = data.filter(p => p.status === 'PENDING').length
  const approved = data.filter(p => p.status === 'APPROVED' || p.status === 'COMPLETED').length
  
  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['SUMMARY'],
    ['Total Requests', data.length],
    ['Pending', pending],
    ['Approved / Completed', approved],
    ['Total Requested', totalRequested],
    ['Total Approved', totalApproved],
  ], { origin: -1 })

  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Requests')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

export function exportDrivers(data: DriverExport[], options: ExportOptions): Buffer {
  const workbook = XLSX.utils.book_new()
  
  const wsData = [
    ['ID', 'Name', 'Email', 'Stellar Wallet', 'Credit Limit', 'Total Requests', 'Pending', 'Approved', 'Rejected'],
    ...data.map(c => [
      c.id,
      c.name,
      c.email,
      c.stellarWallet,
      c.creditLimit,
      c.totalRequests,
      c.pendingRequests,
      c.approvedRequests,
      c.rejectedRequests,
    ])
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(wsData)
  
  const totalCreditLimits = data.reduce((sum, c) => sum + c.creditLimit, 0)
  
  XLSX.utils.sheet_add_aoa(worksheet, [
    [],
    ['SUMMARY'],
    ['Total Drivers', data.length],
    ['Total Credit Limit', totalCreditLimits],
  ], { origin: -1 })

  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Drivers')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

export function exportMonthlyReport(data: MonthlyReportExport, transactions: TransactionExport[], requests: RequestExport[]): Buffer {
  const workbook = XLSX.utils.book_new()
  
  const summaryData = [
    ['MONTHLY REPORT - TANKO'],
    ['Period', data.period],
    ['Company', data.company],
    [],
    ['FINANCIAL SUMMARY'],
    ['Total Funds in Escrow', data.totalFunds],
    ['Total Released', data.totalReleased],
    ['Total Fees', data.totalFees],
    [],
    ['COUNTERS'],
    ['Transactions', data.numTransactions],
    ['Total Requests', data.numRequests],
    ['Approved Requests', data.numApprovedRequests],
    ['Rejected Requests', data.numRejectedRequests],
    ['Active Drivers', data.activeDrivers],
  ]
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary')
  
  if (transactions.length > 0) {
    const txData = [
      ['ID', 'Date', 'Type', 'Amount', 'Fee', 'Status', 'TX Hash', 'Driver'],
      ...transactions.map(t => [
        t.id, t.date, t.type, t.amount, t.fee, t.status, t.txHash || '-', t.driver
      ])
    ]
    const txWs = XLSX.utils.aoa_to_sheet(txData)
    XLSX.utils.book_append_sheet(workbook, txWs, 'Transactions')
  }
  
  if (requests.length > 0) {
    const reqData = [
      ['ID', 'Date', 'Driver', 'Type', 'Liters', 'Amount', 'Status', 'Location'],
      ...requests.map(p => [
        p.id, p.requestDate, p.driver, p.fuelType, p.liters, p.requestedAmount, p.status, p.location
      ])
    ]
    const reqWs = XLSX.utils.aoa_to_sheet(reqData)
    XLSX.utils.book_append_sheet(workbook, reqWs, 'Requests')
  }
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer
}

export function generateFilename(prefix: string, extension: string = 'xlsx'): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${prefix}_${timestamp}.${extension}`
}

export default {
  exportTransactions,
  exportRequests,
  exportDrivers,
  exportMonthlyReport,
  generateFilename,
}
