const BASE_URL = 'http://127.0.0.1:8080/api/v1'
const USE_MOCK = true

export function request(options) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			timeout: options.timeout || 10000,
			success(response) {
				const payload = response.data || {}
				if (payload.code === 0) {
					resolve(payload.data)
					return
				}
				const error = new Error(payload.message || '请求失败')
				error.code = payload.code || 5000
				reject(error)
			},
			fail(error) {
				reject(error)
			}
		})
	})
}

export function runWithAdapter(mockHandler, requestOptions) {
	if (USE_MOCK) {
		return Promise.resolve().then(mockHandler)
	}
	return request(requestOptions)
}
