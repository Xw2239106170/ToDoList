import Vue from 'vue'
import {
	listTasks,
	createTask,
	updateTask,
	updateTaskStatus,
	updateTaskTodayFlag,
	reorderTasks,
	deleteTask
} from '../api/tasks'
import {
	getCurrentSession,
	startFocusSession,
	pauseFocusSession,
	resumeFocusSession,
	finishFocusSession,
	interruptFocusSession
} from '../api/focus'
import { getStatsOverview, getStatsTrend } from '../api/stats'
import { getSettings, updateSettings } from '../api/settings'
import { getSessionElapsedSeconds } from '../utils/time'

const SELECTED_TASK_KEY = 'pomodoro.todo.selected-task-id'

function defaultOverview() {
	return {
		focusMinutes: 0,
		pomodoroCount: 0,
		completedTaskCount: 0,
		completionRate: 0,
		continuousDays: 0
	}
}

function defaultSettings() {
	return {
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
}

const state = Vue.observable({
	ready: false,
	loading: false,
	taskFilter: 'today',
	tasks: [],
	currentSession: null,
	overview: defaultOverview(),
	trend: [],
	settings: defaultSettings(),
	selectedTaskId: null,
	recommendedSessionType: 'SHORT_BREAK',
	lastCompletedSession: null
})

function showError(error, fallback) {
	uni.showToast({
		title: (error && error.message) || fallback,
		icon: 'none'
	})
}

function persistSelectedTask(id) {
	if (id) {
		uni.setStorageSync(SELECTED_TASK_KEY, Number(id))
		return
	}
	uni.removeStorageSync(SELECTED_TASK_KEY)
}

function loadSelectedTask() {
	const value = uni.getStorageSync(SELECTED_TASK_KEY)
	return value ? Number(value) : null
}

function syncSelectedTask() {
	if (state.currentSession && state.currentSession.taskId) {
		state.selectedTaskId = Number(state.currentSession.taskId)
		persistSelectedTask(state.selectedTaskId)
		return
	}
	const currentExists = state.tasks.some(item => Number(item.id) === Number(state.selectedTaskId))
	if (currentExists) {
		persistSelectedTask(state.selectedTaskId)
		return
	}
	const savedId = loadSelectedTask()
	const savedExists = state.tasks.some(item => Number(item.id) === Number(savedId))
	if (savedExists) {
		state.selectedTaskId = Number(savedId)
		persistSelectedTask(state.selectedTaskId)
		return
	}
	const todayTask = state.tasks.find(item => item.todayFlag && item.status !== 'DONE' && item.status !== 'ARCHIVED')
	const fallbackTask = todayTask || state.tasks.find(item => item.status !== 'ARCHIVED') || null
	state.selectedTaskId = fallbackTask ? Number(fallbackTask.id) : null
	persistSelectedTask(state.selectedTaskId)
}

function getMinutesByType(sessionType) {
	if (sessionType === 'LONG_BREAK') {
		return state.settings.longBreakMinutes
	}
	if (sessionType === 'SHORT_BREAK') {
		return state.settings.shortBreakMinutes
	}
	return state.settings.focusMinutes
}

function getTaskFocusMinutes(taskId) {
	const task = state.tasks.find(item => Number(item.id) === Number(taskId))
	if (!task) {
		return state.settings.focusMinutes
	}
	return Math.max(5, Number(task.durationMinutes || state.settings.focusMinutes || 25))
}

function buildReorderItems(list) {
	return list.map((item, index) => ({
		id: item.id,
		sortOrder: (index + 1) * 10
	}))
}

const store = {
	state: state,

	async bootstrap() {
		if (state.loading) {
			return state
		}
		state.loading = true
		try {
			await Promise.all([
				this.refreshSettings(),
				this.refreshTasks(),
				this.refreshCurrentSession(),
				this.refreshOverview(),
				this.refreshTrend()
			])
			syncSelectedTask()
			state.ready = true
			return state
		} catch (error) {
			showError(error, '初始化失败')
			throw error
		} finally {
			state.loading = false
		}
	},

	setTaskFilter(filter) {
		state.taskFilter = filter
	},

	selectTask(id) {
		state.selectedTaskId = id ? Number(id) : null
		persistSelectedTask(state.selectedTaskId)
	},

	getSelectedTask() {
		return state.tasks.find(item => Number(item.id) === Number(state.selectedTaskId)) || null
	},

	getVisibleTasks() {
		const baseList = state.tasks.filter(item => item.status !== 'ARCHIVED')
		if (state.taskFilter === 'today') {
			return baseList.filter(item => item.todayFlag)
		}
		return baseList
	},

	async refreshTasks() {
		const result = await listTasks({
			pageNo: 1,
			pageSize: 200,
			sortBy: 'sortOrder'
		})
		state.tasks = result.list || []
		syncSelectedTask()
		return state.tasks
	},

	async refreshCurrentSession() {
		state.currentSession = await getCurrentSession()
		syncSelectedTask()
		return state.currentSession
	},

	async refreshOverview() {
		state.overview = await getStatsOverview({
			range: 'today'
		})
		return state.overview
	},

	async refreshTrend() {
		const result = await getStatsTrend({
			range: '7d'
		})
		state.trend = result.points || []
		return state.trend
	},

	async refreshSettings() {
		state.settings = await getSettings()
		return state.settings
	},

	async quickAddTask(title, durationMinutes) {
		try {
			const task = await createTask({
				title: title,
				note: '',
				priority: 'MEDIUM',
				category: '',
				tags: [],
				dueDate: '',
				durationMinutes: Math.max(5, Number(durationMinutes || 25)),
				estimatePomodoros: 1,
				todayFlag: true
			})
			this.selectTask(task.id)
			await Promise.all([this.refreshTasks(), this.refreshOverview(), this.refreshTrend()])
			return task
		} catch (error) {
			showError(error, '添加任务失败')
			throw error
		}
	},

	async saveTask(payload) {
		try {
			let task = null
			if (payload.id) {
				task = await updateTask(payload.id, payload)
			} else {
				task = await createTask(payload)
			}
			this.selectTask(task.id)
			await Promise.all([this.refreshTasks(), this.refreshOverview(), this.refreshTrend()])
			return task
		} catch (error) {
			showError(error, '保存任务失败')
			throw error
		}
	},

	async toggleTaskDone(task) {
		try {
			const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE'
			await updateTaskStatus(task.id, {
				status: nextStatus
			})
			await Promise.all([this.refreshTasks(), this.refreshOverview(), this.refreshTrend()])
		} catch (error) {
			showError(error, '更新任务状态失败')
			throw error
		}
	},

	async toggleTodayFlag(task) {
		try {
			await updateTaskTodayFlag(task.id, {
				todayFlag: !task.todayFlag
			})
			await Promise.all([this.refreshTasks(), this.refreshOverview()])
		} catch (error) {
			showError(error, '更新今日任务失败')
			throw error
		}
	},

	async moveTask(id, direction) {
		const list = state.tasks.slice()
		const currentIndex = list.findIndex(item => Number(item.id) === Number(id))
		if (currentIndex < 0) {
			return
		}
		const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
		if (targetIndex < 0 || targetIndex >= list.length) {
			return
		}
		const temp = list[currentIndex]
		list[currentIndex] = list[targetIndex]
		list[targetIndex] = temp
		try {
			await reorderTasks({
				items: buildReorderItems(list)
			})
			await this.refreshTasks()
		} catch (error) {
			showError(error, '调整排序失败')
			throw error
		}
	},

	async removeTask(id) {
		try {
			await deleteTask(id)
			if (Number(state.selectedTaskId) === Number(id)) {
				this.selectTask(null)
			}
			await Promise.all([this.refreshTasks(), this.refreshOverview(), this.refreshTrend()])
		} catch (error) {
			showError(error, '删除任务失败')
			throw error
		}
	},

	async startSession(options) {
		const sessionType = options.sessionType || 'WORK'
		const taskId = sessionType === 'WORK' ? Number(options.taskId || state.selectedTaskId || 0) : null
		try {
			const session = await startFocusSession({
				taskId: taskId || null,
				sessionType: sessionType,
				planMinutes: sessionType === 'WORK' ? getTaskFocusMinutes(taskId) : getMinutesByType(sessionType)
			})
			state.currentSession = session
			state.lastCompletedSession = null
			if (taskId) {
				this.selectTask(taskId)
			}
			await Promise.all([this.refreshTasks(), this.refreshOverview(), this.refreshTrend()])
			return session
		} catch (error) {
			showError(error, '开启专注失败')
			throw error
		}
	},

	async startTaskFocusNow(taskId) {
		if (state.currentSession) {
			this.selectTask(taskId)
			return state.currentSession
		}
		this.selectTask(taskId)
		return this.startSession({
			taskId: taskId,
			sessionType: 'WORK'
		})
	},

	async pauseSession() {
		if (!state.currentSession) {
			return null
		}
		try {
			state.currentSession = await pauseFocusSession(state.currentSession.id)
			return state.currentSession
		} catch (error) {
			showError(error, '暂停失败')
			throw error
		}
	},

	async resumeSession() {
		if (!state.currentSession) {
			return null
		}
		try {
			state.currentSession = await resumeFocusSession(state.currentSession.id)
			return state.currentSession
		} catch (error) {
			showError(error, '继续失败')
			throw error
		}
	},

	async finishSession() {
		if (!state.currentSession) {
			return null
		}
		try {
			const completed = await finishFocusSession(state.currentSession.id, {
				actualMinutes: Math.max(1, Math.round(getSessionElapsedSeconds(state.currentSession) / 60))
			})
			state.currentSession = null
			state.lastCompletedSession = completed
			state.recommendedSessionType = completed.nextSuggestion || 'SHORT_BREAK'
			await Promise.all([this.refreshCurrentSession(), this.refreshTasks(), this.refreshOverview(), this.refreshTrend()])
			return completed
		} catch (error) {
			showError(error, '完成专注失败')
			throw error
		}
	},

	async interruptSession() {
		if (!state.currentSession) {
			return null
		}
		try {
			const interrupted = await interruptFocusSession(state.currentSession.id, {
				reason: 'USER_CANCEL'
			})
			state.currentSession = null
			state.lastCompletedSession = interrupted
			await Promise.all([this.refreshCurrentSession(), this.refreshTasks(), this.refreshOverview(), this.refreshTrend()])
			return interrupted
		} catch (error) {
			showError(error, '中断专注失败')
			throw error
		}
	},

	async saveSettings(payload) {
		try {
			state.settings = await updateSettings(payload)
			return state.settings
		} catch (error) {
			showError(error, '保存设置失败')
			throw error
		}
	}
}

export default store
