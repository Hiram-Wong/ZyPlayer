import { decodeBase64 } from '@/utils/tool';
const splitWithEscapedDelimiter = (str, delimiter) => {
  let parts: string[] = [];
  let buffer: string = '';
  let len: number = str.length;
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
    let first = delimiter[0];
    parts[j] = parts[j].replaceAll('\\' + first, first);
  }

  return parts;
};

const customSort = (arr, order) => {
  const orderMap = new Map();
  order.forEach((keyword, index) => {
    orderMap.set(keyword, index);
  });

  function compareStrings(a, b) {
    for (let [keyword, _index] of orderMap) {
      let aIndex = a.indexOf(keyword);
      let bIndex = b.indexOf(keyword);
      if (aIndex !== -1 && bIndex === -1) return -1;
      if (bIndex !== -1 && aIndex === -1) return 1;
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    }
    return 0;
  }
  arr.sort(compareStrings);
  return arr;
};

const carryInstructionForText = (rtext, instruction, arrindex = undefined) => {
  instruction.forEach((cd) => {
    if (cd.startsWith('替换:') && (cd = cd.replace('替换:', ''))) {
      splitWithEscapedDelimiter(cd, '#').forEach((cdr) => {
        let index = cdr.lastIndexOf('>>');
        let [oT, nT] = [cdr.slice(0, index), cdr.slice(index + 2)];
        if (nT === '空') nT = '';
        //if(nT.includes("*")&&!nT.includes("\\*"))
        if (nT.includes('<序号>') && arrindex !== undefined) {
          nT = nT.replace(/<序号>/g, arrindex + '');
        }
        rtext = rtext.split(getSplitRule(oT)).join(nT);
      });
    } else if (cd === 'Base64') {
      rtext = decodeBase64(rtext);
    }
  });
  return rtext;
};

const carryInstructionForArray = (array, instruction) => {
  instruction.forEach((cd) => {
    if (cd.startsWith('排序:') && (cd = cd.replace('排序:', ''))) {
      let order = cd.split('>');
      array = customSort(array, order);
    } else if (cd.startsWith('不包含:') && (cd = cd.replace('不包含:', ''))) {
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_) => {
        return !cd.some((v) => _.includes(v));
      });
    } else if (cd.startsWith('包含:') && (cd = cd.replace('包含:', ''))) {
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_) => {
        return cd.some((v) => _.includes(v));
      });
    } else if (cd.startsWith('不含序号:') && (cd = cd.replace('不含序号:', ''))) {
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_, i) => {
        return !cd.some((v) => {
          if (!Number.isNaN(Number(v))) {
            v = Number(v);
            return v === i;
          } else if (/^\d*?-\d*?$/.test(v)) {
            let [s, e] = v.split('-');
            return i >= s && i <= e;
          }
          return false;
        });
      });
    } else if (cd.startsWith('含序号:') && (cd = cd.replace('含序号:', ''))) {
      cd = splitWithEscapedDelimiter(cd, '#');
      array = array.filter((_, i) => {
        return cd.some((v: string) => {
          if (!Number.isNaN(Number(v))) {
            const new_v = Number(v);
            return new_v === i;
          } else if (/^\d*?-\d*?$/.test(v as string)) {
            let [s, e] = v.split('-');
            return i >= s && i <= e;
          }
        });
      });
    }
  });
  return array;
};

const getInstructionAndClear = (str) => {
  let leftbrackets = splitWithEscapedDelimiter(str, '[');
  //let merge = false;
  let instruction = leftbrackets.map((v, _i) => {
    let res = splitWithEscapedDelimiter(v, ']')[0];
    /*if (res === "&&" && i === 1) {
            merge = true
            return "[" + res + "]";
        }*/
    return res.replaceAll('\\&', '&');
  });
  str = instruction.shift();
  //if (merge) str += instruction.shift();

  if (/^Base64\((.*?)\)$/.test(str)) {
    str = RegExp.$1;
    instruction.push('Base64');
  }
  return [str, instruction];
};

const getSplitRule = (rule) => {
  if (rule.includes('*') && !rule.includes('\\*')) {
    return new RegExp(rule.replace(/[\.\+\?\^\$\{\}\(\)\|\[\]]/g, '\\$&').replace('*', '.*?'));
  }
  return rule;
};

const getSplitStr = (text, rule, host = '') => {
  if (!rule) return '';
  let rules = splitWithEscapedDelimiter(rule, '+');
  let res = '';
  rules.forEach((r) => {
    if (!r.includes('&&')) {
      res += r;
      return;
    }

    let [rulec, instruction] = getInstructionAndClear(r);
    if (!rulec.includes('&&')) return null;
    rulec = dealWithRule(rulec);

    let rindex = Number(rulec[0]);
    let lindex = Number(rulec[1]);
    if (!Number.isNaN(rindex) && !Number.isNaN(lindex)) {
      res += carryInstructionForText(text.slice(rindex, lindex), instruction);
    } else {
      let rtext = (text.split(getSplitRule(rulec[0]))[1] || '').split(getSplitRule(rulec[1]))[0] || '';
      res += carryInstructionForText(rtext, instruction);
    }
  });
  if (host && !res.startsWith('http') && res) {
    res = host + res;
  }
  return res;
};

const dealWithRule = (rule) => {
  return splitWithEscapedDelimiter(rule, '&&');
};

const getHasRuleSplitStr = (text, rule, host: string = '', complete: boolean = false) => {
  if (!rule) return '';
  let rules = splitWithEscapedDelimiter(rule, '+');
  let res = '';
  for (let r of rules) {
    if (!r.includes('&&')) {
      res += r;
      continue;
    }

    let [rulec, instruction] = getInstructionAndClear(r);

    if (!rulec.includes('&&')) return null;
    rulec = dealWithRule(rulec);

    let rindex = Number(rulec[0]);
    let lindex = Number(rulec[1]);

    if (!Number.isNaN(rindex) && !Number.isNaN(lindex)) {
      res += carryInstructionForText(text.slice(rindex, lindex), instruction);
    } else {

      let rrule = getSplitRule(rulec[0]);
      let rtext = text.split(rrule);
      let fix = typeof rrule === 'string' ? rrule : '';
      if (rtext.length < 2) return null;
      let lrule = getSplitRule(rulec[1]);
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

const getSplitArray = (text, rule, complete: boolean = false) => {
  if (!rule) return [];
  let [rulec, instruction] = getInstructionAndClear(rule);
  rulec = dealWithRule(rulec);
  let res: string[] = [];
  let arr = text.split(getSplitRule(rulec[0]));
  arr.shift();
  arr.forEach((rtext, i) => {
    let stext = rtext.split(getSplitRule(rulec[1]));
    if (complete && stext[0] === rtext) return;
    res.push(carryInstructionForText(stext[0], instruction, i));
  });

  return carryInstructionForArray(res, instruction);
};

const splitAndMapToStr = (text, rule, strRule) => {
  return getSplitArray(text, rule)
    .map((v) => getHasRuleSplitStr(v, strRule))
    .filter((v) => v !== null);
};

const XBPQParse = { getSplitStr, getSplitArray, getHasRuleSplitStr, splitAndMapToStr, splitWithEscapedDelimiter };

export default XBPQParse;
