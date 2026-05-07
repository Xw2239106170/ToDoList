export function padTime(value) {
	return value < 10 ? '0' + value : '' + value
}

export function formatClock(totalSeconds) {
	const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0))
	const minutes = Math.floor(safeSeconds / 60)
	const seconds = safeSeconds % 60
	return padTime(minutes) + ':' + padTime(seconds)
}

export function formatMinutes(minutes) {
	const safeMinutes = Math.max(0, Math.round(minutes || 0))
	if (safeMinutes >= 60) {
		const hours = Math.floor(safeMinutes / 60)
		const remain = safeMinutes % 60
		return remain ? hours + '小时 ' + remain + '分钟' : hours + '小时'
	}
	return safeMinutes + ' 分钟'
}

export function getSessionElapsedSeconds(session, now) {
	if (!session || !session.startedAt) {
		return 0
	}
	const current = now || Date.now()
	const startedAt = new Date(session.startedAt).getTime()
	let endAt = current
	if (session.status === 'PAUSED' && session.pausedAt) {
		endAt = new Date(session.pausedAt).getTime()
	}
	if ((session.status === 'COMPLETED' || session.status === 'INTERRUPTED' || session.status === 'SKIPPED') && session.endedAt) {
		endAt = new Date(session.endedAt).getTime()
	}
	const pauseSeconds = session.pauseSeconds || 0
	return Math.max(0, Math.floor((endAt - startedAt) / 1000) - pauseSeconds)
}

export function getSessionTotalSeconds(session) {
	return (session && session.planMinutes ? session.planMinutes : 0) * 60
}

export function getSessionRemainingSeconds(session, now) {
	return Math.max(0, getSessionTotalSeconds(session) - getSessionElapsedSeconds(session, now))
}

export function getSessionProgress(session, now) {
	const total = getSessionTotalSeconds(session)
	if (!total) {
		return 0
	}
	return Math.min(1, getSessionElapsedSeconds(session, now) / total)
}
