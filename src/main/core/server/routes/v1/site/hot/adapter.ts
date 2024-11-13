import request from '@main/utils/request';

const komect = async (doc: { [key: string]: string | number }) => {
  let { type = '电影', limit = 20, start = 0 } = doc;
  if (typeof limit === 'string') limit = parseInt(limit);
  if (typeof start === 'string') start = parseInt(start);
  try {
    let data: any = [];
    const url = 'https://msi.nsoap.komect.com/msi/cbiz/dp/contentInfo/homePage/list';
    const body = {
      openId: '111',
      provCode: '42',
      licensedParty: '未来电视',
      deviceType: '502090',
      contentTypeIndexs: [
        {
          contentType: type,
          pageNum: start,
          pageSize: limit,
        },
      ],
    };

    const response = await request({
      url,
      method: 'POST',
      headers: {
        auth: '3637df52d98ce8815fe47bbe49fe6459',
        Origin: 'https://msi.nsoap.komect.com',
        Referer: 'https://msi.nsoap.komect.com/minitvH5/index.html',
        channelId: 'H5',
      },
      data: body,
    });
    if (response?.data.items[0].contentInfoList && response.data.items[0].contentInfoList.length > 0) {
      for (const subject of response.data.items[0].contentInfoList) {
        const item = subject;
        data.push({
          vod_score: item.dpContentScore,
          vod_name: item.dpContentName,
          vod_pic: item.dpContentPicUrl,
          vod_year: item.publishTime,
          vod_id: item.psId,
          vod_hot: item.dpPlayCount,
        });

        data.sort((a, b) => b.vod_hot - a.vod_hot);
      }
    }
    return data;
  } catch (err) {
    console.error('Error making API request:', err);
    throw err;
  }
};

const douban = async (doc: { [key: string]: string | number }) => {
  let { type, limit = 20, start = 0 } = doc;
  if (typeof limit === 'string') limit = parseInt(limit);
  if (typeof start === 'string') start = parseInt(start);
  try {
    let data: any = [];
    const url = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}/items?start=${limit * start}&count=${limit}`;

    const response = await request({
      url,
      method: 'GET',
      headers: {
        Referer: 'https://movie.douban.com',
      },
    });
    if (response?.subject_collection_items && response.subject_collection_items.length > 0) {
      for (const subject of response.subject_collection_items) {
        const item = subject;
        if (type === 'tv_hot' || type === 'tv_variety_show') {
          data.push({
            vod_douban_id: item.id,
            vod_douban_type: item.type,
            vod_score: item.rating.value,
            vod_name: item.title,
            vod_pic: item.pic.large || item.pic.normal,
            vod_year: item.year,
            vod_id: item.id,
            vod_hot: item.rating.count,
          });
        } else if (type === 'movie_hot_gaia' || type === 'movie_showing') {
          data.push({
            vod_douban_id: item.id,
            vod_douban_type: item.type,
            vod_score: item?.rating?.value || 0.0,
            vod_name: item.title,
            vod_pic: item?.cover?.url,
            vod_year: item.year,
            vod_id: item.id,
            vod_hot: item?.rating?.value || 0,
          });
        }
        data.sort((a, b) => b.vod_hot - a.vod_hot);
      }
    }
    return data;
  } catch (err) {
    console.error('Error making API request:', err);
    throw err;
  }
};

const quark = async () => {
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

const baidu = async () => {
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

const kylive = async ({ date, type, plat }) => {
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

const enlightent = async ({ date, sort, channelType, day }) => {
  const url = `https://www.enlightent.cn/sxapi/top/getHeatTop.do`;
  try {
    const body = new URLSearchParams();
    body.append('sort', sort);
    body.append('channelType', channelType);
    body.append('day', day);
    body.append('date', date);

    const response = await request({
      url,
      method: 'POST',
      data: body,
    });
    if (response?.content && response?.content.length > 0) {
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

const adapter = {
  komect,
  douban,
  quark,
  baidu,
  kylive,
  enlightent,
};

export default adapter;
