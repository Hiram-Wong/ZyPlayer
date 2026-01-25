export const host = import.meta.env.VITE_API_URL;
export const prefix = import.meta.env.VITE_API_URL_PREFIX;
export const prefixApi = `${host}${prefix}`;

export const proxyApi = `${host}/proxy`;
export const aigcChatCompletionApi = `${prefixApi}/v1/aigc/chat/completion`;
export const fileManageApi = `${prefixApi}/v1/file/manage/file`;
export const systemM3u8AdRemoveApi = `${prefixApi}/v1/system/m3u8/adremove`;
