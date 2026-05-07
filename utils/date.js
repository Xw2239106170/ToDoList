export function padNumber(value) {
	return value < 10 ? '0' + value : '' + value
}

export function getDateKey(input) {
	const date = input ? new Date(input) : new Date()
	return [
		date.getFullYear(),
		padNumber(date.getMonth() + 1),
		padNumber(date.getDate())
	].join('-')
}

export function isSameDay(a, b) {
	return getDateKey(a) === getDateKey(b)
}

export function formatMonthDay(input) {
	const date = input ? new Date(input) : new Date()
	return date.getMonth() + 1 + '月' + date.getDate() + '日'
}

export function formatDateLabel(input) {
	const date = input ? new Date(input) : new Date()
	const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
	return formatMonthDay(date) + ' ' + weekdays[date.getDay()]
}

export function getGreeting() {
	const hour = new Date().getHours()
	if (hour < 6) {
		return '夜深了，也可以慢慢开始'
	}
	if (hour < 12) {
		return '早上好，先完成最重要的一件事'
	}
	if (hour < 18) {
		return '下午好，继续把节奏稳住'
	}
	return '晚上好，收尾也值得认真对待'
}

export function getDayDiff(input) {
	const now = new Date()
	const current = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
	const targetDate = new Date(input)
	const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime()
	return Math.round((target - current) / 86400000)
}

export function formatDueDate(input) {
	if (!input) {
		return '未设置截止日期'
	}
	const diff = getDayDiff(input)
	if (diff === 0) {
		return '今天截止'
	}
	if (diff === 1) {
		return '明天截止'
	}
	if (diff < 0) {
		return '已逾期 ' + Math.abs(diff) + ' 天'
	}
	return formatMonthDay(input) + ' 截止'
}

export function getLastNDays(days) {
	const list = []
	const now = new Date()
	for (let index = days - 1; index >= 0; index -= 1) {
		const date = new Date(now)
		date.setDate(now.getDate() - index)
		list.push({
			key: getDateKey(date),
			label: date.getMonth() + 1 + '/' + date.getDate()
		})
	}
	return list
}
