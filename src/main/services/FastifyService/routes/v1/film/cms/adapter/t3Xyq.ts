import { loggerService } from '@logger';
import { pd, pdfa, pdfh } from '@main/utils/hiker/htmlParser';
import jinja from '@main/utils/hiker/jinja';
import * as XBPQParse from '@main/utils/hiker/ruleParse';
import { MOBILE_UA, PC_UA } from '@main/utils/hiker/ua';
import { request } from '@main/utils/request';
import { SITE_LOGGER_MAP, SITE_TYPE } from '@shared/config/film';
import { getHome } from '@shared/modules/headers';
import type {
  ICmsCategory,
  ICmsCategoryOptions,
  ICmsDetail,
  ICmsDetailOptions,
  ICmsHome,
  ICmsHomeVod,
  ICmsInit,
  ICmsPlay,
  ICmsPlayOptions,
  ICmsProxy,
  ICmsProxyOptions,
  ICmsRunMian,
  ICmsRunMianOptions,
  ICmsSearch,
  ICmsSearchOptions,
  IConstructorOptions,
} from '@shared/types/cms';
import JSON5 from 'json5';

const logger = loggerService.withContext(SITE_LOGGER_MAP[SITE_TYPE.T3_XYQ]);

function getValueByPath(json, path) {
  // 将路径字符串拆分成属性名数组
  const keys = path.split('.');
  // 逐层访问对象属性
  return keys.reduce((obj, key) => {
    if (obj === undefined || obj === null) {
      return undefined;
    }
    return obj[key];
  }, json); // 初始值为json对象
}

function generateYearArray(startYear, endYear) {
  const years: number[] = [];
  for (let year = startYear; year >= endYear; year--) {
    years.push(year);
  }
  return years;
}

const replacePlaceholders = (url, fl) => {
  return jinja.render(url.replace(/\{(\w+)\}/g, '{{$1}}'), fl);
};

class T3XyqAdapter {
  rule: any = {};
  source: any = '';
  XYQRULE: any = {};
  private categories: string[] = [];

  constructor(source: IConstructorOptions) {
    this.source = source;
    this.categories = source.categories;

    this.XYQRULE = source.ext;

    this.rule = {
      name: source.name,
      host: '',
      一级: 'true',
      推荐: 'true',
      类型: '影视',
      headers: {},
    };
  }

  async init(): Promise<ICmsInit> {
    let resp: string = this.source.ext;
    if (this.source.ext.startsWith('http')) {
      const { data } = await request.request({
        url: this.source.ext,
        method: 'GET',
        responseType: 'text',
        headers: { 'User-Agent': 'okhttp/4.12.0' },
      });
      resp = data;
    }
    try {
      resp = JSON5.parse(resp);
      this.XYQRULE = Object.assign(this.XYQRULE, resp);
    } catch {
      // ignore
    }

    const XYQRULE = this.XYQRULE;
    const headers = this.rule.headers;

    if (XYQRULE['请求头参数']) {
      if (XYQRULE['请求头参数'].includes('#') || XYQRULE['请求头参数'].includes('$')) {
        XYQRULE['请求头参数'].split('#').forEach((v) => (headers[v.split('$')[0]] = v.split('$')[1]));
      } else {
        headers['User-Agent'] = XYQRULE['请求头参数'];
      }
    }
    headers['User-Agent'] = headers['User-Agent'] === '电脑' || headers['User-Agent'] === 'PC_UA' ? PC_UA : MOBILE_UA;

    if (XYQRULE['首页推荐链接'] || XYQRULE['分类链接']) {
      const host = getHome(XYQRULE['首页推荐链接'] || XYQRULE['分类链接']);
      this.rule.host = host;
    }
    if (!XYQRULE['是否开启获取首页数据'] || !XYQRULE['首页列表数组规则']) {
      this.rule.推荐 = '';
    }
    if (!XYQRULE['分类名称']) {
      this.rule.一级 = '';
    }
    if (XYQRULE['链接是否直接播放'] === '1') {
      this.rule.二级 = '*';
    }
  }

  async home(): Promise<ICmsHome> {
    const XYQRULE = this.XYQRULE;
    const typenames = XYQRULE['分类名称'] ? XYQRULE['分类名称'].split('&') : [];
    const typeids = XYQRULE['分类名称替换词'] ? XYQRULE['分类名称替换词'].split('&') : [];

    const rawClassList = typenames.map((name, i) => ({
      type_id: typeids[i],
      type_name: name,
    }));
    const classes = rawClassList
      .map((item) => ({
        type_id: String(item.type_id ?? '').trim(),
        type_name: item.type_name?.toString().trim() ?? '',
      }))
      .filter(
        (item, index, self) =>
          item.type_id &&
          item.type_name &&
          !this.categories?.includes(item.type_name) &&
          self.findIndex((other) => other.type_id === item.type_id) === index,
      );
    const classIds = classes.map((item) => item.type_id);

    let filters: Record<string, any[]> = {};
    if (typeof XYQRULE['筛选数据'] == 'string' && XYQRULE['筛选数据'] === 'ext') {
      if (!XYQRULE['筛选年份名称'] && XYQRULE['分类链接'].includes('{year}')) {
        XYQRULE['筛选年份名称'] = generateYearArray(new Date().getFullYear(), 2004).join('&');
        XYQRULE['筛选年份替换词'] = generateYearArray(new Date().getFullYear(), 2004).join('&');
      }
      if (!XYQRULE['筛选排序名称'] && XYQRULE['分类链接'].includes('{by}')) {
        XYQRULE['筛选排序名称'] = '时间&人气&评分';
        XYQRULE['筛选排序替换词'] = 'time&hits&score';
      }
      const filtersTypes = ['子分类', '类型', '地区', '年份', '语言', '排序'];
      const filtersIds = ['cateId', 'class', 'area', 'year', 'lang', 'by'];
      const rawFiltersObj = filtersTypes.reduce((acc, it, id) => {
        const ruleName = `筛选${it}名称`;
        const ruleId = `筛选${it}替换词`;

        if (!XYQRULE[ruleName] || !XYQRULE[ruleId]) return acc;

        let catenames = XYQRULE[ruleName].split('||');
        let cateids = (XYQRULE[ruleId] === '*' ? XYQRULE[ruleName] : XYQRULE[ruleId]).split('||');

        /* ———— 长度对齐逻辑 ———— */
        if (it === '排序') {
          catenames = Array.from({ length: typeids.length }).fill(catenames[0]);
          cateids = Array.from({ length: typeids.length }).fill(cateids[0]);
        } else if (cateids.length === 1 && catenames.length === 1 && typeids.length > 1) {
          catenames = Array.from({ length: typeids.length }).fill(catenames[0]);
          cateids = Array.from({ length: typeids.length }).fill(cateids[0]);
        }

        /* ———— 生成每个 type_id 的筛选项 ———— */
        cateids.forEach((_x, i) => {
          const names = catenames[i]?.split('&') ?? [];
          if (names.length === 1 && names[0] === '空') return;

          const ids = cateids[i].split('&');
          const value = names.map((n, idx) => ({ n, v: ids[idx] ?? '' }));

          if (value.length) {
            if (it !== '排序' && value[0].n !== '全部') {
              value.unshift({ n: '全部', v: '' });
            }

            const key = typeids[i]; // 当前分类 id
            if (!acc[key]) acc[key] = []; // 首次初始化
            acc[key].push({
              key: filtersIds[id], // 过滤器字段名
              name: it, // 中文名
              value, // 可选项
            });
          }
        });

        return acc;
      }, {});
      filters = Object.keys(rawFiltersObj).reduce((acc, key) => {
        if (String(key) && classIds.includes(String(key))) {
          acc[String(key)] = rawFiltersObj[key];
        }
        return acc;
      }, {});
    }
    return { class: classes, filters };
  }

  async homeVod(): Promise<ICmsHomeVod> {
    const XYQRULE = this.XYQRULE;
    const html = await this.getCode(XYQRULE['首页推荐链接'] || this.rule.host);
    const list: ICmsHomeVod['list'] = [];
    if (XYQRULE['首页片单是否Jsoup写法'] === '1' || XYQRULE['首页片单是否Jsoup写法'] === '是') {
      const listArr = pdfa(html, XYQRULE['首页列表数组规则']);
      let ls = XYQRULE['首页片单列表数组规则'];
      if (!ls.includes('body&&')) {
        ls = `body&&${ls}`;
      }

      listArr.forEach((it) => {
        pdfa(it, ls).forEach((v) => {
          const vod_id = pd(v, XYQRULE['首页片单链接'] || XYQRULE['分类片单链接'], this.rule.host);
          const vod_name = pdfh(v, XYQRULE['首页片单标题'] || XYQRULE['分类片单标题']);
          const vod_pic = pdfh(v, XYQRULE['首页片单图片'] || XYQRULE['分类片单图片']);
          const vod_remarks = pdfh(v, XYQRULE['首页片单副标题'] || XYQRULE['分类片单副标题']);
          if (vod_id && vod_name) {
            list.push({
              vod_id,
              vod_name,
              vod_pic,
              vod_remarks,
            } as any);
          }
        });
      });
    }

    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = 1;
    const pagecount = videos.length ? 1 : 0;
    const total = videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async category(doc: ICmsCategoryOptions): Promise<ICmsCategory> {
    const { tid, page: pg, extend = {} } = doc;

    const XYQRULE = this.XYQRULE;
    let url = String(
      XYQRULE['分类链接'].includes('firstPage=') && pg === 1
        ? XYQRULE['分类链接'].split('firstPage=')[1].split(']')[0]
        : XYQRULE['分类链接'].split('[')[0],
    );

    url = url.startsWith('http') ? url : this.rule.host;
    extend.cateId = extend?.cateId || tid;

    let html = await this.getCode(
      replacePlaceholders(url.replaceAll('{catePg}', `${pg}`), extend).replaceAll('{cateId}', tid),
    );

    const list: ICmsCategory['list'] = [];
    if (
      (XYQRULE['分类片单是否Jsoup写法'] === '1' || XYQRULE['分类片单是否Jsoup写法'] === '是') &&
      XYQRULE['分类列表数组规则']
    ) {
      pdfa(html, XYQRULE['分类列表数组规则']).forEach((it) => {
        const vod_name = pdfh(it, XYQRULE['分类片单标题']);
        const vod_id = pd(it, XYQRULE['分类片单链接'], this.rule.host);
        const vod_pic = pdfh(it, XYQRULE['分类片单图片']);
        const vod_remarks = pdfh(it, XYQRULE['分类片单副标题']);
        if (vod_id && vod_name) {
          list.push({
            vod_id,
            vod_name,
            vod_pic,
            vod_remarks,
          } as any);
        }
      });
    }
    if (XYQRULE['分类截取模式'] === '0') {
      if (XYQRULE['分类Json数据二次截取']) {
        html = XBPQParse.getHasRuleSplitStr(html, XYQRULE['分类Json数据二次截取'], undefined, true) || html;
      }

      const json = JSON.parse(html);
      const vlist = getValueByPath(json, XYQRULE['分类列表数组规则']);

      vlist.forEach((it) => {
        let vod_id = it[XYQRULE['分类片单链接']];
        const vod_name = it[XYQRULE['分类片单标题']];
        const vod_pic = it[XYQRULE['分类片单图片']];
        const vod_remarks = it[XYQRULE['分类片单副标题']];

        const prefix = XYQRULE['分类片单链接加前缀'] || '';
        let suffix = XYQRULE['分类片单链接加后缀'] || '';
        if (suffix && suffix.includes("'input'")) {
          suffix = suffix.replace("'input'", vod_id);
        }

        vod_id = `${prefix || ''}${vod_id}${suffix || ''}`;

        if (vod_id && vod_name) {
          list.push({
            vod_id,
            vod_name,
            vod_pic,
            vod_remarks,
          } as any);
        }
      });
    }

    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),

        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = 1;
    const pagecount = videos.length ? 999 : 0;
    const total = videos.length ? 999 : 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async detail(doc: ICmsDetailOptions): Promise<ICmsDetail> {
    const { ids } = doc || {};
    const idsArray = ids.split(',');
    const vod_url = ids || '';

    const XYQRULE = this.XYQRULE;
    if (this.rule['二级'] === '*') {
      return {
        list: [
          {
            vod_id: vod_url,
            vod_name: '',
            vod_play_url: vod_url.includes('$') ? vod_url : `直接播放$${vod_url}`,
            vod_play_from: '嗅探',
          } as any,
        ],
      };
    }
    const html = await this.getCode(vod_url);
    let resitem: any = {};

    let tabs: any[] = [];
    const lists: any[] = [];
    try {
      if (XYQRULE['详情是否Jsoup写法'] === '1' || XYQRULE['详情是否Jsoup写法'] === '是') {
        resitem = {
          vod_remarks: pdfh(html, XYQRULE['类型详情']),
          vod_content: pdfh(html, XYQRULE['简介详情']),
          vod_actor: pdfh(html, XYQRULE['演员详情']),
          vod_year: pdfh(html, XYQRULE['年代详情']),
          vod_area: pdfh(html, XYQRULE['地区详情']),
        };
      } else {
        // XBPQ
        resitem = {
          vod_remarks: pdfh(XBPQParse.getHasRuleSplitStr(html, XYQRULE['类型详情'])!, 'Text'),
          vod_content: pdfh(XBPQParse.getHasRuleSplitStr(html, XYQRULE['简介详情'])!, 'Text'),
          vod_actor: pdfh(XBPQParse.getHasRuleSplitStr(html, XYQRULE['演员详情'])!, 'Text'),
          vod_year: XBPQParse.getHasRuleSplitStr(html, XYQRULE['年代详情']),
          vod_area: XBPQParse.getHasRuleSplitStr(html, XYQRULE['地区详情']),
        };
      }
    } catch (error) {
      logger.info('xpath获取海报信息失败>', error as Error);
    }
    try {
      if (XYQRULE['线路列表数组规则']) {
        pdfa(html, XYQRULE['线路列表数组规则']).forEach((it) => {
          let linename = '';
          XYQRULE['线路标题'].split('+').forEach((v) => {
            let n;
            if (v === '_') {
              n = v;
            } else {
              n = pdfh(it, v);
            }
            linename = linename.concat(n);
          });
          tabs.push(linename);
        });
      } else {
        tabs = ['线路1'];
      }
    } catch (error) {
      logger.info('XYQ获取线路失败>', error as Error);
    }

    try {
      const contlist = pdfa(html, XYQRULE['播放列表数组规则']);
      for (let i = 0; i < contlist.length; i++) {
        let bfline = pdfa(contlist[i], `body&&${XYQRULE['选集列表数组规则']}`);
        if (bfline.length === 0) {
          bfline = [contlist[i]];
        }
        const cont: any[] = [];
        for (let j = 0; j < bfline.length; j++) {
          let contname, conturl;
          if (XYQRULE['选集标题链接是否Jsoup写法'] === '1' || XYQRULE['选集标题链接是否Jsoup写法'] === '是') {
            contname = pdfh(bfline[j], XYQRULE['选集标题'] || 'a&&Text');
            if (!contname) {
              contname = j + 1;
            }
            conturl =
              (XYQRULE['选集链接加前缀'] || '') +
              pdfh(bfline[j], XYQRULE['选集链接'] || 'a&&href') +
              (XYQRULE['选集链接加后缀'] || '');
          }
          cont.push(`${contname}$${conturl}`);
        }
        if (XYQRULE['是否反转选集序列'] === '1') {
          cont.reverse();
        }
        lists.push(cont.join('#'));
      }
    } catch (error) {
      logger.info('XYQ获取选集列表失败>', error as Error);
    }

    resitem.vod_play_from = tabs.join('$$$') || '默认线路';
    resitem.vod_play_url = lists.join('$$$');
    const list = [resitem];

    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v, i) => ({
        vod_id: String((v.vod_id || idsArray[i]) ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_year: String(v.vod_year ?? ''),
        vod_lang: v.vod_lang ?? '',
        vod_area: v.vod_area ?? '',
        vod_score: String((v.vod_score || v.vod_douban_score) ?? '0.0'),
        vod_state: v.vod_state ?? '', // '正片' | '预告' | '花絮'
        vod_class: v.vod_class ?? '', // '电影' | '电视剧' | '综艺' | '动漫' | '纪录片' | '其他'
        vod_actor: v.vod_actor ?? '',
        vod_director: v.vod_director ?? '',
        vod_content: (v.vod_content ?? '')?.trim(),
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_play_from: v.vod_play_from ?? '',
        vod_play_url: v.vod_play_url ?? '',
        type_name: v.type_name ?? '',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = 1;
    const pagecount = videos.length ? 1 : 0;
    const total = videos.length;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async search(doc: ICmsSearchOptions): Promise<ICmsSearch> {
    const { wd, page } = doc;

    const XYQRULE = this.XYQRULE;
    const headers = {};
    if (XYQRULE['搜索请求头参数']) {
      if (XYQRULE['搜索请求头参数'].includes('#') || XYQRULE['搜索请求头参数'].includes('$')) {
        XYQRULE['搜索请求头参数'].split('#').forEach((v) => {
          headers[v.split('$')[0]] = v.split('$')[1];
        });
      } else {
        headers['User-Agent'] = XYQRULE['搜索请求头参数'];
      }
    }
    headers['User-Agent'] = headers['User-Agent'] === '电脑' || headers['User-Agent'] === 'PC_UA' ? PC_UA : MOBILE_UA;
    let url = XYQRULE['搜索链接'].replaceAll('{wd}', wd).replaceAll('{pg}', page).replaceAll('{SearchPg}', page);
    let host = this.rule.host;
    if (host.includes('undefined') || !host) {
      host = getHome(url);
      this.rule.host = host;
    }

    let postData;
    if (XYQRULE['POST请求数据'] !== '') {
      url = url.split(';')[0];
      postData = XYQRULE['POST请求数据'].replaceAll('{wd}', wd).replaceAll('{pg}', page);
    }

    let html = '';
    let result;
    if (postData) {
      try {
        result = await request.request({
          url,
          headers,
          method: 'POST',
          data: postData,
        });
        html = result.data;
      } catch {
        // ignore
      }
    } else {
      html = await this.getCode(url, headers);
    }
    const list: ICmsSearch['list'] = [];
    const sslist = pdfa(html, XYQRULE['搜索列表数组规则']);

    for (let i = 0; i < sslist.length; i++) {
      const item = sslist[i];
      let title, href, img, desc;
      if (XYQRULE['搜索片单是否Jsoup写法'] === '1' || XYQRULE['搜索片单是否Jsoup写法'] === '是') {
        title = pdfh(sslist[i], XYQRULE['搜索片单标题']);
        href =
          (XYQRULE['搜索片单链接加前缀'] || '') +
          pdfh(sslist[i], XYQRULE['搜索片单链接']) +
          (XYQRULE['搜索片单链接加后缀'] || '');
        img = pdfh(sslist[i], XYQRULE['搜索片单图片']);
        desc = pdfh(sslist[i], XYQRULE['搜索片单副标题']);
      }
      if (XYQRULE['搜索片单是否Jsoup写法'] === '0') {
        title = XBPQParse.getHasRuleSplitStr(item, XYQRULE['搜索片单标题']);
        href = XBPQParse.getHasRuleSplitStr(item, XYQRULE['搜索片单链接']);
        img = XBPQParse.getHasRuleSplitStr(item, XYQRULE['搜索片单图片']);
        if (img && img.startsWith('/')) {
          img = host + img;
        }
      }

      if (href && title) {
        list.push({
          vod_id: href,
          vod_name: title,
          vod_pic: img,
          vod_remarks: desc || '',
        } as any);
      }
    }

    const rawList = Array.isArray(list) ? list : [];
    const videos = rawList
      .map((v) => ({
        vod_id: String(v.vod_id ?? ''),
        vod_name: v.vod_name ?? '',
        vod_pic: v.vod_pic ?? '',
        vod_remarks: v.vod_remarks ?? '',
        vod_blurb: (v.vod_blurb ?? '')?.trim(),
        vod_tag: v.vod_tag || 'file',
      }))
      .filter((v) => v.vod_id);

    const pagecurrent = page;
    const pagecount = videos.length ? 999 : 0;
    const total = videos.length ? 999 : 0;

    return { page: pagecurrent, pagecount, total, list: videos };
  }

  async play(doc: ICmsPlayOptions): Promise<ICmsPlay> {
    const { play } = doc || {};
    const parse = /\.(?:m3u8|mp4|mpd|flv|mkv)/.test(play) ? 0 : 1;
    return { url: play, parse };
  }

  async proxy(_doc: ICmsProxyOptions): Promise<ICmsProxy> {
    return [];
  }

  async runMain(_doc: ICmsRunMianOptions): Promise<ICmsRunMian> {
    return '';
  }

  private async getCode(url: string, headers: object = {}) {
    const resp = await request.request({
      url,
      method: 'GET',
      headers: Object.assign(this.rule.headers, headers),
    });

    let html = resp.data;

    try {
      if (html.includes('检测中')) {
        const { data } = await request.request({
          url: `${url}&btwaf${html.match(/btwaf(.*?)"/)[1]}`,
          method: 'GET',
          headers,
        });
        html = data;
      } else if (html.includes('页面已拦截')) {
        //   html = fetchCodeByWebView(url, {
        //     headers: headers,
        //     blockRules: ['.png', '.jpg', '.gif', '.mp3', '.mp4'],
        //   });
        //   html = pdfh(html, 'body&&pre&&Text');
      } else if (html.includes('系统安全验证')) {
        //   async function ocr(codeurl: string, headers: any) {
        //     headers = headers || {};
        //     let img = convertBase64Image(codeurl, headers).replace('data:image/jpeg;base64,', '');
        //     let code = await request({
        //       url: 'https://api.xhofe.top/ocr/b64/text',
        //       data: img,
        //       method: 'POST',
        //       headers: {
        //         'Content-Type': 'text/html',
        //       },
        //     });
        //     code = code.replace(/o/g, '0').replace(/u/g, '0').replace(/I/g, '1').replace(/l/g, '1').replace(/g/g, '9');
        //     logger.info('识别验证码：' + code);
        //     return code;
        //   }
        //   let www = url.split('/');
        //   let home = www[0] + '//' + www[2];
        //   let codeurl =
        //     home +
        //     (url.indexOf('search-pg-1-wd-') > -1 ? '/inc/common/code.php?a=search' : '/index.php/verify/index.html?');
        //   let cook = await completeRequest({
        //     url: codeurl,
        //     headers: headers,
        //   });
        //   headers.Cookie = (cook.headers['set-cookie'] || '[]').join(';');
        //   let vcode = ocr(codeurl, headers);
        //   await request({
        //     url:
        //       home +
        //       (url.indexOf('search-pg-1-wd-') > -1
        //         ? '/inc/ajax.php?ac=code_check&type=search&code='
        //         : html.match(/\/index.php.*?verify=/)[0]) +
        //       vcode,
        //     headers: headers,
        //     method: url.indexOf('search-pg-1-wd-') > -1 ? 'GET' : 'POST',
        //   });
        const { data } = await request.request({
          url,
          method: 'GET',
          headers,
        });
        html = data;
      }
    } catch {
      // ignore
    }

    return html;
  }
}

export default T3XyqAdapter;
