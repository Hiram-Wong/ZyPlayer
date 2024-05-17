import OpenAI, { ClientOptions } from 'openai';
import ora from 'ora';

import { PARSE_ELEMENTS_CONTEXT, GET_ELEMENT_SELECTORS_CONTEXT, HELP_CONTEXT } from './context';
import { isObject, logStart, logSuccess } from './general';

type OpenAIChatModel =
  | 'gpt-4-0125-preview'
  | 'gpt-4-turbo-preview'
  | 'gpt-4-1106-preview'
  | 'gpt-4-vision-preview'
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-0613'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-4-32k-0613'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-0301'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-3.5-turbo-0125'
  | 'gpt-3.5-turbo-16k-0613';

interface CreateCrawlOpenAIConfig {
  defaultModel?: {
    chatModel: OpenAIChatModel;
  };
  clientOptions?: ClientOptions;
}

interface CrawlOpenAICommonAPIOtherOption {
  model?: OpenAIChatModel;
}

interface CrawlOpenAIRunChatOption {
  model: OpenAIChatModel | undefined;
  context: string;
  HTMLContent: string;
  userContent: string;
  responseFormatType: 'text' | 'json_object';
}

interface CrawlOpenAIParseElementsContentOptions {
  message: string;
}

interface CrawlOpenAIGetElementSelectorsContentOptions {
  message: string;
  pathMode: 'default' | 'strict';
}

interface CrawlOpenAIGetElementSelectorsResult {
  selectors: string;
  type: 'single' | 'multiple' | 'none';
}

interface CrawlOpenAIParseElementsResult<T extends Record<string, string>> {
  elements: T[];
  type: 'single' | 'multiple' | 'none';
}

interface CrawlOpenAIApp {
  parseElements<T extends Record<string, string>>(
    HTML: string,
    content: string | CrawlOpenAIParseElementsContentOptions,
    option?: CrawlOpenAICommonAPIOtherOption,
  ): Promise<CrawlOpenAIParseElementsResult<T>>;

  getElementSelectors(
    HTML: string,
    content: string | CrawlOpenAIGetElementSelectorsContentOptions,
    option?: CrawlOpenAICommonAPIOtherOption,
  ): Promise<CrawlOpenAIGetElementSelectorsResult>;

  help(content: string, option?: CrawlOpenAICommonAPIOtherOption): Promise<string>;

  custom(): OpenAI;
}

export function createCrawlOpenAI(config: CreateCrawlOpenAIConfig = {}): CrawlOpenAIApp {
  const { defaultModel, clientOptions } = config;

  const openai = new OpenAI(clientOptions);
  const chatDefaultModel: OpenAIChatModel = defaultModel?.chatModel ?? 'gpt-3.5-turbo';

  async function runChat<T>(option: CrawlOpenAIRunChatOption): Promise<T> {
    const { model = chatDefaultModel, context, HTMLContent, userContent, responseFormatType } = option;

    const spinner = ora(logStart(`AI is answering your question, please wait a moment`)).start();
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: context },
        { role: 'user', name: 'x-crawl', content: HTMLContent },
        { role: 'user', name: 'coder', content: userContent },
      ],
      response_format: { type: responseFormatType },
      temperature: 0.1,
    });
    spinner.succeed(logSuccess(`AI has completed your question`));

    const content = completion.choices[0].message.content;
    const result = responseFormatType === 'json_object' ? JSON.parse(content!) : content;

    return result;
  }

  const app: CrawlOpenAIApp = {
    async parseElements<T extends Record<string, string>>(
      HTML: string,
      content: string | CrawlOpenAIParseElementsContentOptions,
      option: CrawlOpenAICommonAPIOtherOption = {},
    ): Promise<CrawlOpenAIParseElementsResult<T>> {
      const { model } = option;

      let coderContent: string = '';
      if (isObject(content)) {
        coderContent = JSON.stringify(content);
      } else {
        const obj: CrawlOpenAIParseElementsContentOptions = {
          message: content,
        };
        coderContent = JSON.stringify(obj);
      }

      const result = await runChat<CrawlOpenAIParseElementsResult<T>>({
        model,
        context: PARSE_ELEMENTS_CONTEXT,
        HTMLContent: HTML,
        userContent: coderContent,
        responseFormatType: 'json_object',
      });

      return result;
    },

    async getElementSelectors(
      HTML: string,
      content: string | CrawlOpenAIGetElementSelectorsContentOptions,
      option: CrawlOpenAICommonAPIOtherOption = {},
    ): Promise<CrawlOpenAIGetElementSelectorsResult> {
      const { model } = option;

      let coderContent: string = '';
      if (isObject(content)) {
        coderContent = JSON.stringify(content);
      } else {
        const obj: CrawlOpenAIGetElementSelectorsContentOptions = {
          message: content,
          pathMode: 'default',
        };
        coderContent = JSON.stringify(obj);
      }

      const result = await runChat<CrawlOpenAIGetElementSelectorsResult>({
        model,
        context: GET_ELEMENT_SELECTORS_CONTEXT,
        HTMLContent: HTML,
        userContent: coderContent,
        responseFormatType: 'json_object',
      });

      return result;
    },

    async help(content: string, option: CrawlOpenAICommonAPIOtherOption = {}): Promise<string> {
      const { model } = option;

      const result = await runChat<string>({
        model,
        context: HELP_CONTEXT,
        HTMLContent: '',
        userContent: content,
        responseFormatType: 'text',
      });

      return result;
    },

    custom() {
      return openai;
    },
  };

  return app;
}
