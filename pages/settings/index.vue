<template>
	<view class="page-shell settings-page">
		<view>
			<text class="page-heading">专注设置</text>
			<text class="page-subtitle">把节奏调成你舒服的样子，系统才会长期陪你工作。</text>
		</view>

		<view class="section-card settings-card">
			<text class="section-title">番茄参数</text>
			<view class="setting-row">
				<text class="setting-label">专注时长</text>
				<view class="stepper">
					<view class="stepper-btn" @click="changeNumber('focusMinutes', -5)">-</view>
					<text class="stepper-value">{{ form.focusMinutes }} 分钟</text>
					<view class="stepper-btn" @click="changeNumber('focusMinutes', 5)">+</view>
				</view>
			</view>
			<view class="setting-row">
				<text class="setting-label">短休息时长</text>
				<view class="stepper">
					<view class="stepper-btn" @click="changeNumber('shortBreakMinutes', -1)">-</view>
					<text class="stepper-value">{{ form.shortBreakMinutes }} 分钟</text>
					<view class="stepper-btn" @click="changeNumber('shortBreakMinutes', 1)">+</view>
				</view>
			</view>
			<view class="setting-row">
				<text class="setting-label">长休息时长</text>
				<view class="stepper">
					<view class="stepper-btn" @click="changeNumber('longBreakMinutes', -5)">-</view>
					<text class="stepper-value">{{ form.longBreakMinutes }} 分钟</text>
					<view class="stepper-btn" @click="changeNumber('longBreakMinutes', 5)">+</view>
				</view>
			</view>
			<view class="setting-row">
				<text class="setting-label">长休息触发间隔</text>
				<view class="stepper">
					<view class="stepper-btn" @click="changeNumber('longBreakInterval', -1)">-</view>
					<text class="stepper-value">{{ form.longBreakInterval }} 个番茄</text>
					<view class="stepper-btn" @click="changeNumber('longBreakInterval', 1)">+</view>
				</view>
			</view>
		</view>

		<view class="section-card settings-card">
			<text class="section-title">每日目标</text>
			<view class="setting-row">
				<text class="setting-label">目标番茄数</text>
				<view class="stepper">
					<view class="stepper-btn" @click="changeNumber('dailyGoalPomodoros', -1)">-</view>
					<text class="stepper-value">{{ form.dailyGoalPomodoros }} 个</text>
					<view class="stepper-btn" @click="changeNumber('dailyGoalPomodoros', 1)">+</view>
				</view>
			</view>
			<view class="setting-row">
				<text class="setting-label">目标专注分钟</text>
				<view class="stepper">
					<view class="stepper-btn" @click="changeNumber('dailyGoalMinutes', -10)">-</view>
					<text class="stepper-value">{{ form.dailyGoalMinutes }} 分钟</text>
					<view class="stepper-btn" @click="changeNumber('dailyGoalMinutes', 10)">+</view>
				</view>
			</view>
		</view>

		<view class="section-card settings-card">
			<text class="section-title">自动化与提醒</text>
			<view class="switch-row">
				<text class="setting-label">自动开始休息</text>
				<switch :checked="form.autoStartBreak" color="#007AFF" @change="handleSwitch('autoStartBreak', $event)"></switch>
			</view>
			<view class="switch-row">
				<text class="setting-label">自动开始下一轮专注</text>
				<switch :checked="form.autoStartFocus" color="#007AFF" @change="handleSwitch('autoStartFocus', $event)"></switch>
			</view>
			<view class="switch-row">
				<text class="setting-label">声音提醒</text>
				<switch :checked="form.soundEnabled" color="#007AFF" @change="handleSwitch('soundEnabled', $event)"></switch>
			</view>
			<view class="switch-row">
				<text class="setting-label">震动提醒</text>
				<switch :checked="form.vibrationEnabled" color="#007AFF" @change="handleSwitch('vibrationEnabled', $event)"></switch>
			</view>
		</view>

		<view class="primary-pill save-btn" @click="saveSettings">保存设置</view>

		<app-tabbar current="settings"></app-tabbar>
	</view>
</template>

<script>
	import store from '../../store'
	import AppTabbar from '../../components/app-tabbar.vue'

	function createForm(settings) {
		return Object.assign({
			focusMinutes: 25,
			shortBreakMinutes: 5,
			longBreakMinutes: 15,
			longBreakInterval: 4,
			autoStartBreak: false,
			autoStartFocus: false,
			dailyGoalPomodoros: 8,
			dailyGoalMinutes: 200,
			soundEnabled: true,
			vibrationEnabled: true
		}, settings || {})
	}

	export default {
		components: {
			AppTabbar
		},
		data() {
			return {
				form: createForm()
			}
		},
		onShow() {
			store.bootstrap().then(() => {
				this.form = createForm(store.state.settings)
			})
		},
		onPullDownRefresh() {
			store.bootstrap().then(() => {
				this.form = createForm(store.state.settings)
			}).finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		methods: {
			changeNumber(field, step) {
				const limitMap = {
					focusMinutes: 5,
					shortBreakMinutes: 1,
					longBreakMinutes: 5,
					longBreakInterval: 1,
					dailyGoalPomodoros: 1,
					dailyGoalMinutes: 10
				}
				const current = Number(this.form[field] || 0)
				this.form[field] = Math.max(limitMap[field], current + step)
			},
			handleSwitch(field, event) {
				this.form[field] = !!event.detail.value
			},
			saveSettings() {
				store.saveSettings(this.form).then(() => {
					uni.showToast({
						title: '设置已保存',
						icon: 'none'
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.settings-card {
		margin-top: 24rpx;
		overflow: hidden;
	}

	.setting-row,
	.switch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid rgba(60, 60, 67, 0.08);
	}

	.setting-row:last-child,
	.switch-row:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.setting-label {
		font-size: 26rpx;
		color: $text-primary;
	}

	.stepper {
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
		height: 64rpx;
	}

	.stepper-btn {
		width: 64rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.92);
		font-size: 32rpx;
		color: $text-primary;
	}

	.stepper-value {
		min-width: 170rpx;
		padding: 0 14rpx;
		font-size: 24rpx;
		font-weight: 600;
		color: $text-primary;
	}

	.save-btn {
		width: 100%;
		margin-top: 30rpx;
	}
</style>
