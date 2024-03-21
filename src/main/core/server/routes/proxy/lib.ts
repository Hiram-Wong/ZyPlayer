/**
 * 本地代理解析规则
 * @param params
 */
const proxyParse = (proxyObj) => {
  var input = proxyObj.params;

  if (proxyObj.proxy_rule) {
    console.log('准备执行本地代理规则:\n' + proxyObj.proxy_rule);

    try {
      eval(proxyObj.proxy_rule);

      if (input && input !== proxyObj.params && Array.isArray(input) && input.length === 3) {
        return input;
      } else {
        return [404, 'text/plain', 'Not Found'];
      }
    } catch (e) {
      return [500, 'text/plain', '代理规则错误: ' + e];
    }
  } else {
    return [404, 'text/plain', 'Not Found'];
  }
}

/**
 * js源本地代理返回的数据列表特定返回对象中的函数
 * @param params 代理链接参数比如 /proxy?do=js&url=https://wwww.baidu.com => params就是 {do:'js','url':'https://wwww.baidu.com'}
 * @returns {*}
 */
const proxy = (params) => {
  let proxy_rule = rule["proxy_rul"]?.trim() || "";
  
  if (proxy_rule.startsWith('js:')) {
    proxy_rule = proxy_rule.replace('js:', '');
  }
  
  const proxyObj = {
    params: params,
    proxy_rule: proxy_rule
  };
  
  return proxyParse(proxyObj);
};

export default proxy;