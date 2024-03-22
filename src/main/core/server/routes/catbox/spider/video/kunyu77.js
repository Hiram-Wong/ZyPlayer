import req from '../../util/req.js';
import { formatPlayUrl, randDeviceWithId, jsonParse, randUUID } from '../../util/misc.js';

import dayjs from 'dayjs';
import NodeRSA from 'node-rsa';
import CryptoJS from 'crypto-js';

let url = 'https://api.tyun77.cn';
let device = {};
let timeOffset = 0;
const appVer = '2.3.0';
const rsa = NodeRSA(
    `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7QHUVAUM7yghB0/3qz5C
bWX5YYD0ss+uDtbDz5VkTclop6YnCY+1U4aw4z134ljkp/jL0mWnYioZHTTqxXMf
R5q15FcMZnnn/gMZNj1ZR67/c9ti6WTG0VEr9IdcJgwHwwGak/xQK1Z9htl7TR3Q
WA45MmpCSSgjVvX4bbV43IjdjSZNm8s5efdlLl1Z+7uJTR024xizhK5NH0/uPmR4
O8QEtxO9ha3LMmTYTfERzfNmpfDVdV3Rok4eoTzhHmxgqQ0/S0S+FgjHiwrCTFlv
NCiDhSemnJT+NIzAnMQX4acL5AYNb5PiDD06ZMrtklTua+USY0gSIrG9LctaYvHR
swIDAQAB
-----END PUBLIC KEY-----`,
    'pkcs8-public-pem',
    {
        encryptionScheme: 'pkcs1',
    }
);

async function request(reqUrl, ua) {
    let sj = dayjs().unix() - timeOffset;
    let uri = new URL(reqUrl);
    uri.searchParams.append('pcode', '010110010');
    uri.searchParams.append('version', appVer);
    uri.searchParams.append('devid', device.id);
    uri.searchParams.append('package', 'com.sevenVideo.app.android'); // com.xiaoxiaoVideo.app.android
    uri.searchParams.append('sys', 'android');
    uri.searchParams.append('sysver', device.release);
    uri.searchParams.append('brand', device.brand);
    uri.searchParams.append('state', 'on');
    uri.searchParams.append('model', device.model.replaceAll(' ', '_'));
    uri.searchParams.append('sj', sj);
    let keys = [];
    for (const k of uri.searchParams.keys()) {
        keys.push(k);
    }
    keys.sort();
    let tkSrc = uri.pathname;
    for (let k of keys) {
        let v = uri.searchParams.get(k);
        v = encodeURIComponent(v);
        tkSrc += v;
    }
    tkSrc += sj;
    tkSrc += 'XSpeUFjJ';
    console.log(tkSrc);
    let tk = CryptoJS.enc.Hex.stringify(CryptoJS.MD5(tkSrc)).toString().toLowerCase();
    console.log(tk);
    let header = {
        'User-Agent': ua || 'okhttp/3.12.0',
        T: sj,
        TK: tk,
    };

    if (reqUrl.indexOf('getVideoPlayAuth') > 0) {
        header['TK-VToken'] = rsa.encrypt(`{"videoId":"${uri.searchParams.get('videoId')}","timestamp":"${sj}"}`, 'base64');
    } else if (reqUrl.indexOf('parserUrl') > 0) {
        header['TK-VToken'] = rsa.encrypt(`{"url":"${uri.searchParams.get('url')}","timestamp":"${sj}"}`, 'base64');
    }

    let resp = await req.get(uri.toString(), {
        headers: header,
    });

    let serverTime = resp.headers.date; //  dart all response header key is lowercase
    let serverTimeS = dayjs(serverTime).unix();
    timeOffset = dayjs().unix() - serverTimeS;
    return resp.data;
}

async function init(inReq, _outResp) {
    console.log(inReq.server.config.kunyu77.testcfg);
    const deviceKey = inReq.server.prefix + '/device';
    device = await inReq.server.db.getObjectDefault(deviceKey, {});
    if (!device.id) {
        device = randDeviceWithId(32);
        device.id = device.id.toLowerCase();
        device.ua = 'Dalvik/2.1.0 (Linux; U; Android ' + device.release + '; ' + device.model + ' Build/' + device.buildId + ')';
        await inReq.server.db.push(deviceKey, device);
    }
    await request(url + '/api.php/provide/getDomain');
    await request(url + '/api.php/provide/config');
    await request(url + '/api.php/provide/checkUpgrade');
    await request(url + '/api.php/provide/channel');
    return {};
}

async function home(_inReq, _outResp) {
    let data = (await request(url + '/api.php/provide/filter')).data;
    let classes = [];
    let filterObj = {};
    let filterAll = [];
    for (const key in data) {
        classes.push({
            type_id: key,
            type_name: data[key][0].cat,
        });
        try {
            let typeId = key.toString();
            if (filterAll.length === 0) {
                let filterData = (await request(url + '/api.php/provide/searchFilter?type_id=0&pagenum=1&pagesize=24')).data.conditions;
                // 年份
                let year = {
                    key: 'year',
                    name: '年份',
                    init: '',
                };
                let yearValues = [];
                yearValues.push({ n: '全部', v: '' });
                // yearValues.push({ n: '2022', v: '2022' });
                // yearValues.push({ n: '2021', v: '2021' });
                filterData.y.forEach((e) => {
                    yearValues.push({ n: e.name, v: e.value });
                });
                year['value'] = yearValues;
                // 地区
                let area = {
                    key: 'area',
                    name: '地区',
                    init: '',
                };
                let areaValues = [];
                areaValues.push({ n: '全部', v: '' });
                filterData.a.forEach((e) => {
                    areaValues.push({ n: e.name, v: e.value });
                });
                area['value'] = areaValues;
                // 类型
                let type = {
                    key: 'category',
                    name: '类型',
                    init: '',
                };
                let typeValues = [];
                typeValues.push({ n: '全部', v: '' });
                filterData.scat.forEach((e) => {
                    typeValues.push({ n: e.name, v: e.value });
                });
                type['value'] = typeValues;

                filterAll.push(year, area, type);
            }
            if (filterAll.length !== 0) {
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
    let reqUrl = url + '/api.php/provide/searchFilter?type_id=' + tid + '&pagenum=' + pg + '&pagesize=24&';
    reqUrl += `year=${extend.year || ''}&category=${extend.category || ''}&area=${extend.area || ''}`;
    let data = (await request(reqUrl)).data;
    let videos = [];
    for (const vod of data.result) {
        videos.push({
            vod_id: vod.id,
            vod_name: vod.title,
            vod_pic: vod.videoCover,
            vod_remarks: vod.msg,
        });
    }
    return {
        page: parseInt(data.page),
        pagecount: data.pagesize,
        limit: 24,
        total: data.total,
        list: videos,
    };
}

async function detail(inReq, _outResp) {
    const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
    const videos = [];
    for (const id of ids) {
        let data = (await request(url + '/api.php/provide/videoDetail?ids=' + id)).data;
        console.log(data);
        let vod = {
            vod_id: data.id,
            vod_name: data.videoName,
            vod_pic: data.videoCover,
            type_name: data.subCategory,
            vod_year: data.year,
            vod_area: data.area,
            vod_remarks: data.msg,
            vod_actor: data.actor,
            vod_director: data.director,
            vod_content: data.brief.trim(),
        };
        let episodes = (await request(url + '/api.php/provide/videoPlaylist?ids=' + id)).data.episodes;
        let playlist = {};
        for (const episode of episodes) {
            let playurls = episode.playurls;
            for (const playurl of playurls) {
                let from = playurl.playfrom;
                let t = formatPlayUrl(vod.vod_name, playurl.title);
                if (t.length == 0) t = playurl.title.trim();
                if (!playlist.hasOwnProperty(from)) {
                    playlist[from] = [];
                }
                playlist[from].push(t + '$' + playurl.playurl);
            }
        }
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

async function play(inReq, _outResp) {
    const flag = inReq.body.flag;
    const id = inReq.body.id;
    if (flag == 'alivc') {
        const ua = `Dalvik/2.1.0(sevenVideo android)${device.release} ${appVer} ${device.brand}`;
        let data = (await request(url + '/api.php/provide/getVideoPlayAuth?videoId=' + id)).data;
        var s = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(data.playAuth));
        s = JSON.parse(s);

        const e = {
            AccessKeyId: s.AccessKeyId,
            Action: 'GetPlayInfo',
            AuthInfo: s.AuthInfo,
            AuthTimeout: 3600,
            Channel: 'Android',
            Format: 'JSON',
            Formats: '',
            PlayerVersion: '',
            Rand: randUUID(),
            SecurityToken: s.SecurityToken,
            SignatureMethod: 'HMAC-SHA1',
            SignatureNonce: randUUID(),
            SignatureVersion: '1.0',
            Version: '2017-03-21',
            VideoId: id,
        };
        let keys = Object.keys(e);
        keys.sort();

        let param = keys.map((k) => k + '=' + encodeURIComponent(e[k])).join('&');
        let signSrc = 'GET&%2F&' + encodeURIComponent(param);
        let sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signSrc, s.AccessKeySecret + '&'));
        param += '&Signature=' + encodeURIComponent(sign);

        const aliurl = 'https://vod.cn-shanghai.aliyuncs.com/?' + param;
        const res = await req.get(aliurl, {
            header: {
                'User-Agent': ua,
            },
        });
        if (res.status == 200) {
            const p = res.data;
            return {
                parse: 0,
                url: p.PlayInfoList.PlayInfo[0].PlayURL,
                header: {
                    'User-Agent': ua,
                },
            };
        } else {
            return {
                parse: 0,
                url: id,
            };
        }
    }

    let data = (await request(url + '/api.php/provide/parserUrl?url=' + id + '&retryNum=0')).data;
    let playHeader = data.playHeader;
    let jxUrl = data.url;
    if (jxUrl.indexOf(url) >= 0) {
        let result = jsonParse(id, await request(jxUrl));
        result['parse'] = 0;
        if (playHeader) {
            result.header = Object.assign(result.header, playHeader);
        }
        return result;
    } else {
        let res = await req.get(jxUrl, {
            headers: {
                'user-agent': 'okhttp/3.12.0',
            },
        });
        let result = jsonParse(id, res.data);
        result['parse'] = 0;
        if (playHeader) {
            result.header = Object.assign(result.header, playHeader);
        }
        return result;
    }
}

async function search(inReq, _outResp) {
    const pg = inReq.body.page;
    const wd = inReq.body.wd;
    let page = pg || 1;
    if (page == 0) page = 1;
    let data = await request(url + '/api.php/provide/searchVideo?searchName=' + wd + '&pg=' + page, 'okhttp/3.12.0');
    let videos = [];
    for (const vod of data.data) {
        videos.push({
            vod_id: vod.id,
            vod_name: vod.videoName,
            vod_pic: vod.videoCover,
            vod_remarks: vod.msg,
        });
    }
    return {
        page: page,
        pagecount: data.pages,
        list: videos,
    };
}

async function test(inReq, outResp) {
    try {
        const prefix = inReq.server.prefix;
        const dataResult = {};
        let resp = await inReq.server.inject().post(`${prefix}/init`);
        dataResult.init = resp.json();
        resp = await inReq.server.inject().post(`${prefix}/home`);
        dataResult.home = resp.json();
        if (dataResult.home.class.length > 0) {
            resp = await inReq.server.inject().post(`${prefix}/category`).payload({
                id: dataResult.home.class[0].type_id,
                page: 1,
                filter: true,
                filters: {},
            });
            dataResult.category = resp.json();
            if (dataResult.category.list.length > 0) {
                resp = await inReq.server.inject().post(`${prefix}/detail`).payload({
                    id: dataResult.category.list[0].vod_id, // dataResult.category.list.map((v) => v.vod_id),
                });
                dataResult.detail = resp.json();
                if (dataResult.detail.list.length > 0) {
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
        return dataResult;
    } catch (err) {
        console.error(err);
        outResp.code(500);
        return { err: err.message, tip: 'check debug console output' };
    }
}

export default {
    meta: {
        key: 'kunyu77',
        name: '琨娱七七',
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
