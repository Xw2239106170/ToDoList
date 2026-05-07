<template>
	<view class="page-shell edit-page">
		<view>
			<text class="page-heading">{{ isEdit ? '编辑任务' : '新建任务' }}</text>
			<text class="page-subtitle">把任务描述得再清楚一点，后面执行起来会轻松很多。</text>
		</view>

		<view class="section-card form-card">
			<text class="label">任务标题</text>
			<input
				v-model="form.title"
				class="text-input"
				maxlength="40"
				placeholder="例如：完成专注页布局"
				placeholder-class="placeholder"
			/>

			<text class="label">备注</text>
			<textarea
				v-model="form.note"
				class="textarea-input"
				maxlength="200"
				placeholder="补充一点上下文，让未来的自己更快进入状态"
				placeholder-class="placeholder"
			></textarea>

			<text class="label">优先级</text>
			<view class="option-row">
				<view
					v-for="item in priorities"
					:key="item.value"
					class="option-pill"
					:class="{ active: form.priority === item.value }"
					@click="form.priority = item.value"
				>
					{{ item.label }}
				</view>
			</view>

			<text class="label">分类</text>
			<input
				v-model="form.category"
				class="text-input"
				maxlength="20"
				placeholder="例如：前端 / 学习 / 工作"
				placeholder-class="placeholder"
			/>

			<text class="label">标签</text>
			<input
				v-model="tagText"
				class="text-input"
				maxlength="60"
				placeholder="用英文逗号分隔，例如：专注, MVP"
				placeholder-class="placeholder"
			/>

			<text class="label">截止日期</text>
			<view class="picker-row">
				<picker mode="date" :value="form.dueDate" @change="handleDateChange">
					<view class="picker-value">{{ form.dueDate || '选择日期' }}</view>
				</picker>
				<view v-if="form.dueDate" class="ghost-pill clear-btn" @click="form.dueDate = ''">清除</view>
			</view>

			<text class="label">任务持续时间</text>
			<view class="stepper-row">
				<view class="stepper-btn" @click="changeDuration(-5)">-</view>
				<view class="stepper-value long">{{ form.durationMinutes }} 分钟</view>
				<view class="stepper-btn" @click="changeDuration(5)">+</view>
			</view>

			<text class="label">预计番茄数</text>
			<view class="stepper-row">
				<view class="stepper-btn" @click="changeEstimate(-1)">-</view>
				<view class="stepper-value">{{ form.estimatePomodoros }}</view>
				<view class="stepper-btn" @click="changeEstimate(1)">+</view>
			</view>

			<text class="label">加入今日专注</text>
			<view class="option-row">
				<view class="option-pill" :class="{ active: form.todayFlag }" @click="form.todayFlag = !form.todayFlag">
					{{ form.todayFlag ? '已加入今日专注' : '暂不加入今日专注' }}
				</view>
			</view>
		</view>

		<view class="action-stack">
			<view class="primary-pill save-btn" @click="saveTask">保存任务</view>
			<view v-if="isEdit" class="delete-btn" @click="removeTask">删除任务</view>
		</view>
	</view>
</template>

<script>
	import store from '../../store'
	import { getTaskDetail } from '../../api/tasks'

	function createForm() {
		return {
			id: null,
			title: '',
			note: '',
			priority: 'MEDIUM',
			category: '',
			tags: [],
			dueDate: '',
			durationMinutes: 25,
			estimatePomodoros: 1,
			todayFlag: true
		}
	}

	export default {
		data() {
			return {
				isEdit: false,
				form: createForm(),
				tagText: '',
				priorities: [
					{ label: '高优先级', value: 'HIGH' },
					{ label: '中优先级', value: 'MEDIUM' },
					{ label: '低优先级', value: 'LOW' }
				]
			}
		},
		onLoad(query) {
			store.bootstrap().then(() => {
				if (query && query.id) {
					this.loadTaskDetail(query.id)
				}
			})
		},
		methods: {
			async loadTaskDetail(id) {
				const localTask = store.state.tasks.find(item => Number(item.id) === Number(id))
				const task = localTask || await getTaskDetail(id)
				if (!task) {
					return
				}
				this.isEdit = true
				this.form = {
					id: task.id,
					title: task.title,
					note: task.note || '',
					priority: task.priority || 'MEDIUM',
					category: task.category || '',
					tags: task.tags || [],
					dueDate: task.dueDate || '',
					durationMinutes: task.durationMinutes || 25,
					estimatePomodoros: task.estimatePomodoros || 1,
					todayFlag: !!task.todayFlag
				}
				this.tagText = (task.tags || []).join(', ')
			},
			handleDateChange(event) {
				this.form.dueDate = event.detail.value
			},
			changeEstimate(step) {
				const nextValue = Number(this.form.estimatePomodoros || 1) + step
				this.form.estimatePomodoros = Math.max(1, nextValue)
			},
			changeDuration(step) {
				const nextValue = Number(this.form.durationMinutes || 25) + step
				this.form.durationMinutes = Math.max(5, nextValue)
			},
			saveTask() {
				const title = (this.form.title || '').trim()
				if (!title) {
					uni.showToast({
						title: '任务标题不能为空',
						icon: 'none'
					})
					return
				}
				const payload = Object.assign({}, this.form, {
					title: title,
					tags: (this.tagText || '')
						.split(',')
						.map(item => item.trim())
						.filter(Boolean)
				})
				store.saveTask(payload).then(() => {
					uni.showToast({
						title: '任务已保存',
						icon: 'none'
					})
					this.backToHome()
				})
			},
			removeTask() {
				uni.showModal({
					title: '删除任务',
					content: '删除后将无法恢复，确认继续吗？',
					success: result => {
						if (result.confirm) {
							store.removeTask(this.form.id).then(() => {
								this.backToHome()
							})
						}
					}
				})
			},
			backToHome() {
				const pages = getCurrentPages()
				if (pages.length > 1) {
					uni.navigateBack()
					return
				}
				uni.reLaunch({
					url: '/pages/index/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.form-card {
		margin-top: 24rpx;
	}

	.label {
		display: block;
		margin-bottom: 12rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: $text-secondary;
	}

	.text-input,
	.textarea-input,
	.picker-value {
		width: 100%;
		background: rgba(118, 118, 128, 0.08);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
		border-radius: 22rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
		color: $text-primary;
	}

	.text-input,
	.picker-value {
		height: 92rpx;
		line-height: 92rpx;
	}

	.textarea-input {
		height: 180rpx;
		padding-top: 24rpx;
	}

	.placeholder {
		color: $text-tertiary;
	}

	.label:not(:first-child) {
		margin-top: 26rpx;
	}

	.option-row {
		display: flex;
		flex-wrap: wrap;
		gap: 14rpx;
	}

	.option-pill {
		padding: 18rpx 24rpx;
		border-radius: 999rpx;
		background: rgba(118, 118, 128, 0.1);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
		color: $text-primary;
		font-size: 24rpx;
		font-weight: 600;
	}

	.option-pill.active {
		background: rgba(0, 122, 255, 0.1);
		border-color: rgba(0, 122, 255, 0.14);
		color: $brand-primary;
	}

	.picker-row {
		display: flex;
		align-items: center;
	}

	.picker-row picker {
		flex: 1;
	}

	.clear-btn {
		margin-left: 16rpx;
		flex-shrink: 0;
		height: 72rpx;
	}

	.stepper-row {
		display: inline-flex;
		align-items: center;
		padding: 10rpx;
		border-radius: 999rpx;
		background: rgba(118, 118, 128, 0.12);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.stepper-btn,
	.stepper-value {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 68rpx;
	}

	.stepper-btn {
		width: 68rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.92);
		font-size: 34rpx;
		color: $text-primary;
	}

	.stepper-value {
		min-width: 110rpx;
		font-size: 28rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.stepper-value.long {
		min-width: 180rpx;
	}

	.action-stack {
		margin-top: 30rpx;
	}

	.save-btn {
		width: 100%;
	}

	.delete-btn {
		margin-top: 20rpx;
		height: 84rpx;
		border-radius: 999rpx;
		background: rgba(255, 255, 255, 0.9);
		border: 1rpx solid rgba(255, 59, 48, 0.14);
		color: $brand-danger;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		font-weight: 600;
	}
</style>
