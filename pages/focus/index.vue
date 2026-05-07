<template>
	<view class="page-shell focus-page">
		<view>
			<text class="page-heading">保持节奏</text>
			<text class="page-subtitle">{{ subtitle }}</text>
		</view>

		<view v-if="storeState.currentSession" class="section-card focus-session-card">
			<view class="session-task">
				<text class="session-kicker">{{ stageLabel }}</text>
				<text class="session-title">{{ currentTask ? currentTask.title : restTitle }}</text>
				<text class="session-desc">{{ currentTask ? currentTask.note || '现在只做这一件事。' : '给大脑一点恢复空间，下一轮会更稳。' }}</text>
			</view>

			<focus-clock
				:remaining-seconds="remainingSeconds"
				:total-seconds="totalSeconds"
				:stage-label="stageLabel"
				:status="storeState.currentSession.status"
			></focus-clock>

			<view class="session-stats">
				<view class="session-stat">
					<text class="session-stat-value">{{ storeState.overview.pomodoroCount }}</text>
					<text class="session-stat-label">今日完成番茄</text>
				</view>
				<view class="session-stat">
					<text class="session-stat-value">{{ storeState.overview.focusMinutes }}</text>
					<text class="session-stat-label">今日专注分钟</text>
				</view>
				<view class="session-stat" v-if="currentTask">
					<text class="session-stat-value">{{ currentTask.completedPomodoros }}/{{ currentTask.estimatePomodoros }}</text>
					<text class="session-stat-label">任务进度</text>
				</view>
			</view>

			<view class="control-row">
				<view v-if="storeState.currentSession.status === 'RUNNING'" class="ghost-pill control-btn" @click="pauseSession">暂停</view>
				<view v-if="storeState.currentSession.status === 'PAUSED'" class="ghost-pill control-btn" @click="resumeSession">继续</view>
				<view class="primary-pill control-btn strong" @click="finishSession">完成</view>
			</view>

			<view class="interrupt-btn" @click="interruptSession">放弃本轮</view>
		</view>

		<view v-else class="section-card idle-card">
			<text class="section-title">开始下一轮</text>
			<text class="section-desc">选择一个任务进入专注，或者先休息几分钟再回来。</text>

			<view v-if="selectedTask" class="selected-task">
				<text class="selected-task-title">{{ selectedTask.title }}</text>
				<text class="selected-task-desc">预计 {{ selectedTask.estimatePomodoros }} 个番茄，已完成 {{ selectedTask.completedPomodoros }} 个。</text>
			</view>

			<view class="start-row">
				<view class="primary-pill start-btn" @click="startWork">开始专注</view>
				<view class="soft-pill start-btn" @click="startBreak('SHORT_BREAK')">短休息</view>
				<view class="soft-pill start-btn" @click="startBreak('LONG_BREAK')">长休息</view>
			</view>

			<view v-if="storeState.lastCompletedSession" class="suggest-card">
				<text class="suggest-label">建议下一步</text>
				<text class="suggest-value">{{ recommendedLabel }}</text>
			</view>
		</view>

		<view class="section-card candidate-card">
			<text class="section-title">今日任务</text>
			<text class="section-desc">先选中一个，再开始专注会更顺手。</text>
			<view class="candidate-list">
				<view
					v-for="task in focusCandidates"
					:key="task.id"
					class="candidate-item"
					:class="{ active: Number(storeState.selectedTaskId) === Number(task.id) }"
					@click="selectTask(task.id)"
				>
					<text class="candidate-title">{{ task.title }}</text>
					<text class="candidate-meta">{{ task.completedPomodoros }}/{{ task.estimatePomodoros }} 个番茄</text>
				</view>
			</view>
		</view>

		<app-tabbar current="focus"></app-tabbar>
	</view>
</template>

<script>
	import store from '../../store'
	import AppTabbar from '../../components/app-tabbar.vue'
	import FocusClock from '../../components/focus-clock.vue'
	import { getSessionRemainingSeconds, getSessionTotalSeconds } from '../../utils/time'

	export default {
		components: {
			AppTabbar,
			FocusClock
		},
		data() {
			return {
				storeState: store.state,
				nowTick: Date.now(),
				timer: null,
				autoFinishing: false
			}
		},
		computed: {
			selectedTask() {
				return store.getSelectedTask()
			},
			currentTask() {
				if (!this.storeState.currentSession) {
					return this.selectedTask
				}
				if (!this.storeState.currentSession.taskId) {
					return null
				}
				return this.storeState.tasks.find(item => Number(item.id) === Number(this.storeState.currentSession.taskId)) || null
			},
			focusCandidates() {
				return this.storeState.tasks.filter(item => item.todayFlag && item.status !== 'DONE').slice(0, 6)
			},
			remainingSeconds() {
				if (!this.storeState.currentSession) {
					return 0
				}
				return getSessionRemainingSeconds(this.storeState.currentSession, this.nowTick)
			},
			totalSeconds() {
				return this.storeState.currentSession ? getSessionTotalSeconds(this.storeState.currentSession) : 0
			},
			stageLabel() {
				const sessionType = this.storeState.currentSession ? this.storeState.currentSession.sessionType : 'WORK'
				return {
					WORK: '工作专注',
					SHORT_BREAK: '短休息',
					LONG_BREAK: '长休息'
				}[sessionType] || '工作专注'
			},
			recommendedLabel() {
				return this.storeState.recommendedSessionType === 'LONG_BREAK' ? '建议来一轮长休息' : '建议先短暂休息一下'
			},
			subtitle() {
				if (this.storeState.currentSession) {
					return '把注意力留给眼前这一件事。'
				}
				if (this.selectedTask) {
					return '当前已选任务：' + this.selectedTask.title
				}
				return '没有进行中的 session，可以从今日任务里选一个开始。'
			},
			restTitle() {
				return this.stageLabel === '长休息' ? '长休息时间' : '短休息时间'
			}
		},
		onShow() {
			store.bootstrap()
			this.startTicker()
		},
		onHide() {
			this.stopTicker()
		},
		onUnload() {
			this.stopTicker()
		},
		onPullDownRefresh() {
			store.bootstrap().finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		methods: {
			startTicker() {
				this.stopTicker()
				this.timer = setInterval(() => {
					this.nowTick = Date.now()
					if (
						this.storeState.currentSession &&
						this.storeState.currentSession.status === 'RUNNING' &&
						this.remainingSeconds <= 0 &&
						!this.autoFinishing
					) {
						this.autoFinishing = true
						this.finishSession().finally(() => {
							this.autoFinishing = false
						})
					}
				}, 1000)
			},
			stopTicker() {
				if (this.timer) {
					clearInterval(this.timer)
					this.timer = null
				}
			},
			selectTask(id) {
				store.selectTask(id)
			},
			startWork() {
				if (!this.selectedTask) {
					uni.showToast({
						title: '先选择一个任务',
						icon: 'none'
					})
					return
				}
				store.startSession({
					taskId: this.selectedTask.id,
					sessionType: 'WORK'
				})
			},
			startBreak(type) {
				store.startSession({
					sessionType: type
				})
			},
			pauseSession() {
				store.pauseSession()
			},
			resumeSession() {
				store.resumeSession()
			},
			finishSession() {
				return store.finishSession().then(() => {
					uni.showToast({
						title: '本轮已完成',
						icon: 'none'
					})
				})
			},
			interruptSession() {
				uni.showModal({
					title: '中断专注',
					content: '确认要放弃这一轮吗？',
					success: result => {
						if (result.confirm) {
							store.interruptSession()
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.focus-session-card,
	.idle-card,
	.candidate-card {
		margin-top: 24rpx;
	}

	.focus-session-card {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 255, 0.92));
	}

	.session-task {
		text-align: center;
	}

	.session-kicker {
		font-size: 24rpx;
		color: $text-secondary;
	}

	.session-title {
		display: block;
		margin-top: 14rpx;
		font-size: 38rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.session-desc {
		display: block;
		margin-top: 12rpx;
		font-size: 24rpx;
		line-height: 1.6;
		color: $text-secondary;
	}

	.session-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 14rpx;
		margin-top: 24rpx;
	}

	.session-stat {
		padding: 20rpx;
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.72);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
		text-align: center;
	}

	.session-stat-value {
		display: block;
		font-size: 34rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.session-stat-label {
		display: block;
		margin-top: 8rpx;
		font-size: 20rpx;
		line-height: 1.5;
		color: $text-secondary;
	}

	.control-row {
		display: flex;
		gap: 16rpx;
		margin-top: 26rpx;
	}

	.control-btn {
		flex: 1;
	}

	.interrupt-btn {
		margin-top: 16rpx;
		height: 76rpx;
		border-radius: 999rpx;
		background: rgba(255, 59, 48, 0.1);
		border: 1rpx solid rgba(255, 59, 48, 0.1);
		color: $brand-danger;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 600;
	}

	.selected-task {
		margin-top: 24rpx;
		padding: 24rpx;
		border-radius: 22rpx;
		background: rgba(118, 118, 128, 0.08);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.selected-task-title {
		display: block;
		font-size: 30rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.selected-task-desc {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		line-height: 1.5;
		color: $text-secondary;
	}

	.start-row {
		display: flex;
		flex-wrap: wrap;
		gap: 14rpx;
		margin-top: 24rpx;
	}

	.start-btn {
		flex: 1;
		min-width: 180rpx;
	}

	.suggest-card {
		margin-top: 24rpx;
		padding: 22rpx 24rpx;
		border-radius: 22rpx;
		background: rgba(0, 122, 255, 0.08);
		border: 1rpx solid rgba(0, 122, 255, 0.08);
	}

	.suggest-label {
		display: block;
		font-size: 22rpx;
		color: $text-secondary;
	}

	.suggest-value {
		display: block;
		margin-top: 10rpx;
		font-size: 28rpx;
		font-weight: 700;
		color: $brand-primary;
	}

	.candidate-list {
		margin-top: 22rpx;
	}

	.candidate-item + .candidate-item {
		margin-top: 14rpx;
	}

	.candidate-item {
		padding: 22rpx;
		border-radius: 22rpx;
		background: rgba(255, 255, 255, 0.76);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.candidate-item.active {
		background: rgba(0, 122, 255, 0.08);
		border-color: rgba(0, 122, 255, 0.14);
	}

	.candidate-title {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: $text-primary;
	}

	.candidate-meta {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		color: $text-secondary;
	}
</style>
