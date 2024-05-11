/**
 * RSA 加密解密工具定义
 */
declare const RSA: {
  /**
   * 解密数据
   * @param data 待解密的字符串数据
   * @param key 解密所用的密钥
   * @param option 解密选项，包含分段解密时的块大小 默认分段长度为117
   * @returns 解密后的字符串数据，若 JSEncrypt 未定义则返回 false
   */
  decode(data: string, key: string, option?: { chunkSize?: number }): string | false;
  /**
   * 加密数据
   * @param data 待加密的字符串数据
   * @param key 加密所用的密钥
   * @param option 加密选项，包含分段加密时的块大小  默认分段长度为117
   * @returns 加密后的字符串数据，若 JSEncrypt 未定义则返回 false
   */
  encode(data: string, key: string, option?: { chunkSize?: number }): string | false;

  /**
   * 修正密钥格式，确保其有正确的前缀和后缀
   * @param key 需要修正的原始密钥字符串
   * @param prefix 密钥前缀字符串
   * @param endfix 密钥后缀字符串
   * @returns 格式修正后的密钥字符串
   */
  fixKey(key: string, prefix: string, endfix: string): string;
  /**
   * 从给定的密钥材料中获取私钥字符串，确保其格式正确
   * @param key 密钥材料字符串
   * @returns 格式正确的私钥字符串
   */
  getPrivateKey(key: string): string;

  /**
   * 从给定的密钥材料中获取公钥字符串，确保其格式正确
   * @param key 密钥材料字符串
   * @returns 格式正确的公钥字符串
   */
  getPublicKey(key: string): string;
}


/**
 * 检查宝塔验证并自动跳过获取正确源码
 * @param html 之前获取的html
 * @param url 之前的来源url
 * @param obj 来源obj
 * @returns \{string|DocumentFragment|*\} 返回请求结果
 */
declare function checkHtml(html: string, url: string, obj: object): any


/**
 * 首页分类解析，筛选暂未实现
 * @param homeObj 首页传参对象
 * @returns \{string\}
 */
declare function homeParse(homeObj: object): string

/**
 *  首页推荐列表解析
 * @param homeVodObj
 * @returns \{string\}
 */
declare function homeVodParse(homeVodObj: object): string

/**
 * 一级分类页数据解析
 * @param cateObj
 * @returns \{string\}
 */
declare function categoryParse(cateObj: object): string

/**
 * 搜索列表数据解析
 * @param searchObj
 * @returns \{string\}
 */
declare function searchParse(searchObj: object): string

/**
 * 二级详情页数据解析
 * @param detailObj
 * @returns \{string\}
 */
declare function detailParse(detailObj: object): string
