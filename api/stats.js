import { runWithAdapter } from './http'
import { getStatsOverviewMock, getStatsTrendMock } from './mock-db'

export function getStatsOverview(params) {
	return runWithAdapter(
		() => getStatsOverviewMock(params),
		{ url: '/stats/overview', method: 'GET', data: params }
	)
}

export function getStatsTrend(params) {
	return runWithAdapter(
		() => getStatsTrendMock(params),
		{ url: '/stats/trend', method: 'GET', data: params }
	)
}
