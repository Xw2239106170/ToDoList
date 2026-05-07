import { runWithAdapter } from './http'
import {
	listTasksMock,
	getTaskDetailMock,
	createTaskMock,
	updateTaskMock,
	updateTaskStatusMock,
	updateTaskTodayFlagMock,
	reorderTasksMock,
	deleteTaskMock
} from './mock-db'

export function listTasks(params) {
	return runWithAdapter(
		() => listTasksMock(params),
		{ url: '/tasks', method: 'GET', data: params }
	)
}

export function getTaskDetail(id) {
	return runWithAdapter(
		() => getTaskDetailMock(id),
		{ url: '/tasks/' + id, method: 'GET' }
	)
}

export function createTask(payload) {
	return runWithAdapter(
		() => createTaskMock(payload),
		{ url: '/tasks', method: 'POST', data: payload }
	)
}

export function updateTask(id, payload) {
	return runWithAdapter(
		() => updateTaskMock(id, payload),
		{ url: '/tasks/' + id, method: 'PUT', data: payload }
	)
}

export function updateTaskStatus(id, payload) {
	return runWithAdapter(
		() => updateTaskStatusMock(id, payload.status),
		{ url: '/tasks/' + id + '/status', method: 'PATCH', data: payload }
	)
}

export function updateTaskTodayFlag(id, payload) {
	return runWithAdapter(
		() => updateTaskTodayFlagMock(id, payload.todayFlag),
		{ url: '/tasks/' + id + '/today-flag', method: 'PATCH', data: payload }
	)
}

export function reorderTasks(payload) {
	return runWithAdapter(
		() => reorderTasksMock(payload),
		{ url: '/tasks/reorder', method: 'POST', data: payload }
	)
}

export function deleteTask(id) {
	return runWithAdapter(
		() => deleteTaskMock(id),
		{ url: '/tasks/' + id, method: 'DELETE' }
	)
}
