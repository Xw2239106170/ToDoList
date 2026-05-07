<template>
	<view class="page-shell home-page">
		<view class="home-hero" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="hero-top">
				<view>
					<text class="hero-title">待办</text>
					<text class="hero-subtitle">{{ todayLabel }} · {{ greeting }}</text>
				</view>
				<view class="hero-actions">
					<view class="hero-icon-btn" @click="goFocus">
						<text class="hero-icon">◉</text>
					</view>
					<view class="hero-icon-btn strong" @click="goCreateTask">
						<text class="hero-icon">＋</text>
					</view>
					<view class="hero-icon-btn" @click="showMore">
						<text class="hero-icon">⋯</text>
					</view>
				</view>
			</view>

			<view class="hero-quickbar">
				<view class="hero-pill" @click="goFocus">进入专注模式</view>
				<view class="hero-pill light" @click="goCreateTask">添加任务</view>
			</view>
		</view>

		<view class="section-card overview-card">
			<view class="overview-head">
				<view>
					<text class="section-title">今日进度</text>
					<text class="section-desc">把最重要的事情推进一点点，也是在前进。</text>
				</view>
				<view class="progress-badge">{{ goalProgressText }}</view>
			</view>

			<view class="overview-grid">
				<view class="overview-item">
					<text class="overview-value">{{ storeState.overview.focusMinutes }}</text>
					<text class="overview-label">专注分钟</text>
				</view>
				<view class="overview-item">
					<text class="overview-value">{{ storeState.overview.pomodoroCount }}</text>
					<text class="overview-label">完成番茄</text>
				</view>
				<view class="overview-item">
					<text class="overview-value">{{ storeState.overview.completedTaskCount }}</text>
					<text class="overview-label">完成任务</text>
				</view>
				<view class="overview-item">
					<text class="overview-value">{{ storeState.overview.continuousDays }}</text>
					<text class="overview-label">连续专注</text>
				</view>
			</view>

			<view v-if="storeState.currentSession" class="active-session-banner">
				<text class="active-session-text">当前有进行中的专注流程，返回即可继续。</text>
				<view class="ghost-pill banner-btn" @click="goFocus">继续专注</view>
			</view>
		</view>

		<view class="section-card quick-card">
			<text class="section-title">快速新增</text>
			<view class="quick-row">
				<input
					v-model="quickTitle"
					class="quick-input"
					maxlength="40"
					placeholder="写下现在最想完成的一件事"
					placeholder-class="quick-placeholder"
				/>
				<view class="primary-pill quick-btn" @click="handleQuickAdd">添加</view>
			</view>
			<view class="quick-duration-row">
				<text class="quick-duration-label">持续时间</text>
				<view class="quick-stepper">
					<view class="quick-step-btn" @click="changeQuickDuration(-5)">-</view>
					<text class="quick-step-value">{{ quickDuration }} 分钟</text>
					<view class="quick-step-btn" @click="changeQuickDuration(5)">+</view>
				</view>
			</view>
			<text class="section-desc">默认加入今日专注，后面再补充截止日期和备注。</text>
		</view>

		<view class="toolbar-row">
			<view class="segment-wrap">
				<view class="segment-item" :class="{ active: storeState.taskFilter === 'today' }" @click="setFilter('today')">今日待办</view>
				<view class="segment-item" :class="{ active: storeState.taskFilter === 'all' }" @click="setFilter('all')">全部任务</view>
			</view>
			<text class="list-hint">点卡片可编辑，点开始直接专注</text>
		</view>

		<view v-if="visibleTasks.length">
			<task-card
				v-for="(task, index) in visibleTasks"
				:key="task.id"
				:task="task"
				:card-index="index"
				:selected="Number(storeState.selectedTaskId) === Number(task.id)"
				@edit="goEditTask"
				@focus="focusTask"
			/>
		</view>

		<view v-else class="section-card empty-card">
			<text class="section-title">任务列表还是空的</text>
			<text class="section-desc">先写下今天想推进的一件事，列表就会开始动起来。</text>
		</view>

		<view class="floating-focus">
			<view class="floating-copy">
				<text class="floating-title">{{ selectedTask ? selectedTask.title : '先选择一个任务，再开始专注' }}</text>
				<text class="floating-desc">{{ selectedTask ? ((selectedTask.durationMinutes || 25) + ' 分钟') : '你可以从任务卡片里点击开始，或者先添加一个任务。' }}</text>
			</view>
			<view class="primary-pill floating-btn" @click="goFocus">{{ storeState.currentSession ? '回到专注' : '开始专注' }}</view>
		</view>

		<app-tabbar current="home"></app-tabbar>
	</view>
</template>

<script>
	import store from '../../store'
	import TaskCard from '../../components/task-card.vue'
	import AppTabbar from '../../components/app-tabbar.vue'
	import { formatDateLabel, getGreeting } from '../../utils/date'

	export default {
		components: {
			TaskCard,
			AppTabbar
		},
		data() {
			return {
				storeState: store.state,
				quickTitle: '',
				quickDuration: 25,
				statusBarHeight: 0
			}
		},
		computed: {
			greeting() {
				return getGreeting()
			},
			todayLabel() {
				return formatDateLabel()
			},
			visibleTasks() {
				return store.getVisibleTasks()
			},
			selectedTask() {
				return store.getSelectedTask()
			},
			goalProgressText() {
				const goalMinutes = this.storeState.settings.dailyGoalMinutes || 1
				const current = this.storeState.overview.focusMinutes || 0
				const rate = Math.min(100, Math.round(current / goalMinutes * 100))
				return '目标完成 ' + rate + '%'
			}
		},
		onShow() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 0
			store.bootstrap()
		},
		onPullDownRefresh() {
			store.bootstrap().finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		methods: {
			setFilter(filter) {
				store.setTaskFilter(filter)
			},
			handleQuickAdd() {
				const title = (this.quickTitle || '').trim()
				if (!title) {
					uni.showToast({
						title: '先输入任务标题',
						icon: 'none'
					})
					return
				}
				store.quickAddTask(title, this.quickDuration).then(() => {
					this.quickTitle = ''
					this.quickDuration = 25
					uni.showToast({
						title: '任务已加入今日专注',
						icon: 'none'
					})
				})
			},
			changeQuickDuration(step) {
				const nextValue = Number(this.quickDuration || 25) + step
				this.quickDuration = Math.max(5, nextValue)
			},
			goCreateTask() {
				uni.navigateTo({
					url: '/pages/task/edit'
				})
			},
			goEditTask(id) {
				uni.navigateTo({
					url: '/pages/task/edit?id=' + id
				})
			},
			focusTask(id) {
				store.startTaskFocusNow(id).then(() => {
					uni.reLaunch({
						url: '/pages/focus/index'
					})
				})
			},
			goFocus() {
				if (!this.storeState.currentSession && !this.selectedTask) {
					uni.showToast({
						title: '请先选择一个任务',
						icon: 'none'
					})
					return
				}
				uni.reLaunch({
					url: '/pages/focus/index'
				})
			},
			showMore() {
				uni.showToast({
					title: '更多功能可继续扩展',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.home-hero {
		margin: -32rpx -28rpx 24rpx;
		padding: 0 28rpx 28rpx;
		background: linear-gradient(180deg, #72A6E7 0%, #7AB0EA 38%, #9CC5F3 100%);
		border-bottom-left-radius: 34rpx;
		border-bottom-right-radius: 34rpx;
		box-shadow: 0 18rpx 40rpx rgba(77, 130, 198, 0.18);
	}

	.hero-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding-top: 18rpx;
	}

	.hero-title {
		display: block;
		font-size: 56rpx;
		font-weight: 700;
		line-height: 1.1;
		color: #ffffff;
	}

	.hero-subtitle {
		display: block;
		margin-top: 12rpx;
		font-size: 24rpx;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.88);
	}

	.hero-actions {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}

	.hero-icon-btn {
		width: 72rpx;
		height: 72rpx;
		border-radius: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.16);
		border: 1rpx solid rgba(255, 255, 255, 0.14);
		backdrop-filter: blur(18rpx);
		-webkit-backdrop-filter: blur(18rpx);
	}

	.hero-icon-btn.strong {
		background: rgba(255, 255, 255, 0.24);
	}

	.hero-icon {
		font-size: 34rpx;
		font-weight: 700;
		color: #ffffff;
		line-height: 1;
	}

	.hero-quickbar {
		display: flex;
		flex-wrap: wrap;
		gap: 14rpx;
		margin-top: 28rpx;
	}

	.hero-pill {
		height: 68rpx;
		padding: 0 24rpx;
		border-radius: 999rpx;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 600;
		color: #ffffff;
		background: rgba(60, 110, 178, 0.34);
		border: 1rpx solid rgba(255, 255, 255, 0.18);
	}

	.hero-pill.light {
		background: rgba(255, 255, 255, 0.18);
	}

	.overview-card,
	.quick-card,
	.empty-card {
		margin-top: 24rpx;
	}

	.overview-card {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 255, 0.9));
	}

	.overview-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.progress-badge {
		padding: 12rpx 18rpx;
		border-radius: 999rpx;
		background: rgba(0, 122, 255, 0.1);
		border: 1rpx solid rgba(0, 122, 255, 0.12);
		color: $brand-primary;
		font-size: 22rpx;
		font-weight: 600;
	}

	.overview-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 18rpx;
		margin-top: 26rpx;
	}

	.overview-item {
		padding: 24rpx;
		border-radius: 22rpx;
		background: rgba(255, 255, 255, 0.7);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.overview-value {
		display: block;
		font-size: 42rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.overview-label {
		display: block;
		margin-top: 10rpx;
		font-size: 22rpx;
		color: $text-secondary;
	}

	.active-session-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 24rpx;
		padding: 22rpx 24rpx;
		border-radius: 22rpx;
		background: rgba(52, 199, 89, 0.1);
		border: 1rpx solid rgba(52, 199, 89, 0.12);
	}

	.active-session-text {
		flex: 1;
		padding-right: 18rpx;
		font-size: 24rpx;
		line-height: 1.5;
		color: $brand-success;
	}

	.banner-btn {
		height: 62rpx;
		padding: 0 18rpx;
	}

	.quick-row {
		display: flex;
		align-items: center;
		margin-top: 22rpx;
	}

	.quick-input {
		flex: 1;
		height: 92rpx;
		padding: 0 24rpx;
		border-radius: 22rpx;
		background: rgba(118, 118, 128, 0.08);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
		font-size: 28rpx;
		color: $text-primary;
	}

	.quick-placeholder {
		color: $text-tertiary;
	}

	.quick-btn {
		margin-left: 18rpx;
		flex-shrink: 0;
	}

	.quick-duration-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 18rpx;
	}

	.quick-duration-label {
		font-size: 24rpx;
		font-weight: 600;
		color: $text-secondary;
	}

	.quick-stepper {
		display: inline-flex;
		align-items: center;
		padding: 8rpx;
		border-radius: 999rpx;
		background: rgba(118, 118, 128, 0.12);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.quick-step-btn,
	.quick-step-value {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.quick-step-btn {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
		font-size: 30rpx;
		color: $text-primary;
	}

	.quick-step-value {
		min-width: 150rpx;
		padding: 0 16rpx;
		font-size: 24rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.toolbar-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 28rpx;
		margin-bottom: 18rpx;
	}

	.segment-wrap {
		display: inline-flex;
		align-items: center;
		padding: 8rpx;
		border-radius: 999rpx;
		background: rgba(118, 118, 128, 0.12);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.segment-item {
		padding: 16rpx 24rpx;
		border-radius: 999rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: $text-secondary;
	}

	.segment-item.active {
		background: rgba(255, 255, 255, 0.92);
		color: $text-primary;
		box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.06);
	}

	.list-hint {
		font-size: 22rpx;
		line-height: 1.4;
		color: $text-secondary;
	}

	.floating-focus {
		position: fixed;
		left: 28rpx;
		right: 28rpx;
		bottom: 144rpx;
		z-index: 20;
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-radius: 30rpx;
		background: rgba(248, 248, 252, 0.86);
		border: 1rpx solid rgba(60, 60, 67, 0.12);
		box-shadow: 0 14rpx 36rpx rgba(15, 23, 42, 0.1);
		backdrop-filter: blur(28rpx);
		-webkit-backdrop-filter: blur(28rpx);
	}

	.floating-copy {
		flex: 1;
		padding-right: 20rpx;
	}

	.floating-title {
		display: block;
		font-size: 28rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.floating-desc {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		line-height: 1.5;
		color: $text-secondary;
	}

	.floating-btn {
		flex-shrink: 0;
	}

	.empty-card {
		text-align: center;
	}
</style>
