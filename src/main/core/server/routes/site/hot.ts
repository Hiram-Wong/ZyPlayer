import fetch from 'node-fetch';
import _ from 'lodash';

import logger from '../../../logger';


const enlightentHot = async (date, sort, channelType, day) => {
  const url = `https://www.enlightent.cn/sxapi/top/getHeatTop.do`;
  try {
    const params = {
      sort,
      channelType,
      day,
      date,
    };
    logger.info(JSON.stringify(params))
    const response = await fetch(url,{
      method: "POST",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        sort,
        channelType,
        day,
        date,
      }),
    })
    logger.info(response.text())

    const data = await response.text();
    if (data && !_.isEmpty(data.content)) {
      return data.content.map((item) => ({
        vod_id: item.nameId, 
        vod_name: item.name,
        vod_hot: item.allHot
      }));
    } else {
      return [];
    }
  } catch (err) {
    throw err;
  }
}

const kyLiveHot = async(date, type, plat) => {
  const url = `https://www.ky.live/api/fullhot?vt=${type}&sd=${date}&plt=${plat}`;
  try {
    const response = await fetch(url,{headers: {
     "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    }});
    logger.info(url,response)
    logger.info(response.headers)
    const text = response.json();
    logger.info(text)
    if (text.status) {
      const data = text.data;
      return data ? data.map((item) => ({
        vod_id: item.caid,
        vod_name: item.epg,
        vod_hot: item.hot
      })) : [];
    }
  } catch (err) {
    throw err;
  }
}

export { enlightentHot, kyLiveHot }