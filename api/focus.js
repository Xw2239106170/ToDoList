import { runWithAdapter } from './http'
import {
	getCurrentSessionMock,
	getFocusHistoryMock,
	startFocusSessionMock,
	pauseFocusSessionMock,
	resumeFocusSessionMock,
	finishFocusSessionMock,
	interruptFocusSessionMock
} from './mock-db'

export function getCurrentSession() {
	return runWithAdapter(
		() => getCurrentSessionMock(),
		{ url: '/focus-sessions/current', method: 'GET' }
	)
}

export function getFocusHistory(params) {
	return runWithAdapter(
		() => getFocusHistoryMock(params),
		{ url: '/focus-sessions/history', method: 'GET', data: params }
	)
}

export function startFocusSession(payload) {
	return runWithAdapter(
		() => startFocusSessionMock(payload),
		{ url: '/focus-sessions/start', method: 'POST', data: payload }
	)
}

export function pauseFocusSession(id) {
	return runWithAdapter(
		() => pauseFocusSessionMock(id),
		{ url: '/focus-sessions/' + id + '/pause', method: 'POST' }
	)
}

export function resumeFocusSession(id) {
	return runWithAdapter(
		() => resumeFocusSessionMock(id),
		{ url: '/focus-sessions/' + id + '/resume', method: 'POST' }
	)
}

export function finishFocusSession(id, payload) {
	return runWithAdapter(
		() => finishFocusSessionMock(id, payload),
		{ url: '/focus-sessions/' + id + '/finish', method: 'POST', data: payload }
	)
}

export function interruptFocusSession(id, payload) {
	return runWithAdapter(
		() => interruptFocusSessionMock(id, payload),
		{ url: '/focus-sessions/' + id + '/interrupt', method: 'POST', data: payload }
	)
}
