<template>
	<view class="clock-shell">
		<view class="clock-ring" :class="statusClass">
			<text class="clock-label">{{ stageLabel }}</text>
			<text class="clock-time">{{ formattedTime }}</text>
			<text class="clock-progress-text">已完成 {{ progressPercent }}%</text>
			<view class="progress-bar">
				<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
			</view>
		</view>
	</view>
</template>

<script>
	import { formatClock } from '../utils/time'

	export default {
		props: {
			remainingSeconds: {
				type: Number,
				default: 0
			},
			totalSeconds: {
				type: Number,
				default: 0
			},
			stageLabel: {
				type: String,
				default: '专注中'
			},
			status: {
				type: String,
				default: 'RUNNING'
			}
		},
		computed: {
			formattedTime() {
				return formatClock(this.remainingSeconds)
			},
			progressPercent() {
				if (!this.totalSeconds) {
					return 0
				}
				return Math.min(100, Math.max(0, Math.round((1 - this.remainingSeconds / this.totalSeconds) * 100)))
			},
			statusClass() {
				return {
					paused: this.status === 'PAUSED'
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.clock-shell {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx 0 6rpx;
	}

	.clock-ring {
		position: relative;
		width: 470rpx;
		height: 470rpx;
		border-radius: 50%;
		padding: 38rpx;
		background: radial-gradient(circle at top, rgba(255, 255, 255, 0.98), rgba(246, 248, 252, 0.96));
		border: 1rpx solid rgba(60, 60, 67, 0.08);
		box-shadow: 0 18rpx 48rpx rgba(15, 23, 42, 0.08);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.clock-ring::before {
		content: '';
		position: absolute;
		inset: 24rpx;
		border-radius: 50%;
		border: 18rpx solid rgba(0, 122, 255, 0.12);
	}

	.clock-ring::after {
		content: '';
		position: absolute;
		inset: 58rpx;
		border-radius: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 249, 252, 0.88));
	}

	.clock-ring > * {
		position: relative;
		z-index: 1;
	}

	.clock-ring.paused {
		box-shadow: 0 18rpx 48rpx rgba(15, 23, 42, 0.08);
	}

	.clock-ring.paused::before {
		border-color: rgba(255, 159, 10, 0.18);
	}

	.clock-label {
		font-size: 26rpx;
		color: $text-secondary;
	}

	.clock-time {
		margin-top: 24rpx;
		font-size: 90rpx;
		font-weight: 700;
		color: $text-primary;
		letter-spacing: -2rpx;
	}

	.clock-progress-text {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: $text-secondary;
	}

	.progress-bar {
		width: 72%;
		height: 14rpx;
		margin-top: 18rpx;
		border-radius: 999rpx;
		overflow: hidden;
		background: rgba(60, 60, 67, 0.1);
	}

	.progress-fill {
		height: 100%;
		border-radius: 999rpx;
		background: linear-gradient(90deg, #0A84FF, #5AC8FA);
	}
</style>
