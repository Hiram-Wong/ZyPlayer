<template>
  <div class="system-config" @click="gotoLab">
    <t-button theme="default" shape="square" variant="text">
      <extension-icon />
    </t-button>
  </div>
</template>

<script setup lang="ts">
import { ExtensionIcon } from 'tdesign-icons-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const gotoLab = () => {
  router.push({ name: 'LabIndex' });
}
</script>
