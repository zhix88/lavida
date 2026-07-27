<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface ReportInfo { id: string; customerName: string; questionnaireVersion: string; sleepQuality: string; energyLevel: string; exerciseFrequency: string; dietStructure: string; primaryNeed: string; advisorSummary: string }
const props = defineProps<{ report: ReportInfo | null }>()
const emit = defineEmits<{ back: []; saved: [message: string] }>()
const goals = ref('改善睡眠质量与日间能量水平')
const cycle = ref('12 周')
const planName = ref('个性化健康调理方案')
const guidance = ref('结合测评结果，建议优先建立规律作息、均衡饮食与适量运动习惯。')
const notes = ref('如有不适请及时联系服务顾问；本方案需经专业审核后对顾客生效。')
const validUntil = ref('2026-10-26')
const reviewer = ref('王医生')
const formula = ref([
  { product: 'Omega-3 营养配方', dosage: '2 粒 / 日', timing: '早餐后', cycle: '12 周', quantity: 2 },
  { product: '辅酶 Q10 营养配方', dosage: '1 粒 / 日', timing: '午餐后', cycle: '12 周', quantity: 1 },
])
const summary = computed(() => props.report ? `关联报告：${props.report.id} · 题库 ${props.report.questionnaireVersion}` : '未关联测评报告')
watch(() => props.report?.id, () => { if (props.report?.primaryNeed) goals.value=`围绕“${props.report.primaryNeed}”开展个性化健康调理` }, { immediate: true })
function addFormula(){ formula.value.push({ product: '', dosage: '', timing: '', cycle: cycle.value, quantity: 1 }) }
function removeFormula(index: number){ formula.value.splice(index, 1) }
function validate(){ return !!(props.report && planName.value.trim() && goals.value.trim() && cycle.value.trim() && formula.value.length && formula.value.every(item=>item.product && item.dosage && item.timing && item.quantity > 0)) }
function saveDraft(){ if(!validate()) return alert('请完成方案名称、目标、周期及配方明细'); emit('saved','治疗方案草稿已保存') }
function submitReview(){ if(!validate()) return alert('请完成方案名称、目标、周期及配方明细'); emit('saved','治疗方案已提交专业审核，审核通过后方可向顾客展示') }
</script>

<template>
  <section class="plan-detail">
    <div class="plan-top"><div><button class="back" @click="emit('back')">← 返回测评报告</button><span class="crumb">治疗方案 / 方案详情</span><h2>生成治疗方案</h2><p>{{ summary }}</p></div><span class="plan-tag">待专业审核</span></div>
    <section class="plan-card report-summary" v-if="report"><h3>测评信息摘要</h3><div><article><span>顾客</span><b>{{report.customerName}}</b></article><article><span>睡眠质量</span><b>{{report.sleepQuality}}</b></article><article><span>日间能量</span><b>{{report.energyLevel}}</b></article><article><span>主要诉求</span><b>{{report.primaryNeed}}</b></article></div><p><b>顾问总结：</b>{{report.advisorSummary}}</p></section>
    <section class="plan-card"><h3>方案基础信息</h3><div class="plan-grid"><label>方案名称 <b>*</b><input v-model="planName"/></label><label>服务周期 <b>*</b><select v-model="cycle"><option>4 周</option><option>8 周</option><option>12 周</option><option>24 周</option></select></label><label class="span-two">服务目标 <b>*</b><textarea v-model="goals" rows="2"></textarea></label><label class="span-two">调理建议<textarea v-model="guidance" rows="3"></textarea></label></div></section>
    <section class="plan-card"><div class="section-title"><h3>产品 / 配方明细 <b>*</b></h3><button @click="addFormula">+ 添加配方</button></div><table><thead><tr><th>产品 / 配方</th><th>建议用量</th><th>使用时间</th><th>使用周期</th><th>数量</th><th>操作</th></tr></thead><tbody><tr v-for="(item,index) in formula" :key="index"><td><input v-model="item.product" placeholder="选择或填写产品配方"/></td><td><input v-model="item.dosage" placeholder="例如 2 粒 / 日"/></td><td><select v-model="item.timing"><option value="">请选择</option><option>早餐后</option><option>午餐后</option><option>晚餐后</option><option>睡前</option></select></td><td><input v-model="item.cycle"/></td><td><input v-model.number="item.quantity" type="number" min="1"/></td><td><button class="link danger" @click="removeFormula(index)">删除</button></td></tr></tbody></table></section>
    <section class="plan-card"><h3>审核与展示信息</h3><div class="plan-grid"><label>专业审核人<select v-model="reviewer"><option>王医生</option><option>李医生</option><option>张医生</option></select></label><label>方案有效期<input v-model="validUntil" type="date"/></label><label class="span-two">注意事项<textarea v-model="notes" rows="3"></textarea></label></div></section>
    <footer class="plan-footer"><button @click="emit('back')">取消</button><button @click="saveDraft">保存草稿</button><button class="primary" @click="submitReview">提交专业审核</button></footer>
  </section>
</template>

<style scoped>
.plan-detail{max-width:1120px;margin:0 auto}.plan-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}.back{display:block;margin:0 0 8px;padding:0;background:transparent;color:#7a5944}.plan-top h2{margin:8px 0;font-size:23px}.plan-top p{margin:0;color:#778096;font-size:12px}.plan-tag{margin-top:28px;padding:5px 9px;border-radius:99px;background:#fff3d8;color:#9b6200;font-size:12px}.plan-card{margin-bottom:15px;padding:20px;border:1px solid #e7e9ef;border-radius:13px;background:#fff}.plan-card h3{margin:0 0 14px;font-size:16px}.plan-card h3 b,.plan-grid label>b{color:#b24b42}.report-summary>div{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.report-summary article{padding:11px;border-radius:8px;background:#f8f8fb}.report-summary span,.report-summary b{display:block}.report-summary span{font-size:11px;color:#778096}.report-summary b{margin-top:5px}.report-summary p{margin:14px 0 0;font-size:13px;color:#586174}.plan-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}.plan-grid label{font-size:12px;color:#586174}.plan-grid input,.plan-grid select,.plan-grid textarea,.plan-card table input,.plan-card table select{display:block;width:100%;margin-top:7px;padding:9px 11px;border:1px solid #dce0e8;border-radius:8px;background:#fff}.span-two{grid-column:1/-1}.section-title{display:flex;align-items:center;justify-content:space-between}.section-title button{margin-bottom:13px}.plan-card table input,.plan-card table select{min-width:100px;margin:0;padding:7px}.danger{color:#a4423b;background:#ffeceb}.plan-footer{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:9px;padding:14px 0;background:#f5f6fa}@media(max-width:700px){.report-summary>div,.plan-grid{grid-template-columns:1fr}.span-two{grid-column:auto}.plan-card{overflow:auto}}
</style>
