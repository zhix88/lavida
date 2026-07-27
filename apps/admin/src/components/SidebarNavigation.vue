<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ groups: Array<[string, string[]]>; page: string }>()
const emit = defineEmits<{ select: [page: string] }>()

// 保持一次只展开一个一级栏目，导航在常见笔记本高度下无需内部滚动。
const expandedGroups = ref<string[]>([])
const icons: Record<string, string> = {
  工作台: 'dashboard', 顾客中心: 'users', 顾客档案: 'file', 测评中心: 'checklist', 测评报告: 'file', 治疗方案: 'shield', 测评题库: 'list',
  订单中心: 'order', 订单管理: 'file', 收款管理: 'card', 订单履约: 'truck', 加盟中心: 'store', 加盟商管理: 'store', 订货单管理: 'list',
  生产中心: 'factory', 排产任务: 'list', 生产设备: 'device', 库存管理: 'box', SKU管理: 'box', 库存台账: 'list', 商品分类: 'category', 供应商管理: 'store',
  经营分析: 'chart', 系统设置: 'settings', 设备集成: 'device', 大模型配置: 'message', 部门管理: 'building', 人员管理: 'users', 角色管理: 'shield', 菜单管理: 'menu', 参数管理: 'sliders',
}

function isExpanded(group: string) { return expandedGroups.value.includes(group) }
function hasChildren(group: string) { return (props.groups.find((item) => item[0] === group)?.[1].length || 0) > 0 }
function iconFor(name: string) { return icons[name] || 'file' }
function toggle(group: string) {
  if (!hasChildren(group)) { emit('select', group); return }
  expandedGroups.value = isExpanded(group) ? [] : [group]
}
function choose(group: string, item: string) {
  if (!isExpanded(group)) toggle(group)
  emit('select', item)
}
</script>

<template>
  <nav class="sidebar-navigation" aria-label="后台功能导航">
    <section v-for="group in groups" :key="group[0]" class="nav-group">
      <button class="nav-level-one" :class="{ expanded: isExpanded(group[0]), active: !hasChildren(group[0]) && page === group[0] }" :aria-expanded="hasChildren(group[0]) ? isExpanded(group[0]) : undefined" @click="toggle(group[0])">
        <span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><template v-if="iconFor(group[0]) === 'dashboard'"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 3v4m8-4v4M7 12h3m2 0h5"/></template><template v-else-if="iconFor(group[0]) === 'users'"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20v-1a4.5 4.5 0 0 1 4.5-4.5h6a4.5 4.5 0 0 1 4.5 4.5v1"/></template><template v-else-if="iconFor(group[0]) === 'checklist'"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="m8 10 1.5 1.5L12 8.5M8 15h8"/></template><template v-else-if="iconFor(group[0]) === 'order'"><path d="M5 7h14l1 13H4L5 7Z"/><path d="M8 7a4 4 0 0 1 8 0M8 12h8"/></template><template v-else-if="iconFor(group[0]) === 'store'"><path d="M4 20V8l8-4 8 4v12M8 20v-5h8v5"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></template><template v-else-if="iconFor(group[0]) === 'factory'"><path d="M4 20V9l5-3v4l4-3v4l3-2 4 3v8M8 20v-4h3v4M16 13h.01M16 16h.01"/></template><template v-else-if="iconFor(group[0]) === 'box'"><path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="M4 8v8l8 4 8-4V8m-8 4v8"/></template><template v-else-if="iconFor(group[0]) === 'chart'"><path d="M5 19.5V11M10 19.5V5M15 19.5V8M20 19.5V3"/></template><template v-else-if="iconFor(group[0]) === 'settings'"><circle cx="12" cy="12" r="3.5"/><path d="m19 12 2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-1.1L14.2 4H9.8l-.4 2.9a8 8 0 0 0-2 1.1L5 7 3 10.5 5 12c0 .4 0 .8.1 1.2L3 14.7 5 18l2.4-1a8 8 0 0 0 2 1.1l.4 2.9h4.4l.4-2.9a8 8 0 0 0 2-1.1l2.4 1 2-3.3-2-1.5c.1-.4.1-.8.1-1.2Z"/></template><template v-else><path d="M6 3.5h9l3 3v14H6z"/><path d="M9 11h6m-6 4h6m0-11.5v3h3"/></template></svg></span>
        <strong>{{ group[0] }}</strong>
        <span v-if="hasChildren(group[0])" class="nav-chevron" :class="{ open: isExpanded(group[0]) }" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4"/></svg></span>
      </button>
      <div v-show="isExpanded(group[0])" class="nav-level-two">
        <button v-for="item in group[1]" :key="item" :class="{ active: page === item }" @click="choose(group[0], item)">
          <span class="nav-icon sub-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><template v-if="iconFor(item) === 'shield'"><path d="M12 20.5s7-3.8 7-9.2V5.5L12 3 5 5.5v5.8c0 5.4 7 9.2 7 9.2Z"/><path d="m9 11.5 2 2 4-4"/></template><template v-else-if="iconFor(item) === 'card'"><rect x="4" y="7" width="16" height="10" rx="1.5"/><path d="M4 10h16m-5 4h2"/></template><template v-else-if="iconFor(item) === 'truck'"><path d="M3.5 7.5h11v9h-11zM14.5 10h3l2 2v4h-5"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></template><template v-else-if="iconFor(item) === 'device'"><rect x="7" y="4" width="10" height="16" rx="1.5"/><path d="M10 8h4m-4 4h4m-4 4h4"/></template><template v-else-if="iconFor(item) === 'category'"><path d="m4 7 4-4 4 4-4 4L4 7Zm8 0 4-4 4 4-4 4-4-4ZM4 16l4-4 4 4-4 4-4-4Z"/></template><template v-else-if="iconFor(item) === 'message'"><path d="M4 12a8 8 0 0 1 16 0c0 4.4-3.6 8-8 8a7.8 7.8 0 0 1-4.3-1.3L4 20l1.4-3.3A8 8 0 0 1 4 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></template><template v-else-if="iconFor(item) === 'building'"><path d="M4 20V5h16v15M8 20v-4h8v4M8 9h.01M12 9h.01M16 9h.01"/></template><template v-else-if="iconFor(item) === 'menu'"><path d="M6 6h14M6 12h14M6 18h14M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></template><template v-else-if="iconFor(item) === 'sliders'"><path d="M5 7h14M5 17h14M9 4.5v5M15 14.5v5"/></template><template v-else-if="iconFor(item) === 'list'"><rect x="5" y="4.5" width="14" height="15" rx="1"/><path d="M8 9h8M8 13h8M8 17h5"/></template><template v-else-if="iconFor(item) === 'box'"><path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="M4 8v8l8 4 8-4V8m-8 4v8"/></template><template v-else-if="iconFor(item) === 'users'"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20v-1a4.5 4.5 0 0 1 4.5-4.5h6a4.5 4.5 0 0 1 4.5 4.5v1"/></template><template v-else><path d="M6 3.5h9l3 3v14H6z"/><path d="M9 11h6m-6 4h6m0-11.5v3h3"/></template></svg></span>
          {{ item }}
        </button>
      </div>
    </section>
  </nav>
</template>

<style scoped>
:global(.side-foot){position:absolute;right:23px;bottom:18px;left:23px;margin:0}
.sidebar-navigation{position:absolute;top:87px;right:15px;bottom:78px;left:15px;overflow:hidden}.nav-group{margin-bottom:7px}:global(.side .sidebar-navigation button.nav-level-one){display:flex;align-items:center;gap:10px;width:100%;min-height:40px;margin:0;padding:10px 11px;border:0;border-radius:8px;background:transparent;color:#b6bfd2;text-align:left}.nav-level-one.expanded,.nav-level-one.active{background:#30394f!important;color:#fff!important}.nav-level-one strong{flex:1;font-size:13px}.nav-icon{display:grid!important;flex:0 0 19px;place-items:center;width:19px;height:19px}.nav-icon svg{display:block!important;width:19px!important;height:19px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;stroke-linecap:round;stroke-linejoin:round}.nav-chevron{display:grid!important;flex:0 0 16px;place-items:center;width:16px;height:16px;color:#aeb8ce;transition:transform .18s ease}.nav-chevron.open{transform:rotate(180deg)}.nav-chevron svg{display:block!important;width:16px!important;height:16px!important;fill:none!important;stroke:currentColor!important;stroke-width:2.2!important;stroke-linecap:round;stroke-linejoin:round}.nav-level-two{display:grid;gap:3px;margin:5px 0 8px;padding:0}:global(.side .sidebar-navigation .nav-level-two button){display:flex;align-items:center;gap:9px;width:100%;min-height:40px;margin:0;padding:10px 10px 10px 30px;border:0;border-radius:7px;background:transparent;color:#aeb8ce;text-align:left;font-size:13px}.nav-level-two button.active{background:#3b4359!important;color:#fff!important}.sub-icon{flex-basis:19px;width:19px;height:19px}.sub-icon svg{width:19px!important;height:19px!important;stroke-width:1.55!important}
</style>
