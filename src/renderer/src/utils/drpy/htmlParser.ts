import * as cheerio from 'cheerio';
import jsonpath from 'jsonpath';
import url from 'url';

const PARSE_CACHE = true;  // 解析缓存
const NOADD_INDEX = ':eq|:lt|:gt|:first|:last|^body$|^#';  // 不自动加eq下标索引
const URLJOIN_ATTR = '(url|src|href|-original|-src|-play|-url|style)$';  // 需要自动urljoin的属性
const SPECIAL_URL = '^(ftp|magnet|thunder|ws):';  // 过滤特殊链接,不走urlJoin

class Jsoup {
  MY_URL: string = '';
  pdfh_html = '';
  pdfa_html = '';

  pdfh_doc = null;
  pdfa_doc = null;

  // 构造函数
  constructor(MY_URL: string = '') {
    this.MY_URL = MY_URL;
  }

  // 测试
  test(text: string, string: string): boolean {
    const searchObj = new RegExp(text, 'mgi').exec(string);
    return searchObj !== null;
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
  parseHikerToJq(parse: string, first = false): string {
    if (this.contains(parse, '&&')) {
      const parses = parse.split('&&');  // 带&&的重新拼接
      let new_parses: string[] = [];  //  构造新的解析表达式列表
      for (let i = 0; i < parses.length; i++) {
        const ps = parses[i].split(' ')[-1];  // 如果分割&&后带空格就取最后一个元素
        if (!this.test(NOADD_INDEX, ps)) {
          if (!first && i === parses.length - 1) {  // 不传first且遇到最后一个,不用补eq(0)
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
      const ps = parse.split(' ')[-1];  // 如果带空格就取最后一个元素
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
  getParseInfo(nparse: string): { rule: string, index: number, excludes: string[] } {
    let excludes: string[] = [];  // 定义排除列表默认值为空
    let nparseIndex = 0;  // 定义位置索引默认值为0
    let nparseRule = nparse;  // 定义规则默认值为本身

    if (this.contains(nparse, ':eq')) {
      nparseRule = nparse.split(':eq')[0];
      let nparsePos = nparse.split(':eq')[1];
      if (this.contains(nparseRule, '--')) {
        excludes = nparseRule.split('--').slice(1);
        nparseRule = nparseRule.split('--')[0];
      } else if (this.contains(nparsePos, '--')) {
        excludes = nparsePos.split('--').slice(1);
        nparsePos = nparsePos.split('--')[0]
      }
      try {
        nparseIndex = parseInt(nparsePos.split('(')[1].split(')')[0]);
      } catch {}
    } else if (this.contains(nparse, '--')) {
      nparseRule = nparse.split('--')[0];
      excludes = nparse.split('--').slice(1);
    }

    return { rule: nparseRule, index: nparseIndex, excludes };
  }

  /**
   * 解析空格分割后的原生表达式中的一条记录,正确处理eq的索引,返回处理后的ret
   * @param $: cheerio
   * @param nparse: 解析表达式
   * @param ret: 当前返回值
   * @returns {Cheerio}
   */
  parseOneRule($, nparse: string, ret) {
    const { rule, index, excludes } = this.getParseInfo(nparse);

    if (!ret) {
      ret = $(rule);
    } else {
      ret = ret.find(rule);
    }

    if (this.contains(nparse, ':eq')) {
      ret = ret.eq(index);
    }

    if (excludes && ret.length > 0) {
      ret = ret.clone(); // 克隆一个，避免直接remove影响原始DOM
      excludes.forEach(exclude => {
        ret.find(exclude).remove();
      });
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
    if (!html || !parse) {
      return [];
    }
    parse = this.parseHikerToJq(parse);
    const $ = cheerio.load(html);
    const ret: string[] = [];

    const parses = parse.split(' ');
    let currentRet = $('body');
    for (const nparse of parses) {
      currentRet = this.parseOneRule($, nparse, currentRet);
      if (currentRet.length === 0) {
        return [];
      }
    }

    currentRet.each((_, el) => {
      ret.push($(el).html());
    });

    return ret;
  }
  
  /**
   * 解析空格分割后的原生表达式,返回处理后的ret
   * https://pyquery.readthedocs.io/en/latest/api.html
   * @param html
   * @param parse
   * @returns {Cheerio}
   */
  pdfh(html: string, parse: string, baseUrl: string = ''): string {
    if (!html || !parse) {
      return '';
    }
    if (PARSE_CACHE && this.pdfh_html !== html) {
      this.pdfh_html = html;
      const $ = cheerio.load(html);
      this.pdfh_doc = $;
    } else {
      const $ = cheerio.load(html);
    }

    let option: string | undefined;
    if (this.contains(parse, '&&')) {
      [parse, option] = parse.split('&&');
      parse = this.parseHikerToJq(parse, true);
    }

    const parses = parse.split(' ');
    let currentRet = $('body');
    for (const nparse of parses) {
      currentRet = this.parseOneRule($, nparse, currentRet);
      if (currentRet.length === 0) {
        return '';
      }
    }

    let ret: string;
    if (option) {
      switch (option.toLowerCase()) {
        case 'text':
          ret = currentRet.text();
          break;
        case 'html':
          ret = currentRet.html();
          break;
        default:
          ret = currentRet.attr(option) || '';
          if (this.contains(option.toLowerCase(), 'style') && this.contains(ret, 'url(')) {
            try {
              ret = ret.match(/url\((.*?)\)/)?.[1];
              // 2023/07/28新增 style取内部链接自动去除首尾单双引号
              ret = ret?.replace(/^['"]|['"]$/g, '');
            } catch {
              // 忽略错误
            }
          }
          if (ret && baseUrl) {
            const needAdd = this.test(URLJOIN_ATTR, option) && !this.test(SPECIAL_URL, ret);
            if (needAdd) {
              if (ret.startsWith('http')) {
                ret = ret.slice(ret.indexOf('http'));
              } else {
                ret = url.resolve(baseUrl, ret);
              }
            }
          }
      }
    } else {
      ret = currentRet.prop('outerHTML');
    }

    return ret;
  }

  pd(html: string, parse: string, baseUrl: string = ''): string {
    if (!baseUrl) {
      baseUrl = this.MY_URL;
    }
    return this.pdfh(html, parse, baseUrl);
  }

  pq(html: string) {
    return cheerio.load(html);
  }

  pjfh(html: any, parse: string, addUrl = false): string {
    if (!html || !parse) {
      return '';
    }

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
      ret = queryResult.length > 0 ? queryResult[0] : '';
      if (addUrl && ret) {
        ret = url.resolve(this.MY_URL, ret);
      }
      if (ret) {
        break;
      }
    }

    return ret;
  }

  pj(html: any, parse: string): string {
    return this.pjfh(html, parse, true);
  }

  pjfa(html: any, parse: string): any[] {
    if (!html || !parse) {
      return [];
    }

    try {
      html = typeof html === 'string' ? JSON.parse(html) : html;
    } catch {
      return [];
    }

    if (!parse.startsWith('$.')) {
      parse = '$.' + parse;
    }

    const result = jsonpath.query(html, parse);
    if (Array.isArray(result) && Array.isArray(result[0]) && result.length === 1) {
      // 自动解包
      return result[0];
    }

    return result || [];
  }
}

export default Jsoup;