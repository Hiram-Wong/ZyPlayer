import _ from 'lodash';
import qs from 'qs';

import request from '@/utils/request';

const doubanHot = async (type, tag, limit = 20, start = 0) => {
  const url = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURI(
    tag,
  )}&page_limit=${limit}&page_start=${start}`;
  try {
    const response = await request({
      url,
      method: 'GET',
    });
    return response.subjects.map((item) => ({
      vod_id: item.id,
      vod_name: item.title,
      vod_remarks: item.episodes_info,
      vod_pic: item.cover,
    }));
  } catch (err) {
    throw err;
  }
};

const quarkHot = async () => {
  const url = `https://com-cms.quark.cn/cms?partner_id=quark-covid&group=quark-covid&uc_param_str=dnfrpfbivessbtbmnilauputogpintnwmtsvcppcprsnnnchmicckpgi&uid=`;
  try {
    const response = await request({
      url,
      method: 'GET',
    });
    if (response.success) {
      return response.data.allUserRes.hot_search_movie[0].items[0].list.map((item) => ({
        vod_id: item.name,
        vod_name: item.name,
        vod_remarks: item.video_tag,
        vod_pic: item.cover_url,
      }));
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

const baiduHot = async () => {
  const url = `https://opendata.baidu.com/api.php?resource_id=51274&ks_from=aladdin&new_need_di=1&from_mid=1&sort_type=1&query=%E7%94%B5%E8%A7%86%E5%89%A7%E6%8E%92%E8%A1%8C%E6%A6%9C&tn=wisexmlnew&dsp=iphone&format=json&ie=utf-8&oe=utf-8&q_ext=%7B%22query_key%22%3A1%2C%22is_person_related%22%3A0%2C%22video_type_list%22%3A%5B%5D%7D&sort_key=1&stat0=%E7%94%B5%E8%A7%86%E5%89%A7&stat1=%E5%85%A8%E9%83%A8&stat2=%E5%85%A8%E9%83%A8&stat3=%E5%85%A8%E9%83%A8&rn=10&pn=0&trigger_srcid=51251&sid=38515_36559_38540_38591_38596_38582_36804_38434_38414_38640_26350_38623`;
  try {
    const response = await request({
      url,
      method: 'GET',
    });
    if (response.ResultCode === 0) {
      return response.Result[0].DisplayData.resultData.tplData.result.result.map((item) => ({
        vod_id: item.urlsign,
        vod_name: item.ename,
        vod_remarks: item.additional,
        vod_pic: item.img,
      }));
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

const kyLiveHot = async (date, type, plat) => {
  const url = `https://www.ky.live/api/fullhot?vt=${type}&sd=${date}&plt=${plat}`;
  const response = await request({
    url,
    method: 'GET',
  });

  const data = response.status ? response.data : [];
  return data
    ? data.map((item: any) => ({
        vod_id: item.caid,
        vod_name: item.epg,
        vod_hot: item.hot,
      }))
    : [];
};

const enlightentHot = async (date, sort, channelType, day) => {
  const url = `https://www.enlightent.cn/sxapi/top/getHeatTop.do`;
  try {
    const body = qs.stringify({
      sort,
      channelType,
      day,
      date,
    });
    const response = await request({
      url,
      method: 'POST',
      data: body,
    });
    if (response && !_.isEmpty(response.content)) {
      return response.content.map((item) => ({
        vod_id: item.nameId,
        vod_name: item.name,
        vod_hot: item.allHot,
      }));
    } else {
      return [];
    }
  } catch (err) {
    console.error('Error making API request:', err);
    throw err;
  }
};

export { doubanHot, quarkHot, baiduHot, kyLiveHot, enlightentHot };
