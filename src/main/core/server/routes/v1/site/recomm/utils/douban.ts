import request from '@main/utils/request';

/**
 * 搜索视频ID和类型
 * @param {string} name 视频名称
 * @param {string} year 视频年份
 * @returns {Promise<{id: string, type: string}>|null} 匹配的视频ID和类型，或null
 */
const fetchDoubanSearch = async (name: string, year: string) => {
  try {
    let data = {};
    const url = `https://m.douban.com/rexxar/api/v2/search/subjects?q=${encodeURIComponent(name.trim())}`;

    const response = await request({
      url,
      method: 'GET',
      headers: {
        Referer: 'https://movie.douban.com',
      },
    });
    if (response?.subjects && response.subjects.items.length > 0) {
      for (const subject of response.subjects.items) {
        const item = subject.target;
        if (
          (item.title === name && item.year === year && subject.target_type === 'movie') ||
          subject.target_type === 'tv'
        ) {
          data = {
            vod_douban_id: item.id,
            vod_douban_type: subject.target_type,
            vod_score: item.rating.value,
            vod_name: item.title,
            vod_year: item.year,
          };
        }
      }
    }
    return data;
  } catch (err) {
    console.error(`[cms][fetchDoubanSearch][error]`, err);
    return {};
  }
};

/**
 * 搜索视频ID和类型
 * @param {string} id 豆瓣标识
 * @param {string} type movie | tv
 * @returns {Promise<{id: string, type: string}>|null} 匹配的视频ID和类型，或null
 */
const fetchDoubanDetail = async (id: string, type: string) => {
  try {
    let data = {};
    if (id && type) {
      const url = `https://m.douban.com/rexxar/api/v2/${type}/${id}`;

      const response = await request({
        url,
        method: 'GET',
        headers: {
          Referer: 'https://movie.douban.com',
        },
      });

      if (response) {
        data = {
          type_name: response.genres.json(','),
          vod_douban_id: response.id,
          vod_douban_type: response.target_type,
          vod_lang: response.languages.json(','),
          vod_score: response.rating.value,
          vod_name: response.title,
          vod_year: response.year,
          vod_pic: response.pic?.normal || response.pic?.large,
          vod_blurb: response.intro,
          vod_content: response.intro,
          vod_director: response.directors.map((item) => item.name).join(','),
          vod_actor: response.actors.map((item) => item.name).join(','),
        };
      }
    }
    return data;
  } catch (err) {
    console.error(`[cms][fetchDoubanDetail][error]`, err);
    return {};
  }
};

/**
 * 获取豆瓣评分
 * @param {*} id 视频唯一标识
 * @param {*} type 类型 tv｜movie
 * @param {*} name 视频名称
 * @param {*} year 视频年份
 * @returns 豆瓣评分
 */
const fetchDoubanRate = async (id, type, name, year) => {
  try {
    let rate = 0.0;
    if (!id || !type) {
      const { vod_score: foundRate } = (await fetchDoubanSearch(name, year)) as any;
      rate = foundRate;
    } else {
      const { vod_score: foundRate } = (await fetchDoubanDetail(id, type)) as any;
      rate = foundRate;
    }

    return rate;
  } catch (err) {
    console.error(`[cms][fetchDoubanRate][error]`, err);
    return 0.0;
  }
};

/**
 * 获取豆瓣相关视频推荐列表
 * @param {*} id 视频唯一标识
 * @param {*} type 类型 tv｜movie
 * @param {*} name 视频名称
 * @param {*} year 视频年份
 * @returns 豆瓣相关视频推荐列表
 */
const fetchDoubanRecomm = async (name: string, year, id, type) => {
  try {
    if (!id || !type) {
      const { vod_douban_id: foundId, vod_douban_type: foundType } = (await fetchDoubanSearch(name, year)) as any;
      id = foundId;
      type = foundType;
    }

    if (id && type) {
      const url = `https://m.douban.com/rexxar/api/v2/${type}/${id}/recommendations`;
      const response = await request({
        url,
        method: 'GET',
        headers: {
          Referer: 'https://movie.douban.com',
        },
      });

      return (
        response.map((item) => ({
          vod_douban_id: item.id,
          vod_douban_type: item.id,
          vod_pic: item.pic.large || item.pic.normal,
          vod_name: item.title,
        })) || []
      );
    }

    return [];
  } catch (err) {
    console.error(`[cms][fetchDoubanRecomm][error]`, err);
    return [];
  }
};

export { fetchDoubanRecomm };
