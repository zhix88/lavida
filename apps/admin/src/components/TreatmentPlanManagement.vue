<script setup lang="ts">
import { computed, ref } from 'vue'
import TreatmentPlanDetail from './TreatmentPlanDetail.vue'

type PlanStatus = '待审核' | '已审核' | '已生效' | '已退回'
interface Plan { id:string; customerName:string; name:string; ingredientCount:number; assessedAt:string; modelVersion:string; status:PlanStatus; generatedAt:string; version:string; primaryNeed:string; sleepQuality:string; energyLevel:string; exerciseFrequency:string; dietStructure:string; advisorSummary:string }
interface OrderDraft { orderNo:string; planId:string; planName:string; planVersion:string; customerName:string; ingredients:number; amount:number; storeName:string; receiver:string; phone:string; address:string; status:string; createdAt:string }

const plans = ref<Plan[]>([
  { id:'PLAN-20260725-001', customerName:'林若溪', name:'睡眠与精力调理方案', ingredientCount:2, assessedAt:'2026-07-25 09:30', modelVersion:'LAVIDA-AI V2.1', status:'待审核', generatedAt:'2026-07-25 09:38', version:'V1.0', primaryNeed:'改善睡眠', sleepQuality:'一般', energyLevel:'偏低', exerciseFrequency:'每周 1-2 次', dietStructure:'外食偏多', advisorSummary:'已完成初步访谈并上传检查报告。' },
  { id:'PLAN-20260724-018', customerName:'周以宁', name:'日常能量支持方案', ingredientCount:3, assessedAt:'2026-07-24 13:20', modelVersion:'LAVIDA-AI V2.1', status:'已审核', generatedAt:'2026-07-24 13:28', version:'V1.1', primaryNeed:'能量改善', sleepQuality:'良好', energyLevel:'一般', exerciseFrequency:'每周 3 次', dietStructure:'均衡', advisorSummary:'营养建议已确认。' },
  { id:'PLAN-20260723-006', customerName:'谢知夏', name:'复测营养支持方案', ingredientCount:4, assessedAt:'2026-07-23 10:50', modelVersion:'LAVIDA-AI V2.0', status:'已生效', generatedAt:'2026-07-23 11:05', version:'V2.0', primaryNeed:'营养支持', sleepQuality:'较差', energyLevel:'一般', exerciseFrequency:'很少运动', dietStructure:'不规律', advisorSummary:'顾客已确认服务周期。' },
])
const keyword=ref(''); const assessedDate=ref(''); const model=ref(''); const status=ref(''); const generatedDate=ref(''); const current=ref<Plan|null>(null); const notice=ref('')
const versionsVisible=ref(false); const reviewVisible=ref(false); const reviewTarget=ref<Plan|null>(null); const reviewDecision=ref<'通过'|'拒绝'>('通过'); const reviewComment=ref('专业审核通过，方案可进入订单确认。')
const orderVisible=ref(false); const orderDraft=ref<OrderDraft|null>(null); const generatedOrders=ref<OrderDraft[]>([])
const filtered = computed(() => plans.value.filter(item => (!keyword.value || `${item.id}${item.customerName}${item.name}`.includes(keyword.value)) && (!assessedDate.value || item.assessedAt.startsWith(assessedDate.value)) && (!model.value || item.modelVersion===model.value) && (!status.value || item.status===status.value) && (!generatedDate.value || item.generatedAt.startsWith(generatedDate.value))))

function detail(item:Plan){ current.value=item }
function openReview(item:Plan){ reviewTarget.value=item; reviewDecision.value='通过'; reviewComment.value='专业审核通过，方案可进入订单确认。'; reviewVisible.value=true }
function submitReview(){
  if(!reviewTarget.value) return
  if(!reviewComment.value.trim()){ notice.value='请填写审核意见'; return }
  reviewTarget.value.status=reviewDecision.value==='通过' ? '已审核' : '已退回'
  notice.value=`方案 ${reviewTarget.value.id} 已${reviewDecision.value==='通过'?'审核通过':'拒绝并退回'}`
  reviewVisible.value=false; reviewTarget.value=null
}
function adjust(item:Plan){ current.value=item; notice.value='已进入方案详情，可调整配方后重新提交审核' }
function regenerate(item:Plan){ const num=Number(item.version.replace('V','')) || 1; item.version=`V${(num+0.1).toFixed(1)}`; item.status='待审核'; item.generatedAt=new Date().toLocaleString('zh-CN',{hour12:false}); notice.value=`方案已重新生成，当前版本 ${item.version}` }
function createOrder(item:Plan){
  if(item.status!=='已审核'){ notice.value='仅审核通过的方案可生成订单'; return }
  const old=generatedOrders.value.find(order=>order.planId===item.id && order.planVersion===item.version)
  orderDraft.value=old || { orderNo:`ORD-${item.id.replace('PLAN-','')}`, planId:item.id, planName:item.name, planVersion:item.version, customerName:item.customerName, ingredients:item.ingredientCount, amount:item.ingredientCount*398, storeName:'上海静安体验店', receiver:item.customerName, phone:'138****6812', address:'上海市静安区南京西路 1688 号', status:'待支付', createdAt:new Date().toLocaleString('zh-CN',{hour12:false}) }
  orderVisible.value=true
}
function confirmOrder(){
  if(!orderDraft.value) return
  if(!orderDraft.value.receiver.trim() || !orderDraft.value.phone.trim() || !orderDraft.value.address.trim()){ notice.value='请补全收货人、联系电话和收货地址'; return }
  if(!generatedOrders.value.some(order=>order.orderNo===orderDraft.value?.orderNo)) generatedOrders.value.push({ ...orderDraft.value })
  notice.value=`订单 ${orderDraft.value.orderNo} 已生成，等待顾客支付`; orderVisible.value=false
}
function saved(message:string){ notice.value=message; current.value=null }
const reportForDetail = computed(() => current.value ? { id:current.value.id, customerName:current.value.customerName, questionnaireVersion:current.value.version, sleepQuality:current.value.sleepQuality, energyLevel:current.value.energyLevel, exerciseFrequency:current.value.exerciseFrequency, dietStructure:current.value.dietStructure, primaryNeed:current.value.primaryNeed, advisorSummary:current.value.advisorSummary } : null)
</script>

<template>
  <section v-if="!current" class="plan-management">
    <div v-if="notice" class="plan-notice" @click="notice=''">{{ notice }} ×</div>
    <div class="toolbar plan-toolbar"><input v-model="keyword" placeholder="查询方案编号、顾客姓名、方案名称"/><input v-model="assessedDate" type="date" title="测评时间"/><select v-model="model"><option value="">全部模型版本</option><option>LAVIDA-AI V2.1</option><option>LAVIDA-AI V2.0</option></select><select v-model="status"><option value="">全部方案状态</option><option>待审核</option><option>已审核</option><option>已生效</option><option>已退回</option></select><input v-model="generatedDate" type="date" title="生成方案时间"/></div>
    <section class="panel table-panel">
      <h3>治疗方案 <small>方案内容关联测评报告，审核通过后方可对顾客生效。</small></h3>
      <table><thead><tr><th>方案编号</th><th>顾客姓名</th><th>方案名称</th><th>成分数量</th><th>测评时间</th><th>模型版本</th><th>方案状态</th><th>生成方案时间</th><th>操作</th></tr></thead><tbody>
        <tr v-for="item in filtered" :key="item.id"><td>{{ item.id }}<br><small>{{ item.version }}</small></td><td><b>{{ item.customerName }}</b></td><td>{{ item.name }}</td><td>{{ item.ingredientCount }}</td><td>{{ item.assessedAt }}</td><td>{{ item.modelVersion }}</td><td><span :class="['tag', item.status==='待审核'?'待审核':item.status==='已审核'?'待质检':item.status==='已生效'?'已生效':'待补资料']">{{ item.status }}</span></td><td>{{ item.generatedAt }}</td><td class="actions"><button @click="detail(item)">详情</button><button v-if="item.status==='待审核'" class="link" @click="openReview(item)">审核</button><button v-else-if="item.status==='已审核'" class="link primary" @click="createOrder(item)">生成订单</button><button class="link" @click="adjust(item)">调整配方</button><button class="link" @click="versionsVisible=true">版本记录</button><button class="link" @click="regenerate(item)">重新生成</button></td></tr>
        <tr v-if="!filtered.length"><td colspan="9" class="empty">暂无符合条件的治疗方案</td></tr>
      </tbody></table>
    </section>
  </section>

  <section v-else>
    <div class="order-entry"><span>方案状态：{{ current.status }}</span><button v-if="current.status==='已审核'" class="primary" @click="createOrder(current)">生成订单</button></div>
    <TreatmentPlanDetail :report="reportForDetail" @back="current=null" @saved="saved"/>
  </section>

  <div v-if="reviewVisible" class="plan-modal-mask" @click.self="reviewVisible=false"><section class="review-dialog"><header><h2>方案审核确认</h2><button class="close" @click="reviewVisible=false">×</button></header><main><p>方案：<b>{{ reviewTarget?.name }}</b></p><label><input v-model="reviewDecision" type="radio" value="通过"/> 通过</label><label><input v-model="reviewDecision" type="radio" value="拒绝"/> 拒绝</label><textarea v-model="reviewComment" rows="5" :placeholder="reviewDecision==='通过'?'请输入审核意见':'请填写拒绝原因'"/></main><footer><button @click="reviewVisible=false">取消</button><button class="primary" @click="submitReview">确认{{ reviewDecision }}</button></footer></section></div>
  <div v-if="versionsVisible" class="plan-modal-mask" @click.self="versionsVisible=false"><section class="version-modal"><header><h2>方案版本记录</h2><button class="close" @click="versionsVisible=false">×</button></header><main><table><thead><tr><th>版本</th><th>生成时间</th><th>模型版本</th><th>状态</th><th>说明</th></tr></thead><tbody><tr><td>V1.0</td><td>2026-07-25 09:38</td><td>LAVIDA-AI V2.1</td><td>待审核</td><td>首次生成方案</td></tr><tr><td>V0.9</td><td>2026-07-25 09:35</td><td>LAVIDA-AI V2.1</td><td>已归档</td><td>模型建议草稿</td></tr></tbody></table></main><footer><button @click="versionsVisible=false">关闭</button></footer></section></div>
  <div v-if="orderVisible && orderDraft" class="plan-modal-mask" @click.self="orderVisible=false"><section class="order-dialog"><header><div><span>订单管理 / 订单详情</span><h2>生成订单</h2></div><button class="close" @click="orderVisible=false">×</button></header><main><section class="order-section"><h3>订单基本信息</h3><div class="order-grid"><p><span>订单编号</span><b>{{ orderDraft.orderNo }}</b></p><p><span>订单状态</span><b class="tag">{{ orderDraft.status }}</b></p><p><span>顾客姓名</span><b>{{ orderDraft.customerName }}</b></p><p><span>所属门店</span><b>{{ orderDraft.storeName }}</b></p><p><span>创建时间</span><b>{{ orderDraft.createdAt }}</b></p><p><span>关联方案</span><b>{{ orderDraft.planId }} · {{ orderDraft.planVersion }}</b></p></div></section><section class="order-section"><h3>订单商品快照</h3><table><thead><tr><th>方案名称</th><th>成分/产品数量</th><th>单价</th><th>应付金额</th></tr></thead><tbody><tr><td>{{ orderDraft.planName }}</td><td>{{ orderDraft.ingredients }}</td><td>¥398 / 项</td><td><b>¥{{ orderDraft.amount }}</b></td></tr></tbody></table></section><section class="order-section"><h3>收货信息</h3><div class="plan-grid"><label>收货人 <b>*</b><input v-model="orderDraft.receiver"/></label><label>联系电话 <b>*</b><input v-model="orderDraft.phone"/></label><label class="span-two">收货地址 <b>*</b><textarea v-model="orderDraft.address" rows="2"></textarea></label></div></section><section class="order-section note"><b>演示模拟</b>：订单生成后进入“待支付”；方案、配方版本、金额、门店及收货信息将作为订单快照保存。</section></main><footer><button @click="orderVisible=false">取消</button><button class="primary" @click="confirmOrder">确认生成订单</button></footer></section></div>
</template>

<style scoped>
.plan-management{width:100%;max-width:none}.plan-toolbar{flex-wrap:wrap}.plan-toolbar input[type='date']{width:148px;padding:9px 11px;border:1px solid #dce0e8;border-radius:8px;background:#fff}.plan-toolbar select{min-width:132px}.table-panel{max-width:none;overflow-x:auto}.table-panel table{min-width:1180px}.table-panel th,.table-panel td{white-space:nowrap;vertical-align:middle}.table-panel td:nth-child(3){min-width:158px;white-space:normal}.actions{min-width:420px;white-space:nowrap}.empty{text-align:center;padding:24px;color:#778096}.plan-notice{position:fixed;right:28px;top:88px;z-index:50;padding:12px 16px;border-radius:9px;background:#223042;color:#fff}.plan-modal-mask{position:fixed;inset:0;z-index:45;display:grid;place-items:center;background:rgba(20,25,36,.38)}.review-dialog,.version-modal,.order-dialog{width:min(800px,92vw);height:min(720px,90vh);display:flex;flex-direction:column;overflow:hidden;border-radius:14px;background:#fff}.review-dialog header,.version-modal header,.order-dialog>header{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 25px 16px;border-bottom:1px solid #edf0f4}.review-dialog h2,.version-modal h2,.order-dialog h2{margin:0;font-size:22px}.review-dialog main,.version-modal main,.order-dialog>main{flex:1;overflow:auto;padding:20px 25px}.review-dialog label{display:inline-flex;align-items:center;gap:7px;margin:8px 18px 14px 0}.review-dialog textarea{display:block;width:100%;padding:10px;border:1px solid #dce0e8;border-radius:8px}.review-dialog footer,.version-modal footer,.order-dialog>footer{display:flex;justify-content:flex-end;gap:9px;padding:14px 25px;border-top:1px solid #edf0f4;background:#fff}.close{border-radius:50%;font-size:19px;width:32px;height:32px;padding:0}.version-modal table{width:100%}.order-entry{max-width:1120px;margin:0 auto 10px;display:flex;justify-content:flex-end;align-items:center;gap:10px;color:#6d768b;font-size:13px}.order-dialog>header span{font-size:12px;color:#778096}.order-dialog>header h2{margin-top:6px}.order-section{margin-bottom:16px;padding:16px;border:1px solid #e8ebf0;border-radius:10px}.order-section h3{margin:0 0 12px;font-size:15px}.order-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px}.order-grid p{margin:0;font-size:13px}.order-grid span,.order-grid b{display:block}.order-grid span{margin-bottom:4px;color:#778096;font-size:12px}.order-section table{width:100%}.plan-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}.plan-grid label{font-size:12px;color:#586174}.plan-grid input,.plan-grid textarea{display:block;width:100%;margin-top:7px;padding:9px 11px;border:1px solid #dce0e8;border-radius:8px;background:#fff}.span-two{grid-column:1/-1}.order-section.note{font-size:12px;color:#657087;background:#f8f9fb}@media(max-width:760px){.plan-toolbar input{width:100%!important}.order-grid,.plan-grid{grid-template-columns:1fr}.span-two{grid-column:auto}.actions{white-space:normal}}
</style>
