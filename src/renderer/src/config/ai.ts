import { computed } from 'vue';
import { t } from '@/locales';

const platform = computed(() => {
  return [
    {
      id: 'openai',
      name: t('pages.lab.aiBrain.platform.openai'),
      url: 'https://platform.openai.com/api-keys',
    },
    {
      id: 'deepseek',
      name: t('pages.lab.aiBrain.platform.deepseek'),
      url: 'https://platform.deepseek.com/api_keys',
    },
    {
      id: 'kimi',
      name: t('pages.lab.aiBrain.platform.kimi'),
      url: 'https://platform.moonshot.cn/console/api-keys',
    },
    {
      id: 'free',
      name: t('pages.lab.aiBrain.platform.free'),
      url: 'https://github.com/chatanywhere/GPT_API_free',
    },
  ];
});

export { platform };
