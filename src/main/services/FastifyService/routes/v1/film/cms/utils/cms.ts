import { isStrEmpty, isString } from '@shared/modules/validate';
import type { ICmsInfo } from '@shared/types/cms';

/**
 * Format the episode information
 * @param playFroms - From of the video episodes
 * @param playUrls - Url of the video episodes
 * @returns episode
 */
export const formatEpisode = (playFroms: string, playUrls: string): ICmsInfo['vod_episode'] => {
  try {
    if (!isString(playFroms) || isStrEmpty(playFroms) || !isString(playUrls) || isStrEmpty(playUrls)) {
      return {};
    }

    // Parsing Episode Information: Split different sources by $$$, split different episodes by #.
    const episodesBySource = playUrls.split('$$$').map((sourceEpisodes) => {
      return sourceEpisodes.split('#').map((episode) => {
        const hasCustomName = episode.includes('$');
        if (hasCustomName) {
          const [text, link] = episode.split('$');
          return { text: text || '正片', link: link || '' };
        }
        return { text: '正片', link: episode };
      });
    });

    // Build the final data structure: play source name -> list of corresponding episodes
    const formattedData = playFroms.split('$$$').reduce((result, sourceName, index) => {
      const episodes = episodesBySource[index] || [];
      result[sourceName] = episodes;
      return result;
    }, {});

    return formattedData;
  } catch {
    return {};
  }
};

/**
 * Format the content
 * @param val - Text to be formatted
 * @param key - Key of the text
 * @returns text
 */
export const formatInfoContent = (val: string, key?: string): string => {
  if (!isString(val) || isStrEmpty(val)) return val?.toString() || '';

  const DEFAULT_PREFIXES = [
    '年份',
    '年代',
    '上映',
    '地区',
    '类型',
    '语言',
    '更新',
    '更新至',
    '评分',
    '导演',
    '编剧',
    '主演',
    '演员',
    '简介',
    '背景',
    '详情',
    '片长',
    '状态',
    '播放',
    '集数',
    '标签',
  ] as const;

  const SEPARATORS = ['：', ':', ' '];

  let text = String(val).trim();

  /** remove prefix */
  const prefixes = key ? [key] : DEFAULT_PREFIXES;

  const prefix = prefixes.find((p) => text.startsWith(p));
  if (prefix) {
    text = text.slice(prefix.length).trim();

    const separator = SEPARATORS.find((s) => text.startsWith(s));
    if (separator) {
      text = text.slice(separator.length).trim();
    }
  }

  /** normalize slash-separated values */
  if (text.startsWith('/') || text.endsWith('/')) {
    text = text
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
  }

  return text;
};
