/**
 * 扩展字符串方法
 */
function stringex() {
  Object.defineProperties(String.prototype, {
    retag: {
      value: function () {
        return this.replace(/<[^>]*>/g, '').replace(/[“”']/g, '');
      },
      writable: true,
      enumerable: false,
    },
    Split: {
      value: function (s, e) {
        if (e) {
          return this.split(s).filter((item) => item !== '');
        } else {
          return this.split(s);
        }
      },
      writable: true,
      enumerable: false,
    },
  });
}

/**
 * 移除字符串中指定的字符
 *
 * @param {string} originalText - 原始文本
 * @param {string} charsToRemove - 需要移除的字符
 * @returns {string} - 移除指定字符后的文本
 */
function removeChars(originalText, charsToRemove) {
  // 将原始文本转换为字符数组，以便后续处理
  return originalText.split('').reduce((acc, char) => {
    // 判断当前字符是否需要被移除
    return charsToRemove.includes(char) ? acc : acc + char;
  }, '');
}

function removeTagsExceptList(htmlString, tagList: string[] = []) {
  if (htmlString == '') {
    return htmlString;
  }
  if (tagList == undefined) {
    tagList = [];
  }
  // 构建一个正则表达式，排除列表中的标签
  let tagPattern = tagList.map((tag) => `</?${tag}(\\s+[^>]*)?>`).join('|');
  let regex = tagList.length > 0 ? new RegExp(`<(?!${tagPattern})[^>]+>|<!--.*?-->`, 'gs') : /<[^>]+>|<!--.*?-->/gs; // 如果 tagList 为空，则匹配所有标签
  // 使用正则表达式替换掉除了列表中标签之外的所有HTML标签
  return htmlString.replace(regex, (match) => {
    // 如果匹配的是注释，则直接返回空字符串
    if (match.startsWith('<!--')) {
      return '';
    }
    // 如果 tagList 为空，则直接返回空字符串，因为我们要删除所有标签
    if (tagList == undefined || tagList.length === 0) {
      return '';
    }
    // 如果匹配的是我们要保留的标签，则返回原字符串
    if (tagList.some((tag) => match.includes(`<${tag}`) || match.includes(`</${tag}>`))) {
      return match;
    }
    // 否则，返回空字符串，即删除该标签
    return '';
  });
}

function replaceTagsWithMapping(htmlString, replacementMap: Record<string, string[]>) {
  // 遍历映射并构建替换逻辑
  const replacements = Object.entries(replacementMap).map(([newTag, oldTags]) => {
    // 构建正则表达式来匹配旧标签的开始和结束标签
    let openTagRegex = new RegExp(`<(${oldTags.join('|')})(\\s+[^>]*)?>`, 'g');
    let closeTagRegex = new RegExp(`</(${oldTags.join('|')})>`, 'g');
    // 替换函数
    return (str) => {
      return str
        .replace(openTagRegex, `<${newTag}$2>`) // 替换开始标签
        .replace(closeTagRegex, `</${newTag}>`); // 替换结束标签
    };
  });
  // 执行替换
  return replacements.reduce((acc, replace) => {
    return replace(acc);
  }, htmlString);
}

export { removeTagsExceptList, replaceTagsWithMapping, stringex, removeChars };
