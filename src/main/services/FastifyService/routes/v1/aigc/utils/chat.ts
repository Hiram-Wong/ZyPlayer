import { PassThrough, Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';

import { loggerService } from '@logger';
import { t } from '@main/services/AppLocale';
import { configManager } from '@main/services/ConfigManager';
import { APP_NAME } from '@shared/config/appinfo';
import { LOG_MODULE } from '@shared/config/logger';
import { isHttp, isObject, isObjectEmpty } from '@shared/modules/validate';
import { isEqual } from 'es-toolkit';
import type { ClientOptions } from 'openai';
import OpenAI from 'openai';

import { memoryManager } from './memory';

const SYSTEM_PROMPT = `
你是一名名为${APP_NAME}智能助手的人工智能助手。你的角色设定为简洁高效地为用户提供准确信息。当被问及姓名时，必须明确回答 "${APP_NAME}智能助手"。

你需要严格遵循用户要求，杜绝违反版权的内容。回答应简洁明了，不带有任何个人情感色彩。在回复之前，要逐步思考，详细规划回复思路。尽量减少其他散文式表述，避免用三重回车键包裹整个回复，每个对话回合仅给出一个回复。

当遇到询问${APP_NAME}产品相关的问题时，需参考以下信息：${APP_NAME}是一款免费易用的媒体播放器桌面客户端, 支持Windows、Mac和Linux操作系统, 其开源地址为https://github.com/Hiram-Wong/ZyPlayer 。在回复此类问题时，要准确运用这些参考信息，清晰、直接地给出答案。
`;

interface OpenAICommonAPIOtherOption {
  prompt: string;
  model: string;
  stream?: boolean;
  sessionId?: string;
  parentId?: string;
}

const logger = loggerService.withContext(LOG_MODULE.AIGC_HELPER);

class ChatCompletion {
  private client: OpenAI | null = null;
  private options: ClientOptions = {};
  private memory: typeof memoryManager;

  constructor() {
    this.memory = memoryManager;
  }

  private async init(options: ClientOptions = {}): Promise<boolean> {
    if (isObjectEmpty(options) || !isHttp(options.baseURL)) {
      logger.warn('Invalid OpenAI client options');
      return false;
    }

    if (isEqual(this.options, options) && this.client) {
      return true;
    }

    try {
      const client = new OpenAI(options);
      this.client = client;
      this.options = options;
      return true;
    } catch (error) {
      logger.error(`Failed to initialize OpenAI client: ${(error as Error).message}`);
      this.client = null;
      if ((error as any).status === 401 || (error as any).status === 403) return false;
      throw error;
    }
  }

  public async chatStandard(
    config: OpenAICommonAPIOtherOption,
    options?: ClientOptions,
  ): Promise<{ completion: any; sessionId: string }> {
    if (options && isObject(options) && !isObjectEmpty(options)) {
      await this.init(options);
    }
    if (!this.client) throw new Error('OpenAI client is not initialized.');

    const { sessionId: rawSessionId, prompt, model, stream = false } = config;
    const sessionId = rawSessionId || this.memory.createSession().id;

    try {
      // Record user messages
      this.memory.addMessage(sessionId, { role: 'user', content: prompt });

      // Get recent 10 context messages
      const history = this.memory.getMessage(sessionId, { recentCount: 10 });
      const timeout = configManager.timeout;

      const completion = await this.client.chat.completions.create(
        {
          model,
          messages: [{ role: 'system', content: `必须使用${t('lang')}回答\n\n${SYSTEM_PROMPT}` }, ...history.messages],
          temperature: 0.3,
          stream: stream ?? false,
          stream_options: { include_usage: false },
        },
        { maxRetries: 1, timeout },
      );

      if (stream) {
        const nodeStream = Readable.from(completion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>);
        const toCaller = new PassThrough({ objectMode: true });
        const toInternal = new PassThrough({ objectMode: true });
        const readyMessage = { id: 'ready', sessionId };
        toCaller.write(readyMessage);
        nodeStream.pipe(toCaller);
        nodeStream.pipe(toInternal);

        (async () => {
          let fullMessage = '';
          for await (const chunk of toInternal) {
            const reply = chunk?.choices?.[0]?.delta?.content || '';
            fullMessage += reply;
          }
          this.memory.addMessage(sessionId, { role: 'assistant', content: fullMessage });
        })();

        const webStream = ReadableStream.from(toCaller);
        return { completion: webStream, sessionId };
      } else {
        const reply = (completion as OpenAI.Chat.Completions.ChatCompletion).choices?.[0]?.message?.content || '';
        this.memory.addMessage(sessionId, { role: 'assistant', content: reply });
        return { completion, sessionId };
      }
    } catch (error) {
      this.memory.deleteMessage(sessionId, [-1]);
      logger.error(`Failed to chat: ${(error as Error).message}`);
      throw error;
    }
  }

  public async chatNormal(config: OpenAICommonAPIOtherOption, options?: ClientOptions): Promise<string> {
    config.stream = false; // Ensure it's non-streaming
    const resp = await this.chatStandard(config, options);
    const text = (resp.completion as OpenAI.Chat.Completions.ChatCompletion)?.choices?.[0]?.message?.content || '';
    return text;
  }
}

export const chatCompletion = new ChatCompletion();
