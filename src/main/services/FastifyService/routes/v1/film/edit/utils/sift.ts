import { pdfa, pdfh } from '@main/utils/hiker/htmlParser';
import type { ISiftCategoryResult } from '@shared/types/sift';

export const siftCategory = (
  html: string,
  base_url: string,
  category_url: string,
  category_rule: string,
  category_exclude: string = '',
): ISiftCategoryResult => {
  const host = new URL(base_url).origin;
  const [listSelector, titleSelector, urlSelector, matchPattern] = category_rule.split(';').map((s) => s.trim());
  const excludePattern = new RegExp(['首页', '留言求片', 'APP'].join('|'), 'gi');

  const categories = pdfa(html, listSelector)
    .map((item) => {
      const title = pdfh(item, titleSelector).trim();
      if ((category_exclude && new RegExp(category_exclude).test(title)) || excludePattern.test(title)) {
        return null;
      }

      const itemUrl = pdfh(item, urlSelector);
      const categoryItem: Record<string, string> = { title, path_url: itemUrl };

      if (matchPattern) {
        const matchResult = itemUrl.match(new RegExp(matchPattern));
        if (matchResult) {
          categoryItem.uuid = matchResult[1];
        } else {
          return null;
        }
      }

      if (category_url) {
        if (category_url.startsWith('http')) {
          categoryItem.source_url = category_url.replace('fyclass', categoryItem.uuid);
        } else {
          categoryItem.source_url = host + category_url.replace('fyclass', categoryItem.uuid);
        }
      } else {
        categoryItem.source_url = host + categoryItem.url;
      }
      return categoryItem;
    })
    .filter(Boolean) as ISiftCategoryResult['raw'];

  const convertArrayToObject = (array: any[], excludedKeys: string[] = []): { title: string; uuid: string } =>
    array.reduce((acc, curr) => {
      Object.entries(curr).forEach(([key, value]) => {
        if (!excludedKeys.includes(key)) {
          acc[key] = acc[key] ? `${acc[key]}&${value}` : value?.toString();
        }
      });
      return acc;
    }, {});

  const { title, uuid } = convertArrayToObject(categories, ['source_url', 'path_url']);

  return { title, uuid, raw: categories };
};

export const siftFilter = (
  html: string,
  base_rule: string,
  detail_rule: string,
  matchs: Record<string, string> = {},
  ci: string = '',
  exclude_keys: string = '',
) => {
  const filters: Array<{ key: string; name: string; value: { n: string; v: string }[] }> = [];
  const links: Record<number, string[]> = {};
  const list = base_rule.split(/[\r\n]/).filter(Boolean);

  let fs = 0;
  list.forEach((item: string | string[], id) => {
    let [key, name, type = 'body&&a', title = 'a&&Text', url = 'a&&href'] = detail_rule.split(/[\r\n]/)[id].split(';');
    let rename = '';

    if (name && name.includes('@r')) {
      const tk = name.split('@');
      name = tk[0];
      rename = tk[1].replace(/^r/, '.replace');
    }

    if (item.includes(';')) {
      item = (item as string).split(';').filter(Boolean);
    }

    let content: string[] = [];
    if (Array.isArray(item)) {
      content = item.map((e) => pdfa(html, e)).flat();
    } else {
      content = pdfa(html, item);
    }

    content.forEach((it) => {
      let n = name.startsWith('s:') ? name.replace('s:', '') : pdfh(it, name);

      if (rename) {
        // eslint-disable-next-line no-new-func
        const func = new Function('str', `return (str${rename});`);
        // n = eval('n' + rename);
        n = func(n);
      }

      const k = key === '' ? n : key.startsWith('s:') ? key.replace('s:', '') : pdfh(it, key);

      // 排除键
      if (exclude_keys.split('|').includes(k)) return;

      const typeMatch = pdfa(it, type);
      fs++;

      links[fs] = [];
      const filterResults: Array<{ title: string; match_part: string; path_url: string }> = typeMatch
        .map((y) => {
          const parsedTitle = pdfh(y, title);
          if (parsedTitle === k) return null;

          const pathUrl = pdfh(y, url);
          let matchPart = '';

          let me = matchs[fs] || matchs[k];
          let add: string | undefined;

          if (me) {
            const regexList = me.split(/[\r\n]/g).filter(Boolean);

            if (regexList.length > 1) {
              const regex = regexList.find((rr) => rr.startsWith(`${ci}::`));
              me = regex?.split('::')[1] || regexList[0];
            } else {
              me = regexList[0];
            }

            let error: string | undefined;
            // let add: string | undefined;
            if (me.includes('@@')) {
              const [main, err] = me.split('@@');
              me = main;
              error = err;

              if (error?.includes('##')) {
                const te = error.split('##');
                error = te[0];
                // add = te[1];
              }
            } else if (me.includes('##')) {
              const [main, _addition] = me.split('##');
              me = main;
              // // eslint-disable-next-line ts/no-unused-vars
              // add = addition;
            }
            if (error !== undefined) {
              error = error.replace('fyclass', ci);
            }

            try {
              const str = pathUrl;
              links[fs].push(str);
              matchPart = decodeURIComponent(new RegExp(me).exec(str)?.[1] || '');
            } catch {
              if (error) matchPart = error;
            }
          }

          if (add) matchPart += add;

          const res = { title: parsedTitle, match_part: matchPart, path_url: pathUrl };
          return res;
        })
        .filter((item): item is { title: string; match_part: string; path_url: string } => item !== null);

      filters.push({
        key: k,
        name: n,
        value: filterResults.map((item) => ({
          n: item.title,
          v: item.match_part !== undefined ? item.match_part : item.path_url,
        })),
      });
    });
  });

  return { filters, fs, links, fl: filters.map((x) => x.key) };
};

export default { siftCategory, siftFilter };
