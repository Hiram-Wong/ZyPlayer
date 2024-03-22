import req from '../../util/req.js';
import { MOBILE_UA } from '../../util/misc.js';
import { load } from 'cheerio';

let url = 'https://m.13bqg.cc';

async function request(reqUrl) {
    let resp = await req.get(reqUrl, {
        headers: {
            'Accept-Language': 'zh-CN,zh;q=0.8',
            'User-Agent': MOBILE_UA,
        },
    });
    return resp.data;
}

async function init(_inReq, _outResp) {
    return {};
}

async function home(_inReq, _outResp) {
    var html = await request(url);
    const $ = load(html);
    let classes = [];
    for (const a of $('div.nav > ul > li > a[href!="/"]')) {
        classes.push({
            type_id: a.attribs.href.replace(/\//g, ''),
            type_name: a.children[0].data.trim(),
            tline: 2,
        });
    }
    return {
        class: classes,
    };
}

async function category(inReq, _outResp) {
    const tid = inReq.body.id;
    const pg = inReq.body.page;
    let page = pg || 1;
    if (page == 0) page = 1;
    var html = await request(url + `/${tid}/${page}.html`);
    const $ = load(html);
    let books = [];
    for (const item of $('div.item')) {
        const a = $(item).find('a:first')[0];
        const img = $(a).find('img:first')[0];
        const span = $(item).find('span:first')[0];
        books.push({
            book_id: a.attribs.href,
            book_name: img.attribs.alt,
            book_pic: img.attribs.src,
            book_remarks: span.children[0].data.trim(),
        });
    }
    return {
        page: pg,
        pagecount: $('div.page > a:contains(>)').length > 0 ? pg + 1 : pg,
        list: books,
    };
}

async function detail(inReq, _outResp) {
    const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
    const books = [];
    for (const id of ids) {
        var html = await request(url + id);
        var $ = load(html);
        let book = {
            book_name: $('[property$=book_name]')[0].attribs.content,
            book_year: $('[property$=update_time]')[0].attribs.content,
            book_director: $('[property$=author]')[0].attribs.content,
            book_content: $('[property$=description]')[0].attribs.content,
        };
        html = await request(url + id + `list.html`);
        $ = load(html);
        let urls = [];
        const links = $('dl>dd>a[href*="/html/"]');
        for (const l of links) {
            var name = $(l).text().trim();
            var link = l.attribs.href;
            urls.push(name + '$' + link);
        }
        book.volumes = '全卷';
        book.urls = urls.join('#');
        books.push(book);
    }
    return {
        list: books,
    };
}

async function play(inReq, _outResp) {
    let id = inReq.body.id;
    var content = '';
    while (true) {
        var html = await request(url + id);
        var $ = load(html);
        content += $('#chaptercontent')
            .html()
            .replace(/<br>|请收藏.*?<\/p>/g, '\n')
            .trim();
        id = $('a.Readpage_down')[0].attribs.href;
        if (id.indexOf('_') < 0) break;
    }
    return {
        content: content + '\n\n',
    };
}

async function search(inReq, _outResp) {
    const wd = inReq.body.wd;
    const cook = await req.get(`${url}/user/hm.html?q=${encodeURIComponent(wd)}`, {
        headers: {
            accept: 'application/json',
            'User-Agent': MOBILE_UA,
            Referer: `${url}/s?q=${encodeURIComponent(wd)}`,
        },
    });
    const set_cookie = Array.isArray(cook.headers['set-cookie']) ? cook.headers['set-cookie'].join(';;;') : cook.headers['set-cookie'];
    const cks = set_cookie.split(';;;');
    const cookie = {};
    for (const c of cks) {
        const tmp = c.trim();
        const idx = tmp.indexOf('=');
        const k = tmp.substr(0, idx);
        const v = tmp.substr(idx + 1, tmp.indexOf(';') - idx - 1);
        cookie[k] = v;
    }
    const resp = await req.get(`${url}/user/search.html?q=${encodeURIComponent(wd)}&so=undefined`, {
        headers: {
            accept: 'application/json',
            'User-Agent': MOBILE_UA,
            cookie: 'hm=' + cookie['hm'],
            Referer: `${url}/s?q=${encodeURIComponent(wd)}`,
        },
    });
    let books = [];
    for (const book of resp.data) {
        books.push({
            book_id: book.url_list,
            book_name: book.articlename,
            book_pic: book.url_img,
            book_remarks: book.author,
        });
    }
    return {
        tline: 2,
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
            wd: '科技',
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
        key: '13bqg',
        name: '笔趣阁',
        type: 10,
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
