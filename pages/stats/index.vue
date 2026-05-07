<template>
	<view class="page-shell stats-page">
		<view>
			<text class="page-heading">专注统计</text>
			<text class="page-subtitle">看见积累，会更容易把节奏坚持下去。</text>
		</view>

		<view class="section-card stats-overview">
			<view class="stats-grid">
				<view class="stats-block">
					<text class="stats-value">{{ storeState.overview.focusMinutes }}</text>
					<text class="stats-label">今日专注分钟</text>
				</view>
				<view class="stats-block">
					<text class="stats-value">{{ storeState.overview.pomodoroCount }}</text>
					<text class="stats-label">今日完成番茄</text>
				</view>
				<view class="stats-block">
					<text class="stats-value">{{ storeState.overview.completedTaskCount }}</text>
					<text class="stats-label">今日完成任务</text>
				</view>
				<view class="stats-block">
					<text class="stats-value">{{ completionRateText }}</text>
					<text class="stats-label">任务完成率</text>
				</view>
			</view>
		</view>

		<view class="section-card trend-card">
			<text class="section-title">最近 7 天趋势</text>
			<text class="section-desc">用一条轻量曲线，观察自己最近的专注节奏。</text>

			<view class="trend-list">
				<view v-for="item in trendPoints" :key="item.date" class="trend-item">
					<view class="trend-head">
						<text class="trend-date">{{ item.label }}</text>
						<text class="trend-meta">{{ item.focusMinutes }} 分钟 · {{ item.pomodoroCount }} 个番茄</text>
					</view>
					<view class="trend-bar">
						<view class="trend-fill" :style="{ width: item.width + '%' }"></view>
					</view>
				</view>
			</view>
		</view>

		<view class="section-card insight-card">
			<text class="section-title">一些反馈</text>
			<view class="insight-row">
				<text class="insight-label">连续专注天数</text>
				<text class="insight-value">{{ storeState.overview.continuousDays }} 天</text>
			</view>
			<view class="insight-row">
				<text class="insight-label">周平均专注</text>
				<text class="insight-value">{{ averageMinutes }} 分钟 / 天</text>
			</view>
			<view class="insight-row">
				<text class="insight-label">距离今日分钟目标</text>
				<text class="insight-value">{{ goalDistanceText }}</text>
			</view>
		</view>

		<app-tabbar current="stats"></app-tabbar>
	</view>
</template>

<script>
	import store from '../../store'
	import AppTabbar from '../../components/app-tabbar.vue'

	export default {
		components: {
			AppTabbar
		},
		data() {
			return {
				storeState: store.state
			}
		},
		computed: {
			trendPoints() {
				const maxValue = Math.max.apply(null, [1].concat(this.storeState.trend.map(item => item.focusMinutes || 0)))
				return this.storeState.trend.map(item => Object.assign({}, item, {
					width: Math.max(8, Math.round((item.focusMinutes || 0) / maxValue * 100))
				}))
			},
			completionRateText() {
				return Math.round((this.storeState.overview.completionRate || 0) * 100) + '%'
			},
			averageMinutes() {
				if (!this.storeState.trend.length) {
					return 0
				}
				const total = this.storeState.trend.reduce((sum, item) => sum + Number(item.focusMinutes || 0), 0)
				return Math.round(total / this.storeState.trend.length)
			},
			goalDistanceText() {
				const gap = (this.storeState.settings.dailyGoalMinutes || 0) - (this.storeState.overview.focusMinutes || 0)
				if (gap <= 0) {
					return '今日目标已完成'
				}
				return '还差 ' + gap + ' 分钟'
			}
		},
		onShow() {
			store.bootstrap()
		},
		onPullDownRefresh() {
			store.bootstrap().finally(() => {
				uni.stopPullDownRefresh()
			})
		}
	}
</script>

<style lang="scss" scoped>
	.stats-overview,
	.trend-card,
	.insight-card {
		margin-top: 24rpx;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 18rpx;
	}

	.stats-block {
		padding: 24rpx;
		border-radius: 22rpx;
		background: rgba(255, 255, 255, 0.72);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.stats-value {
		display: block;
		font-size: 42rpx;
		font-weight: 700;
		color: $text-primary;
	}

	.stats-label {
		display: block;
		margin-top: 10rpx;
		font-size: 22rpx;
		line-height: 1.4;
		color: $text-secondary;
	}

	.trend-list {
		margin-top: 24rpx;
	}

	.trend-item + .trend-item {
		margin-top: 18rpx;
	}

	.trend-item {
		padding: 20rpx;
		border-radius: 22rpx;
		background: rgba(118, 118, 128, 0.08);
		border: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.trend-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10rpx;
	}

	.trend-date {
		font-size: 24rpx;
		font-weight: 600;
		color: $text-primary;
	}

	.trend-meta {
		font-size: 22rpx;
		color: $text-secondary;
	}

	.trend-bar {
		height: 16rpx;
		border-radius: 999rpx;
		background: rgba(60, 60, 67, 0.1);
		overflow: hidden;
	}

	.trend-fill {
		height: 100%;
		border-radius: 999rpx;
		background: linear-gradient(90deg, #0A84FF, #5AC8FA);
	}

	.insight-row + .insight-row {
		margin-top: 18rpx;
	}

	.insight-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.insight-row:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.insight-label {
		font-size: 26rpx;
		color: $text-secondary;
	}

	.insight-value {
		font-size: 28rpx;
		font-weight: 700;
		color: $text-primary;
	}
</style>
