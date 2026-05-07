<script>
	export default {
		onLaunch: function() {
			console.log('Pomodoro Todo Launch')
		},
		onShow: function() {
			console.log('Pomodoro Todo Show')
		},
		onHide: function() {
			console.log('Pomodoro Todo Hide')
		}
	}
</script>

<style lang="scss">
	page {
		background:
			radial-gradient(circle at top, rgba(0, 122, 255, 0.08), transparent 26%),
			linear-gradient(180deg, $app-bg-highlight 0%, $app-bg 32%, $app-bg 100%);
		color: $text-primary;
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', sans-serif;
	}

	view,
	text,
	input,
	textarea,
	button {
		box-sizing: border-box;
	}

	button::after {
		border: 0;
	}

	.page-shell {
		min-height: 100vh;
		padding: 32rpx 28rpx 188rpx;
	}

	.page-heading {
		font-size: 60rpx;
		font-weight: 700;
		line-height: 1.12;
		letter-spacing: -1rpx;
		color: $text-primary;
	}

	.page-subtitle {
		display: block;
		margin-top: 12rpx;
		font-size: 24rpx;
		line-height: 1.55;
		color: $text-secondary;
	}

	.section-card {
		background: $surface-card;
		border: 1rpx solid $line-soft;
		border-radius: $radius-card;
		padding: 28rpx;
		box-shadow: 0 10rpx 32rpx rgba(15, 23, 42, 0.06);
		backdrop-filter: blur(28rpx);
		-webkit-backdrop-filter: blur(28rpx);
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 700;
		letter-spacing: -0.3rpx;
		color: $text-primary;
	}

	.section-desc {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		line-height: 1.5;
		color: $text-secondary;
	}

	.primary-pill,
	.ghost-pill,
	.soft-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999rpx;
		padding: 0 24rpx;
		height: 74rpx;
		font-size: 25rpx;
		font-weight: 600;
	}

	.primary-pill {
		background: $brand-primary;
		color: #ffffff;
		box-shadow: 0 10rpx 24rpx rgba(0, 122, 255, 0.2);
	}

	.ghost-pill {
		background: rgba(0, 122, 255, 0.08);
		border: 1rpx solid rgba(0, 122, 255, 0.12);
		color: $brand-primary;
	}

	.soft-pill {
		background: $surface-muted;
		color: $text-primary;
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		padding: 10rpx 18rpx;
		border-radius: 999rpx;
		background: rgba(118, 118, 128, 0.1);
		color: $text-secondary;
		font-size: 22rpx;
	}

	.bottom-safe-space {
		height: 150rpx;
	}
</style>
