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
				<text class="tabbar-icon">{{ current === item.key ? item.activeIcon : item.icon }}</text>
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
					{ key: 'home', label: '首页', path: '/pages/index/index', icon: '⌂', activeIcon: '⌂' },
					{ key: 'focus', label: '专注', path: '/pages/focus/index', icon: '◌', activeIcon: '◉' },
					{ key: 'stats', label: '统计', path: '/pages/stats/index', icon: '◔', activeIcon: '◕' },
					{ key: 'settings', label: '设置', path: '/pages/settings/index', icon: '⚙', activeIcon: '⚙' }
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
		margin-top: 6rpx;
		font-size: 22rpx;
		font-weight: 600;
		color: $text-secondary;
	}

	.tabbar-icon {
		font-size: 34rpx;
		line-height: 1;
		color: $text-secondary;
	}

	.tabbar-item.active .tabbar-label {
		color: $brand-primary;
	}

	.tabbar-item.active .tabbar-icon {
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
</style>
