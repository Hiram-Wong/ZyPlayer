export default {
  title: '智能助手',
  subheading: 'AIGC',
  field: {
    key: '密钥',
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
    tip: '你好! 我是 {0} 智能助手, 有什么可以帮助你的吗?',
    suggestion: {
      desc: {
        title: '{0} 是什么?',
        prompt: '介绍一下 {0}',
      },
    },
    modelChange: '由 {0} 模型提供服务',
    stopGenerating: '用户已停止内容生成',
  },
  status: {
    reason: '思考',
    reasoning: '思考中...',
    reasoned: '已深度思考',
  },
  declare: '内容由AI生成, 仅供参考',
  noParam: '参数不正确, 请前往 [设置->基础配置] 配置AIGC相关数据',
  message: {
    createSessionFailed: '创建会话失败',
  },
};
