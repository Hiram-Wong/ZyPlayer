import { Buffer } from 'node:buffer';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { promisify } from 'node:util';

import { loggerService } from '@logger';
import { fileChmod, filePermission, pathExist } from '@main/utils/file';
import { HOME_BIN_PATH } from '@main/utils/path';
import { getBinaryName } from '@main/utils/process';
import { arch, isWindows } from '@main/utils/systeminfo';
import { getTimeout, getUserAgent } from '@main/utils/tool';
import { LOG_MODULE } from '@shared/config/logger';
import { headersPascalCase } from '@shared/modules/headers';
import { isHttp, isNil, isPositiveFiniteNumber, isStrEmpty } from '@shared/modules/validate';
import type { FfprobeData } from 'fluent-ffmpeg';
import ffmpegFluent from 'fluent-ffmpeg';

type IFFmpeg = typeof ffmpegFluent & { ffprobeAsync: (path: string, options?: string[]) => Promise<FfprobeData> };

export interface IFfmpegOptions {
  timeout?: number;
  userAgent?: string;
}

export interface IMediaOptions {
  headers?: Record<string, any>;
  timeout?: number;
}

export type IMediaInfoOptions = IMediaOptions;

export type IMediaScreenshotOptions = IMediaOptions & { timestamp?: string };

export interface IMediaBaseInfo {
  duration: number;
  video?: {
    codec: string;
    width: number;
    height: number;
    resolution: string;
    fps: number;
    bitrate: number;
  };
  audio?: {
    codec: string;
    sampleRate: number;
    channelCount: number;
    channelType: string;
    bitrate: number;
  };
}

const logger = loggerService.withContext(LOG_MODULE.FFMPEG);

export class FFmpegService {
  private static instance: FFmpegService;
  private ffmpeg: IFFmpeg | null = null;

  private options: IFfmpegOptions = { timeout: undefined, userAgent: undefined };

  constructor(options: Partial<IFfmpegOptions> = {}) {
    this.options = {
      timeout: options?.timeout,
      userAgent: options?.userAgent,
    };
  }

  public static getInstance(): FFmpegService {
    if (!FFmpegService.instance) {
      FFmpegService.instance = new FFmpegService();
    }
    return FFmpegService.instance;
  }

  public async prepare(): Promise<void> {
    try {
      if (this.ffmpeg) return;

      if (isWindows && arch === 'arm_64') {
        throw new Error(`FFmpeg not support: windows ${arch}`);
      }

      const ffmpegPath = join(HOME_BIN_PATH, getBinaryName('ffmpeg'));
      const ffprobePath = join(HOME_BIN_PATH, getBinaryName('ffprobe'));

      if (await pathExist(ffmpegPath)) {
        if (!isWindows && !(await filePermission(ffmpegPath)).exec) {
          await fileChmod(ffmpegPath, 0o755);
        }
      } else {
        throw new Error(`Binary ffmpeg not found: ${ffmpegPath}`);
      }

      if (await pathExist(ffprobePath)) {
        if (!isWindows && !(await filePermission(ffprobePath)).exec) {
          await fileChmod(ffprobePath, 0o755);
        }
      } else {
        throw new Error(`Binary ffprobe not found: ${ffprobePath}`);
      }

      ffmpegFluent.setFfmpegPath(ffmpegPath);
      ffmpegFluent.setFfprobePath(ffprobePath);

      this.ffmpeg = ffmpegFluent as IFFmpeg;
      this.ffmpeg.ffprobeAsync = promisify(ffmpegFluent.ffprobe);
    } catch (error) {
      this.ffmpeg = null;
      logger.error('Failed to initialize ffmpeg:', error as Error);
    }
  }

  private formatNumber(value: number | string): number {
    if (value === 'N/A') return 0;

    const num = Number(value);
    if (!isPositiveFiniteNumber(num)) return 0;
    return num;
  }

  private buildParams(path: string, options: IMediaOptions = {}): string[] {
    const args: string[] = [];

    const { headers: rawHeaders = {}, timeout: rawTimeout } = options;
    const timeout = getTimeout(rawTimeout, this.options.timeout);

    /**
     * FFmpeg timeout options (microseconds)
     *
     * - stimeout   : RTSP only, connection timeout (legacy but still valid)
     * - timeout    : legacy option, behavior varies by protocol (not recommended)
     * - rw_timeout : IO read/write timeout, works for HTTP / RTSP / TCP / UDP
     *                Available since ffmpeg 4.x, preferred in 5.x+
     */
    if (isPositiveFiniteNumber(timeout) && timeout > 0) {
      timeout < 2.14748e9 / 1000
        ? args.push('-rw_timeout', `${timeout * 1000}`)
        : args.push('-rw_timeout', `${2.14748e9}`);
    }

    if (isHttp(path)) {
      const headers = headersPascalCase(rawHeaders);
      headers['User-Agent'] = getUserAgent(headers['User-Agent'], this.options.userAgent);

      const headersArg = Object.entries(headers)
        .filter(([_key, value]) => !isNil(value) && !isStrEmpty(String(value)))
        .map(([key, value]) => `${key}: ${value}\r\n`)
        .join('');
      if (!isStrEmpty(headersArg)) args.push('-headers', `"${headersArg}"`);
    }

    return args;
  }

  private getProbeCommand(path: string, args: string[] = []): string {
    const baseArgs = [...args, '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', `"${path}"`];

    return `ffprobe ${baseArgs.join(' ')}`;
  }

  public async getInfo(path: string, options?: IMediaInfoOptions): Promise<FfprobeData | null> {
    if (!this.ffmpeg) {
      return null;
    }

    try {
      const probeArgs = this.buildParams(path, options);

      const log = this.getProbeCommand(path, probeArgs);
      logger.debug(`Executing command: ${log}`);

      const data = await this.ffmpeg.ffprobeAsync(path, probeArgs);

      return data;
    } catch (error) {
      logger.error('Failed to get media info:', error as Error);
      return null;
    }
  }

  public async getBaseInfo(path: string, options?: IMediaInfoOptions): Promise<IMediaBaseInfo | null> {
    try {
      const probe = await this.getInfo(path, options);
      if (!probe) return null;

      const fmt = probe.format;
      const videoStream = probe.streams.find((s) => s.codec_type === 'video');
      const audioStream = probe.streams.find((s) => s.codec_type === 'audio');

      const res = {
        duration: this.formatNumber(fmt.duration!),
        ...(videoStream && {
          video: {
            codec: videoStream.codec_name ?? '',
            width: videoStream.width ?? 0,
            height: videoStream.height ?? 0,
            resolution: videoStream.width && videoStream.height ? `${videoStream.width}x${videoStream.height}` : '',
            fps: (() => {
              const rate = videoStream.r_frame_rate ?? '';
              const [n, d] = rate.split('0/0').map(Number);
              const result = d && d !== 0 ? n / d : 0;
              return Math.round(result);
            })(),
            bitrate: this.formatNumber(videoStream.bit_rate!),
          },
        }),
        ...(audioStream && {
          audio: {
            codec: audioStream.codec_name ?? '',
            sampleRate: Number(audioStream.sample_rate ?? 0),
            channelCount: audioStream.channels ?? 0,
            channelType: audioStream.channel_layout ?? '',
            bitrate: this.formatNumber(audioStream.bit_rate!),
          },
        }),
      };
      return res;
    } catch (error) {
      logger.error('Failed to get media base info:', error as Error);
      return null;
    }
  }

  /**
   * @see https://qianqianquege.com/images/base64/
   */

  public async getScreenshot(path: string, options?: IMediaScreenshotOptions): Promise<string | null> {
    if (!this.ffmpeg) return null;

    try {
      const buffers: Buffer[] = [];
      const { timestamp = '00:00:01', ...args } = options || {};
      const probeArgs = this.buildParams(path, args);

      const pts = new PassThrough();
      ffmpegFluent(path)
        .inputOptions(['-ss', timestamp, ...probeArgs])
        .outputOptions(['-an', '-vframes', '1', '-vcodec', 'png'])
        .format('image2pipe')
        .on('start', (cmd) => logger.debug(`Executing command: ${cmd}`))
        .on('stderr', (stderrLine) => logger.silly(stderrLine))
        .on('error', (error) => logger.error('Failed to grab screenshot:', error as Error))
        .pipe(pts, { end: true });

      for await (const chunk of pts) {
        buffers.push(chunk as Buffer);
      }

      const buffer = Buffer.concat(buffers);
      return buffer.length ? `data:image/png;base64,${buffer.toString('base64')}` : null;
    } catch (error) {
      logger.error('Failed to grab screenshot:', error as Error);
      return null;
    }
  }
}

export const ffmpegService = FFmpegService.getInstance();
