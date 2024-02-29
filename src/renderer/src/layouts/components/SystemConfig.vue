<template>
	<div class="system-config" @click="gotoSetting">
		<setting-icon size="1.3em"/>
	</div>
</template>

<script setup lang="ts">
import { SettingIcon } from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter()

const gotoSetting = () => {
	router.push({ name: 'SettingIndex' });
}
</script>