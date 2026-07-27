import Fastify from 'fastify'
import cors from '@fastify/cors'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { CaseStatus, DemoCase, FormulaItem, Role } from '@lavida/shared'

const here = dirname(fileURLToPath(import.meta.url))
// Keep the new full-feature demo isolated from any legacy starter database.
const dbFile = join(here, '..', 'lavida-full-demo.db')
const formula: FormulaItem[] = [
  { skuCode: 'SKU-OMEGA-07', name: 'Omega-3', ratio: 24, dosage: '2 粒/日', rationale: '睡眠与精力支持', machineParams: '温度 22℃，转速 175', valid: true, stockAvailable: true },
  { skuCode: 'SKU-Q10-08', name: '辅酶 Q10', ratio: 22, dosage: '1 粒/日', rationale: '能量代谢支持', machineParams: '温度 20℃，转速 155', valid: true, stockAvailable: true },
  { skuCode: 'SKU-MG-09', name: '镁', ratio: 18, dosage: '1 粒/日', rationale: '睡眠放松支持', machineParams: '温度 18℃，转速 140', valid: true, stockAvailable: true },
  { skuCode: 'SKU-B12-10', name: '维生素 B12', ratio: 18, dosage: '1 粒/日', rationale: '营养支持', machineParams: '温度 19℃，转速 138', valid: true, stockAvailable: true },
  { skuCode: 'SKU-ZINC-11', name: '锌', ratio: 18, dosage: '1 粒/日', rationale: '修复支持', machineParams: '温度 19℃，转速 132', valid: true, stockAvailable: true },
]

function init(db: Database.Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT, role TEXT, action TEXT, object_id TEXT, detail TEXT);
    CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, type TEXT, read INTEGER DEFAULT 0, at TEXT);`)
  const count = db.prepare('SELECT count(*) as count FROM cases').get() as { count: number }
  if (!count.count) {
    const seed: DemoCase[] = [
      { id: 'C-20260725-001', customer: '林若溪', phone: '138****6812', store: '上海静安体验店', franchisee: '华东优选', status: '待审核', risk: '建议改善', planId: 'PLAN202607250001', planVersion: 'FV-20260725-A', createdAt: '2026-07-25 09:30', reportStatus: '已解析，待人工确认', paid: false, qualityReleased: false, formula, timeline: [{ time: '09:30', title: '顾客提交测评', description: '题库 V1.0、检查报告 2 份' }, { time: '09:35', title: '智能分析完成', description: '生成方案草稿，进入专业审核' }] },
      { id: 'C-20260724-018', customer: '周以宁', phone: '139****0318', store: '杭州西湖体验店', franchisee: '华东优选', status: '待质检', risk: '常规关注', planId: 'PLAN202607240018', planVersion: 'FV-20260724-B', createdAt: '2026-07-24 13:20', reportStatus: '已确认', paid: true, qualityReleased: false, formula, timeline: [{ time: '13:20', title: '订单已支付', description: '已锁定库存' }, { time: '14:10', title: '生产完成', description: '批次 BATCH-20260724-07，待质检' }] },
      { id: 'C-20260723-006', customer: '谢知夏', phone: '136****0220', store: '北京国贸体验店', franchisee: '北方优选', status: '运输中', risk: '建议改善', planId: 'PLAN202607230006', planVersion: 'FV-20260723-A', createdAt: '2026-07-23 10:50', reportStatus: '已确认', paid: true, qualityReleased: true, formula, timeline: [{ time: '10:50', title: '方案审核通过', description: '专业审核人 王医生' }, { time: '16:20', title: '已发货', description: '顺丰 SF1234567890' }] },
    ]
    const insert = db.prepare('INSERT INTO cases (id,payload) VALUES (?,?)')
    for (const item of seed) insert.run(item.id, JSON.stringify(item))
    db.prepare('INSERT INTO messages (title,body,type,at) VALUES (?,?,?,?)').run('方案待审核', '林若溪的方案需要专业审核', '审核待办', '2026-07-25 09:35')
  }
}

function getCases(db: Database.Database): DemoCase[] { return (db.prepare('SELECT payload FROM cases').all() as Array<{ payload: string }>).map(x => JSON.parse(x.payload)) }
function saveCase(db: Database.Database, item: DemoCase, role: string, action: string) {
  db.prepare('UPDATE cases SET payload=? WHERE id=?').run(JSON.stringify(item), item.id)
  db.prepare('INSERT INTO audit_logs (at,role,action,object_id,detail) VALUES (?,?,?,?,?)').run(new Date().toISOString(), role, action, item.id, item.status)
}
function roleOf(req: { headers: Record<string, unknown> }): Role { return (String(req.headers.authorization ?? '').replace('Bearer ', '') || 'customer') as Role }

export function buildServer() {
  const app = Fastify({ logger: false })
  // Tests use an isolated database; the local demo persists to the workspace SQLite file.
  const db = new Database(process.env.NODE_ENV === 'test' || process.argv.includes('--test') ? ':memory:' : dbFile); init(db)
  app.register(cors, { origin: true })
  app.get('/api/health', async () => ({ data: { ok: true, now: new Date().toISOString() } }))
  app.post('/api/auth/login', async (req) => ({ data: { token: (req.body as any)?.role || 'customer' } }))
  app.post('/api/reports/generate', async (req, reply) => {
    const body = (req.body || {}) as any
    if (!body.customerId || !body.questionnaireVersion) return reply.code(400).send({ message: '顾客信息和题库版本不能为空' })
    const id = `RPT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(Date.now()).slice(-4)}`
    db.prepare('INSERT INTO audit_logs (at,role,action,object_id,detail) VALUES (?,?,?,?,?)').run(new Date().toISOString(), roleOf(req), '生成测评报告', id, `题库 ${body.questionnaireVersion}`)
    return { data: { id, status: '已完成', generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }) } }
  })
  app.get('/api/cases', async (req) => {
    const role = roleOf(req); const items = getCases(db)
    return { data: role === 'customer' ? items.filter(x => x.customer === '林若溪') : role === 'franchisee' ? items.filter(x => x.franchisee === '华东优选') : items }
  })
  app.get('/api/cases/:id', async (req, reply) => { const item = getCases(db).find(x => x.id === (req.params as any).id); return item ? { data: item } : reply.code(404).send({ message: '业务单不存在' }) })
  app.post('/api/cases/:id/submit', async (req, reply) => {
    const item = getCases(db).find(x => x.id === (req.params as any).id); const body = (req.body || {}) as any
    if (!item) return reply.code(404).send({ message: '业务单不存在' })
    if (!body.complete) return reply.code(400).send({ message: '请完成所有必答题与报告上传' })
    item.status = '待审核'; item.timeline.push({ time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), title: '测评已提交', description: '等待专业审核' }); saveCase(db, item, roleOf(req), '提交测评'); return { data: item }
  })
  app.post('/api/cases/:id/review', async (req, reply) => {
    const item = getCases(db).find(x => x.id === (req.params as any).id); const role = roleOf(req); const body = req.body as any
    if (!item) return reply.code(404).send({ message: '业务单不存在' }); if (!['reviewer', 'hq'].includes(role)) return reply.code(403).send({ message: '无方案审核权限' })
    if (item.status !== '待审核') return reply.code(400).send({ message: '仅待审核方案可处理' })
    item.status = body?.approved ? '已生效' : '待补资料'; item.timeline.push({ time: '10:20', title: body?.approved ? '方案审核通过' : '审核退回补充', description: body?.comment || '专业审核处理' }); saveCase(db, item, role, '审核方案'); return { data: item }
  })
  app.post('/api/cases/:id/pay', async (req, reply) => {
    const item = getCases(db).find(x => x.id === (req.params as any).id); if (!item) return reply.code(404).send({ message: '业务单不存在' })
    if (item.status !== '已生效') return reply.code(400).send({ message: '未审核通过方案不可支付' })
    item.paid = true; item.status = '待生产'; item.timeline.push({ time: '10:30', title: '支付成功', description: '本地支付回调已确认，等待生产' }); saveCase(db, item, roleOf(req), '订单支付'); return { data: item }
  })
  app.post('/api/cases/:id/fulfill', async (req, reply) => {
    const item = getCases(db).find(x => x.id === (req.params as any).id); const body = req.body as any; if (!item) return reply.code(404).send({ message: '业务单不存在' })
    if (body?.action === 'ship' && !item.qualityReleased) return reply.code(400).send({ message: '质检放行前不可发货' })
    const map: Record<string, CaseStatus> = { produce: '生产中', quality: '待发货', ship: '运输中', sign: '已签收' }
    if (!map[body?.action]) return reply.code(400).send({ message: '不支持的履约动作' }); if (body.action === 'quality') item.qualityReleased = true
    item.status = map[body.action]; item.timeline.push({ time: '11:00', title: `履约：${body.action}`, description: '本地演示流程推进' }); saveCase(db, item, roleOf(req), '履约处理'); return { data: item }
  })
  app.get('/api/dashboard', async () => ({ data: { cards: [{ label: '待审核方案', value: getCases(db).filter(x => x.status === '待审核').length }, { label: '待生产订单', value: getCases(db).filter(x => x.status === '待生产').length }, { label: '待质检批次', value: getCases(db).filter(x => x.status === '待质检').length }, { label: '风险预警', value: 3 }], messages: db.prepare('SELECT * FROM messages ORDER BY id DESC').all() } }))
  app.get('/api/resources/:module', async (req) => ({ data: makeResources((req.params as any).module) }))
  app.get('/api/audit-logs', async () => ({ data: db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all() }))
  return app
}

function makeResources(module: string) {
  const samples: Record<string, string[]> = {
    sku: ['SKU-NMN-01|NMN 单体|抗衰核心|60 粒/瓶|启用', 'SKU-OMEGA-07|Omega-3|睡眠修复|90 粒/瓶|启用'],
    inventory: ['WH-SH-01|Omega-3|56|安全库存 30|正常', 'WH-SH-02|辅酶 Q10|42|安全库存 25|正常'],
    franchisee: ['FR-EC-01|华东优选|上海静安体验店|启用', 'FR-NC-02|北方优选|北京国贸体验店|启用'],
    content: ['ART-001|睡眠管理的日常建议|健康资讯|已发布', 'ART-002|抗氧化饮食提示|健康资讯|待审核'],
    system: ['CFG-UPLOAD|报告上传限制|20MB|启用', 'CFG-SLA|审核 SLA|24 小时|启用'],
  }
  return (samples[module] || ['REC-001|演示记录 A|处理中|2026-07-25', 'REC-002|演示记录 B|已完成|2026-07-24']).map(row => row.split('|'))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildServer().listen({ port: 3001, host: '127.0.0.1' })
