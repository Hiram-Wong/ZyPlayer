import { addHistory, delHistory, findHistory, putHistory } from '@/api/history';
import { addStar, delStar, putStar, findStar } from '@/api/star';

/**
 * 获取追番数据
 * @param relateId 关联ID
 * @param videoId 视频ID
 * @param type 类型
 * @returns { status: boolean, data: any, code: number }
 */
const fetchBingeData = async (relateId: string, videoId: number | string, type: string | string[] = []): Promise<{ status: boolean; data: any, code: number }> => {
  let data = {
    status: false,
    code: -1,
    data: {
      relateId: null,
      videoId: 0,
      videoImage: '',
      videoName: '',
      videoType: '',
      videoRemarks: '',
      id: null,
      type: 'film'
    }
  };
  try {
    if (typeof type === 'string') type = [type];
    const res = await findStar({ relateId, videoId, type });
    data = { status: !!res, data: res || {}, code: 0 };
  } catch (err) {
    console.error(`[chase][fetchBingeData][error]`, err);
  } finally {
    return data;
  }
};

/**
 * 追番数据操作
 * @param action 操作类型 add/del/update
 * @param id 追番ID
 * @param doc 操作数据
 * @returns { status: boolean, data: any, code: number }
 */
const putBingeData = async (action: string, doc: any = {}, id: string | null = null): Promise<{ status: boolean; data: any, code: number }> => {
  let data = {
    status: false,
    code: -1,
    data: {
      relateId: null,
      videoId: 0,
      videoImage: '',
      videoName: '',
      videoType: '',
      videoRemarks: '',
      id: null,
      type: 'film'
    }
  };
  try {
    let res = {};
    if (action === 'add') {
      res = await addStar(doc);
    } else if (action === 'del') {
      await delStar({ ids: [id] });
      res = [data.data];
    } else if (action === 'put') {
      res = await putStar({ ids: [id], doc });
    }
    data = { status: ['add', 'put'].includes(action) && res?.[0]?.id, data: res?.[0], code: 0 };
  } catch (err) {
    console.error(`[chase][putBingeData][error]`, err);
  } finally {
    return data;
  }
};

/**
 * 获取历史数据
 * @param relateId 关联ID
 * @param videoId 视频ID
 * @param type 类型
 * @returns { status: boolean, data: any, code: number }
 */
const fetchHistoryData = async (relateId: string, videoId: number | string, type: string | string[] = []): Promise<{ status: boolean, data: any, code: number }> => {
  let data = {
    status: false,
    code: -1,
    data: {
      id: null,
      date: 1715018234,
      type: 'film',
      relateId: '',
      siteSource: '',
      playEnd: false,
      videoId: '',
      videoImage: '',
      videoName: '',
      videoIndex: '',
      watchTime: 0,
      duration: null,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    }
  };

  try {
    if (typeof type === 'string') type = [type];
    const res = await findHistory({ relateId, videoId, type });
    data = { status: !!res, data: res || {}, code: 0 };
  } catch (err) {
    console.error(`[cha'se][fetchHistoryData][error]`, err);
  } finally {
    return data;
  }
};

/**
 * 更新历史数据
 * @param action 操作类型 add/del/update
 * @param doc 更新数据
 * @param id 历史ID
 * @returns { status: boolean, data: any, code: number }
 */
const putHistoryData = async (action: string, doc: any = {}, id: string | null = null): Promise<{ status: boolean, data: any, code: number }> => {
  let data = {
    status: false,
    code: -1,
    data: {
      id: null,
      date: 1715018234,
      type: 'film',
      relateId: '',
      siteSource: '',
      playEnd: false,
      videoId: '',
      videoImage: '',
      videoName: '',
      videoIndex: '',
      watchTime: 0,
      duration: null,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    }
  };

  try {
    let res = {};
    if (action === 'add') {
      res = await addHistory(doc);
    } else if (action === 'del') {
      await delHistory({ ids: [id] });
      res = [data.data];
    } else if (action === 'put') {
      res = await putHistory({ ids: [id], doc });
    }
    data = { status: ['add', 'put'].includes(action) && res?.[0]?.id, data: res?.[0], code: 0 };
  } catch (err) {
    console.log(`[chase][putHistoryData][error]`, err);
  } finally {
    return data;
  }
};

export {
  fetchBingeData,
  putBingeData,
  fetchHistoryData,
  putHistoryData,
}
