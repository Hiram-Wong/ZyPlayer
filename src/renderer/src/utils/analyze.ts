import * as cheerio from 'cheerio';

import request from '@/utils/request';

const getUrlTitle = async (url: string): Promise<string> => {
  try {
    const response = await request({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });
    const html = Buffer.from(response).toString('utf-8');
    const $ = cheerio.load(html);
    const title = $('title').text();
    return title;
  } catch (err) {
    throw err;
  }
};

export { getUrlTitle };
