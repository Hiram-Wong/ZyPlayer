import req from '../../util/req.js';
import CryptoJS from 'crypto-js';
import { PC_UA } from '../../util/misc.js';
import { load } from 'cheerio';

let url = 'https://www.copymanga.tv';

async function request(reqUrl) {
    let resp = await req.get(reqUrl, {
        headers: {
            'User-Agent': PC_UA,
        },
    });
    return resp.data;
}

async function init(_inReq, _outResp) {
    return {};
}

async function home(_inReq, _outResp) {
    var html = await request(url + '/comics');
    const $ = load(html);
    let filterObj = {};

    let region = {
        key: 'region',
        name: '地區',
        init: '',
    };
    let regionValues = [];
    regionValues.push({ n: '全部', v: '' });
    regionValues.push({ n: '日漫', v: '0' });
    regionValues.push({ n: '韓漫', v: '1' });
    regionValues.push({ n: '美漫', v: '2' });
    region['value'] = regionValues;

    let ordering = {
        key: 'ordering',
        name: '排序',
        init: '-datetime_updated',
    };
    let orderingValues = [];
    orderingValues.push({ n: '更新時間↓', v: '-datetime_updated' });
    orderingValues.push({ n: '更新時間↑', v: 'datetime_updated' });
    orderingValues.push({ n: '熱門↓', v: '-popular' });
    orderingValues.push({ n: '熱門↑', v: 'popular' });
    ordering['value'] = orderingValues;

    let status = {
        key: 'sort',
        name: '狀態',
        init: '',
    };
    let statusValues = [];
    statusValues.push({ n: '全部', v: '' });
    statusValues.push({ n: '連載中', v: '0' });
    statusValues.push({ n: '已完結', v: '1' });
    statusValues.push({ n: '短篇', v: '2' });
    status['value'] = statusValues;

    filterObj['c1'] = [];

    let themeValues = [{ n: '全部', v: '' }];
    for (const a of $('div.classify-right>a[href*="theme="]')) {
        themeValues.push({
            n: $(a).text().trim(),
            v: a.attribs.href.match(/.*?theme=(.*)&/)[1],
        });
    }

    filterObj['c1'].push({
        key: 'theme',
        name: '',
        init: '',
        wrap: 1,
        value: themeValues,
    });

    filterObj['c1'].push(region);
    filterObj['c1'].push(status);
    filterObj['c1'].push(ordering);

    return {
        class: [{ type_name: 'all', type_id: 'c1' }],
        filters: filterObj,
    };
}

async function category(inReq, _outResp) {
    const pg = inReq.body.page;
    const extend = inReq.body.filters;
    let page = pg || 1;
    if (page == 0) page = 1;
    let link = url + `/comics?theme=${extend.theme || ''}&region=${extend.region || ''}&status=${extend.status || ''}&ordering=${extend.ordering || '-datetime_updated'}`;
    if (page > 1) {
        link += '&offset=' + (page - 1) * 50 + '&limit=50';
    }
    var html = await request(link);
    const $ = load(html);
    const list = eval($('div[class="row exemptComic-box"]')[0].attribs.list);
    let books = [];
    for (const book of list) {
        books.push({
            book_id: book.path_word,
            book_name: book.name,
            book_pic: book.cover,
            book_remarks: book.author ? book.author[0].name : '',
        });
    }
    return {
        page: page,
        pagecount: list.length == 50 ? page + 1 : page,
        list: books,
    };
}

async function detail(inReq, _outResp) {
    const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
    const books = [];
    for (const id of ids) {
        var html = await request(url + `/comic/${id}`);
        const $ = load(html);
        let book = {
            book_name: $('h6').text().trim(),
            book_director: $('span.comicParticulars-right-txt>a[href*="/author/"]')
                .map((_, a) => $(a).text().trim())
                .get()
                .join('/'),
            book_content: $('p.intro').text().trim(),
        };

        const data = (await request(url + `/comicdetail/${id}/chapters`)).results;
        var key = CryptoJS.enc.Utf8.parse('xxxmanga.woo.key');
        var iv = CryptoJS.enc.Utf8.parse(data.substr(0, 16));
        var src = CryptoJS.enc.Hex.parse(data.substr(16));
        var dst = CryptoJS.AES.decrypt({ ciphertext: src }, key, { iv: iv, padding: CryptoJS.pad.Pkcs7 });
        dst = CryptoJS.enc.Utf8.stringify(dst);

        const groups = JSON.parse(dst).groups;

        let urls = groups.default.chapters
            .map((c) => {
                return c.name + '$' + id + '|' + c.id;
            })
            .join('#');
        book.volumes = '默認';
        book.urls = urls;
        books.push(book);
    }
    return {
        list: books,
    };
}

async function play(inReq, _outResp) {
    const id = inReq.body.id;
    var info = id.split('|');
    var html = await request(url + `/comic/${info[0]}/chapter/${info[1]}`);
    const $ = load(html);
    const data = $('div.imageData')[0].attribs.contentkey;
    var key = CryptoJS.enc.Utf8.parse('xxxmanga.woo.key');
    var iv = CryptoJS.enc.Utf8.parse(data.substr(0, 16));
    var src = CryptoJS.enc.Hex.parse(data.substr(16));
    var dst = CryptoJS.AES.decrypt({ ciphertext: src }, key, { iv: iv, padding: CryptoJS.pad.Pkcs7 });
    dst = CryptoJS.enc.Utf8.stringify(dst);
    const list = JSON.parse(dst);
    var content = [];
    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        content[index] = element.url;
    }
    return {
        content: content,
    };
}

async function search(inReq, _outResp) {
    const pg = inReq.body.page;
    const wd = inReq.body.wd;
    let page = pg || 1;
    if (page == 0) page = 1;
    const link = `${url}/api/kb/web/searcha/comics?offset=${page > 1 ? ((page - 1) * 12).toString() : ''}&platform=2&limit=12&q=${wd}&q_type=`;
    var list = (await request(link)).results.list;
    const books = [];
    for (const book of list) {
        books.push({
            book_id: book.path_word,
            book_name: book.name,
            book_pic: book.cover,
            book_remarks: book.author ? book.author[0].name : '',
        });
    }
    return {
        page: page,
        pagecount: list.length == 12 ? page + 1 : page,
        list: books,
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
                    id: dataResult.category.list[0].book_id, // dataResult.category.list.map((v) => v.vod_id),
                });
                dataResult.detail = resp.json();
                printErr(resp.json());
                if (dataResult.detail.list && dataResult.detail.list.length > 0) {
                    dataResult.play = [];
                    for (const book of dataResult.detail.list) {
                        const flags = book.volumes.split('$$$');
                        const ids = book.urls.split('$$$');
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
        key: 'copymanga',
        name: '拷贝漫画',
        type: 20,
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
