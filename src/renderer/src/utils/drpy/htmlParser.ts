import * as cheerio from 'cheerio';
const { URL } = require('url');

let pdfh_html = "";
let pdfa_html = "";
let p = /url\((.*?)\)/ms;
let NOADD_INDEX = /:eq|:lt|:gt|:first|:last|^body$|^#/;
let URLJOIN_ATTR = /(url|src|href|-original|-src|-play|-url)$/mi;
let pdfh_doc = null;
let pdfa_doc = null;

const joinUrl = (parent, child): String=> {
  if (!parent || parent.trim() === '') {
    return child;
  }

  let url;
  let q = parent;
  try {
    url = new URL(new URL(parent), child);
    q = url.href;
  } catch (e) {
    console.error(e);
  }
  return q;
}

/**
 * 根据传入的单规则获取 parse规则，索引位置,排除列表  -- 可以用于剔除元素,支持多个，按标签剔除，按id剔除等操作
 * @param {String} nparse 单规则
 * @returns 解析信息对象  
*/
const getParseInfo = (nparse) =>{
  const painfo = {
    nparse_index: 0, // 定义位置索引默认值为0
    nparse_rule: nparse, // 定义规则默认值为本身
    excludes: [], // 定义排除列表默认值为空
  };

  if (nparse.includes(":eq")) {
    const parts = nparse.split(":");
    painfo.nparse_rule = parts[0];
    let nparse_pos = parts[1];

    if (painfo.nparse_rule.includes("--")) {
      const rules = painfo.nparse_rule.split("--");
      painfo.excludes = rules.slice(1);
      painfo.nparse_rule = rules[0];
    } else if (nparse_pos.includes("--")) {
      const rules = nparse_pos.split("--");
      painfo.excludes = rules.slice(1);
      nparse_pos = rules[0];
    }

    try {
      painfo.nparse_index = parseInt(nparse_pos.replace("eq(", "").replace(")", ""));
    } catch (err) {
      painfo.nparse_index = 0;
    }
  } else {
    if (nparse.includes("--")) {
      const rules = nparse.split("--");
      painfo.excludes = rules.slice(1);
      painfo.nparse_rule = rules[0];
    }
  }

  return painfo;
}

/**
 * 检查字符串中是否包含特定的索引字符串
 * @param {String} str 
 * @return
 */
const isIndex = (str): Boolean => {
  if (!str || str.trim() === '') {
    return false;
  }

  const indexStrings = [':eq', ':lt', ':gt', ':first', ':last', 'body', '#'];

  for (let i = 0; i < indexStrings.length; i++) {
    const indexStr = indexStrings[i];
  
    if (str.includes(indexStr)) {
      if (indexStr === 'body' || indexStr === '#') {
        return str.startsWith(indexStr);
      }
      return true;
    }
  }

  return false;
};

/**
 * 检查字符串中是否包含特定的 URL 字符串
 * @param {String} str 
 * @return
 */
const isUrl = (str): Boolean => {
  if (!str || str.trim() === '') {
    return false;
  }

  const urlStrings = ['url', 'src', 'href', '-original', '-play'];

  for (let i = 0; i < urlStrings.length; i++) {
    const urlString = urlStrings[i];

    if (str.includes(urlString)) {
      return true;
    }
  }

  return false;
};

/**
 * 海阔解析表达式转原生表达式,自动补eq,如果传了first就最后一个也取eq(0)
 * @param {String} parse 
 * @param {Boolean} first 
 * @return
 */
const parseHikerToJq = (parse, first) => {
  if (parse.includes('&&')) {
    const parses = parse.split('&&');
    const newParses = [];
    for (let i = 0; i < parses.length; i++) {
      const pss = parses[i].split(' ');
      const ps = pss[pss.length - 1];
      const m = ps.match(NOADD_INDEX);
      if (!m) {
        if (!first && i >= parses.length - 1) {
          newParses.push(parses[i]);
        } else {
          newParses.push(`${parses[i]}:eq(0)`);
        }
      } else {
        newParses.push(parses[i]);
      }
    }
    parse = newParses.join(' ');
  } else {
    // 如果带空格就取最后一个元素
    const pss = parse.split(' ');
    const ps = pss[pss.length - 1];
    const m = ps.match(NOADD_INDEX);
    if (!m && first) {
      parse += ':eq(0)';
    }
  }
  return parse;
};

const parseDomForUrl = (html, rule, addUrl) =>{
  if (pdfh_html !== html) {
    pdfh_html = html;
    pdfh_doc = cheerio.load(html);
  }
  const doc = pdfa_doc;

  // let ret = cheerio.load('')(0); // create empty element
  if (rule === 'body&&Text' || rule === 'Text') {
    return doc.text();
  } else if (rule === 'body&&Html' || rule === 'Html') {
    return doc.html();
  }

  let option = '';
  if (rule.includes('&&')) {
    const rs = rule.split('&&');
    option = rs.slice(-1)[0];
    const excludes = rs.splice(rs.length - 1, 1);
    rule = excludes.join('&&');
  }
  rule = parseHikerToJq(rule, true);
  const parses = rule.split(' ');

  let ret = null;
  for (const nparse of parses) {
    ret = parseOneRule(pdfh_doc, nparse, ret);
    if (!ret.length) {
      return '';
    }
  }

  let result;
  if (option) {
    if (option === 'Text') {
      result = ret.text();
    } else if (option === 'Html') {
      result = ret.html();
    } else {
      result = ret.attr(option);
      if (option.toLowerCase().includes('style') && result.includes('url(')) {
        const match = result.match(p);
        if (match) {
          result = match[1];
        }
      }
      if (result && addUrl) {
        const urlJoinMatch = option.match(URLJOIN_ATTR);
        if (urlJoinMatch) {
          if (result.includes('http')) {
            result = result.substring(result.indexOf('http'));
          } else {
            result = new URL(addUrl, result).href;
          }
        }
      }
    }
  } else {
    result = ret.html();
  }
  return result;
}

const parseDomForArray = (html, rule) => {
  if (pdfa_html !== html) {
    pdfa_html = html;
    pdfa_doc = cheerio.load(html);
  }
  const doc = pdfa_doc;
  rule = parseHikerToJq(rule, false);
  console.log(rule)
  const parses = rule.split(' ');
  console.log(parses)
  let ret = '';

  for (const pars of parses) {
    console.log(pars)
    ret = parseOneRule(doc, pars, ret);
    console.log(ret)
    if (ret.length === 0) {
      return [];
    }
  } 

  const eleHtml = [];
  for (let i = 0; i < ret.length; i++) {
    const element1 = ret[i];
    console.log(element1)
    
    eleHtml.push(doc.html(element1));
  }

  return eleHtml;
};

/**
 * 解析空格分割后的原生表达式中的一条记录,正确处理eq的索引，返回处理后的ret
 * @param {String} doc html对象
 * @param {String} nparse 当前单个解析表达式
 * @param {String} ret pd对象结果
 * @return:
 */
const parseOneRule = (doc, nparse, ret) => {
  const painfo = getParseInfo(nparse);
  console.log(painfo);

  if (ret.length === 0) {
    ret = doc(painfo.nparse_rule)
  } else {
    ret = ret(painfo.nparse_rule)
  }

  if (nparse.includes(":eq")) {
    if (painfo.nparse_index < 0) {
      ret = ret.eq(ret.length + painfo.nparse_index);
    } else {
      ret = ret.eq(painfo.nparse_index);
    }
  }

  if (painfo.excludes && !ret) {
    ret = ret.slice();  //克隆一个, 免得直接remove会影响doc的缓存
    for (let i = 0; i < painfo.excludes.length; i++) {
      ret = ret(painfo.excludes[i]).remove();
      // retClone = retClone.filter(item => item !== painfo.excludes[i]);
    }
  }
  return ret;
};

const parseDomForList = (html, p1, listText, listUrl, addUrl) => {
  if (pdfh_html !== html) {
    pdfh_html = html;
    pdfh_doc = cheerio.load(html);
  }
  const doc = pdfa_doc;
  p1 = parseHikerToJq(p1, false);
  const parses = p1.split(' ');
  let ret;
  for (const pars of parses) {
    ret = parseOneRule(doc, pars, ret);
    if (ret.length === 0) {
      return [];
    }
  }
  const newVodList = [];
  for (let i = 0; i < ret.length; i++) {
    const it = ret[i].outerHtml();
    const listTextResult = parseDomForUrl(it, listText, '');
    const listUrlResult = parseDomForUrl(it, listUrl, addUrl);
    const result = `${listTextResult.trim()}$${listUrlResult}`;
    newVodList.push(result);
  }
  return newVodList;
};

export default {
  joinUrl,
  getParseInfo,
  isIndex,
  isUrl,
  parseHikerToJq,
  parseDomForArray,
  parseDomForList,
  parseDomForUrl,
  parseOneRule
}