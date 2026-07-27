export type Role = 'customer' | 'franchisee' | 'hq' | 'reviewer' | 'finance' | 'production' | 'admin'
export type CaseStatus = '待补资料' | '待审核' | '已生效' | '待支付' | '待生产' | '生产中' | '待质检' | '待发货' | '运输中' | '已签收' | '复测中' | '已完成'

export interface FormulaItem {
  skuCode: string; name: string; ratio: number; dosage: string; rationale: string
  machineParams: string; valid: boolean; stockAvailable: boolean
}

export interface DemoCase {
  id: string; customer: string; phone: string; store: string; franchisee: string
  status: CaseStatus; risk: '常规关注' | '建议改善' | '需专业复核'; planId: string
  planVersion: string; createdAt: string; reportStatus: string; paid: boolean; qualityReleased: boolean
  formula: FormulaItem[]; timeline: Array<{ time: string; title: string; description: string }>
}

export interface ApiResponse<T> { data: T; message?: string }

export const roles: Array<{ key: Role; label: string }> = [
  { key: 'hq', label: '总部运营' }, { key: 'reviewer', label: '专业审核人' },
  { key: 'finance', label: '财务专员' }, { key: 'production', label: '生产履约' },
  { key: 'franchisee', label: '加盟商店员' }, { key: 'admin', label: '平台管理员' },
]

export const workflow: CaseStatus[] = ['待补资料', '待审核', '已生效', '待支付', '待生产', '生产中', '待质检', '待发货', '运输中', '已签收', '复测中', '已完成']
