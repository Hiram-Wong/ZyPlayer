import OpenAI, { ClientOptions } from 'openai';
import { PassThrough } from 'stream';
import { v4 as uuidv4 } from 'uuid';

interface OpenAIRunChatOption {
  model?: string;
  messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string; }>;
  stream?: boolean;
  timeout?: number;
}

interface OpenAICommonAPIOtherOption {
  prompt: string;
  model?: string;
  sessionId?: string | null;
  stream?: boolean;
  timeout?: number;
}

const SYSTEM_PROMPT = `我现在有一个爬虫相关的问题需要请教你。作为爬虫专家和前端专家，需要能帮我解答一下, 只需回答 user 用户的问题。
zyfun[ZyPlayer]是一款采用现代化技术栈开发的全功能媒体播放器, 以清新的薄荷绿为主题, 旨在为用户提供流畅的跨平台娱乐体验。
GitHub: https://github.com/Hiram-Wong/ZyPlayer
`;

class OpenAIApp {
  private openai: OpenAI | null = null;
  private options: ClientOptions = {};
  private messages: Map<string, Array<{ role: string; content: string }>> = new Map();

  constructor() {}

  clientCreate(options: ClientOptions) {
    this.openai = new OpenAI(options);
  }

  checkOptions(options: ClientOptions): boolean {
    if (Object.keys(options).length === 0) return false;
    if (!options.apiKey) return false;
    if (!options.baseURL || !/^(https?:\/\/)/.test(options.baseURL)) return false;
    return true;
  }

  checkClient(options: ClientOptions = {}): boolean {
    const isVisable = this.checkOptions(options);
    if (!isVisable) return false;
    const isDifferent = Object.keys(options).some(
      key => this.options[key] !== options[key]
    );
    if (isDifferent) {
      this.options = { ...this.options, ...options };
      this.clientCreate(this.options);
    }
    return true;
  }

  cacheCreate() {
    const key = uuidv4();
    this.messages.set(key, []);
    return { id: key, metadata: [] };
  }

  cacheAdd(key: string, doc: { role: string; content: string }) {
    const current = this.messages.get(key) || [];
    current.push(doc);
    this.messages.set(key, current);
    return { id: key, metadata: current };
  }

  cacheFetch(key: string) {
    return { id: key, metadata: this.messages.get(key) || [] };
  }

  cacheDel(key: string, index: number[]) {
    if (index.length === 0) {
      this.messages.delete(key);
    } else {
      const current = this.messages.get(key) || [];
      for (const i of index) {
        current.splice(i, 1);
      }
      this.messages.set(key, current);
    }
    return { id: key, metadata: this.messages.get(key) || [] };
  }

  cachePut(key: string, metadata: Array<{ index: number, doc: { role: string; content: string } }>) {
    const current = this.messages.get(key) || [];
    for (let { index, doc } of metadata) {
      if (index < 0) index = current.length + index;
      if (index >= 0 && index < current.length) {
        current[index] = doc;
      }
    }
    this.messages.set(key, current);
    return { id: key, metadata: current };
  }

  async runChat(option: OpenAIRunChatOption): Promise<AsyncIterable<any>> {
    const { model, messages, stream, timeout } = option;
    const completion: any = this.openai!.chat.completions.create(
      {
        model: model || 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.3,
        stream,
        stream_options: { "include_usage": false } // 禁用使用统计
      },
      { maxRetries: 1, timeout },
    );

    return completion;
  }

  async chat(option: OpenAICommonAPIOtherOption) {
    if (!this.openai) throw new Error('OpenAI client is not initialized.');

    const { prompt, model, sessionId = uuidv4(), stream = false, timeout } = option;
    const history: any[] = this.messages.get(sessionId!) || [];

    history.push({ role: 'user', content: prompt });
    this.messages.set(sessionId!, history);

    const result: any = await this.runChat({
      model,
      messages: history,
      stream,
      timeout: timeout || globalThis.variable?.timeout || 5000,
    });

    if (stream) {
      const passThroughStream = new PassThrough();

      (async () => {
        const chunks: string[] = [];
        for await (const chunk of result) {
          const delta = chunk?.choices?.[0]?.delta?.content || '';
          chunks.push(delta);
          passThroughStream.write(JSON.stringify(chunk));
        }
        passThroughStream.end();
        this.cacheAdd(sessionId!, { role: 'assistant', content: chunks.join('') });
        // console.log(this.cacheFetch(sessionId!));
      })()

      return { result: passThroughStream, sessionId }; // 返回完整的处理结果
    } else {
      const reply = result.choices?.[0]?.message?.content;
      this.cacheAdd(sessionId!, { role: 'assistant', content: reply });
      // console.log(this.cacheFetch(sessionId!));
      return { result, sessionId };
    }
  }
}

export default OpenAIApp;
