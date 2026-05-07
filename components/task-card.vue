<template>
	<view class="task-card" :class="[themeClass, { selected: selected, done: task.status === 'DONE' }]" @click="$emit('edit', task.id)">
		<view class="task-cover">
			<view class="task-cover-main">
				<view class="task-copy">
					<text class="task-kicker">{{ kickerText }}</text>
					<text class="task-title">{{ task.title }}</text>
					<text class="task-subline">{{ metaLine }}</text>
				</view>
				<view class="start-action" @click.stop="handleStart">
					<text class="start-text">{{ task.status === 'DONE' ? '查看' : '开始' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { formatDueDate } from '../utils/date'

	export default {
		props: {
			task: {
				type: Object,
				required: true
			},
			selected: {
				type: Boolean,
				default: false
			},
			cardIndex: {
				type: Number,
				default: 0
			}
		},
		computed: {
			dueLabel() {
				return formatDueDate(this.task.dueDate)
			},
			kickerText() {
				const parts = []
				if (this.task.status === 'DONE') {
					parts.push('已完成')
				} else if (this.task.todayFlag) {
					parts.push('今日待办')
				}
				parts.push(this.priorityLabel)
				return parts.join(' · ')
			},
			metaLine() {
				const parts = []
				if (this.task.durationMinutes) {
					parts.push(this.task.durationMinutes + ' 分钟')
				}
				if (this.task.dueDate) {
					parts.push(this.dueLabel)
				} else if (this.task.note) {
					parts.push(this.task.note)
				}
				if (!parts.length && this.task.category) {
					parts.push(this.task.category)
				}
				return parts.join(' · ') || '点击卡片可编辑任务详情'
			},
			priorityLabel() {
				return {
					HIGH: '高优先级',
					MEDIUM: '中优先级',
					LOW: '低优先级'
				}[this.task.priority] || '普通'
			},
			priorityClass() {
				return {
					HIGH: this.task.priority === 'HIGH',
					MEDIUM: this.task.priority === 'MEDIUM',
					LOW: this.task.priority === 'LOW'
				}
			},
			themeClass() {
				return 'theme-' + (this.cardIndex % 7)
			}
		},
		methods: {
			handleStart() {
				if (this.task.status === 'DONE') {
					this.$emit('edit', this.task.id)
					return
				}
				this.$emit('focus', this.task.id)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.task-card {
		position: relative;
	}

	.task-card + .task-card {
		margin-top: 42rpx;
	}

	.task-card.selected {
		transform: translateY(-4rpx);
	}

	.task-card.done {
		opacity: 0.84;
	}

	.task-cover {
		position: relative;
		overflow: hidden;
		min-height: 228rpx;
		border-radius: 36rpx;
		box-shadow: 0 20rpx 44rpx rgba(15, 23, 42, 0.14);
	}

	.task-cover::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, rgba(7, 18, 40, 0.36), rgba(7, 18, 40, 0.14) 54%, rgba(7, 18, 40, 0.06));
	}

	.task-cover::after {
		content: '';
		position: absolute;
		right: -14rpx;
		top: -28rpx;
		width: 240rpx;
		height: 240rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
		filter: blur(12rpx);
	}

	.task-cover-main {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 228rpx;
		padding: 30rpx 34rpx;
	}

	.task-copy {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 156rpx;
		padding-right: 30rpx;
	}

	.task-kicker {
		display: block;
		font-size: 22rpx;
		font-weight: 600;
		letter-spacing: 0.4rpx;
		color: rgba(255, 255, 255, 0.84);
	}

	.task-title {
		display: block;
		margin-top: 18rpx;
		font-size: 36rpx;
		font-weight: 700;
		line-height: 1.32;
		color: #ffffff;
		text-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.22);
	}

	.task-subline {
		display: block;
		margin-top: 24rpx;
		font-size: 24rpx;
		line-height: 1.55;
		color: rgba(255, 255, 255, 0.92);
		text-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.18);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.start-action {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 132rpx;
		padding-left: 16rpx;
	}

	.start-text {
		font-size: 40rpx;
		font-weight: 700;
		color: #ffffff;
		text-shadow: 0 10rpx 22rpx rgba(0, 0, 0, 0.24);
	}

	.theme-0 .task-cover {
		background:
			radial-gradient(circle at 68% 42%, rgba(255, 123, 150, 0.96), rgba(255, 123, 150, 0.18) 7%, rgba(255, 123, 150, 0) 12%),
			linear-gradient(135deg, #1e5d9e 0%, #3f8bd7 52%, #74b5ee 100%);
	}

	.theme-1 .task-cover {
		background:
			radial-gradient(circle at 70% 22%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 14%),
			linear-gradient(180deg, #7d82be 0%, #57517d 42%, #15172f 100%);
	}

	.theme-2 .task-cover {
		background:
			radial-gradient(circle at 26% 26%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 16%),
			linear-gradient(135deg, #75d5d0 0%, #8ddfd9 42%, #caece3 100%);
	}

	.theme-3 .task-cover {
		background:
			radial-gradient(circle at 42% 74%, rgba(255, 183, 206, 0.26), rgba(255, 183, 206, 0) 18%),
			linear-gradient(135deg, #a397e8 0%, #b19ee6 38%, #ddc2e7 100%);
	}

	.theme-4 .task-cover {
		background:
			radial-gradient(circle at 76% 40%, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0) 12%),
			linear-gradient(135deg, #bfe0f4 0%, #d4ecfa 56%, #ecf6ff 100%);
	}

	.theme-5 .task-cover {
		background:
			radial-gradient(circle at 58% 64%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 14%),
			linear-gradient(135deg, #5b7caf 0%, #7c97c1 38%, #b7c7df 100%);
	}

	.theme-6 .task-cover {
		background:
			radial-gradient(circle at 68% 32%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 14%),
			linear-gradient(135deg, #d8bf95 0%, #ead2ad 48%, #f4e4cc 100%);
	}
</style>
