# LAVIDA 双产品端交互演示

本项目包含顾客/加盟商微信小程序源码、加盟商/总部 Web 工作台及统一本地模拟服务。

## 在线预览

- 管理后台 GitHub Pages：[https://zhix88.github.io/lavida/](https://zhix88.github.io/lavida/)

> 在线预览使用内置的模拟业务数据，支持查看各栏目及演示审核、支付、生产和履约状态流转；真实本地 API 联动请在本地环境启动后体验。

## 预置账号

| 身份 | 账号 | 密码 |
|---|---|---|
| 顾客 | `customer` | `lavida123` |
| 加盟商 | `merchant` | `lavida123` |
| 总部 | `hq` | `lavida123` |

## 启动

```powershell
pnpm install
pnpm dev
```

如使用 npm，可分别在 `packages/api`、`apps/admin`、`apps/mini` 执行 `npm install`，再分别执行 `npm run dev`。

- Web 后台：`http://localhost:5173`
- API：`http://127.0.0.1:3001`
- 小程序 H5：由 Uni-App 启动命令输出本地地址。

## 演示说明

所有支付、AI、物流、附件及生产数据均是本地模拟数据。可使用总部账号审核方案并推进生产、质检、发货；顾客端刷新后可查看相同记录的状态变化。

小程序构建微信版本：`pnpm --filter @lavida/mini build:mp-weixin`。
