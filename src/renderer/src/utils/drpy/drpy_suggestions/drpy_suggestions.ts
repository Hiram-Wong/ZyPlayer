/**
 * 自定义代码片段
 */
const Snippet = [
  {
    label: 'ifelse',
    insertText: `if (\${1:condition}) {
  \t$0
} else {
  \t
}
    `,
    detail: '普通if-else',
    documentation: `if (condition) {

} else {

}`,
  },
  {
    label: 'for',
    insertText: `for (let \${1:i} = 0; \${1:i} < \${2:array}.length; \${1:i}++) {
  let \${3:data} = \${2:array}[\${1:i}];
  \$0
}`,
    detail: '普通 for 循环',
    documentation: `for (let i = 0; i < array.length; i++) {
  let data = array[i];

}`,
  },
  {
    label: 'forof',
    insertText: `for (let data of \${1:array}) {
  \$0
}`,
    detail: 'for-of(遍历数组推荐)',
    documentation: `for (let data of array) {

}`,
  },
  {
    label: 'forin',
    insertText: `for (let key in \${1:object}) {
  let data = \${1:object}[key];
  \$0
}`,
    detail: 'for-in(遍历对象推荐)',
    documentation: `for (let key in object) {
  let data = object[key];

}`,
  },
  {
    label: '$js',
    insertText: `\\$js.toString(()=>{
    $0
})`,
    detail: '$js工具',
    documentation: `$js.toString(()=>{

})`,
  },
  {
    label: '$rule',
    insertText: `
var rule = {
  title:'',
  host:'',
  url:'',
  searchUrl:'',
  searchable:2,
  quickSearch:0,
  filterable:1,
  filter:'',
  filter_url:'',
  headers:{
      'User-Agent':'MOBILE_UA',
  },
  timeout:5000,
  class_parse:'#side-menu li;a&&Text;a&&href;/(.*?)\\.html',
  cate_exclude:'',
  play_parse:true,
  lazy:\\$js.toString(()=>{
    input = {parse:0,url:input,js:''};
  }),
  double:true,
  推荐:'列表1;列表2;标题;图片;描述;链接;详情',
  一级:'列表;标题;图片;描述;链接;详情',
  二级:{
    title:'vod_name;vod_type',
    img:'图片链接',
    desc:'主要信息;年代;地区;演员;导演',
    content:'简介',
    tabs:'',
    lists:'',
    tab_text:'body&&Text',
    list_text:'body&&Text',
    list_url:'a&&href'
  },
  搜索:'列表;标题;图片;描述;链接;详情',
}
    `.trim(),
    detail: '常用简单列表定位规则写法',
    documentation: `var rule = {};`,
  },
  {
    label: '$ruleJs',
    insertText: `
var rule = {
  title:'',
  host:'',
  url:'',
  searchUrl:'',
  searchable:2,
  quickSearch:0,
  filterable:1,
  filter:'',
  filter_url:'',
  headers:{
      'User-Agent':'MOBILE_UA',
  },
  timeout:5000,
  class_parse:'#side-menu li;a&&Text;a&&href;/(.*?)\\.html',
  cate_exclude:'',
  play_parse:true,
  double:true,
  推荐:\\$js.toString(()=>{
    let html=request(input);
    let data=pdfa(html,'');
    VODS = [];
  }),
  一级:\\$js.toString(()=>{
    let html=request(input);
    let data=pdfa(html,'');
    VODS = [];
  }),
  二级:\\$js.toString(()=>{
    let html=request(input);
    let vod_name=pdfh(html,'.title&&Text');
    VOD = {vod_name:vod_name};
  }),
  搜索:\\$js.toString(()=>{
    let html=request(input);
    let data=pdfa(html,'');
    VODS = [];
  }),
  lazy:\\$js.toString(()=>{
    input = {parse:0,url:input,js:''};
  }),
}
    `.trim(),
    detail: '常用简单纯JS规则写法',
    documentation: `var rule = {};`,
  },
  {
    label: '$ruleInherit',
    insertText: `
var rule = {
  title:'cokemv',
  模板:'mxpro',
  host:'https://cokemv.me',
  class_parse:\`.navbar-items li:gt(1):lt(7);a&&Text;a&&href;/(\\\\d+).html\`,
}
    `.trim(),
    detail: '简单继承写法',
    documentation: `var rule = {};`,
  },
  {
    label: '$ruleTemplate',
    insertText: `
var rule = {
    title:'规则标题',
    编码:'utf-8',
    搜索编码:'utf-8',
    host:'网页的域名根',
    hostJs:'print(HOST);let html=request(HOST,{headers:{"User-Agent":PC_UA}});let src = jsp.pdfh(html,"ul&&li&&a&&href");print(src);HOST=src.replace("/index.php","")',
    homeUrl:'/latest/',
    url:'/fyclass/fypage.html[/fyclass/]',
    detailUrl:'https://yanetflix.com/voddetail/fyid.html',
    searchUrl:'',
    searchable:2,
    quickSearch:0,
    filterable:1,
    filter:{},
    filter_def:{
        1:{
        年份:'2024',
        },
    },
    filter_url:'style={{fl.style}}&zone={{fl.zone}}&year={{fl.year}}&fee={{fl.fee}}&order={{fl.order}}',
    headers:{
        'User-Agent':'MOBILE_UA',
        "Cookie": "searchneed=ok"
    },
    timeout:5000,
    class_name:'电影&电视剧&动漫&综艺',
    class_url:'1&2&3&4',
    class_parse:'#side-menu:lt(1) li;a&&Text;a&&href;com/(.*?)/',
    cate_exclude:'',
    tab_exclude:'',
    tab_remove:['tkm3u8'],
    tab_order:['lzm3u8','wjm3u8','1080zyk','zuidam3u8','snm3u8'],
    tab_rename:{'lzm3u8':'量子','1080zyk':'1080看','zuidam3u8':'最大资源','kuaikan':'快看',
    'bfzym3u8':'暴风','ffm3u8':'非凡','snm3u8':'索尼','tpm3u8':'淘片','tkm3u8':'天空',},
    play_parse:true,
    play_json:[{
        re:'*',
        json:{
            jx:1,
            parse:1,
        },
    }],
    pagecount:{"1":1,"2":1,"3":1,"4":1,"5":1,"7":1,"时间表":1},
    lazy:'',
    limit:6,
    double:true,
    图片来源:'@Referer=http://www.jianpianapp.com@User-Agent=jianpian-version350',
    图片替换:'https://www.keke6.app/=>https://vres.a357899.cn/',
    预处理:'rule_fetch_params.headers.Cookie = "xxxx";',
    推荐:'列表;标题;图片;描述;链接;详情',
    一级:'列表;标题;图片;描述;链接;详情',
    二级访问前:'log(MY_URL);let jump=request(MY_URL).match(/href="(.*?)"/)[1];log(jump);MY_URL=urljoin2(MY_URL,jump)',
    二级:{
      title:'vod_name;vod_type',
      img:'图片链接',
      desc:'主要信息;年代;地区;演员;导演',
      content:'简介',
      tabs:'',
      lists:'',
      tab_text:'body&&Text',
      list_text:'body&&Text',
      list_url:'a&&href'
    },
    搜索:'列表;标题;图片;描述;链接;详情',
    proxy_rule:\`js:
    log(input);
    input = [200,'text;plain','hello drpy']
    \`,
    sniffer:1,
    isVideo:"http((?!http).){26,}\\\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp|rm|rmvb|asf|m4a|mp3|wma)",
    isVideo:\`js:
    log(input);
    if(/m3u8/.test(input)){
    input = true
    }else{
    input = false
    }
    \`,
}
    `.trim(),
    detail: '快捷规则带参说明',
    documentation: `var rule = {};`,
  },
  {
    label: 'list.map',
    insertText: `list.map((item,index)=>{
  $1
})`,
    detail: 'list.map',
    documentation: `list.map((item,index)=>{

    })`,
  },
  {
    label: 'd.pushit',
    insertText: `d.push({
  title: "$1",
  desc:"",
  img:"",
  url:"$2"
})`,
    detail: '海阔d.push',
    documentation: `d.push({
  title: '',
  desc:'',
  img:'',
  url:''
})`,
  },

];

/**
 * 自定义函数
 */
const Function = [
  {
    label: 'getProxyUrl',
    insertText: 'getProxyUrl()+\'&url=\'',
    detail: '获取本地代理链接',
    documentation: 'getProxyUrl()',
  },
  {
    label: 'gzip',
    insertText: 'gzip($0)',
    detail: 'gzip压缩',
    documentation: 'gzip(string)',
  },
  {
    label: 'ungzip',
    insertText: 'ungzip($0)',
    detail: 'ungzip 解压',
    documentation: `ungzip(base64)`,
  },
  {
    label: 'uint8ArrayToBase64',
    insertText: 'uint8ArrayToBase64($0)',
    detail: 'uint8数组转Base64',
    documentation: `uint8ArrayToBase64(uint8Array)`,
  },
  {
    label: 'Utf8ArrayToStr',
    insertText: 'Utf8ArrayToStr($0)',
    detail: 'Utf8数组转字符串',
    documentation: `Utf8ArrayToStr(array)`,
  },
  {
    label: 'rsa.encode',
    insertText: 'RSA.encode($1,"$2",null)',
    detail: 'rsa加密',
    documentation: `RSA.encode(data, key, option)`,
  },
  {
    label: 'rsa.decode',
    insertText: 'RSA.decode($1,"$2",null)',
    detail: 'rsa解密',
    documentation: `RSA.decode(data, key, option)`,
  },
  {
    label: 'fixAdM3u8',
    insertText: 'fixAdM3u8($1,$2,$3)',
    detail: '根据正则处理原始m3u8里的广告ts片段，自动修复相对链接',
    documentation: `fixAdM3u8(m3u8_text, m3u8_url, ad_remove)`,
  },
  {
    label: 'fixAdM3u8Ai',
    insertText: 'fixAdM3u8Ai($1)',
    detail: '智能对比去除广告。支持嵌套m3u8。只需要传入播放地址',
    documentation: `fixAdM3u8Ai(m3u8_url)`,
  },
  {
    label: 'stringify',
    insertText: 'stringify($1)',
    detail: 'js对象转json文本',
    documentation: `stringify(object)\nJSON.stringify的简写`,
  },
  {
    label: 'urlencode',
    insertText: 'urlencode(${1:input})',
    detail: 'url编码',
    documentation: 'urlencode(string)',
  },
  {
    label: 'encodeStr',
    insertText: 'encodeStr($1,$2)',
    detail: '字符串指定编码',
    documentation: 'encodeStr(input,encoding="gbk")',
  },
  {
    label: 'decodeStr',
    insertText: 'decodeStr($1,$2)',
    detail: '字符串指定解码',
    documentation: 'decodeStr(input,encoding="gbk")',
  },
  {
    label: 'jinja2',
    insertText: 'cheerio.jinja2($1,{fl:fl})',
    detail: 'jinja2模板渲染',
    documentation: 'cheerio.jinja2(url,{fl:fl)',
  },
  {
    label: 'base64Encode',
    insertText: 'base64Encode($1)',
    detail: 'base64编码',
    documentation: 'base64Encode(string)',
  },
  {
    label: 'base64Decode',
    insertText: 'base64Decode($1)',
    detail: 'base64解码',
    documentation: 'base64Decode(string)',
  },
  {
    label: 'md5',
    insertText: 'md5($0)',
    detail: 'md5加密',
    documentation: 'md5(string)',
  },
  {
    label: 'log',
    insertText: 'log($0)',
    detail: '打印日志(文本)',
    documentation: 'log(string)',
  },
  {
    label: 'print',
    insertText: 'print($0)',
    detail: '打印日志(文本)',
    documentation: 'print(string)',
  },
  {
    label: 'urljoin',
    insertText: 'urljoin($1,$2)',
    detail: '路径拼接 urljoin(from,to)',
    documentation: 'urljoin(from,to)',
  },
  {
    label: 'urljoin2',
    insertText: 'urljoin2($1,$2)',
    detail: '路径拼接 urljoin2(from,to)',
    documentation: 'urljoin2(from,to)',
  },
  {
    label: 'pdfa',
    insertText: 'pdfa($1,$2)',
    detail: '提取列表',
    documentation: '例子:pdfa(item,"body&&a")',
  },
  {
    label: 'pdfh',
    insertText: 'pdfh($1,$2)',
    detail: '提取文本',
    documentation: '例子:pd(item,"a&&Text")',
  },
  {
    label: 'pd',
    insertText: 'pd($1,$2,$3)',
    detail: '提取链接或者图片地址',
    documentation: '例子:pd(item,"a&&href","http://xx.com/api")',
  },
  {
    label: 'getQuery',
    insertText: 'getQuery($1)',
    detail: '链接的query转为字典(url)',
    documentation: 'getQuery(url)',
  },
  {
    label: 'setItem',
    insertText: 'setItem($1,$2)',
    detail: '存在数据库配置表里, key字段对应值value,没有就新增,有就更新,调用此方法会清除key对应的内存缓存',
    documentation: 'setItem(k,v)',
  },
  {
    label: 'getItem',
    insertText: 'getItem($1,$2)',
    detail: '获取数据库配置表对应的key字段的value，没有这个key就返回value默认传参.需要有缓存,第一次获取后会存在内存里',
    documentation: 'getItem(k,v)',
  },
  {
    label: 'clearItem',
    insertText: 'clearItem($1)',
    detail: '删除数据库key对应的一条数据,并清除此key对应的内存缓存',
    documentation: 'clearItem(k)',
  },
  {
    label: 'buildUrl',
    insertText: 'buildUrl($1,$2)',
    detail: 'get参数编译链接,类似python params字典自动拼接',
    documentation: 'buildUrl(url,obj)',
  },
  {
    label: '$require',
    insertText: '\\$require("$1")',
    detail: 'eval执行一段远程js链接',
    documentation: '$require(url)',
  },
  {
    label: 'getCode',
    insertText: 'getCode($1)',
    detail: '带一次宝塔验证的源码获取',
    documentation: 'getCode(url)',
  },
  {
    label: 'getHtml',
    insertText: 'getHtml($1)',
    detail: '源rule专用的请求方法,自动注入cookie',
    documentation: 'getHtml(url)',
  },
  {
    label: 'req',
    insertText: 'req($1,{})',
    detail: '构造网页请求-原始',
    documentation: 'req(url,object)',
  },
  {
    label: 'request',
    insertText: 'request($1,{})',
    detail: '构造网页请求-封装',
    documentation: 'request(url,object)',
  },
  {
    label: 'post',
    insertText: 'post($1,{})',
    detail: 'post请求-封装',
    documentation: 'post(url,object)',
  },
  {
    label: 'dealJson',
    insertText: 'dealJson($1)',
    detail: '处理返回的json数据',
    documentation: 'dealJson(json)',
  },
  {
    label: 'getHome',
    insertText: 'getHome($1)',
    detail: '获取链接的host',
    documentation: 'getHome(url)',
  },
];

/**
 * 自定义关键词
 */
const Keyword = [
  {
    label: 'setResult',
    insertText: 'setResult(d)',
    detail: '海阔写法设置一级或搜索列表数据',
    documentation: 'setResult(d)',
  },
  {
    label: 'setResult2',
    insertText: 'setResult2(d)',
    detail: '设置cms的完整json数据为drpy的一级、搜索列表数据',
    documentation: 'setResult2(d)',
  },
  {
    label: 'setHomeResult',
    insertText: 'setHomeResult(d)',
    detail: '同海阔，跟setResult的区别在于数据格式为{list:[]}',
    documentation: 'setHomeResult(d)',
  },
  {
    label: 'Referer',
    insertText: 'Referer',
    detail: 'headers里的属性-访问来源',
    documentation: 'headers里的属性之一',
  },
  {
    label: 'User-Agent',
    insertText: 'User-Agent',
    detail: 'headers里的属性-请求头',
    documentation: 'headers里的属性之一',
  },
  {
    label: 'Content-Type',
    insertText: 'Content-Type',
    detail: 'headers里的属性-请求数据格式',
    documentation: 'headers里的属性之一',
  },
  {
    label: 'MOBILE_UA',
    insertText: 'MOBILE_UA',
    detail: '应用注入的手机UA',
    documentation: 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36',
  },
  {
    label: 'PC_UA',
    insertText: 'PC_UA',
    detail: '应用注入的电脑UA',
    documentation: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
  },
  {
    label: 'headers',
    insertText: 'headers:{ \'User-Agent\': PC_UA, \'Referer\': \'\', \'content-type\': \'application/x-www-form-urlencoded\', \'Cookie\': \'\'}',
    detail: '常用headers参数',
    documentation: 'headers:{ \'User-Agent\': PC_UA, \'Referer\': \'\', \'content-type\': \'application/x-www-form-urlencoded\', \'Cookie\': \'\'}',
  },
];

/**
 * 自定义变量
 */
const Variable = [
  {
    label: 'rule_fetch_params',
    insertText: 'rule_fetch_params',
    detail: '源自带的请求参数',
    documentation: '原始参数不允许修改',
  },
  {
    label: 'fetch_params',
    insertText: 'fetch_params',
    detail: '可变变量，每次请求时使用的请求参数',
    documentation: 'fetch_params.headers={}',
  },
  {
    label: 'rule',
    insertText: 'rule',
    detail: '源本身的对象',
    documentation: '可以对顶层源对象的属性进行操作',
  },
  {
    label: 'HOST',
    insertText: 'HOST',
    detail: '源主页地址',
    documentation: '只能用在hostJs',
  },
  {
    label: 'TYPE',
    insertText: 'TYPE',
    detail: '标识js的执行环境，是主页。一级还是搜索等',
    documentation: 'if(TYPE == \'home\')',
  },
  {
    label: 'input',
    insertText: 'input',
    detail: '一级二级搜索lazy的传入url',
    documentation: 'input',
  },
  {
    label: 'VODS',
    insertText: 'VODS',
    detail: '一级、推荐、搜索的cms列表变量',
    documentation: 'VODS=[{vod_id,vod_name,vod_pic,vod_remarks}]',
  },
  {
    label: 'VOD',
    insertText: 'VOD',
    detail: '二级的cms详情变量',
    documentation: 'VOD',
  },
  {
    label: 'TABS',
    insertText: 'TABS',
    detail: '二级的tabs自定义js',
    documentation: 'TABS',
  },
  {
    label: 'LISTS',
    insertText: 'LISTS',
    detail: '二级的lists自定义js',
    documentation: 'LISTS',
  },
  {
    label: 'MY_URL',
    insertText: 'MY_URL',
    detail: '获取当前网络请求地址',
    documentation: '一级和二级js里通用',
  },
  {
    label: 'MY_CATE',
    insertText: 'MY_CATE',
    detail: '一级分类传入的tid',
    documentation: '仅在一级的js里可用',
  },
  {
    label: 'MY_FL',
    insertText: 'MY_FL',
    detail: '一级分类传入的筛选',
    documentation: '仅在一级的js里可用',
  },
  {
    label: 'MY_PAGE',
    insertText: 'MY_PAGE',
    detail: '一级分类或搜索传入的页数',
    documentation: '仅在一级和搜索的js里可用',
  },
  {
    label: 'MY_FLAG',
    insertText: 'MY_FLAG',
    detail: 'lazy里传入的flag',
    documentation: '仅在lazy的js里可用，等同flag',
  },
  {
    label: 'flag',
    insertText: 'flag',
    detail: 'lazy里传入的flag',
    documentation: '仅在lazy的js里可用',
  },
  {
    label: 'KEY',
    insertText: 'KEY',
    detail: '搜索传入的搜索关键词',
    documentation: '仅在搜索的js里可用',
  },
  {
    label: 'UA',
    insertText: 'UA',
    detail: '最简ua',
    documentation: 'Mozilla/5.0',

  },
  {
    label: 'UC_UA',
    insertText: 'UC_UA',
    detail: 'uc浏览器的ua',
    documentation: 'Mozilla/5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.5.5.1035 Mobile Safari/537.36',
  },
  {
    label: 'IOS_UA',
    insertText: 'IOS_UA',
    detail: '苹果设备的ua',
    documentation: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  }];

const createDependencyProposals = (range: object, monaco: any) => {
  let suggestions = [];
  // 代码片段
  let suggestions_27 = Snippet.map((it) => {
    Object.assign(it, {
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    });
    suggestions.push(it);
    return it;
  });
  // 函数
  let suggestions_1 = Function.map((it) => {
    Object.assign(it, {
      kind: monaco.languages.CompletionItemKind.Function,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    });
    suggestions.push(it);
    return it;
  });
  // 关键词
  let suggestions_17 = Keyword.map((it) => {
    Object.assign(it, {
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
      range: range,
    });
    suggestions.push(it);
    return it;
  });

  // 变量
  let suggestions_4 = Variable.map((it) => {
    Object.assign(it, {
      kind: monaco.languages.CompletionItemKind.Variable,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
      range: range,
    });
    suggestions.push(it);
    return it;
  });
  return suggestions;
};

export { createDependencyProposals };
