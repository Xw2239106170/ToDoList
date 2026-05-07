import { runWithAdapter } from './http'
import { getSettingsMock, updateSettingsMock } from './mock-db'

export function getSettings() {
	return runWithAdapter(
		() => getSettingsMock(),
		{ url: '/settings', method: 'GET' }
	)
}

export function updateSettings(payload) {
	return runWithAdapter(
		() => updateSettingsMock(payload),
		{ url: '/settings', method: 'PUT', data: payload }
	)
}
