async function init(_inReq, _outResp) {
  return {};
}

async function support(_inReq, _outResp) {
  // const clip = inReq.body.clip;
  return 'true';
}

async function detail(inReq, _outResp) {
  const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
  const videos = [];
  for (const id of ids) {
    let vod = {
      vod_id: id,
      vod_content: '',
      vod_name: id,
      vod_pic: 'https://pic.rmb.bdstatic.com/bjh/1d0b02d0f57f0a42201f92caba5107ed.jpeg',
    };
    vod.vod_play_from = '推送';
    vod.vod_play_url = '测试$' + id;
    videos.push(vod);
  }
  return {
    list: videos,
  };
}

async function play(inReq, _outResp) {
  // const flag = inReq.body.flag;
  const id = inReq.body.id;
  return {
    parse: 0,
    url: id,
  };
}

async function test(inReq, outResp) {
  try {
    const printErr = function (json) {
      if (json.statusCode && json.statusCode == 500) {
        console.error(json);
      }
    };
    const prefix = inReq.server.prefix;
    const dataResult = {};
    let resp = await inReq.server.inject().post(`${prefix}/support`).payload({
      clip: 'https://xx.xx/1.m3u8',
    });
    dataResult.support = resp.json();
    printErr(resp.json());
    resp = await inReq.server.inject().post(`${prefix}/detail`).payload({
      id: 'https://xx.xx/1.m3u8',
    });
    dataResult.detail = resp.json();
    printErr(resp.json());
    resp = await inReq.server.inject().post(`${prefix}/play`).payload({
      flag: 'xx',
      id: 'https://xx.xx/1.m3u8',
    });
    dataResult.play = resp.json();
    printErr(resp.json());
    return dataResult;
  } catch (err) {
    console.error(err);
    outResp.code(500);
    return { err: err.message, tip: 'check debug console output' };
  }
}

export default {
  meta: {
    key: 'push',
    name: '推送',
    type: 4,
  },
  api: async (fastify) => {
    fastify.post('/init', init);
    fastify.post('/support', support);
    fastify.post('/detail', detail);
    fastify.post('/play', play);
    fastify.get('/test', test);
  },
};
