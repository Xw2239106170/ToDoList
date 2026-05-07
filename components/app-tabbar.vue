<template>
	<view class="tabbar-wrap">
		<view class="tabbar-panel">
			<view
				v-for="item in items"
				:key="item.key"
				class="tabbar-item"
				:class="{ active: current === item.key }"
				@click="navigate(item)"
			>
				<view class="tabbar-icon-shell">
					<view class="tabbar-icon-shape" :class="'icon-' + item.key"></view>
				</view>
				<text class="tabbar-label">{{ item.label }}</text>
				<view class="tabbar-dot"></view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			current: {
				type: String,
				default: 'home'
			}
		},
		data() {
			return {
				items: [
					{ key: 'home', label: '待办', path: '/pages/index/index' },
					{ key: 'focus', label: '专注', path: '/pages/focus/index' },
					{ key: 'stats', label: '统计', path: '/pages/stats/index' },
					{ key: 'settings', label: '设置', path: '/pages/settings/index' }
				]
			}
		},
		methods: {
			navigate(item) {
				if (item.key === this.current) {
					return
				}
				uni.reLaunch({
					url: item.path
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tabbar-wrap {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 20rpx;
		padding: 0 28rpx;
		z-index: 30;
	}

	.tabbar-panel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12rpx;
		border-radius: 34rpx;
		background: rgba(248, 248, 252, 0.86);
		border: 1rpx solid rgba(60, 60, 67, 0.12);
		box-shadow: 0 12rpx 32rpx rgba(15, 23, 42, 0.1);
		backdrop-filter: blur(30rpx);
		-webkit-backdrop-filter: blur(30rpx);
	}

	.tabbar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16rpx 0 12rpx;
		border-radius: 24rpx;
	}

	.tabbar-item.active {
		background: rgba(255, 255, 255, 0.82);
		box-shadow: inset 0 0 0 1rpx rgba(60, 60, 67, 0.08);
	}

	.tabbar-label {
		margin-top: 8rpx;
		font-size: 22rpx;
		font-weight: 600;
		color: $text-secondary;
	}

	.tabbar-icon-shell {
		height: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tabbar-icon-shape {
		position: relative;
		color: $text-secondary;
	}

	.tabbar-item.active .tabbar-label {
		color: $brand-primary;
	}

	.tabbar-item.active .tabbar-icon-shape {
		color: $brand-primary;
	}

	.tabbar-dot {
		width: 8rpx;
		height: 8rpx;
		margin-top: 10rpx;
		border-radius: 50%;
		background: transparent;
	}

	.tabbar-item.active .tabbar-dot {
		background: $brand-primary;
	}

	.tabbar-icon-shape::before,
	.tabbar-icon-shape::after {
		content: '';
		position: absolute;
		box-sizing: border-box;
	}

	.icon-home {
		width: 40rpx;
		height: 32rpx;
	}

	.icon-home::before {
		left: 0;
		right: 0;
		top: 2rpx;
		height: 4rpx;
		border-radius: 999rpx;
		background: currentColor;
		box-shadow: 0 12rpx 0 currentColor, 0 24rpx 0 currentColor;
	}

	.icon-home::after {
		left: 22rpx;
		top: 14rpx;
		width: 18rpx;
		height: 4rpx;
		border-radius: 999rpx;
		background: currentColor;
	}

	.icon-focus {
		width: 36rpx;
		height: 42rpx;
	}

	.icon-focus::before {
		left: 6rpx;
		right: 6rpx;
		bottom: 2rpx;
		height: 22rpx;
		border: 4rpx solid currentColor;
		border-radius: 10rpx;
	}

	.icon-focus::after {
		left: 10rpx;
		right: 10rpx;
		top: 0;
		height: 18rpx;
		border: 4rpx solid currentColor;
		border-bottom: 0;
		border-radius: 20rpx 20rpx 0 0;
	}

	.icon-stats {
		width: 38rpx;
		height: 38rpx;
		border: 4rpx solid currentColor;
		border-radius: 50%;
	}

	.icon-stats::before {
		left: 16rpx;
		top: -4rpx;
		width: 4rpx;
		height: 22rpx;
		background: currentColor;
		transform: rotate(45deg);
		transform-origin: bottom center;
	}

	.icon-stats::after {
		left: 16rpx;
		top: 16rpx;
		width: 14rpx;
		height: 4rpx;
		background: currentColor;
		transform: rotate(45deg);
		transform-origin: left center;
	}

	.icon-settings {
		width: 40rpx;
		height: 34rpx;
	}

	.icon-settings::before {
		left: 0;
		right: 0;
		top: 3rpx;
		height: 4rpx;
		border-radius: 999rpx;
		background: currentColor;
		box-shadow: 0 12rpx 0 currentColor, 0 24rpx 0 currentColor;
	}

	.icon-settings::after {
		left: 20rpx;
		top: 0;
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: currentColor;
		box-shadow: -14rpx 12rpx 0 currentColor, 8rpx 24rpx 0 currentColor;
	}
</style>
