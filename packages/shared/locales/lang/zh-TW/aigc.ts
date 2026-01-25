export default {
  title: '智能助手',
  subheading: 'AIGC',
  field: {
    key: '密鑰',
    model: '模型',
    providerMap: {
      amazon: 'Amazon Bedrock',
      anthropic: 'Anthropic',
      azure: 'Azure',
      gemini: 'Gemini',
      openai: 'OpenAI',
    },
  },
  chat: {
    tip: '你好! 我是 {0} 智能助手, 有什麼可以幫助你的吗?',
    suggestion: {
      desc: {
        title: '{0} 是什麼?',
        prompt: '介紹一下 {0}',
      },
    },
    modelChange: '由 {0} 模型提供服務',
    stopGenerating: '用戶已停止內容生成',
  },
  status: {
    reason: '思考',
    reasoning: '思考中...',
    reasoned: '已深度思考',
  },
  declare: '內容由AI生成, 僅供參考',
  noParam: '參數不正確, 請前往 [設置->基礎配置] 配置AI相關數據',
  message: {
    createSessionFailed: '創建會話失敗',
  },
};
