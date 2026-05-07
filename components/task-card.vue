<template>
	<view class="task-card" :class="[themeClass, { selected: selected, done: task.status === 'DONE' }]" @click="$emit('edit', task.id)">
		<view class="task-cover">
			<view class="task-cover-main">
				<view class="task-copy">
					<view class="badge-row">
						<text v-if="task.todayFlag" class="state-badge">今日</text>
						<text v-if="task.status === 'DONE'" class="state-badge success">完成</text>
						<text class="state-badge priority-badge" :class="priorityClass">{{ priorityLabel }}</text>
					</view>
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
			},
			canMoveUp: {
				type: Boolean,
				default: true
			},
			canMoveDown: {
				type: Boolean,
				default: true
			}
		},
		computed: {
			dueLabel() {
				return formatDueDate(this.task.dueDate)
			},
			metaLine() {
				if (this.task.durationMinutes) {
					return this.task.durationMinutes + ' 分钟'
				}
				return this.task.note || this.dueLabel
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
		margin-top: 34rpx;
	}

	.task-card.selected {
		transform: translateY(-2rpx);
	}

	.task-card.done {
		opacity: 0.82;
	}

	.task-cover {
		position: relative;
		overflow: hidden;
		min-height: 212rpx;
		border-radius: 32rpx;
		box-shadow: 0 18rpx 40rpx rgba(15, 23, 42, 0.14);
	}

	.task-cover::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, rgba(5, 18, 42, 0.34), rgba(5, 18, 42, 0.12) 52%, rgba(5, 18, 42, 0.08));
	}

	.task-cover::after {
		content: '';
		position: absolute;
		right: -26rpx;
		top: -18rpx;
		width: 210rpx;
		height: 210rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.16);
		filter: blur(8rpx);
	}

	.task-cover-main {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 212rpx;
		padding: 28rpx 30rpx;
	}

	.task-copy {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 138rpx;
		padding-right: 20rpx;
	}

	.badge-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.state-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 40rpx;
		padding: 0 16rpx;
		border-radius: 999rpx;
		background: rgba(255, 255, 255, 0.18);
		border: 1rpx solid rgba(255, 255, 255, 0.16);
		font-size: 20rpx;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
	}

	.state-badge.success {
		background: rgba(52, 199, 89, 0.24);
		border-color: rgba(52, 199, 89, 0.18);
	}

	.state-badge.priority-badge.HIGH {
		background: rgba(255, 59, 48, 0.22);
		border-color: rgba(255, 59, 48, 0.2);
	}

	.state-badge.priority-badge.MEDIUM {
		background: rgba(255, 159, 10, 0.24);
		border-color: rgba(255, 159, 10, 0.2);
	}

	.state-badge.priority-badge.LOW {
		background: rgba(52, 199, 89, 0.2);
		border-color: rgba(52, 199, 89, 0.18);
	}

	.task-title {
		display: block;
		margin-top: 16rpx;
		font-size: 34rpx;
		font-weight: 700;
		line-height: 1.35;
		color: #ffffff;
		text-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.2);
	}

	.task-subline {
		display: block;
		margin-top: 22rpx;
		font-size: 24rpx;
		line-height: 1.55;
		color: rgba(255, 255, 255, 0.9);
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
		min-width: 120rpx;
		padding-left: 18rpx;
	}

	.start-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #ffffff;
		text-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.24);
	}

	.theme-0 .task-cover {
		background:
			radial-gradient(circle at 78% 38%, rgba(255, 220, 230, 0.95), rgba(255, 220, 230, 0) 10%),
			linear-gradient(135deg, #1e4e88 0%, #3f7cc5 52%, #72a8ef 100%);
	}

	.theme-1 .task-cover {
		background:
			radial-gradient(circle at 74% 24%, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0) 12%),
			linear-gradient(180deg, #6b6ea9 0%, #51486e 48%, #14172e 100%);
	}

	.theme-2 .task-cover {
		background:
			radial-gradient(circle at 24% 28%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 16%),
			linear-gradient(135deg, #6bc8c4 0%, #8fd0d0 44%, #cde6dc 100%);
	}

	.theme-3 .task-cover {
		background:
			radial-gradient(circle at 40% 74%, rgba(255, 183, 206, 0.26), rgba(255, 183, 206, 0) 18%),
			linear-gradient(135deg, #9287d7 0%, #9f91d9 36%, #d0b9db 100%);
	}

	.theme-4 .task-cover {
		background:
			radial-gradient(circle at 76% 42%, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0) 12%),
			linear-gradient(135deg, #b9d8ef 0%, #c8e3f9 56%, #e0eefc 100%);
	}

	.theme-5 .task-cover {
		background:
			radial-gradient(circle at 58% 64%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 14%),
			linear-gradient(135deg, #5674a4 0%, #758db6 38%, #adbcd6 100%);
	}

	.theme-6 .task-cover {
		background:
			radial-gradient(circle at 68% 32%, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 14%),
			linear-gradient(135deg, #cdb58a 0%, #dec9a2 48%, #efe0c6 100%);
	}
</style>
