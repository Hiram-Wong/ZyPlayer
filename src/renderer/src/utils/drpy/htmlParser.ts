/*!
 * @module htmlParser
 * @brief T3解析html处理库
 * @version 3.1.0
 *
 * @original-author hjdhnx
 * @original-source {@link https://github.com/hjdhnx/hipy-server/blob/master/app/t4/base/htmlParser.py | Source on GitHub}
 *
 * @modified-by HiramWong <admin@catni.cn>
 * @modification-date 2023-04-09T18:31:59+08:00
 * @modification-description Python转TypeScript, 适用于JavaScript项目
 */

import * as cheerio from 'cheerio';
import jsonpath from 'jsonpath';
import urlJoin from 'url';

const PARSE_CACHE = true; // 解析缓存
const NOADD_INDEX = ':eq|:lt|:gt|:first|:last|:not|:even|:odd|:has|:contains|:matches|:empty|^body$|^#'; // 不自动加eq下标索引
const URLJOIN_ATTR = '(url|src|href|-original|-src|-play|-url|style)$|^(data-|url-|src-)'; // 需要自动urljoin的属性
const SPECIAL_URL = '^(ftp|magnet|thunder|ws):'; // 过滤特殊链接,不走urlJoin

class Jsoup {
  MY_URL: string = '';
  pdfh_html = '';
  pdfa_html = '';

  pdfh_doc = null;
  pdfa_doc: cheerio.Root | null = null;

  // 构造函数
  constructor(MY_URL: string = '') {
    this.MY_URL = MY_URL;
  }

  // 测试
  test(text: string, string: string): boolean {
    const searchObj = new RegExp(text, 'mi').exec(string);
    return searchObj ? true : false;
  }

  // 包含
  contains(text: string, match: string): boolean {
    return text.indexOf(match) !== -1;
  }

  /**
   * 海阔解析表达式转原生表达式,自动补eq,如果传了first就最后一个也取eq(0)
   * @param parse: 解析表达式
   * @param first: 是否第一个
   * @returns {string}
   */
  parseHikerToJq(parse: string, first: boolean = false): string {
    if (this.contains(parse, '&&')) {
      const parses = parse.split('&&'); // 带&&的重新拼接
      let new_parses: string[] = []; //  构造新的解析表达式列表
      for (let i = 0; i < parses.length; i++) {
        const ps_list = parses[i].split(' ');
        const ps = ps_list[ps_list.length - 1]; // 如果分割&&后带空格就取最后一个元素
        if (!this.test(NOADD_INDEX, ps)) {
          if (!first && i >= parses.length - 1) {
            // 不传first且遇到最后一个,不用补eq(0)
            new_parses.push(parses[i]);
          } else {
            new_parses.push(`${parses[i]}:eq(0)`);
          }
        } else {
          new_parses.push(parses[i]);
        }
      }
      parse = new_parses.join(' ');
    } else {
      const ps_list = parse.split(' ');
      const ps = ps_list[ps_list.length - 1]; // 如果带空格就取最后一个元素
      if (!this.test(NOADD_INDEX, ps) && first) {
        parse = `${parse}:eq(0)`;
      }
    }

    return parse;
  }

  /**
   * 根据传入的单规则获取 parse规则, 索引位置,排除列表  -- 可以用于剔除元素,支持多个, 按标签剔除, 按id剔除等操作
   * @param nparse
   * @returns {rule: string, index: number, excludes: string[]}
   */
  getParseInfo(nparse: string): { nparse_rule: string; nparse_index: number; excludes: string[] } {
    let excludes: string[] = []; // 定义排除列表默认值为空
    let nparse_index: number = 0; // 定义位置索引默认值为0
    let nparse_rule: string = nparse; // 定义规则默认值为本身

    if (this.contains(nparse, ':eq')) {
      nparse_rule = nparse.split(':eq')[0];
      let nparse_pos = nparse.split(':eq')[1];
      if (this.contains(nparse_rule, '--')) {
        excludes = nparse_rule.split('--').slice(1);
        nparse_rule = nparse_rule.split('--')[0];
      } else if (this.contains(nparse_pos, '--')) {
        excludes = nparse_pos.split('--').slice(1);
        nparse_pos = nparse_pos.split('--')[0];
      }
      try {
        nparse_index = parseInt(nparse_pos.split('(')[1].split(')')[0]);
      } catch {
      }
    } else if (this.contains(nparse, '--')) {
      nparse_rule = nparse.split('--')[0];
      excludes = nparse.split('--').slice(1);
    }

    return { nparse_rule, nparse_index, excludes };
  }

  /**
   * 解析空格分割后的原生表达式中的一条记录,正确处理eq的索引,返回处理后的ret
   * @param doc: cheerio.load() load后的dom对象
   * @param nparse: 解析表达式
   * @param ret: 当前返回值
   * @returns {Cheerio}
   */
  parseOneRule(doc, nparse: string, ret) {
    const { nparse_rule, nparse_index, excludes } = this.getParseInfo(nparse);

    if (!ret) ret = doc(nparse_rule);
    else ret = ret.find(nparse_rule);

    if (this.contains(nparse, ':eq')) ret = ret.eq(nparse_index);

    if (excludes.length > 0 && ret) {
      ret = ret.clone(); // 克隆一个，避免直接remove影响原始DOM
      // ret = ret.toArray().map(element => doc(element));

      for (let exclude of excludes) {
        ret.find(exclude).remove();
      }
    }

    return ret;
  }

  /**
   * 解析空格分割后的原生表达式,返回处理后的ret
   * https://pyquery.readthedocs.io/en/latest/api.html
   * @param html
   * @param parse
   * @returns {Cheerio}
   */
  pdfa(html: string, parse: string): string[] {
    if (!html || !parse) return [];
    parse = this.parseHikerToJq(parse);

    const doc = cheerio.load(html);
    if (PARSE_CACHE) {
      if (this.pdfa_html !== html) {
        this.pdfa_html = html;
        this.pdfa_doc = doc;
      }
    }

    const parses = parse.split(' ');
    let ret: cheerio.Cheerio | null = null;
    for (const nparse of parses) {
      ret = this.parseOneRule(doc, nparse, ret);
      if (!ret) return [];
    }

    const res: string[] = (ret?.toArray() ?? []).map((item: any) => {
      const res_html = `${doc(item)}`; // outerHTML()
      // const res_html = doc(item).html(); // innerHTML()
      return res_html ? res_html : ''; // 空值检查，将 null 值转换为空字符串
    });
    return res;
  }

  pdfl(html: string, parse: string, list_text: string, list_url: string, url_key: string): string[] {
    if (!html || !parse) return [];
    parse = this.parseHikerToJq(parse, false);
    const new_vod_list: any = [];

    const doc = cheerio.load(html);
    const parses: string[] = parse.split(' ');
    let ret: cheerio.Cheerio | null = null;
    for (const pars of parses) {
      ret = this.parseOneRule(doc, pars, ret);
      if (!ret) return [];
    }

    ret!.each((_, element) => {
      new_vod_list.push(`${doc(element)}`); // outerHTML()
      // new_vod_list.push(doc(element).html()); // innerHTML()
    });

    return new_vod_list;
  }

  /**
   * 解析空格分割后的原生表达式,返回处理后的ret
   * https://pyquery.readthedocs.io/en/latest/api.html
   * @param html
   * @param parse
   * @returns {Cheerio}
   */
  pdfh(html: string, parse: string, baseUrl: string = ''): string {
    if (!html || !parse) return '';

    const doc: cheerio.Root = cheerio.load(html);
    if (PARSE_CACHE) {
      if (this.pdfa_html !== html) {
        this.pdfa_html = html;
        this.pdfa_doc = doc;
      }
    }

    if (parse == 'body&&Text' || parse == 'Text') {
      //@ts-ignore
      return doc.text();
    } else if (parse == 'body&&Html' || parse == 'Html') {
      return doc.html();
    }

    let option: string | undefined;
    if (this.contains(parse, '&&')) {
      const parts: string[] = parse.split('&&');
      option = parts[parts.length - 1];
      parse = parts.slice(0, -1).join('&&');
    }
    parse = this.parseHikerToJq(parse, true);
    const parses: string[] = parse.split(' ');

    let ret: string | cheerio.Cheerio | null = null;
    for (const nparse of parses) {
      ret = this.parseOneRule(doc, nparse, ret);
      if (!ret) return '';
    }
    if (option) {
      switch (option) {
        case 'Text':
          ret = (ret as cheerio.Cheerio)?.text() || '';
          break;
        case 'Html':
          ret = (ret as cheerio.Cheerio)?.html() || '';
          break;
        default:
          // 保留原来的ret
          let original_ret = (ret as cheerio.Cheerio)?.clone();
          let options = option.split('||');
          let opt_index = 0;
          for (let opt of options) {
            // console.log(`opt_index:${opt_index},opt:${opt}`);
            opt_index += 1;
            ret = original_ret?.attr(opt) || '';
            // console.log('ret:', ret);
            if (this.contains(opt.toLowerCase(), 'style') && this.contains(ret, 'url(')) {
              try {
                ret = ret.match(/url\((.*?)\)/)![1];
                // 2023/07/28新增 style取内部链接自动去除首尾单双引号
                ret = ret.replace(/^['"]|['"]$/g, '');
              } catch {
              }
            }
            if (ret && baseUrl) {
              const needAdd = this.test(URLJOIN_ATTR, opt) && !this.test(SPECIAL_URL, ret);
              if (needAdd) {
                if (ret.includes('http')) {
                  ret = ret.slice(ret.indexOf('http'));
                } else {
                  ret = urlJoin.resolve(baseUrl, ret);
                }
              }
            }
            if (ret) {
              break;
            }

          }

      }
    } else {
      ret = `${ret}`;
    }

    return ret;
  }

  pd(html: string, parse: string, baseUrl: string = ''): string {
    if (!baseUrl) baseUrl = this.MY_URL;
    return this.pdfh(html, parse, baseUrl);
  }

  pq(html: string) {
    return cheerio.load(html);
  }

  pjfh(html: any, parse: string, addUrl = false): string {
    if (!html || !parse) return '';

    try {
      html = typeof html === 'string' ? JSON.parse(html) : html;
    } catch {
      console.log('字符串转json失败');
      return '';
    }

    if (!parse.startsWith('$.')) {
      parse = '$.' + parse;
    }

    let ret = '';
    const paths = parse.split('||');
    for (const path of paths) {
      const queryResult = jsonpath.query(html, path);
      if (Array.isArray(queryResult)) ret = queryResult[0] ? `${queryResult[0]}` : '';
      else ret = queryResult ? `${queryResult}` : '';

      if (addUrl && ret) {
        ret = urlJoin.resolve(this.MY_URL, ret);
      }
      if (ret) break;
    }

    return ret;
  }

  pj(html: any, parse: string): string {
    return this.pjfh(html, parse, true);
  }

  pjfa(html: any, parse: string): any[] {
    if (!html || !parse) return [];

    try {
      html = typeof html === 'string' ? JSON.parse(html) : html;
    } catch {
      return [];
    }

    if (!parse.startsWith('$.')) parse = '$.' + parse;

    const result = jsonpath.query(html, parse);
    if (Array.isArray(result) && Array.isArray(result[0]) && result.length === 1) {
      return result[0]; // 自动解包
    }

    return result || [];
  }
}

export default Jsoup;
