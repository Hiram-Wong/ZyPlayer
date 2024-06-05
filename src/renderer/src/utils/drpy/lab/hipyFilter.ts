import { pdfh, pdfa } from '../drpyInject';

RegExp.prototype.callback = function (str: string, func: CallbackFunction): string {
  const functions: Functions = {
    replaceFG: function (str, m, callback) {
      // Start position
      const s = m.index + m[0].indexOf(m[1]);
      // End position
      const e = s + m[1].length;
      // Callback
      const r = callback(m);
      // Return
      return str.slice(0, s) + r + str.slice(e);
    },
  };

  let result = str;
  const match = this.exec(str);
  if (match) {
    result = func(match, functions);
  }
  // Reset
  this.lastIndex = 0;
  return result;
};

const getFilters = (
  html: string,
  ci: string,
  f: string,
  f1: string,
  matchs: object = {},
  exclude_keys: string = '',
) => {
  const ms = matchs;
  const fls: any = [];
  // const fi: any = [];
  const links: any = [];
  const list = f.split(/[\r\n]/).filter((e) => e);

  let fs = 0;
  list.forEach((item: any, id) => {
    const ff = f1.split(/[\r\n]/)[id];
    let key, name, type, title, url;
    try {
      [key, name, type, title, url] = ff.split(/;/g);
      console.log(name);
    } catch (err) {
      console.log(`[getFilters][error]`, err);
      return;
    }
    type = type || 'body&&a';
    title = title || 'a&&Text';
    url = url || 'a&&href';
    let rename = '';
    if (name && name.includes('@r')) {
      var tk = name.split('@');
      name = tk[0];
      rename = tk[1].replace(/^r/, '.replace');
    }
    if (item.includes(';')) {
      item = item.split(';').filter((e) => e);
    }
    let c: any = [];
    if (item.constructor == Array) {
      c = item.map((e) => pdfa(html, e)).flat(1);
    } else if (item.constructor == String) {
      c = pdfa(html, item as string);
    }

    c.forEach((it, i) => {
      let n = '';
      if (name && name.startsWith('s:')) {
        n = name.replace('s:', '');
      } else {
        n = pdfh(it, name);
      }

      if (rename != '') {
        n = eval('n' + rename);
      }
      let k = '';
      if (key == '') {
        k = n;
      } else if (key.startsWith('s:')) {
        k = key.replace('s:', '');
      } else {
        k = pdfh(it, key);
      }

      let ex_keys = exclude_keys.split(/\|/g);
      //排除键
      if (ex_keys.includes(k)) {
        return;
      }

      const ty = pdfa(it, type);
      fs++;
      var tobj: any = [];
      links[fs] = [];
      tobj = ty.map((y) => {
        let add: string | undefined = undefined;
        var obj: any = {
          title: pdfh(y, title),
          url: pdfh(y, url),
        };
        let me = ms[fs];
        if (ms.hasOwnProperty(k)) {
          me = ms[k];
        }

        if (me != undefined) {
          const regexList = me.split(/[\r\n]/g).filter((e) => e);

          if (regexList.length == 1) {
            me = regexList[0];
          }
          if (regexList.length > 1) {
            let mIndex = regexList.findIndex((rr) => rr.startsWith(ci + '::'));
            const regex = regexList[mIndex];
            if (mIndex != -1 && regex.includes('::')) {
              // @ts-ignore
              [_, me] = regex.split('::');
            }
            if (mIndex == -1) {
              me = regexList.filter((rr) => !rr.startsWith(ci + '::'))[0];
            }
          }
          let error: string | undefined = undefined;
          if (me.includes('@@')) {
            let te = me.split('@@');
            me = te[0];
            error = te[1];
            if (error?.includes('##')) {
              let te = error.split('##');
              error = te[0];
              add = te[1];
            }
          } else if (me.includes('##')) {
            let te = me.split('##');
            me = te[0];
            add = te[1];
          }
          if (error != undefined) {
            error = error.replace('fyclass', ci);
          }

          try {
            const reg: any = new RegExp(me, 'g');
            console.log(reg);
            let str = obj.url;
            let regobj = reg.callback(str, (m, f) => {
              let result = str;
              result = f.replaceFG(str, m, (m) => {
                return m[1].fontcolor('red');
              });
              return result;
            });
            links[fs].push(regobj);
            let result = reg.exec(str)[1];
            console.log(result);
            obj.m = result;
            obj.m = decodeURIComponent(obj.m);
          } catch (e) {
            console.log(e);
            if (error != undefined) {
              obj.m = error;
            } else {
            }
          }
        }
        if (obj.m == 'undefined') {
          delete obj.m;
        } else if (add != undefined) {
          obj.m = obj.m + add;
        }

        return obj;
      });

      fls.push({
        key: k,
        name: n,
        value: tobj.map((e) => {
          return {
            n: e.title,
            v: e.m != undefined ? e.m : e.url,
          };
        }),
      });
    });
  });
  console.log({
    filters: fls,
    fs: fs,
    links,
    fl: fls.map((x) => x.key),
  });
  return {
    filters: fls,
    fs: fs,
    links,
    fl: fls.map((x) => x.key),
  };
};

const processCategories = (contentHtml, class_parse, cate_exclude, reurl, url) => {
  const host = new URL(url).origin;

  const [listSelector, titleSelector, urlSelector, matchPattern] = class_parse.split(';').map((s) => s.trim());

  const defaultExcludes = ['首页', '留言求片', 'APP'];
  const excludePattern = new RegExp(defaultExcludes.join('|'), 'gi');

  const categories =
    pdfa(contentHtml, listSelector)
      .map((item) => {
        const title = pdfh(item, titleSelector).trim();
        if ((cate_exclude != '' && new RegExp(cate_exclude).test(title)) || excludePattern.test(title)) {
          console.log(`${title}: 跳过`);
          return;
        }

        const itemUrl = pdfh(item, urlSelector);
        const categoryItem: any = { title, url: itemUrl };

        if (matchPattern) {
          const matchResult = itemUrl.match(new RegExp(matchPattern));
          if (matchResult) {
            categoryItem.m = matchResult[1];
          } else {
            return null;
          }
        }
        if (reurl) {
          if (reurl.startsWith('http')) {
            categoryItem.surl = reurl.replace('fyclass', categoryItem.m);
          } else {
            categoryItem.surl = host + reurl.replace('fyclass', categoryItem.m);
          }
        } else {
          categoryItem.surl = host + categoryItem.url;
        }
        return categoryItem;
      })
      .filter(Boolean) || [];

  const convertArrayToObject = (array, excludedKeys) => {
    return array.reduce((accumulator, current) => {
      for (let key in current) {
        // 如果 excludedKeys 包含当前键，则跳过
        if (excludedKeys && excludedKeys.includes(key)) {
          continue;
        }

        if (accumulator.hasOwnProperty(key)) {
          accumulator[key] += '&' + current[key].toString();
        } else {
          accumulator[key] = current[key].toString();
        }
      }
      return accumulator;
    }, {});
  };

  const res = convertArrayToObject(categories, ['surl', 'url']);
  console.log(res);
  return res;
};

export { getFilters, processCategories };
