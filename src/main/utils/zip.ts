import { Buffer } from 'node:buffer';
import { promisify } from 'node:util';
import zlib from 'node:zlib';

import { loggerService } from '@logger';
import { LOG_MODULE } from '@shared/config/logger';

const logger = loggerService.withContext(LOG_MODULE.UTIL_ZIP);

const gzipPromise = promisify(zlib.gzip);
const gunzipPromise = promisify(zlib.gunzip);

/**
 * Compressing strings
 * @param str - The string to be compressed
 * @returns The compressed Buffer
 */
export async function compress(str: string): Promise<Buffer> {
  try {
    const buffer = Buffer.from(str, 'utf-8');
    return await gzipPromise(buffer);
  } catch (error) {
    logger.error('Compression failed:', error as Error);
    throw error;
  }
}

/**
 * Decompress Buffer to string
 * @param compressedBuffer - The compressed Buffer
 * @returns The decompressed string
 */
export async function decompress(compressedBuffer: Buffer): Promise<string> {
  try {
    const buffer = await gunzipPromise(compressedBuffer);
    return buffer.toString('utf-8');
  } catch (error) {
    logger.error('Decompression failed:', error as Error);
    throw error;
  }
}
