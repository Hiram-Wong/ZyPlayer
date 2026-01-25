import { base64 } from '@shared/modules/crypto';

export const splitWithEscapedDelimiter = (str, delimiter) => {
  const parts: string[] = [];
  let buffer: string = '';
  const len: number = str.length;
  let i: number = 0;

  while (i < len) {
    if (str.slice(i, i + delimiter.length) === delimiter) {
      if (i > 0 && str[i - 1] === '\\') {
        buffer += delimiter;
        i += delimiter.length;
      } else {
        parts.push(buffer);
        buffer = '';
        i += delimiter.length;
      }
    } else {
      buffer += str[i];
      i++;
    }
  }

  parts.push(buffer);

  for (let j = 0; j < parts.length; j++) {
    const first = delimiter[0];
    parts[j] = parts[j].replaceAll(`\\${first}`, first);
  }

  return parts;
};

export const customSort = (arr, order) => {
  const orderMap = new Map();
  order.forEach((keyword, index) => {
    orderMap.set(keyword, index);
  });

  function compareStrings(a, b) {
    for (const [keyword, _index] of orderMap) {
      const aIndex = a.indexOf(keyword);
      const bIndex = b.indexOf(keyword);
      if (aIndex !== -1 && bIndex === -1) return -1;
      if (bIndex !== -1 && aIndex === -1) return 1;
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    }
    return 0;
  }
  arr.sort(compareStrings);
  return arr;
};

export const carryInstructionForText = (rtext, instruction, arrindex = undefined) => {
  instruction.forEach((cd) => {
    if (cd.startsWith('替换:')) {
      cd = cd.replace('替换:', '');
      splitWithEscapedDelimiter(cd, '#').forEach((cdr) => {
        const index = cdr.lastIndexOf('>>');
        let [oT, nT] = [cdr.slice(0, index), cdr.slice(index + 2)];
        if (nT === '空') nT = '';
        // if(nT.includes("*")&&!nT.includes("\\*"))
        if (nT.includes('<序号>') && arrindex !== undefined) {
          nT = nT.replace(/<序号>/g, `${arrindex}`);
        }
        rtext = rtext.split(getSplitRule(oT)).join(nT);
      });
    } else if (cd === 'Base64') {
      rtext = base64.decode({ src: rtext });
    }
  });
  return rtext;
};

export const carryInstructionForArray = (array, instruction) => {
  instruction.forEach((cd) => {
    if (cd.startsWith('排序:')) {
      cd = cd.replace('排序:', '');
      const order = cd.split('>');
      array = customSort(array, order);
    } else if (cd.startsWith('不包含:')) {
      cd = cd.replace('不包含:', '');
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_) => {
        return !cd.some((v) => _.includes(v));
      });
    } else if (cd.startsWith('包含:')) {
      cd = cd.replace('包含:', '');
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_) => {
        return cd.some((v) => _.includes(v));
      });
    } else if (cd.startsWith('不含序号:')) {
      cd = cd.replace('不含序号:', '');
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_, i) => {
        return !cd.some((v) => {
          if (!Number.isNaN(Number(v))) {
            v = Number(v);
            return v === i;
          } else if (/^\d*-\d*$/.test(v)) {
            const [s, e] = v.split('-');
            return i >= s && i <= e;
          }
          return false;
        });
      });
    } else if (cd.startsWith('含序号:')) {
      cd = cd.replace('含序号:', '');
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_, i) => {
        return cd.some((v) => {
          if (!Number.isNaN(Number(v))) {
            const new_v = Number(v);
            return new_v === i;
          } else if (/^\d*-\d*$/.test(v as string)) {
            const [s, e] = v.split('-');
            return i >= s && i <= e;
          }
          return false;
        });
      });
    }
  });
  return array;
};

export const getInstructionAndClear = (str) => {
  const leftbrackets = splitWithEscapedDelimiter(str, '[');
  // let merge = false;
  const instruction = leftbrackets.map((v, _i) => {
    const res = splitWithEscapedDelimiter(v, ']')[0];
    /* if (res === "&&" && i === 1) {
            merge = true
            return "[" + res + "]";
        } */
    return res.replaceAll('\\&', '&');
  });
  str = instruction.shift();
  // if (merge) str += instruction.shift();

  // eslint-disable-next-line regexp/no-unused-capturing-group
  if (/^Base64\((.*?)\)$/.test(str)) {
    // eslint-disable-next-line regexp/no-legacy-features
    str = RegExp.$1;
    instruction.push('Base64');
  }
  return [str, instruction];
};

export const getSplitRule = (rule) => {
  if (rule.includes('*') && !rule.includes('\\*')) {
    return new RegExp(rule.replace(/[.+?^${}()|[\]]/g, '\\$&').replace('*', '.*?'));
  }
  return rule;
};

export const getSplitStr = (text, rule, host = '') => {
  if (!rule) return '';
  const rules = splitWithEscapedDelimiter(rule, '+');
  let res = '';
  // @ts-expect-error Not all code paths return values. ts(7030)
  rules.forEach((r) => {
    if (!r.includes('&&')) {
      res += r;
      return;
    }

    let [rulec, instruction] = getInstructionAndClear(r);
    if (!rulec.includes('&&')) return null;
    rulec = dealWithRule(rulec);

    const rindex = Number(rulec[0]);
    const lindex = Number(rulec[1]);
    if (!Number.isNaN(rindex) && !Number.isNaN(lindex)) {
      res += carryInstructionForText(text.slice(rindex, lindex), instruction);
    } else {
      const rtext = (text.split(getSplitRule(rulec[0]))[1] || '').split(getSplitRule(rulec[1]))[0] || '';
      res += carryInstructionForText(rtext, instruction);
    }
  });
  if (host && !res.startsWith('http') && res) {
    res = host + res;
  }
  return res;
};

export const dealWithRule = (rule) => {
  return splitWithEscapedDelimiter(rule, '&&');
};

export const getHasRuleSplitStr = (text, rule, host: string = '', complete: boolean = false) => {
  if (!rule) return '';
  const rules = splitWithEscapedDelimiter(rule, '+');
  let res = '';
  for (const r of rules) {
    if (!r.includes('&&')) {
      res += r;
      continue;
    }

    let [rulec, instruction] = getInstructionAndClear(r);

    if (!rulec.includes('&&')) return null;
    rulec = dealWithRule(rulec);

    const rindex = Number(rulec[0]);
    const lindex = Number(rulec[1]);

    if (!Number.isNaN(rindex) && !Number.isNaN(lindex)) {
      res += carryInstructionForText(text.slice(rindex, lindex), instruction);
    } else {
      const rrule = getSplitRule(rulec[0]);
      const rtext = text.split(rrule);
      const fix = typeof rrule === 'string' ? rrule : '';
      if (rtext.length < 2) return null;
      const lrule = getSplitRule(rulec[1]);
      let ltext;
      for (let i = 1; i < rtext.length; i++) {
        ltext = (rtext[i] + fix).split(lrule);
        if (ltext.length > 1) break;
      }
      if (ltext.length === 1) ltext = [rtext[1]];
      if (complete && ltext.length < 2) return null;
      res += carryInstructionForText(ltext[0], instruction);
    }
  }

  if (host && !res.startsWith('http') && res) {
    res = host + res;
  }
  return res;
};

export const getSplitArray = (text, rule, complete: boolean = false) => {
  if (!rule) return [];
  let [rulec, instruction] = getInstructionAndClear(rule);
  rulec = dealWithRule(rulec);
  const res: string[] = [];
  const arr = text.split(getSplitRule(rulec[0]));
  arr.shift();
  arr.forEach((rtext, i) => {
    const stext = rtext.split(getSplitRule(rulec[1]));
    if (complete && stext[0] === rtext) return;
    res.push(carryInstructionForText(stext[0], instruction, i));
  });

  return carryInstructionForArray(res, instruction);
};

export const splitAndMapToStr = (text, rule, strRule) => {
  return getSplitArray(text, rule)
    .map((v) => getHasRuleSplitStr(v, strRule))
    .filter((v) => v !== null);
};

export const isParseJson = (inputText: string, arrrule: string[]) => {
  const trimmedText = inputText.trim();
  return (
    ((trimmedText.startsWith('{') && trimmedText.endsWith('}')) ||
      (trimmedText.startsWith('[') && trimmedText.endsWith(']'))) &&
    !arrrule.includes('&&')
  );
};

export const toPath = (value: string) => {
  if (typeof value !== 'string') return [];
  const pathSegments: string[] = [];
  let buffer = '';
  let inBrackets = false;
  let escapeCharacter = false;

  for (const char of value) {
    if (escapeCharacter) {
      buffer += char;
      escapeCharacter = false;
    } else if (char === '\\') {
      escapeCharacter = true;
    } else if (char === '.' && !inBrackets) {
      pathSegments.push(buffer);
      buffer = '';
    } else if (char === '[') {
      inBrackets = true;
    } else if (char === ']') {
      inBrackets = false;
    } else {
      buffer += char;
    }
  }
  if (buffer) pathSegments.push(buffer);
  return pathSegments;
};

export const getJson = (obj, path) => {
  if (!obj) return undefined;
  const resolvedPath = Array.isArray(path) ? path : toPath(path);
  return resolvedPath.reduce(
    (currentObject, key) => (currentObject && typeof currentObject === 'object' ? currentObject[key] : undefined),
    obj,
  );
};

export const getJsonArray = (json: string | object, rule: string) => {
  if (!rule || !json) return [];
  try {
    const parsedJson = typeof json === 'string' ? JSON.parse(json) : json;
    return getJson(parsedJson, rule);
  } catch {
    return [];
  }
};

export const getJsonStr = (json: string | object, rule: string) => {
  if (!rule || !json) return '';
  try {
    const parsedJson = typeof json === 'string' ? JSON.parse(json) : json;
    return splitWithEscapedDelimiter(rule, '+').reduce((result, part) => {
      if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
        // 直接添加字符串内容
        return result + part.slice(1, -1);
      } else {
        const [ruleCondition, instructions] = getInstructionAndClear(part);
        const jsonValue = String(getJson(parsedJson, ruleCondition));
        return result + carryInstructionForText(jsonValue, instructions);
      }
    }, '');
  } catch {
    return '';
  }
};
