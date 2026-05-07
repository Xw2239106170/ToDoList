---
name: pomodoro-todo-fullstack-spec
description: Product and implementation specification for a minimalist modern Pomodoro Todo application inspired by focus tools like Pomodoro Todo. Use when building or updating this uni-app (Vue 2) frontend and Spring Boot backend project, including page design, route planning, task management, timer flow, statistics, settings, REST API contracts, backend modules, and frontend-backend collaboration rules.
---

# 项目目标

按以下规格实现一个类似番茄 Todo 的专注任务应用，但不要直接照搬现有产品界面。优先做出轻量、克制、现代、耐看的移动端体验，让用户可以围绕“任务管理 + 番茄钟专注 + 数据复盘”完成每日规划与执行。

当前项目基线如下：

- 当前目录已经是 `uni-app` `Vue 2` 前端工程。
- 当前仅有默认首页 `pages/index/index.vue`，尚未进入业务开发阶段。
- 后续如采用单仓库结构，建议在项目根目录新增 `backend/` 存放 Spring Boot 服务端工程。

# 交付范围

实现以下 MVP 能力：

1. 实现任务新增、编辑、删除、完成、排序、加入今日专注。
2. 实现番茄钟专注流程，包括开始、暂停、继续、完成、中断。
3. 实现短休息和长休息策略。
4. 实现今日数据、近 7 天数据和基础统计展示。
5. 实现专注时长、番茄数量、任务完成数的可视化汇总。
6. 实现个性化专注设置，包括番茄时长、休息时长、长休息间隔、提醒开关。
7. 保证前后端接口清晰稳定，便于并行开发。

当前阶段不做以下内容：

- 社交、排行、组队、自习室
- 复杂会员体系
- 多端消息推送闭环
- 深度社区内容
- 深色主题首发版

# 产品定位

围绕以下体验原则实现：

- 让用户一打开就能开始做事，而不是先学习系统。
- 让“今日待办”和“当前专注”始终成为视觉主角。
- 让统计结果足够有反馈感，但不要做成复杂 BI 面板。
- 让交互节奏安静、清爽，不堆砌高饱和色和彩色卡片。

# 视觉与交互规范

遵循简约现代的浅色系设计，避免默认模板感。

推荐设计基调：

- 主背景色：`#F5F3EE`
- 卡片背景：`#FFFFFF`
- 主强调色：`#FF7A59`
- 成功色：`#35A16B`
- 警示色：`#F59E0B`
- 主文本：`#1F2937`
- 次级文本：`#6B7280`
- 分割线：`#E7E5E4`

统一界面规则：

- 使用大留白、低噪音卡片、弱阴影，不使用重边框。
- 卡片圆角建议 `24rpx`，按钮圆角建议 `999rpx`。
- 主要按钮使用纯色填充，次级按钮使用浅底色或描边。
- 首页信息层级控制在 3 层以内，避免信息墙。
- 动效只用于倒计时、卡片进入、完成反馈，不做花哨转场。
- 图标风格统一使用线性或圆角线性图标。

推荐页面氛围：

- 首页偏规划感，重点突出“今日进度”和“待办列表”。
- 专注页偏沉浸感，重点突出倒计时、当前任务、暂停与完成操作。
- 统计页偏成就感，重点突出连续专注、周趋势和完成率。

# 页面规划

按以下页面结构实现：

1. `pages/index/index`
用途：首页，展示今日概览、快捷新增、任务列表、快速开始专注。

2. `pages/task/edit`
用途：任务新增与编辑页。

3. `pages/focus/index`
用途：番茄钟专注页。

4. `pages/stats/index`
用途：数据统计页。

5. `pages/settings/index`
用途：专注参数和通用设置页。

如需二期扩展，可增加：

- `pages/task/detail`
- `pages/history/index`

# 页面需求

## 首页 `pages/index/index`

实现以下模块：

- 顶部日期与问候语
- 今日专注进度卡片
- 快捷新增任务输入区
- “今日待办 / 全部任务”切换
- 任务列表
- 底部悬浮开始专注按钮，未选任务时引导选择任务

任务项展示字段：

- 标题
- 优先级
- 预计番茄数
- 已完成番茄数
- 截止时间
- 状态

任务项交互：

- 点击进入编辑
- 左滑删除
- 勾选完成
- 设为今日任务
- 立即开始专注
- 长按拖拽排序

首页验收标准：

- 首屏无需滚动即可看到今日概览和至少 3 条任务。
- 快捷新增在 2 步内完成录入。
- 任务完成后应有轻量反馈，并即时刷新统计卡片。

## 任务编辑页 `pages/task/edit`

实现以下字段：

- `title` 任务标题，必填
- `note` 备注，选填
- `priority` 优先级，`LOW | MEDIUM | HIGH`
- `category` 分类，选填
- `tags` 标签数组，选填
- `dueDate` 截止日期，选填
- `estimatePomodoros` 预计番茄数，默认 `1`
- `todayFlag` 是否加入今日专注

交互要求：

- 新建和编辑共用页面。
- 编辑状态下支持删除。
- 标题为空时禁止保存。

## 专注页 `pages/focus/index`

实现以下模块：

- 当前任务信息卡片
- 圆形倒计时主视觉
- 当前阶段标识：专注 / 短休息 / 长休息
- 暂停、继续、结束、放弃按钮
- 本轮累计与今日累计信息

核心交互规则：

- 开始专注时必须绑定任务。
- 一个用户同一时间只允许一个运行中的 session。
- 完成一个工作番茄后，自动累计到任务已完成番茄数。
- 每完成 `longBreakInterval` 个工作番茄后，下一轮休息推荐长休息。
- 页面退出后再次进入，应恢复当前倒计时状态。

## 统计页 `pages/stats/index`

展示以下信息：

- 今日专注时长
- 今日完成番茄数
- 今日完成任务数
- 本周专注趋势
- 最近 7 天专注时长
- 连续专注天数
- 任务完成率

展示形式建议：

- 顶部总览卡片
- 中部周趋势柱状图或折线图
- 底部成就型数据卡片

## 设置页 `pages/settings/index`

提供以下配置：

- 专注时长 `focusMinutes`
- 短休息时长 `shortBreakMinutes`
- 长休息时长 `longBreakMinutes`
- 长休息触发间隔 `longBreakInterval`
- 是否自动开始休息 `autoStartBreak`
- 是否自动开始下一轮专注 `autoStartFocus`
- 每日目标番茄数 `dailyGoalPomodoros`
- 每日目标专注分钟数 `dailyGoalMinutes`
- 声音提醒开关 `soundEnabled`
- 震动提醒开关 `vibrationEnabled`

# 前端实现约束

按以下约束组织 `uni-app` 前端代码：

- 使用 `Vue 2` Options API。
- 将接口请求统一收敛到 `api/` 目录，不在页面内直接拼装 URL。
- 将通用 UI 组件放入 `components/`。
- 将主题变量统一放入 `uni.scss`。
- 将番茄钟状态、当前 session、用户设置等跨页状态放入 `store/`。
- 将日期、时长、状态格式化逻辑放入 `utils/`。

推荐目录结构：

```text
.
├─ pages/
│  ├─ index/index.vue
│  ├─ task/edit.vue
│  ├─ focus/index.vue
│  ├─ stats/index.vue
│  └─ settings/index.vue
├─ components/
├─ api/
├─ store/
├─ utils/
├─ static/
├─ App.vue
├─ main.js
├─ pages.json
└─ uni.scss
```

前端接口封装要求：

- 统一处理请求基地址、超时、错误提示、Token 预留位。
- 统一将后端响应解包为 `data`。
- 对任务、专注、统计、设置分别建立 API 模块。

前端状态恢复要求：

- 将当前运行中的 session 基本信息缓存到本地存储。
- 应用重新打开时，先恢复本地缓存，再调用后端当前 session 接口校准。

# 后端实现约束

按以下约束组织 Spring Boot 服务端：

- 使用 RESTful 风格接口。
- 统一接口前缀为 `/api/v1`。
- 统一返回结构，避免前端处理多个格式。
- 将任务域、专注域、统计域、设置域拆分为独立模块。

推荐分层：

- `controller`
- `service`
- `service.impl`
- `repository` 或 `mapper`
- `entity`
- `dto`
- `vo`
- `enums`
- `config`
- `exception`

推荐数据库：

- `MySQL 8+`

推荐补充能力：

- 参数校验
- 全局异常处理
- 统一日志追踪
- Swagger 或 Springdoc OpenAPI

# 数据模型

## Task

```json
{
  "id": 1,
  "title": "完成产品原型",
  "note": "补齐首页和专注页流程",
  "status": "TODO",
  "priority": "HIGH",
  "category": "工作",
  "tags": ["原型", "高优先级"],
  "dueDate": "2026-05-10",
  "estimatePomodoros": 4,
  "completedPomodoros": 1,
  "todayFlag": true,
  "sortOrder": 10,
  "createdAt": "2026-05-06T14:00:00+08:00",
  "updatedAt": "2026-05-06T14:30:00+08:00"
}
```

字段规则：

- `status` 取值：`TODO | DOING | DONE | ARCHIVED`
- `priority` 取值：`LOW | MEDIUM | HIGH`
- `estimatePomodoros` 最小值为 `1`
- `completedPomodoros` 由专注完成流程累计

## FocusSession

```json
{
  "id": 101,
  "taskId": 1,
  "sessionType": "WORK",
  "planMinutes": 25,
  "actualMinutes": 0,
  "status": "RUNNING",
  "startedAt": "2026-05-06T15:00:00+08:00",
  "endedAt": null,
  "pauseSeconds": 0
}
```

字段规则：

- `sessionType` 取值：`WORK | SHORT_BREAK | LONG_BREAK`
- `status` 取值：`RUNNING | PAUSED | COMPLETED | INTERRUPTED | SKIPPED`
- 工作 session 完成后，需要写回任务累计番茄数

## UserSettings

```json
{
  "focusMinutes": 25,
  "shortBreakMinutes": 5,
  "longBreakMinutes": 15,
  "longBreakInterval": 4,
  "autoStartBreak": false,
  "autoStartFocus": false,
  "dailyGoalPomodoros": 8,
  "dailyGoalMinutes": 200,
  "soundEnabled": true,
  "vibrationEnabled": true
}
```

# 统一响应格式

所有接口返回以下结构：

```json
{
  "code": 0,
  "message": "OK",
  "data": {},
  "timestamp": "2026-05-06T15:20:00+08:00"
}
```

错误码约定：

- `0`：成功
- `4001`：参数错误
- `4004`：资源不存在
- `4090`：业务冲突，例如已有运行中的专注 session
- `5000`：服务端异常

# 接口契约

## 任务接口

### `GET /api/v1/tasks`

用途：分页查询任务列表。

查询参数：

- `status` 选填
- `todayFlag` 选填
- `keyword` 选填
- `pageNo` 默认 `1`
- `pageSize` 默认 `20`
- `sortBy` 选填，建议 `sortOrder` 或 `dueDate`

返回 `data` 示例：

```json
{
  "list": [],
  "total": 0,
  "pageNo": 1,
  "pageSize": 20
}
```

### `GET /api/v1/tasks/{id}`

用途：查询任务详情。

### `POST /api/v1/tasks`

用途：创建任务。

请求体：

```json
{
  "title": "完成首页设计",
  "note": "",
  "priority": "MEDIUM",
  "category": "设计",
  "tags": ["首页"],
  "dueDate": "2026-05-08",
  "estimatePomodoros": 2,
  "todayFlag": true
}
```

### `PUT /api/v1/tasks/{id}`

用途：更新任务完整信息。

### `PATCH /api/v1/tasks/{id}/status`

用途：更新任务状态。

请求体：

```json
{
  "status": "DONE"
}
```

### `PATCH /api/v1/tasks/{id}/today-flag`

用途：切换是否加入今日专注。

请求体：

```json
{
  "todayFlag": true
}
```

### `POST /api/v1/tasks/reorder`

用途：批量更新排序。

请求体：

```json
{
  "items": [
    { "id": 1, "sortOrder": 10 },
    { "id": 2, "sortOrder": 20 }
  ]
}
```

### `DELETE /api/v1/tasks/{id}`

用途：删除任务。

业务规则：

- 若任务存在运行中的 session，返回 `4090`，前端提示先结束专注。

## 专注接口

### `GET /api/v1/focus-sessions/current`

用途：查询当前进行中的 session，没有则返回 `null`。

### `GET /api/v1/focus-sessions/history`

用途：分页查询专注历史。

查询参数：

- `taskId` 选填
- `sessionType` 选填
- `pageNo`
- `pageSize`

### `POST /api/v1/focus-sessions/start`

用途：开始一轮专注或休息。

请求体：

```json
{
  "taskId": 1,
  "sessionType": "WORK",
  "planMinutes": 25
}
```

业务规则：

- 开始工作专注时，`taskId` 必填。
- 若已有运行中的 session，返回 `4090`。
- 若任务状态为 `DONE`，禁止开启工作专注。
- 工作专注开始后，可自动将任务状态置为 `DOING`。

### `POST /api/v1/focus-sessions/{id}/pause`

用途：暂停当前 session。

### `POST /api/v1/focus-sessions/{id}/resume`

用途：继续当前 session。

### `POST /api/v1/focus-sessions/{id}/finish`

用途：完成当前 session。

请求体：

```json
{
  "actualMinutes": 25
}
```

业务规则：

- `WORK` 类型完成后，任务 `completedPomodoros + 1`。
- 完成后根据设置判断下一轮建议休息类型。

### `POST /api/v1/focus-sessions/{id}/interrupt`

用途：中断当前 session。

请求体：

```json
{
  "reason": "USER_CANCEL"
}
```

## 统计接口

### `GET /api/v1/stats/overview`

用途：获取总览统计。

查询参数：

- `range`：`today | week | month`

返回 `data` 示例：

```json
{
  "focusMinutes": 120,
  "pomodoroCount": 5,
  "completedTaskCount": 3,
  "completionRate": 0.75,
  "continuousDays": 6
}
```

### `GET /api/v1/stats/trend`

用途：获取趋势图数据。

查询参数：

- `range`：`7d | 30d`

返回 `data` 示例：

```json
{
  "points": [
    { "date": "2026-05-01", "focusMinutes": 90, "pomodoroCount": 4 },
    { "date": "2026-05-02", "focusMinutes": 120, "pomodoroCount": 5 }
  ]
}
```

## 设置接口

### `GET /api/v1/settings`

用途：获取用户设置。

### `PUT /api/v1/settings`

用途：更新用户设置。

请求体：

```json
{
  "focusMinutes": 25,
  "shortBreakMinutes": 5,
  "longBreakMinutes": 15,
  "longBreakInterval": 4,
  "autoStartBreak": false,
  "autoStartFocus": false,
  "dailyGoalPomodoros": 8,
  "dailyGoalMinutes": 200,
  "soundEnabled": true,
  "vibrationEnabled": true
}
```

# 核心业务规则

遵循以下规则，不要在前后端各自实现一套互相冲突的逻辑：

1. 一个用户同一时间只允许一个 `RUNNING` 或 `PAUSED` 状态的 session。
2. 前端倒计时负责表现，后端 session 时间负责最终一致性。
3. 工作番茄完成后，才能累计到任务完成番茄数。
4. 删除任务前必须校验是否存在未结束 session。
5. 统计页数据优先从 session 和任务数据聚合，不强依赖独立统计表。
6. 设置修改后，新开启的 session 使用新参数，运行中的 session 不强制改写。

# 推荐数据库表

MVP 建议至少包含以下表：

- `task`
- `focus_session`
- `user_settings`

字段建议：

- `task.tags` 在 MVP 阶段可用 JSON 字符串存储。
- `focus_session` 必须保留 `started_at`、`ended_at`、`status`、`session_type`。
- `user_settings` 可按单用户单行存储，后续再扩展多用户。

# 开发顺序建议

按以下顺序推进，降低联调成本：

1. 先完成页面结构、主题变量和路由配置。
2. 再完成任务 CRUD 和首页列表流转。
3. 再完成专注页计时逻辑与 session 接口。
4. 再完成统计页聚合接口与展示。
5. 最后完成设置页和状态恢复。

# 验收标准

满足以下条件即可视为首版达标：

1. 用户可在首页新增任务并加入今日专注。
2. 用户可从任务直接开始一个 25 分钟工作番茄。
3. 专注过程支持暂停、继续、完成、中断，并可恢复状态。
4. 完成番茄后，任务累计番茄数与统计数据同步更新。
5. 设置项可影响新开启的专注流程。
6. 整体视觉简洁、统一、现代，不保留默认示例页样式。
7. 
