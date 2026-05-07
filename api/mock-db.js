import { getDateKey, getLastNDays } from '../utils/date'
import { getSessionElapsedSeconds } from '../utils/time'

const STORAGE_KEY = 'pomodoro.todo.mock.db.v1'

const DEFAULT_SETTINGS = {
	focusMinutes: 25,
	shortBreakMinutes: 5,
	longBreakMinutes: 15,
	longBreakInterval: 4,
	autoStartBreak: false,
	autoStartFocus: false,
	dailyGoalPomodoros: 8,
	dailyGoalMinutes: 200,
	soundEnabled: true,
	vibrationEnabled: true
}

function clone(data) {
	return JSON.parse(JSON.stringify(data))
}

function createError(code, message) {
	const error = new Error(message)
	error.code = code
	return error
}

function dateOffset(dayOffset) {
	const date = new Date()
	date.setDate(date.getDate() + dayOffset)
	return getDateKey(date)
}

function timeOffset(minutes) {
	return new Date(Date.now() + minutes * 60000).toISOString()
}

function createSeedState() {
	return {
		tasks: [
			{
				id: 1,
				title: '梳理首页信息结构',
				note: '保证首屏可以看到今日进度和任务列表',
				status: 'TODO',
				priority: 'HIGH',
				category: '产品',
				tags: ['首页', '体验'],
				dueDate: dateOffset(1),
				durationMinutes: 30,
				estimatePomodoros: 2,
				completedPomodoros: 0,
				todayFlag: true,
				sortOrder: 10,
				createdAt: timeOffset(-180),
				updatedAt: timeOffset(-120),
				completedAt: null
			},
			{
				id: 2,
				title: '完成专注页交互',
				note: '实现暂停、继续、完成与中断动作',
				status: 'DOING',
				priority: 'MEDIUM',
				category: '前端',
				tags: ['番茄钟'],
				dueDate: dateOffset(2),
				durationMinutes: 45,
				estimatePomodoros: 3,
				completedPomodoros: 1,
				todayFlag: true,
				sortOrder: 20,
				createdAt: timeOffset(-300),
				updatedAt: timeOffset(-90),
				completedAt: null
			},
			{
				id: 3,
				title: '整理接口字段',
				note: '统一任务、专注、统计与设置返回结构',
				status: 'DONE',
				priority: 'LOW',
				category: '协作',
				tags: ['接口'],
				dueDate: dateOffset(0),
				durationMinutes: 25,
				estimatePomodoros: 1,
				completedPomodoros: 1,
				todayFlag: false,
				sortOrder: 30,
				createdAt: timeOffset(-600),
				updatedAt: timeOffset(-30),
				completedAt: timeOffset(-30)
			}
		],
		sessions: [
			{
				id: 1001,
				taskId: 3,
				sessionType: 'WORK',
				planMinutes: 25,
				actualMinutes: 25,
				status: 'COMPLETED',
				startedAt: timeOffset(-240),
				endedAt: timeOffset(-215),
				pauseSeconds: 0,
				pausedAt: null
			}
		],
		settings: clone(DEFAULT_SETTINGS)
	}
}

function ensureStateShape(db) {
	const state = db || {}
	state.tasks = Array.isArray(state.tasks) ? state.tasks : []
	state.sessions = Array.isArray(state.sessions) ? state.sessions : []
	state.settings = Object.assign({}, DEFAULT_SETTINGS, state.settings || {})
	return state
}

function loadDb() {
	const raw = uni.getStorageSync(STORAGE_KEY)
	if (!raw) {
		const initialState = createSeedState()
		uni.setStorageSync(STORAGE_KEY, initialState)
		return clone(initialState)
	}
	return clone(ensureStateShape(raw))
}

function saveDb(db) {
	const normalized = ensureStateShape(db)
	uni.setStorageSync(STORAGE_KEY, normalized)
	return clone(normalized)
}

function findTask(db, id) {
	return db.tasks.find(item => Number(item.id) === Number(id))
}

function getCurrentSessionRecord(db) {
	const activeList = db.sessions.filter(item => item.status === 'RUNNING' || item.status === 'PAUSED')
	if (!activeList.length) {
		return null
	}
	return activeList.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0]
}

function nextId(list) {
	return list.length ? Math.max.apply(null, list.map(item => Number(item.id))) + 1 : 1
}

function sortTasks(list, sortBy) {
	return list.sort((a, b) => {
		if (a.status === 'DONE' && b.status !== 'DONE') {
			return 1
		}
		if (a.status !== 'DONE' && b.status === 'DONE') {
			return -1
		}
		if (sortBy === 'dueDate') {
			const left = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
			const right = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
			return left - right
		}
		return Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
	})
}

function paginate(list, pageNo, pageSize) {
	const start = (pageNo - 1) * pageSize
	return {
		list: list.slice(start, start + pageSize),
		total: list.length,
		pageNo: pageNo,
		pageSize: pageSize
	}
}

function updateTaskCompletionStatus(task, status) {
	if (status === 'DONE') {
		task.completedAt = new Date().toISOString()
	} else if (status !== 'DONE') {
		task.completedAt = null
	}
}

function getWorkSessions(db) {
	return db.sessions.filter(item => item.sessionType === 'WORK' && item.status === 'COMPLETED')
}

function getRangeDaysByOverview(range) {
	if (range === 'month') {
		return 30
	}
	if (range === 'week') {
		return 7
	}
	return 1
}

function buildRangeKeySet(days) {
	return new Set(getLastNDays(days).map(item => item.key))
}

function getContinuousDays(db) {
	const workDaySet = new Set(getWorkSessions(db).map(item => getDateKey(item.endedAt || item.startedAt)))
	let streak = 0
	const cursor = new Date()
	while (workDaySet.has(getDateKey(cursor))) {
		streak += 1
		cursor.setDate(cursor.getDate() - 1)
	}
	return streak
}

function getBreakSuggestion(db) {
	const todayKey = getDateKey()
	const workCountToday = getWorkSessions(db).filter(item => getDateKey(item.endedAt || item.startedAt) === todayKey).length
	return workCountToday % db.settings.longBreakInterval === 0 ? 'LONG_BREAK' : 'SHORT_BREAK'
}

export function listTasksMock(params) {
	const db = loadDb()
	const options = params || {}
	let list = db.tasks.slice()
	if (options.status) {
		list = list.filter(item => item.status === options.status)
	}
	if (typeof options.todayFlag === 'boolean') {
		list = list.filter(item => item.todayFlag === options.todayFlag)
	}
	if (options.keyword) {
		const keyword = String(options.keyword).trim()
		list = list.filter(item => item.title.indexOf(keyword) > -1 || (item.note || '').indexOf(keyword) > -1)
	}
	list = sortTasks(list, options.sortBy || 'sortOrder')
	return paginate(clone(list), Number(options.pageNo || 1), Number(options.pageSize || 20))
}

export function getTaskDetailMock(id) {
	const db = loadDb()
	const task = findTask(db, id)
	if (!task) {
		throw createError(4004, '任务不存在')
	}
	return clone(task)
}

export function createTaskMock(payload) {
	const db = loadDb()
	const now = new Date().toISOString()
	const task = {
		id: nextId(db.tasks),
		title: payload.title,
		note: payload.note || '',
		status: payload.status || 'TODO',
		priority: payload.priority || 'MEDIUM',
		category: payload.category || '',
		tags: Array.isArray(payload.tags) ? payload.tags : [],
		dueDate: payload.dueDate || '',
		durationMinutes: Math.max(5, Number(payload.durationMinutes || 25)),
		estimatePomodoros: Math.max(1, Number(payload.estimatePomodoros || 1)),
		completedPomodoros: Number(payload.completedPomodoros || 0),
		todayFlag: typeof payload.todayFlag === 'boolean' ? payload.todayFlag : false,
		sortOrder: db.tasks.length ? Math.max.apply(null, db.tasks.map(item => Number(item.sortOrder || 0))) + 10 : 10,
		createdAt: now,
		updatedAt: now,
		completedAt: payload.status === 'DONE' ? now : null
	}
	db.tasks.push(task)
	saveDb(db)
	return clone(task)
}

export function updateTaskMock(id, payload) {
	const db = loadDb()
	const task = findTask(db, id)
	if (!task) {
		throw createError(4004, '任务不存在')
	}
	Object.assign(task, {
		title: payload.title,
		note: payload.note || '',
		priority: payload.priority || 'MEDIUM',
		category: payload.category || '',
		tags: Array.isArray(payload.tags) ? payload.tags : [],
		dueDate: payload.dueDate || '',
		durationMinutes: Math.max(5, Number(payload.durationMinutes || task.durationMinutes || 25)),
		estimatePomodoros: Math.max(1, Number(payload.estimatePomodoros || 1)),
		todayFlag: typeof payload.todayFlag === 'boolean' ? payload.todayFlag : false
	})
	if (payload.status) {
		task.status = payload.status
		updateTaskCompletionStatus(task, payload.status)
	}
	task.updatedAt = new Date().toISOString()
	saveDb(db)
	return clone(task)
}

export function updateTaskStatusMock(id, status) {
	const db = loadDb()
	const task = findTask(db, id)
	if (!task) {
		throw createError(4004, '任务不存在')
	}
	task.status = status
	task.updatedAt = new Date().toISOString()
	updateTaskCompletionStatus(task, status)
	saveDb(db)
	return clone(task)
}

export function updateTaskTodayFlagMock(id, todayFlag) {
	const db = loadDb()
	const task = findTask(db, id)
	if (!task) {
		throw createError(4004, '任务不存在')
	}
	task.todayFlag = !!todayFlag
	task.updatedAt = new Date().toISOString()
	saveDb(db)
	return clone(task)
}

export function reorderTasksMock(payload) {
	const db = loadDb()
	const items = payload.items || []
	items.forEach(item => {
		const task = findTask(db, item.id)
		if (task) {
			task.sortOrder = Number(item.sortOrder || task.sortOrder || 0)
			task.updatedAt = new Date().toISOString()
		}
	})
	saveDb(db)
	return { success: true }
}

export function deleteTaskMock(id) {
	const db = loadDb()
	const currentSession = getCurrentSessionRecord(db)
	if (currentSession && Number(currentSession.taskId) === Number(id)) {
		throw createError(4090, '当前任务正在专注中，请先结束专注')
	}
	const targetIndex = db.tasks.findIndex(item => Number(item.id) === Number(id))
	if (targetIndex < 0) {
		throw createError(4004, '任务不存在')
	}
	db.tasks.splice(targetIndex, 1)
	saveDb(db)
	return { success: true }
}

export function getCurrentSessionMock() {
	const db = loadDb()
	return clone(getCurrentSessionRecord(db))
}

export function getFocusHistoryMock(params) {
	const db = loadDb()
	const options = params || {}
	let list = db.sessions.slice()
	if (options.taskId) {
		list = list.filter(item => Number(item.taskId) === Number(options.taskId))
	}
	if (options.sessionType) {
		list = list.filter(item => item.sessionType === options.sessionType)
	}
	list = list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
	return paginate(clone(list), Number(options.pageNo || 1), Number(options.pageSize || 20))
}

export function startFocusSessionMock(payload) {
	const db = loadDb()
	if (getCurrentSessionRecord(db)) {
		throw createError(4090, '已有运行中的专注流程')
	}
	if (payload.sessionType === 'WORK') {
		if (!payload.taskId) {
			throw createError(4001, '开始专注前需要绑定任务')
		}
		const task = findTask(db, payload.taskId)
		if (!task) {
			throw createError(4004, '任务不存在')
		}
		if (task.status === 'DONE') {
			throw createError(4090, '已完成任务不能继续开启工作专注')
		}
		task.status = 'DOING'
		task.updatedAt = new Date().toISOString()
	}
	const session = {
		id: nextId(db.sessions),
		taskId: payload.taskId || null,
		sessionType: payload.sessionType,
		planMinutes: Number(payload.planMinutes || 25),
		actualMinutes: 0,
		status: 'RUNNING',
		startedAt: new Date().toISOString(),
		endedAt: null,
		pauseSeconds: 0,
		pausedAt: null
	}
	db.sessions.push(session)
	saveDb(db)
	return clone(session)
}

export function pauseFocusSessionMock(id) {
	const db = loadDb()
	const session = db.sessions.find(item => Number(item.id) === Number(id))
	if (!session) {
		throw createError(4004, '专注记录不存在')
	}
	session.status = 'PAUSED'
	session.pausedAt = new Date().toISOString()
	saveDb(db)
	return clone(session)
}

export function resumeFocusSessionMock(id) {
	const db = loadDb()
	const session = db.sessions.find(item => Number(item.id) === Number(id))
	if (!session) {
		throw createError(4004, '专注记录不存在')
	}
	if (session.status === 'PAUSED' && session.pausedAt) {
		session.pauseSeconds += Math.max(0, Math.floor((Date.now() - new Date(session.pausedAt).getTime()) / 1000))
	}
	session.status = 'RUNNING'
	session.pausedAt = null
	saveDb(db)
	return clone(session)
}

export function finishFocusSessionMock(id, payload) {
	const db = loadDb()
	const session = db.sessions.find(item => Number(item.id) === Number(id))
	if (!session) {
		throw createError(4004, '专注记录不存在')
	}
	session.actualMinutes = Math.max(1, Number(payload.actualMinutes || Math.round(getSessionElapsedSeconds(session) / 60) || session.planMinutes || 1))
	session.status = 'COMPLETED'
	session.endedAt = new Date().toISOString()
	if (session.sessionType === 'WORK' && session.taskId) {
		const task = findTask(db, session.taskId)
		if (task) {
			task.completedPomodoros += 1
			task.updatedAt = new Date().toISOString()
		}
	}
	const nextSuggestion = getBreakSuggestion(db)
	saveDb(db)
	return Object.assign(clone(session), {
		nextSuggestion: nextSuggestion
	})
}

export function interruptFocusSessionMock(id) {
	const db = loadDb()
	const session = db.sessions.find(item => Number(item.id) === Number(id))
	if (!session) {
		throw createError(4004, '专注记录不存在')
	}
	session.actualMinutes = Math.max(0, Math.round(getSessionElapsedSeconds(session) / 60))
	session.status = 'INTERRUPTED'
	session.endedAt = new Date().toISOString()
	saveDb(db)
	return clone(session)
}

export function getStatsOverviewMock(params) {
	const db = loadDb()
	const range = (params && params.range) || 'today'
	const rangeDays = getRangeDaysByOverview(range)
	const keySet = buildRangeKeySet(rangeDays)
	const workSessions = getWorkSessions(db).filter(item => keySet.has(getDateKey(item.endedAt || item.startedAt)))
	const focusMinutes = workSessions.reduce((sum, item) => sum + Number(item.actualMinutes || item.planMinutes || 0), 0)
	const pomodoroCount = workSessions.length
	const completedTaskCount = db.tasks.filter(item => item.completedAt && keySet.has(getDateKey(item.completedAt))).length
	const totalTaskCount = (range === 'today' ? db.tasks.filter(item => item.todayFlag) : db.tasks).filter(item => item.status !== 'ARCHIVED').length
	const completionRate = totalTaskCount ? Number((completedTaskCount / totalTaskCount).toFixed(2)) : 0
	return {
		focusMinutes: focusMinutes,
		pomodoroCount: pomodoroCount,
		completedTaskCount: completedTaskCount,
		completionRate: completionRate,
		continuousDays: getContinuousDays(db)
	}
}

export function getStatsTrendMock(params) {
	const db = loadDb()
	const range = (params && params.range) || '7d'
	const days = range === '30d' ? 30 : 7
	const dayList = getLastNDays(days)
	const points = dayList.map(item => {
		const matches = getWorkSessions(db).filter(session => getDateKey(session.endedAt || session.startedAt) === item.key)
		return {
			date: item.key,
			label: item.label,
			focusMinutes: matches.reduce((sum, session) => sum + Number(session.actualMinutes || session.planMinutes || 0), 0),
			pomodoroCount: matches.length
		}
	})
	return {
		points: points
	}
}

export function getSettingsMock() {
	const db = loadDb()
	return clone(db.settings)
}

export function updateSettingsMock(payload) {
	const db = loadDb()
	db.settings = Object.assign({}, db.settings, payload || {})
	saveDb(db)
	return clone(db.settings)
}
