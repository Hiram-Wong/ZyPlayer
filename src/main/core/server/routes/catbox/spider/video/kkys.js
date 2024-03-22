import req from '../../util/req.js';
import CryptoJS from 'crypto-js';

import { formatPlayUrl, randDeviceWithId, jsonParse, randStr } from '../../util/misc.js';

import dayjs from 'dayjs';

let url = 'https://api1.baibaipei.com:8899';
let device = {};

async function request(reqUrl, postData, agentSp, get) {
    let ts = dayjs().valueOf().toString();
    let rand = randStr(32);
    let sign = CryptoJS.enc.Hex.stringify(CryptoJS.MD5('H58d2%gLbeingX*%D4Y8!C!!@G_' + ts + '_' + rand))
        .toString()
        .toLowerCase();
    let headers = {
        'user-agent': agentSp || device.ua,
    };
    if (reqUrl.includes('baibaipei')) {
        headers['device-id'] = device.id;
        headers['push-token'] = '';
        headers['sign'] = sign;
        headers['time'] = ts;
        headers['md5'] = rand;
        headers['version'] = '2.1.5';
        headers['system-model'] = device.model;
        headers['system-brand'] = device.brand;
        headers['system-version'] = device.release;
    }
    if (!get) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers,
        data: postData || {},
    });

    let content = res.data;
    // console.log(content);
    if (typeof content === 'string') {
        var key = CryptoJS.enc.Utf8.parse('IjhHsCB2B5^#%0Ag');
        var iv = CryptoJS.enc.Utf8.parse('y8_m.3rauW/>j,}.');
        var src = CryptoJS.enc.Base64.parse(content);
        let dst = CryptoJS.AES.decrypt({ ciphertext: src }, key, { iv: iv, padding: CryptoJS.pad.Pkcs7 });
        dst = CryptoJS.enc.Utf8.stringify(dst);
        // console.log(dst);
        return JSON.parse(dst);
    }
    return content;
}

async function init(inReq, _outResp) {
    const deviceKey = inReq.server.prefix + '/device';
    device = await inReq.server.db.getObjectDefault(deviceKey, {});
    if (!device.id) {
        device = randDeviceWithId(33);
        device.id = device.id.toLowerCase();
        device.ua = 'okhttp/4.1.0';
        await inReq.server.db.push(deviceKey, device);
    }
    return {};
}

async function home(_inReq, _outResp) {
    let data = (await request(url + '/api.php/Index/getTopVideoCategory')).data;
    let classes = [];
    let filterObj = {};
    for (const type of data) {
        let typeName = type.nav_name;
        if (typeName == '推荐') continue;
        let typeId = type.nav_type_id.toString();
        classes.push({
            type_id: typeId,
            type_name: typeName,
        });
        try {
            let filterAll = [];
            let filterData = (await request(url + '/api.php/Video/getFilterType', { type: typeId })).data;
            for (let key of Object.keys(filterData)) {
                let itemValues = filterData[key];
                if (key === 'plot') key = 'class';
                let typeExtendName = '';
                switch (key) {
                    case 'class':
                        typeExtendName = '类型';
                        break;
                    case 'area':
                        typeExtendName = '地区';
                        break;
                    case 'lang':
                        typeExtendName = '语言';
                        break;
                    case 'year':
                        typeExtendName = '年代';
                        break;
                    case 'sort':
                        typeExtendName = '排序';
                        break;
                }
                if (typeExtendName.length === 0) continue;
                let newTypeExtend = {
                    key: key,
                    name: typeExtendName,
                };
                let newTypeExtendKV = [];
                for (let j = 0; j < itemValues.length; j++) {
                    const name = itemValues[j];
                    let value = key === 'sort' ? j + '' : name === '全部' ? '0' : name;
                    newTypeExtendKV.push({ n: name, v: value });
                }
                newTypeExtend['init'] = key === 'sort' ? '1' : newTypeExtendKV[0]['v'];
                newTypeExtend.value = newTypeExtendKV;
                filterAll.push(newTypeExtend);
            }
            if (filterAll.length > 0) {
                filterObj[typeId] = filterAll;
            }
        } catch (e) {
            console.log(e);
        }
    }
    return {
        class: classes,
        filters: filterObj,
    };
}

async function category(inReq, _outResp) {
    const tid = inReq.body.id;
    const pg = inReq.body.page;
    const extend = inReq.body.filters;
    let page = pg || 1;
    if (page == 0) page = 1;
    let reqUrl = url + '/api.php/Video/getFilterVideoList';
    var formData = {
        type: tid,
        p: page.toString(),
        area: extend.area | 0,
        year: extend.year | 0,
        sort: extend.sort | 0,
        class: extend.class | 0,
    };
    // console.log(formData);
    let data = (await request(reqUrl, formData)).data;
    let videos = [];
    for (const vod of data.data) {
        videos.push({
            vod_id: vod.vod_id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic,
            vod_remarks: vod.vod_remarks || vod.vod_score || '',
        });
    }
    return {
        page: parseInt(data.current_page),
        pagecount: parseInt(data.last_page),
        limit: parseInt(data.per_page),
        total: parseInt(data.total),
        list: videos,
    };
}

async function detail(inReq, _outResp) {
    const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
    const videos = [];
    for (const id of ids) {
        let data = (await request(url + '/api.php/Video/getVideoInfo', { video_id: id })).data.video;
        let vod = {
            vod_id: data.vod_id,
            vod_name: data.vod_name,
            vod_pic: data.vod_pic,
            type_name: data.vod_class,
            vod_year: data.vod_year,
            vod_area: data.vod_area,
            vod_remarks: data.vod_remarks || '',
            vod_actor: data.vod_actor,
            vod_director: data.vod_director,
            vod_content: data.vod_content.trim(),
        };
        let playlist = {};
        for (const item of data.vod_play) {
            let from = item.playerForm;
            if (from === 'jp') continue;
            if (from === 'xg') continue;
            let urls = [];
            for (const u of item.url) {
                urls.push(formatPlayUrl(vod.vod_name, u.title) + '$' + u.play_url);
            }
            if (!playlist.hasOwnProperty(from) && urls.length > 0) {
                playlist[from] = urls;
            }
        }
        parse = data.parse || [];
        vod.vod_play_from = Object.keys(playlist).join('$$$');
        let urls = Object.values(playlist);
        let vod_play_url = [];
        for (const urlist of urls) {
            vod_play_url.push(urlist.join('#'));
        }
        vod.vod_play_url = vod_play_url.join('$$$');
        videos.push(vod);
    }
    return {
        list: videos,
    };
}

var parse = [];

async function play(inReq, _outResp) {
    const id = inReq.body.id;
    try {
        if (id.indexOf('youku') >= 0 || id.indexOf('iqiyi') >= 0 || id.indexOf('v.qq.com') >= 0 || id.indexOf('pptv') >= 0 || id.indexOf('le.com') >= 0 || id.indexOf('1905.com') >= 0 || id.indexOf('mgtv') >= 0) {
            if (parse.length > 0) {
                for (let index = 0; index < parse.length; index++) {
                    try {
                        const p = parse[index];
                        let res = await req.get(p + id, {
                            headers: { 'user-agent': 'okhttp/4.1.0' },
                        });
                        var jj = res.data.replace('User - Agent', 'User-Agent');
                        if (!jj.url && jj.data && jj.data.url) {
                            jj = jj.data;
                        }
                        var result = jsonParse(id, jj);
                        if (result.url) {
                            result.parse = 0;
                            if (result.header) {
                                Object.keys(result.header).forEach((hk) => {
                                    if (!result.header[hk]) delete result.header[hk];
                                });
                            }
                            return result;
                        }
                    } catch (error) {}
                }
            }
        }
        if (id.indexOf('jqq-') >= 0) {
            var jqqHeader = await request(url + '/jqqheader.json', null, null, true);
            var jqqHeaders = jqqHeader;
            var ids = id.split('-');
            var jxJqq = await req.get('https://api.juquanquanapp.com/app/drama/detail?dramaId=' + ids[1] + '&episodeSid=' + ids[2] + '&quality=LD', { headers: jqqHeaders });
            var jqqInfo = jxJqq.content;
            if (jqqInfo.data.playInfo.url) {
                return {
                    parse: 0,
                    playUrl: '',
                    url: jqqInfo.data.playInfo.url,
                };
            }
        }
        let res = await request(url + '/video.php', { url: id });
        var result = jsonParse(id, res.data);
        if (result.url) {
            result.parse = 0;
            return result;
        }
    } catch (e) {
        console.log(e);
    }
    return {
        parse: 0,
        url: id,
    };
}

async function search(inReq, _outResp) {
    const pg = inReq.body.page;
    const wd = inReq.body.wd;
    let page = pg || 1;
    if (page == 0) page = 1;
    let data = (await request(url + '/api.php/Search/getSearch', { key: wd, type_id: 0, p: page })).data;
    let videos = [];
    for (const vod of data.data) {
        videos.push({
            vod_id: vod.vod_id,
            vod_name: vod.vod_name,
            vod_pic: vod.vod_pic,
            vod_remarks: vod.vod_remarks || vod.vod_score || '',
        });
    }
    return {
        list: videos,
        page: data.current_page,
        pagecount: data.last_page,
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
        let resp = await inReq.server.inject().post(`${prefix}/init`);
        dataResult.init = resp.json();
        printErr(resp.json());
        resp = await inReq.server.inject().post(`${prefix}/home`);
        dataResult.home = resp.json();
        printErr(resp.json());
        if (dataResult.home.class.length > 0) {
            resp = await inReq.server.inject().post(`${prefix}/category`).payload({
                id: dataResult.home.class[0].type_id,
                page: 1,
                filter: true,
                filters: {},
            });
            dataResult.category = resp.json();
            printErr(resp.json());
            if (dataResult.category.list.length > 0) {
                resp = await inReq.server.inject().post(`${prefix}/detail`).payload({
                    id: dataResult.category.list[0].vod_id, // dataResult.category.list.map((v) => v.vod_id),
                });
                dataResult.detail = resp.json();
                printErr(resp.json());
                if (dataResult.detail.list && dataResult.detail.list.length > 0) {
                    dataResult.play = [];
                    for (const vod of dataResult.detail.list) {
                        const flags = vod.vod_play_from.split('$$$');
                        const ids = vod.vod_play_url.split('$$$');
                        for (let j = 0; j < flags.length; j++) {
                            const flag = flags[j];
                            const urls = ids[j].split('#');
                            for (let i = 0; i < urls.length && i < 2; i++) {
                                resp = await inReq.server
                                    .inject()
                                    .post(`${prefix}/play`)
                                    .payload({
                                        flag: flag,
                                        id: urls[i].split('$')[1],
                                    });
                                dataResult.play.push(resp.json());
                            }
                        }
                    }
                }
            }
        }
        resp = await inReq.server.inject().post(`${prefix}/search`).payload({
            wd: '爱',
            page: 1,
        });
        dataResult.search = resp.json();
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
        key: 'kkys',
        name: '快看影视',
        type: 3,
    },
    api: async (fastify) => {
        fastify.post('/init', init);
        fastify.post('/home', home);
        fastify.post('/category', category);
        fastify.post('/detail', detail);
        fastify.post('/play', play);
        fastify.post('/search', search);
        fastify.get('/test', test);
    },
};
