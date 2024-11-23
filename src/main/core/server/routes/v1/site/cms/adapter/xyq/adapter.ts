import request, { completeRequest } from '@main/utils/request';
import jinja from '../../utils/jinja';
import XBPQParse from '../../utils/ruleParse';
import { getHome } from '@main/utils/hiker/base';
import { pd, pdfa, pdfh } from '@main/utils/hiker/htmlParser';
import { MOBILE_UA, PC_UA } from '@main/utils/hiker/ua';
import JSON5 from 'json5';

function getValueByPath(json, path) {
  // 将路径字符串拆分成属性名数组
  var keys = path.split('.');
  // 逐层访问对象属性
  return keys.reduce((obj, key) => {
    if (obj === undefined || obj === null) {
      return undefined;
    }
    return obj[key];
  }, json); // 初始值为json对象
}

function generateYearArray(startYear, endYear) {
  let years: any[] = [];
  for (let year = startYear; year >= endYear; year--) {
    years.push(year);
  }
  return years;
}
const replacePlaceholders = (url: string, fl) => {
  return jinja.render(url.replace(/{(\w+)}/g, '{{$1}}'), fl);
};

const xpdfh = (item, select) => {
  let result = '';
  let prefix;
  if (select.includes('+')) {
    let temp = select.split('+');
    prefix = temp[0];
    select = temp[1];
  }
  if (select == 'href') {
    select = 'a&&href';
  }
  try {
    result = pdfh(item, select);
    if (prefix) {
      result = new Function('return ' + prefix)() + result;
    }
  } catch (err: any) {
    console.log('错误信息:\n' + err.message);
    console.log('错误定位:\n' + select);
  }
  return result;
};
const xpdfa = (item, select) => {
  let result: any[] = [];
  let selects: string[] = [];
  try {
    if (select.includes(';')) {
      selects = select.split(/;/).filter((f) => f);
    } else {
      selects = [select];
    }
    for (select of selects) {
      console.log(item, select);
      result = pdfa(item, select);
      if (result.length > 0) {
        break;
      }
    }
    if (result.length == 0) {
      throw new Error('数组结果为空');
    }
  } catch (err: any) {
    console.log('错误信息:\n' + err.message);
    console.log('错误定位:\n' + select);
  }
  return result;
};

class XyqAdapter {
  rule: any = {};
  source: any = '';
  XYQRULE: any = {};
  constructor(source) {
    this.source = source;
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
  async getCode(url: string, headers: object = {}) {
    console.log('url:', url);
    let result = await completeRequest({
      url: url,
      method: 'GET',
      headers: Object.assign(this.rule.headers, headers),
    });
    let html = result.data;
    console.log(
      JSON5.stringify(
        {
          method: 'GET',
          url: url,
          headers: JSON5.stringify(headers),
          statusCode: result.code,
        },
        null,
        1,
      ),
    );
    if (result.code != 200) {
      console.log(html);
    }
    try {
      if (html.includes('检测中')) {
        html = await request({
          url: url + '&btwaf' + html.match(/btwaf(.*?)\"/)[1],
          method: 'GET',
          headers: headers,
        });
        // } else if (html.includes('页面已拦截')) {
        //   html = fetchCodeByWebView(url, {
        //     headers: headers,
        //     blockRules: ['.png', '.jpg', '.gif', '.mp3', '.mp4'],
        //   });
        //   html = pdfh(html, 'body&&pre&&Text');
        // } else if (html.includes('系统安全验证')) {
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
        //     console.log('识别验证码：' + code);
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
        html = await request({
          url: url,
          method: 'GET',
          headers: headers,
        });
      }
    } catch (e) {}
    return html;
  }
  async init() {
    let res: string = this.source.ext;
    if (this.source.ext.startsWith('http')) {
      res = await request({
        url: this.source.ext,
        method: 'GET',
        responseType: 'text',
        headers: {
          'User-Agent': 'okhttp/4.12.0',
        },
      });
    }
    try {
      res = JSON5.parse(res);
      this.XYQRULE = Object.assign(this.XYQRULE, res);
    } catch (err) {}

    let XYQRULE = this.XYQRULE;
    let headers = this.rule.headers;
    if (XYQRULE['请求头参数']) {
      if (XYQRULE['请求头参数'].includes('#') || XYQRULE['请求头参数'].includes('$')) {
        XYQRULE['请求头参数'].split('#').forEach((v) => (headers[v.split('$')[0]] = v.split('$')[1]));
      } else {
        headers['User-Agent'] = XYQRULE['请求头参数'];
      }
    }
    headers['User-Agent'] = headers['User-Agent'] == '电脑' || headers['User-Agent'] == 'PC_UA' ? PC_UA : MOBILE_UA;
    if (XYQRULE['首页推荐链接'] || XYQRULE['分类链接']) {
      let host = getHome(XYQRULE['首页推荐链接'] || XYQRULE['分类链接']);
      this.rule.host = host;
    }
    if (!XYQRULE['是否开启获取首页数据'] || !XYQRULE['首页列表数组规则']) {
      this.rule.推荐 = '';
    }
    if (!XYQRULE['分类名称']) {
      this.rule.一级 = '';
    }
    if (XYQRULE['链接是否直接播放'] == '1') {
      this.rule.二级 = '*';
    }
  }
  async homeVod() {
    let XYQRULE = this.XYQRULE;
    let html = await this.getCode(XYQRULE['首页推荐链接'] || this.rule.host);
    let list: any[] = [];
    if (XYQRULE['首页片单是否Jsoup写法'] == '1' || XYQRULE['首页片单是否Jsoup写法'] == '是') {
      let listArr = xpdfa(html, XYQRULE['首页列表数组规则']);
      let ls = XYQRULE['首页片单列表数组规则'];
      if (!ls.includes('body&&')) {
        ls = 'body&&' + ls;
      }
      listArr.forEach((it) => {
        xpdfa(it, ls).forEach((v) => {
          let vod_id = pd(v, XYQRULE['首页片单链接'] || XYQRULE['分类片单链接'], this.rule.host);
          let vod_name = pdfh(v, XYQRULE['首页片单标题'] || XYQRULE['分类片单标题']);
          let vod_pic = pdfh(v, XYQRULE['首页片单图片'] || XYQRULE['分类片单图片']);
          let vod_remarks = pdfh(v, XYQRULE['首页片单副标题'] || XYQRULE['分类片单副标题']);
          if (vod_id && vod_name) {
            list.push({
              vod_id,
              vod_name,
              vod_pic,
              vod_remarks,
            });
          }
        });
      });
    }
    if (list.length) {
      console.log('list:', list.slice(0, 3));
    }
    return {
      list,
    };
  }
  home() {
    let homeData: any = {
      filters: {},
      class: [],
    };
    let XYQRULE = this.XYQRULE;
    let typenames = XYQRULE['分类名称'] ? XYQRULE['分类名称'].split('&') : [];
    let typeids = XYQRULE['分类名称替换词'] ? XYQRULE['分类名称替换词'].split('&') : [];
    for (let i in typeids) {
      homeData.class.push({
        type_id: typeids[i],
        type_name: typenames[i],
      });
    }
    if (typeof XYQRULE['筛选数据'] == 'string' && XYQRULE['筛选数据'] == 'ext') {
      if (!XYQRULE['筛选年份名称'] && XYQRULE['分类链接'].includes('{year}')) {
        XYQRULE['筛选年份名称'] = generateYearArray(new Date().getFullYear(), 2004).join('&');
        XYQRULE['筛选年份替换词'] = generateYearArray(new Date().getFullYear(), 2004).join('&');
      }
      if (!XYQRULE['筛选排序名称'] && XYQRULE['分类链接'].includes('{by}')) {
        XYQRULE['筛选排序名称'] = '时间&人气&评分';
        XYQRULE['筛选排序替换词'] = 'time&hits&score';
      }
      let filtersTypes = ['子分类', '类型', '地区', '年份', '语言', '排序'];
      let filtersIds = ['cateId', 'class', 'area', 'year', 'lang', 'by'];
      filtersTypes.forEach((it, id) => {
        if (XYQRULE['筛选' + it + '名称'] && XYQRULE['筛选' + it + '替换词']) {
          let catenames = XYQRULE['筛选' + it + '名称'].split('||');
          let cateids = (
            XYQRULE['筛选' + it + '替换词'] == '*' ? XYQRULE['筛选' + it + '名称'] : XYQRULE['筛选' + it + '替换词']
          ).split('||');
          if (it == '排序') {
            catenames = Array(typeids.length).fill(catenames[0]);
            cateids = Array(typeids.length).fill(cateids[0]);
          } else if (cateids.length < typeids.length && cateids.length == 1) {
            catenames = Array(typeids.length).fill(catenames[0]);
            cateids = Array(typeids.length).fill(cateids[0]);
          }
          //console.log(cateids)
          //console.log(homeData)
          //return JSON.stringify(homeData);
          cateids.forEach((_x, i) => {
            let value: any[] = [];
            let names = catenames[i].split('&');
            if (names.length == 1 && names[0] == '空') {
              return;
            }
            let ids = cateids[i].split('&');
            for (let j in names) {
              value.push({
                n: names[j],
                v: ids[j],
              });
              //console.log(value)
            }
            if (value.length > 0) {
              if (it != '排序' && value[0].n != '全部') {
                value.unshift({
                  n: '全部',
                  v: '',
                });
              }
              let clist = homeData.filters[typeids[i]] || (homeData.filters[typeids[i]] = []);
              clist.push({
                key: filtersIds[id],
                name: it,
                value: value,
              });
            }
          });
        }
      });
    }
    return homeData;
  }
  async category(doc) {
    let { tid, page: pg, f: extend } = doc;
    console.log(tid, pg, extend, typeof extend);
    extend = JSON5.parse(extend);
    let XYQRULE = this.XYQRULE;
    let url = String(
      XYQRULE['分类链接'].includes('firstPage=') && pg == 1
        ? XYQRULE['分类链接'].split('firstPage=')[1].split(']')[0]
        : XYQRULE['分类链接'].split('[')[0],
    );
    console.log(url);
    url = url.startsWith('http') ? url : this.rule.host;
    extend.cateId = extend?.cateId || tid;
    console.log(extend);
    let html = await this.getCode(
      replacePlaceholders(url.replaceAll('{catePg}', pg + ''), extend).replaceAll('{cateId}', tid),
    );
    console.log(html);
    let list: any[] = [];
    if (
      (XYQRULE['分类片单是否Jsoup写法'] == '1' || XYQRULE['分类片单是否Jsoup写法'] == '是') &&
      XYQRULE['分类列表数组规则']
    ) {
      xpdfa(html, XYQRULE['分类列表数组规则']).forEach((it) => {
        let vod_name = pdfh(it, XYQRULE['分类片单标题']);
        let vod_id = pd(it, XYQRULE['分类片单链接'], this.rule.host);
        let vod_pic = pdfh(it, XYQRULE['分类片单图片']);
        let vod_remarks = pdfh(it, XYQRULE['分类片单副标题']);
        if (vod_id && vod_name) {
          list.push({
            vod_id,
            vod_name,
            vod_pic,
            vod_remarks,
          });
        }
      });
    }
    if (XYQRULE['分类截取模式'] == '0') {
      if (XYQRULE['分类Json数据二次截取']) {
        html = XBPQParse.getHasRuleSplitStr(html, XYQRULE['分类Json数据二次截取'], undefined, true) || html;
      }
      let json = JSON5.parse(html);
      let vlist = getValueByPath(json, XYQRULE['分类列表数组规则']);
      vlist.forEach((it) => {
        let vod_id = it[XYQRULE['分类片单链接']];
        let vod_name = it[XYQRULE['分类片单标题']];
        let vod_pic = it[XYQRULE['分类片单图片']];
        let vod_remarks = it[XYQRULE['分类片单副标题']];
        let prefix = XYQRULE['分类片单链接加前缀'] || '';
        let suffix = XYQRULE['分类片单链接加后缀'] || '';
        if (suffix && suffix.includes("'input'")) {
          suffix = suffix.replace("'input'", vod_id);
        }
        vod_id = `${prefix ? prefix : ''}${vod_id}${suffix ? suffix : ''}`;
        if (vod_id && vod_name) {
          list.push({
            vod_id,
            vod_name,
            vod_pic,
            vod_remarks,
          });
        }
      });
    }
    if (list.length) {
      console.log('list:', list.slice(0, 3));
    }
    return {
      list,
    };
  }
  async detail(doc) {
    const { id: vod_url } = doc;
    console.log('vod_url:', vod_url);
    let XYQRULE = this.XYQRULE;
    if (this.rule['二级'] === '*') {
      return JSON5.stringify({
        list: [
          {
            vod_play_url: vod_url.includes('$') ? vod_url : '直接播放$' + vod_url,
            vod_play_from: '嗅探',
          },
        ],
      });
    }
    let html = await this.getCode(vod_url);
    let resitem: any = {};
    let tabs: any[] = [];
    let lists: any[] = [];
    try {
      if (XYQRULE['详情是否Jsoup写法'] == '1' || XYQRULE['详情是否Jsoup写法'] == '是') {
        resitem = {
          vod_remarks: pdfh(html, XYQRULE['类型详情']),
          vod_content: pdfh(html, XYQRULE['简介详情']),
          vod_actor: pdfh(html, XYQRULE['演员详情']),
          vod_year: pdfh(html, XYQRULE['年代详情']),
          vod_area: pdfh(html, XYQRULE['地区详情']),
        };
      } else {
        //XBPQ
        console.log(XBPQParse.getHasRuleSplitStr(html, XYQRULE['演员详情']));
        resitem = {
          vod_remarks: pdfh(XBPQParse.getHasRuleSplitStr(html, XYQRULE['类型详情'])!, 'Text'),
          vod_content: pdfh(XBPQParse.getHasRuleSplitStr(html, XYQRULE['简介详情'])!, 'Text'),
          vod_actor: pdfh(XBPQParse.getHasRuleSplitStr(html, XYQRULE['演员详情'])!, 'Text'),
          vod_year: XBPQParse.getHasRuleSplitStr(html, XYQRULE['年代详情']),
          vod_area: XBPQParse.getHasRuleSplitStr(html, XYQRULE['地区详情']),
        };
      }
    } catch (e) {
      // @ts-ignore
      console.log('xpath获取海报信息失败>' + e.message + ' 错误行#' + e.lineNumber);
    }
    try {
      if (XYQRULE['线路列表数组规则']) {
        xpdfa(html, XYQRULE['线路列表数组规则']).forEach((it) => {
          let linename = '';
          XYQRULE['线路标题'].split('+').forEach((v) => {
            let n;
            if (v == '_') {
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
    } catch (err: any) {
      console.log('XYQ获取线路失败>' + err.message);
    }
    //console.log("tabs:", tabs)
    try {
      let contlist = xpdfa(html, XYQRULE['播放列表数组规则']);
      for (let i = 0; i < contlist.length; i++) {
        let bfline = xpdfa(contlist[i], 'body&&' + XYQRULE['选集列表数组规则']);
        //console.log(bfline)
        if (bfline.length == 0) {
          bfline = [contlist[i]];
        }
        let cont: any[] = [];
        for (let j = 0; j < bfline.length; j++) {
          let contname, conturl;
          if (XYQRULE['选集标题链接是否Jsoup写法'] == '1' || XYQRULE['选集标题链接是否Jsoup写法'] == '是') {
            contname = pdfh(bfline[j], XYQRULE['选集标题'] || 'a&&Text');
            if (!contname) {
              contname = j + 1;
            }
            conturl =
              (XYQRULE['选集链接加前缀'] || '') +
              pdfh(bfline[j], XYQRULE['选集链接'] || 'a&&href') +
              (XYQRULE['选集链接加后缀'] || '');
          }
          cont.push(contname + '$' + conturl);
        }
        if (XYQRULE['是否反转选集序列'] == '1') {
          cont.reverse();
        }
        lists.push(cont.join('#'));
      }
    } catch (err: any) {
      console.log('XYQ获取选集列表失败>' + err.message);
    }
    resitem.vod_play_from = tabs.join('$$$') || '默认线路';
    resitem.vod_play_url = lists.join('$$$');
    return {
      list: [resitem],
    };
  }
  async play(doc) {
    // const { flag, input } = doc;
    return {};
  }
  async search(doc) {
    const { wd, pg } = doc;
    let XYQRULE = this.XYQRULE;
    let headers = {};
    if (XYQRULE['搜索请求头参数']) {
      if (XYQRULE['搜索请求头参数'].includes('#') || XYQRULE['搜索请求头参数'].includes('$')) {
        XYQRULE['搜索请求头参数'].split('#').forEach((v) => {
          headers[v.split('$')[0]] = v.split('$')[1];
        });
      } else {
        headers['User-Agent'] = XYQRULE['搜索请求头参数'];
      }
    }
    headers['User-Agent'] = headers['User-Agent'] == '电脑' || headers['User-Agent'] == 'PC_UA' ? PC_UA : MOBILE_UA;
    let url = XYQRULE['搜索链接'].replaceAll('{wd}', wd).replaceAll('{pg}', pg).replaceAll('{SearchPg}', pg);
    let host = this.rule.host;
    if (host.includes('undefined') || !host) {
      host = getHome(url);
      this.rule.host = host;
    }
    let postData;
    if (XYQRULE['POST请求数据'] != '') {
      url = url.split(';')[0];
      postData = XYQRULE['POST请求数据'].replaceAll('{wd}', wd).replaceAll('{pg}', pg);
    }
    let html = '';
    let result;
    if (postData) {
      try {
        result = await completeRequest({
          url: url,
          headers: headers,
          method: 'POST',
          data: postData,
        });
        html = result.data;
      } catch (err: any) {
        console.log(err.message);
      }
      console.log(
        '\n' +
          JSON5.stringify(
            {
              method: 'POST',
              url: url,
              headers: headers,
              body: JSON5.parse(postData),
              statusCode: result.code,
            },
            null,
            2,
          ),
      );
      console.log(
        `method:POST|url:${url}|headers:${JSON5.stringify(headers)}|body:${postData}|statusCode:${result.statusCode}`,
      );
      if (result.code != 200) {
        console.log(html);
      }
    } else {
      html = await this.getCode(url, headers);
    }
    let list: any[] = [];
    let sslist = xpdfa(html, XYQRULE['搜索列表数组规则']);
    //console.log("sslist:", sslist);
    for (let i = 0; i < sslist.length; i++) {
      let item = sslist[i];
      let title, href, img, desc;
      if (XYQRULE['搜索片单是否Jsoup写法'] == '1' || XYQRULE['搜索片单是否Jsoup写法'] == '是') {
        title = pdfh(sslist[i], XYQRULE['搜索片单标题']);
        href =
          (XYQRULE['搜索片单链接加前缀'] || '') +
          pdfh(sslist[i], XYQRULE['搜索片单链接']) +
          (XYQRULE['搜索片单链接加后缀'] || '');
        img = xpdfh(sslist[i], XYQRULE['搜索片单图片']);
        desc = pdfh(sslist[i], XYQRULE['搜索片单副标题']);
      }
      if (XYQRULE['搜索片单是否Jsoup写法'] == '0') {
        title = XBPQParse.getHasRuleSplitStr(item, XYQRULE['搜索片单标题']);
        href = XBPQParse.getHasRuleSplitStr(item, XYQRULE['搜索片单链接']);
        img = XBPQParse.getHasRuleSplitStr(item, XYQRULE['搜索片单图片']);
        if (img) {
          if (img.startsWith('/')) {
            img = host + img;
          }
        }
      }
      if (href && title) {
        list.push({
          vod_id: href,
          vod_name: title,
          vod_pic: img,
          vod_remarks: desc || '',
        });
      }
    }
    return {
      list,
    };
  }
  getRule(key: string) {
    return key ? this.rule[key] : this.rule;
  }
  runMain() {
    return '';
  }
}

export default XyqAdapter;
