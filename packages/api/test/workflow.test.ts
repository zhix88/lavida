import test from 'node:test'
import assert from 'node:assert/strict'
import { buildServer } from '../src/server.ts'

test('未审核方案不能支付，质检前不能发货', async () => {
  const app = buildServer(); await app.ready()
  const noPlan = await app.inject({ method: 'POST', url: '/api/cases/C-20260725-001/pay', headers: { authorization: 'Bearer customer' } })
  assert.equal(noPlan.statusCode, 400)
  const noQuality = await app.inject({ method: 'POST', url: '/api/cases/C-20260724-018/fulfill', headers: { authorization: 'Bearer hq' }, payload: { action: 'ship' } })
  assert.equal(noQuality.statusCode, 400)
  await app.close()
})
