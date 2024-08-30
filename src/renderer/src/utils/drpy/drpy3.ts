/*!
 * @module drpy3
 * @brief T3数据处理核心库
 * @version 3.1.6
 *
 * @original-author hjdhnx
 * @original-source {@link https://github.com/hjdhnx/hipy-server/blob/master/app/t4/files/drpy3_libs/drpy3.js | Source on GitHub}
 *
 * @modified-by HiramWong <admin@catni.cn>
 * @modification-date 2024-07-04T21:11:19+08:00
 * @modification-description 使用TypeScript适配, 替换eval函数防止报错, 增加日志读取, 自定义请求头用于前端被自动丢失\底层拦截, 并采取措施防止 Tree-Shaking 删除关键代码
 *
 * **防止 Tree-Shake 说明**:
 * - 为了确保 `drpy3.ts` 中的函数和变量不被 Tree Shaking, 已采取以下措施：
 *   - 作用域参数举例：`[a, b, c].forEach(item => item.length)` —— 显式遍历数组元素防止数组相关操作被优化掉。
 *   - 作用域函数举例：`let temp = _; temp.stringify({});` —— 对于 `_` 符合的对象，确保其方法被调用，防止被误删。
 *   - 全局函数与参数举例：`keepUnUse.useful._` —— 对于 `_` 符合的对象，确保其方法被调用，防止被误删。
 *
 * ---
 */

import CryptoJS from 'crypto-js';
import JSON5 from 'json5';
import pako from 'pako';
import JSEncrypt from 'wxmp-rsa';
import { pdfh as pdfhModule, pdfa as pdfaModule, pd as pdModule, local, req, resolve, batchFetch } from './drpyInject';
import { getMubans } from './template';
import cheerio from './utils/cheerio.min';
import gbkTool from './utils/gbk';
import NODERSA from './utils/node-rsa';
import jinja from './utils/jinja';

let consoleHistory: string[] = [];
console['oldLog'] = console.log;
console.log = (str: string) => {
  console['oldLog'](str);
  consoleHistory.push(str);
};

const getConsoleHistory = () => {
  return consoleHistory;
};

const clearConsoleHistory = () => {
  consoleHistory = [];
  return consoleHistory;
};

// const evilFn = (fn) => {
//   let Fn = Function; // 一个变量指向Function，防止有些前端编译工具报错
//   return new Fn(`${fn}`)();
// };

// (function() {
//   self.eval = function(code) {
//     return evilFn(code);
//   };
// })();

cheerio.jinja2 = function (template, obj) {
  return jinja.render(template, obj);
};

const rsa_private_key =
  'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqin/jUpqM6+fgYP/oMqj9zcdHMM0mEZXLeTyixIJWP53lzJV2N2E3OP6BBpUmq2O1a9aLnTIbADBaTulTNiOnVGoNG58umBnupnbmmF8iARbDp2mTzdMMeEgLdrfXS6Y3VvazKYALP8EhEQykQVarexR78vRq7ltY3quXx7cgI0ROfZz5Sw3UOLQJ+VoWmwIxu9AMEZLVzFDQN93hzuzs3tNyHK6xspBGB7zGbwCg+TKi0JeqPDrXxYUpAz1cQ/MO+Da0WgvkXnvrry8NQROHejdLVOAslgr6vYthH9bKbsGyNY3H+P12kcxo9RAcVveONnZbcMyxjtF5dWblaernAgMBAAECggEAGdEHlSEPFmAr5PKqKrtoi6tYDHXdyHKHC5tZy4YV+Pp+a6gxxAiUJejx1hRqBcWSPYeKne35BM9dgn5JofgjI5SKzVsuGL6bxl3ayAOu+xXRHWM9f0t8NHoM5fdd0zC3g88dX3fb01geY2QSVtcxSJpEOpNH3twgZe6naT2pgiq1S4okpkpldJPo5GYWGKMCHSLnKGyhwS76gF8bTPLoay9Jxk70uv6BDUMlA4ICENjmsYtd3oirWwLwYMEJbSFMlyJvB7hjOjR/4RpT4FPnlSsIpuRtkCYXD4jdhxGlvpXREw97UF2wwnEUnfgiZJ2FT/MWmvGGoaV/CfboLsLZuQKBgQDTNZdJrs8dbijynHZuuRwvXvwC03GDpEJO6c1tbZ1s9wjRyOZjBbQFRjDgFeWs9/T1aNBLUrgsQL9c9nzgUziXjr1Nmu52I0Mwxi13Km/q3mT+aQfdgNdu6ojsI5apQQHnN/9yMhF6sNHg63YOpH+b+1bGRCtr1XubuLlumKKscwKBgQDOtQ2lQjMtwsqJmyiyRLiUOChtvQ5XI7B2mhKCGi8kZ+WEAbNQcmThPesVzW+puER6D4Ar4hgsh9gCeuTaOzbRfZ+RLn3Aksu2WJEzfs6UrGvm6DU1INn0z/tPYRAwPX7sxoZZGxqML/z+/yQdf2DREoPdClcDa2Lmf1KpHdB+vQKBgBXFCVHz7a8n4pqXG/HvrIMJdEpKRwH9lUQS/zSPPtGzaLpOzchZFyQQBwuh1imM6Te+VPHeldMh3VeUpGxux39/m+160adlnRBS7O7CdgSsZZZ/dusS06HAFNraFDZf1/VgJTk9BeYygX+AZYu+0tReBKSs9BjKSVJUqPBIVUQXAoGBAJcZ7J6oVMcXxHxwqoAeEhtvLcaCU9BJK36XQ/5M67ceJ72mjJC6/plUbNukMAMNyyi62gO6I9exearecRpB/OGIhjNXm99Ar59dAM9228X8gGfryLFMkWcO/fNZzb6lxXmJ6b2LPY3KqpMwqRLTAU/zy+ax30eFoWdDHYa4X6e1AoGAfa8asVGOJ8GL9dlWufEeFkDEDKO9ww5GdnpN+wqLwePWqeJhWCHad7bge6SnlylJp5aZXl1+YaBTtOskC4Whq9TP2J+dNIgxsaF5EFZQJr8Xv+lY9lu0CruYOh9nTNF9x3nubxJgaSid/7yRPfAGnsJRiknB5bsrCvgsFQFjJVs=';
const aes_key = {
  key: '686A64686E780A0A0A0A0A0A0A0A0A0A',
  iv: '647A797964730A0A0A0A0A0A0A0A0A0A',
};

const init_test = () => {
  const test_data = {
    version: VERSION,
    rkey: RKEY,
    rule: rule,
  };
  // ocr_demo_test();
  // rsa_demo_test();
  console.log(test_data);
  return test_data;
};

/**
 * 验证码ocr识别的测试案例
 */
function ocr_demo_test() {
  // 这张图片为4113的验证码
  let img_base64 = `iVBORw0KGgoAAAANSUhEUgAAAIAAAAAoBAMAAADEX+97AAAAG1BMVEXz+/4thQTa7N6QwIFFkyNeokKozqDB3b93sWHFR+MEAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABN0lEQVRIie2TQU+DQBCFt9vScvQpxR4xrcSjJCZ67JDGXsX+AdR4B3vpsSYm/m2HXaRLmuySepR3Gdidb/btDAjRq5dT96eCMlfBuzi1QLZUoZy2yz5sOvI+9iomaPEZ6nWnEtxqIyiM1RcAy44GNDhBXUjot/VVNweV1ah68FqWRyjKIOqAcyYF6rGcmpYnHzGt3fycNoMw0d3/THFu7hFSJ/8OXO6iTM8/KSg09obAzIHLO250LgQ0txOZSfgrV4Exdw98uGycJ0ErAeExZGhOmFHV9zHO6qVSj0MpLq7xZON56o++MjlsEgfVhbQWWME+xQX7J4V6zfi9A1Ly9rP1BvEXp+BbVJ/M77n+wfOIDVp51pZ4iBxvmj9AGrtvry6emwfKnVkW+ZRKd5ZNMvob36vXP9YPDmQki8QiCFAAAAAASUVORK5CYII=`;
  // 更换api-可以通过这个代码换掉默认的ocr接口
  OcrApi.api = OCR_API;
  let code = OcrApi.classification(img_base64);
  log('测试验证码图片的ocr识别结果为:' + code);
}

/**
 * rsa加解密的全方位测试案例
 */
function rsa_demo_test() {
  let t1 = new Date().getTime();
  let pkcs1_public = `
-----BEGIN RSA PUBLIC KEY-----
MEgCQQCrI0pQ/ERRpJ3Ou190XJedFq846nDYP52rOtXyDxlFK5D3p6JJu2RwsKwy
lsQ9xY0xYPpRZUZKMEeR7e9gmRNLAgMBAAE=
-----END RSA PUBLIC KEY-----
`.trim();

  // @ts-ignore
  let pkcs1_public_pem = `
MEgCQQCrI0pQ/ERRpJ3Ou190XJedFq846nDYP52rOtXyDxlFK5D3p6JJu2RwsKwy
lsQ9xY0xYPpRZUZKMEeR7e9gmRNLAgMBAAE=
`.trim();

  // @ts-ignore
  let pkcs8_public = `
-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKsjSlD8RFGknc67X3Rcl50WrzjqcNg/
nas61fIPGUUrkPenokm7ZHCwrDKWxD3FjTFg+lFlRkowR5Ht72CZE0sCAwEAAQ==
-----END PUBLIC KEY-----`.trim();

  // @ts-ignore
  let pkcs8_public_pem = `
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKsjSlD8RFGknc67X3Rcl50WrzjqcNg/
nas61fIPGUUrkPenokm7ZHCwrDKWxD3FjTFg+lFlRkowR5Ht72CZE0sCAwEAAQ==
`.trim();

  let pkcs1_private = `
-----BEGIN RSA PRIVATE KEY-----
MIIBOAIBAAJBAKsjSlD8RFGknc67X3Rcl50WrzjqcNg/nas61fIPGUUrkPenokm7
ZHCwrDKWxD3FjTFg+lFlRkowR5Ht72CZE0sCAwEAAQI/b6OV1z65UokQaMvSeRXt
0Yv6wiYtduQI9qpq5nzy/ytaqsbBfClNTi/HifKPKxlRouWFkc518EQI8LBxoarJ
AiEA4DaONMplV8PQNa3TKn2F+SDEvLOCjdL0kHKdN90Ti28CIQDDZnTBaHgZwZbA
hS7Bbf5yvwjWMhO6Y7l04/Qm7R+35QIgPuQuqXIoUSD080mp1N5WyRW++atksIF+
5lGv9e6GP/MCICnj8y/rl6Pd7tXDN6zcSeqLrfdNsREKhB3dKOCXgW9JAiAFYtFS
EJNBXVRTK42SNsZ2hJ/9xLwOwnH2epT8Q43s3Q==
-----END RSA PRIVATE KEY-----
`.trim();

  // @ts-ignore
  let pkcs8_private = `
-----BEGIN PRIVATE KEY-----
MIIBUgIBADANBgkqhkiG9w0BAQEFAASCATwwggE4AgEAAkEAqyNKUPxEUaSdzrtf
dFyXnRavOOpw2D+dqzrV8g8ZRSuQ96eiSbtkcLCsMpbEPcWNMWD6UWVGSjBHke3v
YJkTSwIDAQABAj9vo5XXPrlSiRBoy9J5Fe3Ri/rCJi125Aj2qmrmfPL/K1qqxsF8
KU1OL8eJ8o8rGVGi5YWRznXwRAjwsHGhqskCIQDgNo40ymVXw9A1rdMqfYX5IMS8
s4KN0vSQcp033ROLbwIhAMNmdMFoeBnBlsCFLsFt/nK/CNYyE7pjuXTj9CbtH7fl
AiA+5C6pcihRIPTzSanU3lbJFb75q2SwgX7mUa/17oY/8wIgKePzL+uXo93u1cM3
rNxJ6out902xEQqEHd0o4JeBb0kCIAVi0VIQk0FdVFMrjZI2xnaEn/3EvA7CcfZ6
lPxDjezd
-----END PRIVATE KEY-----
`.trim();

  let data = `
NodeRsa
这是node-rsa 现在修改集成在drpy里使用`.trim();

  let encryptedWithPublic = NODERSA.encryptRSAWithPublicKey(data, pkcs1_public, {
    // PublicFormat: "pkcs1-public-pem",
    outputEncoding: 'base64',
    options: { environment: 'browser', encryptionScheme: 'pkcs1_oaep' },
  });
  console.log('公钥加密');
  console.log(encryptedWithPublic);

  let decryptedWithPrivate = NODERSA.decryptRSAWithPrivateKey(encryptedWithPublic, pkcs1_private, {
    // PublicFormat: "pkcs1-private",
    // outEncoding: "hex"
    options: { environment: 'browser', encryptionScheme: 'pkcs1_oaep' },
  });
  console.log('私钥解密');
  console.log(decryptedWithPrivate);

  // https://www.btool.cn/rsa-sign
  let pkcs1_sha256_sign = NODERSA.sign('1', pkcs1_private, {
    outputEncoding: 'base64',
    options: { environment: 'browser', encryptionScheme: 'pkcs1', signingScheme: 'pkcs1-sha256' },
  });
  console.log('pkcs1_sha256_sign');
  console.log(pkcs1_sha256_sign);

  let pkcs1_sha256_sign_verify = NODERSA.verify(
    '1',
    'Oulx2QrgeipKYBtqEDqFb2s/+ndk2cGQxO4CkhU7iBM1vyNmmvqubpsmeoUuN3waGrYZLknSEdwBkfv0tUMpFQ==',
    pkcs1_private,
    {
      options: { environment: 'browser', encryptionScheme: 'pkcs1', signingScheme: 'pkcs1-sha256' },
    },
  );
  console.log('pkcs1_sha256_sign_verify');
  console.log(pkcs1_sha256_sign_verify);

  let pkcs1_oaep_sha256 = NODERSA.encryptRSAWithPublicKey(
    data,
    `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA5KOq1gRNyllLNWKQy8sGpZE3Q1ULLSmzZw+eaAhj9lvqn7IsT1du
SYn08FfoOA2qMwtz+1O2l1mgzNoSVCyVpVabnTG+C9XKeZXAnJHd8aYA7l7Sxhdm
kte+iymYZ0ZBPzijo8938iugtVvqi9UgDmnY3u/NlQDqiL5BGqSxSTd/Sgmy3zD8
PYzEa3wD9vehQ5fZZ45vKIq8GNVh2Z8+IGO85FF1OsN7+b2yGJa/FmDDNn0+HP+m
PfI+kYBqEVpo0Ztbc3UdxgFwGC8O1n8AQyriwHnSOtIiuBH62J/7qyC/3LEAApRb
Dd9YszqzmODjQUddZKHmvc638VW+azc0EwIDAQAB
-----END RSA PUBLIC KEY-----
`,
    {
      outputEncoding: 'base64',
      options: {
        environment: 'browser',
        encryptionScheme: {
          scheme: 'pkcs1_oaep',
          hash: 'sha256',
        },
      },
      // options: { environment: "browser", encryptionScheme: 'pkcs1' },
    },
  );
  console.log('pkcs1_oaep_sha256');
  console.log(pkcs1_oaep_sha256);

  decryptedWithPrivate = NODERSA.decryptRSAWithPrivateKey(
    'kSZesAAyYh2hdsQnYMdGqb6gKAzTauBKouvBzWcc4+F8RvGd0nwO6mVkUMVilPgUuNxjEauHayHiY8gI3Py45UI3+km0rSGyHrS6dHiHgCkMejXHieglYzAB0IxX3Jkm4z/66bdB/D+GFy0oct5fGCMI1UHPjEAYOsazJDa8lBFNbjiWFeb/qiZtIx3vGM7KYPAZzyRf/zPbbQ8zy9xOmRuOl5nnIxgo0Okp3KO/RIPO4GZOSBA8f2lx1UtNwwrXAMpcNavtoqHVcjJ/9lcotXYQFrn5b299pSIRf2gVm8ZJ31SK6Z8cc14nKtvgnmsgClDzIXJ1o1RcDK+knVAySg==',
    `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA5KOq1gRNyllLNWKQy8sGpZE3Q1ULLSmzZw+eaAhj9lvqn7Is
T1duSYn08FfoOA2qMwtz+1O2l1mgzNoSVCyVpVabnTG+C9XKeZXAnJHd8aYA7l7S
xhdmkte+iymYZ0ZBPzijo8938iugtVvqi9UgDmnY3u/NlQDqiL5BGqSxSTd/Sgmy
3zD8PYzEa3wD9vehQ5fZZ45vKIq8GNVh2Z8+IGO85FF1OsN7+b2yGJa/FmDDNn0+
HP+mPfI+kYBqEVpo0Ztbc3UdxgFwGC8O1n8AQyriwHnSOtIiuBH62J/7qyC/3LEA
ApRbDd9YszqzmODjQUddZKHmvc638VW+azc0EwIDAQABAoIBADZ/QGgUzInvsLp/
zO2WbfYm39o/uhNAvk9RbLt1TIZbMFhyOpeKynHi3Swwd9xsfWX/U9zS/lGi/m31
iKrhmaW4OA1G3vqpMcK7TBbFufYwUEaA+ZJX344euH8pIfdzyneMQ4z3Far2dS7l
QsmjuilVV2kEFadveXewiYoVOWCu00w6bN8wy2SIHlQn+kIL6HQhWz12iKKflIKu
eGRdzLHsKmBt6WbY1Wuhx7HU0fAKdlBDPxCHNlI+kybUYE9o5C2vJiaVM5wqJBgZ
8Dz8kt1QbLJ910JoLXkLVQ8uC8NJKQwFtqQjTGPnEq0+wbgz6Ij599rKZkwW/xq9
l6KoUiECgYEA6Ah42tVdkNW047f03xVYXFH96RgorHRS36mR8Y+ONUq1fwKidovC
WjwVujt4OPf3l1W6iyn/F6cu/bsmvPrSc3HTN0B1V31QK4OjgetxQ2PSbTldH02J
NPzkt+v+cPxXpx/P5mgt7Weefw5txU547KubGrHUV5rBKFtIx9pj16MCgYEA/EF0
o19+D24DZAPwlDS5VbEd7FStnwY4oQ5PqbuNOSbSJLMWU0AqzXcRokp8UTyCZ0X3
ATkS1REq97kShCuR+npTR6a6DlY7sdpPI1SMLNajgB2tkx0EOzX+PfNIbHUd4jpJ
I0ZMAHv/OOtkzQHDaeTWBTrzsWm6/nTiykfduNECgYEA46AMD4HpPECqKAs66e5i
tI6q7JSKskObWVdcmQEfnSAhVOwcvPb2Ptda6UuV8S0xcwDi88rLOUUFUFzc79+P
vTkY38cYVi/VChsluDpk7ptqv0PbGu5Rf+3n4pZdEjI7OvR2W64wAAn67uIUxc7p
yiO/ET0K9rYWb6S9jXGtKMkCgYEA2kPAqoO7zZoBMQ7/oR0lp/HC1HRIbiqx4RlC
8Lgpb+QZPEwA6zPAVVvLVENi4d+bbcRp/xLlKpraNNJcJSSWAMbLPFoU7sbKjA87
HnTPfRSTEA2d3Ibk3F7Rh8TzS3Ti0JZiJjVzGZAwu41iAMifzwaD8K6boUy80eNN
QH2CaaECgYBUsLYvC/MiYg3w+LGOONuQongoVUXjGqnw2bjVa9RK7lwRdXPUqJ51
MpVO98IkoLvGSI/0sGNP3GKNhC+eMGjJAVwFyEuOn+JsmMv9Y9uStIVi5tIHIhKw
m7mp8il0kaftHdSxTbspG3tZ2fjIiFIZkLEOmRpd7ogWumgOajzUdA==
-----END RSA PRIVATE KEY-----`,
    {
      // PublicFormat: "pkcs1-private",
      // outEncoding: "hex"
      options: { environment: 'browser', encryptionScheme: 'pkcs1_oaep' },
    },
  );
  console.log('decryptedWithPrivate');
  console.log(decryptedWithPrivate);

  (() => {
    let key = new NODERSA.NodeRSA({ b: 1024 });
    key.setOptions({ encryptionScheme: 'pkcs1' });
    let text = `你好drpy node-ras`;
    let encrypted = key.encrypt(text, 'base64');
    console.log('encrypted: ', encrypted);
    const decrypted = key.decrypt(encrypted, 'utf8');
    console.log('decrypted: ', decrypted);
  })();
  let t2 = new Date().getTime();
  console.log('rsa_demo_test 测试耗时:' + (t2 - t1) + '毫秒');
}

/**
 * 执行预处理代码
 */
const pre = () => {
  let preprocessCode = rule['预处理']?.trim();

  if (typeof preprocessCode === 'string' && preprocessCode !== '') {
    console.log('执行预处理代码:' + preprocessCode);

    if (preprocessCode.startsWith('js:')) {
      preprocessCode = preprocessCode.replace('js:', '');
    }

    try {
      // 在 code 中可以执行 GET 或者 POST 请求，并修改 rule.headers 中的 cookie
      // 直接操作 rule_fetch_params.headers.Cookie
      eval(preprocessCode);
    } catch (e) {
      // @ts-ignore
      console.log(`预处理执行失败:${e.message}`);
    }
  }
};

let rule = {};
// @ts-ignore
let vercode = typeof pdfl === 'function' ? 'drpy3.1' : 'drpy3';
const VERSION = `${vercode} 3.9.51beta2 20240711`;
/** 已知问题记录
 * 1.影魔的jinjia2引擎不支持 {{fl}}对象直接渲染 (有能力解决的话尽量解决下，支持对象直接渲染字符串转义,如果加了|safe就不转义)[影魔牛逼，最新的文件发现这问题已经解决了]
 * Array.prototype.append = Array.prototype.push; 这种js执行后有毛病,for in 循环列表会把属性给打印出来 (这个大毛病需要重点排除一下)
 * 2.import es6py.js但是里面的函数没有被装载进来.比如drpy规则报错setResult2 is undefiend(合并文件了可以不管了)
 * 3.无法重复导入cheerio(怎么解决drpy和parseTag里都需要导入cheerio的问题) 无法在副文件导入cheerio (现在是全部放在drpy一个文件里了,凑合解决?)
 * 4.有个错误不知道哪儿来的 executeScript: com.quickjs.JSObject$Undefined cannot be cast to java.lang.String 在 点击选集播放打印init_test_end后面打印(貌似不影响使用)
 * 5.需要实现 stringify 函数,比起JSON.strifngify函数,它会原封不动保留中文不会编码unicode
 * 6.base64Encode,base64Decode,md5函数还没有实现 (抄影魔代码实现了)
 * 7.eval(getCryptoJS());还没有实现 (可以空实现了,以后遇到能忽略)
 * done: jsp:{pdfa,pdfh,pd},json:{pdfa,pdfh,pd},jq:{pdfa,pdfh,pd}
 * 8.req函数不支持传递字符串的data参数 {'content-type':'text/plain'} 类型数据，因此无法直接调用alist的ocr接口
 * /

 /** 以下是内置变量和解析方法 **/
var MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36';
const PC_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36';
const UA = 'Mozilla/5.0';
const UC_UA =
  'Mozilla/5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.5.5.1035 Mobile Safari/537.36';
const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
// console.log(UA,UC_UA,IOS_UA);
const RULE_CK = 'cookie'; // 源cookie的key值
// const KEY = typeof(key)!=='undefined'&&key?key:'drpy_' + (rule.title || rule.host); // 源的唯一标识
const CATE_EXCLUDE = '首页|留言|APP|下载|资讯|新闻|动态';
const TAB_EXCLUDE = '猜你|喜欢|下载|剧情|榜|评论';
const OCR_RETRY = 3; // ocr验证重试次数
// const OCR_API = 'http://drpy.nokia.press:8028/ocr/drpy/text';//ocr在线识别接口
const OCR_API = 'https://api.nn.ci/ocr/b64/text'; //ocr在线识别接口
if (typeof MY_URL === 'undefined') {
  var MY_URL; // 全局注入变量,pd函数需要
}
var HOST;
var RKEY; // 源的唯一标识
var fetch;
var print;
var log;
var rule_fetch_params;
var fetch_params; // 每个位置单独的
var oheaders;
// var play_url; // 二级详情页注入变量,为了适配js模式0 (不在这里定义了,直接二级里定义了个空字符串)
var _pdfh;
var _pdfa;
var _pd;
var pdfh = pdfhModule;
var pdfa = pdfaModule;
var pd = pdModule;
// const DOM_CHECK_ATTR = ['url', 'src', 'href', 'data-original', 'data-src'];
const DOM_CHECK_ATTR = /(url|src|href|-original|-src|-play|-url|style)$/;
// 过滤特殊链接,不走urlJoin
const SPECIAL_URL = /^(ftp|magnet|thunder|ws):/;
const NOADD_INDEX = /:eq|:lt|:gt|:first|:last|^body$|^#/; // 不自动加eq下标索引
const URLJOIN_ATTR = /(url|src|href|-original|-src|-play|-url|style)$/; // 需要自动urljoin的属性
const SELECT_REGEX = /:eq|:lt|:gt|#/g;
const SELECT_REGEX_A = /:eq|:lt|:gt/g;

// 增加$js工具，支持$js.toString(()=>{});
const $js = {
  toString(func) {
    let strfun = func.toString();
    return strfun.replace(/^\(\)(\s+)?=>(\s+)?\{/, 'js:').replace(/\}$/, '');
  },
};

function window_b64() {
  let b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64DecodeChars = new Array(
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    62,
    -1,
    -1,
    -1,
    63,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    -1,
    -1,
    -1,
    -1,
    -1,
  );

  function btoa(str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = '';
    while (i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if (i == len) {
        out += b64map.charAt(c1 >> 2);
        out += b64map.charAt((c1 & 0x3) << 4);
        out += '==';
        break;
      }
      c2 = str.charCodeAt(i++);
      if (i == len) {
        out += b64map.charAt(c1 >> 2);
        out += b64map.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
        out += b64map.charAt((c2 & 0xf) << 2);
        out += '=';
        break;
      }
      c3 = str.charCodeAt(i++);
      out += b64map.charAt(c1 >> 2);
      out += b64map.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      out += b64map.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
      out += b64map.charAt(c3 & 0x3f);
    }
    return out;
  }

  function atob(str) {
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = '';
    while (i < len) {
      do {
        c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c1 == -1);
      if (c1 == -1) break;
      do {
        c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c2 == -1);
      if (c2 == -1) break;
      out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
      do {
        c3 = str.charCodeAt(i++) & 0xff;
        if (c3 == 61) return out;
        c3 = base64DecodeChars[c3];
      } while (i < len && c3 == -1);
      if (c3 == -1) break;
      out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));
      do {
        c4 = str.charCodeAt(i++) & 0xff;
        if (c4 == 61) return out;
        c4 = base64DecodeChars[c4];
      } while (i < len && c4 == -1);
      if (c4 == -1) break;
      out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
  }

  return {
    atob,
    btoa,
  };
}

/**
 es6扩展 手动造轮子
 */
// @ts-ignore
if (typeof atob !== 'function' || typeof btoa !== 'function') {
  var { atob, btoa } = window_b64();
}
if (typeof Object.assign !== 'function') {
  Object.assign = function () {
    var target = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
}
if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}
// @ts-ignore
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {
      if (this == null) {
        //this是空或者未定义，抛出错误
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this); //将this转变成对象
      var len = o.length >>> 0; //无符号右移0位，获取对象length属性，如果未定义就会变成0

      if (len === 0) {
        //length为0直接返回false未找到目标值
        return false;
      }

      var n = fromIndex | 0; //查找起始索引
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0); //计算正确起始索引，因为有可能是负值

      while (k < len) {
        //从起始索引处开始循环
        if (o[k] === searchElement) {
          //如果某一位置与寻找目标相等，返回true，找到了
          return true;
        }
        k++;
      }
      return false; //未找到，返回false
    },
    enumerable: false,
  });
}
if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = function (prefix) {
    return this.slice(0, prefix.length) === prefix;
  };
}
if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}
Object.defineProperty(Object.prototype, 'myValues', {
  value: function (obj) {
    if (obj == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    var res = [];
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        //需判断是否是本身的属性
        // @ts-ignore
        res.push(obj[k]);
      }
    }
    return res;
  },
  enumerable: false,
});
// @ts-ignore
if (typeof Object.prototype.values != 'function') {
  Object.defineProperty(Object.prototype, 'values', {
    value: function (obj) {
      if (obj == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var res = [];
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          //需判断是否是本身的属性
          // @ts-ignore
          res.push(obj[k]);
        }
      }
      return res;
    },
    enumerable: false,
  });
}
if (typeof Array.prototype.join != 'function') {
  Object.defineProperty(Array.prototype, 'join', {
    value: function (emoji) {
      // emoji = emoji||',';
      emoji = emoji || '';
      let self = this;
      let str = '';
      let i = 0;
      if (!Array.isArray(self)) {
        throw String(self) + 'is not Array';
      }
      if (self.length === 0) {
        return '';
      }
      if (self.length === 1) {
        return String(self[0]);
      }
      i = 1;
      str = this[0];
      for (; i < self.length; i++) {
        str += String(emoji) + String(self[i]);
      }
      return str;
    },
    enumerable: false,
  });
}
// @ts-ignore
if (typeof Array.prototype.toReversed !== 'function') {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value: function () {
      const clonedList = this.slice();
      // 倒序新数组
      const reversedList = clonedList.reverse();
      return reversedList;
    },
    enumerable: false,
  });
}

Object.defineProperty(Array.prototype, 'append', {
  value: Array.prototype.push,
  enumerable: false,
});
Object.defineProperty(String.prototype, 'strip', {
  value: String.prototype.trim,
  enumerable: false,
});
Object.defineProperty(String.prototype, 'rstrip', {
  value: function (chars) {
    let regex = new RegExp(chars + '$');
    return this.replace(regex, '');
  },
  enumerable: false,
});

const isGenuine = (vipUrl: string) => {
  let flag = new RegExp(
    'qq.com|iqiyi.com|youku.com|mgtv.com|bilibili.com|sohu.com|ixigua.com|pptv.com|miguvideo.com|le.com|1905.com|fun.tv',
  );
  return flag.test(vipUrl);
};

const urlDeal = (vipUrl) => {
  if (!vipUrl) return '';

  if (!isGenuine(vipUrl)) return vipUrl;

  if (!/miguvideo/.test(vipUrl)) {
    vipUrl = vipUrl.split('#')[0].split('?')[0];
  }

  return vipUrl;
};

// 设置结果
const setResult = (d) => {
  if (!Array.isArray(d)) return [];
  VODS = [];

  VODS = d.map((it) => {
    const {
      url: vod_id = '',
      title: vod_name = '',
      desc: vod_remarks = '',
      content: vod_content = '',
      pic_url: vod_pic = it.img || '',
      tname: type_name = '',
      tid: type_id = '',
      year: vod_year = '',
      actor: vod_actor = '',
      director: vod_director = '',
      area: vod_area = '',
    } = it;

    return {
      vod_id,
      vod_name,
      vod_remarks,
      vod_content,
      vod_pic,
      type_name,
      type_id,
      vod_year,
      vod_actor,
      vod_director,
      vod_area,
    };
  });
  return VODS;
};

// 设置结果2
const setResult2 = (res) => {
  VODS = res?.list || [];
  return VODS;
};

// 设置首页结果
const setHomeResult = (res) => {
  if (!res || typeof res !== 'object') {
    return [];
  }

  return setResult(res.list);
};

// 猫了个咪
const rc = (js) => {
  if (js === 'maomi_aes.js') {
    const key = CryptoJS.enc.Utf8.parse('625222f9149e961d');
    const iv = CryptoJS.enc.Utf8.parse('5efdtf6060e2o330');

    const decrypt = (word) => {
      word = CryptoJS.enc.Hex.parse(word);
      const decrypted = CryptoJS.AES.decrypt(CryptoJS.enc.Base64.stringify(word), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    };

    const encrypt = (word) => {
      const encrypted = CryptoJS.AES.encrypt(word, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.ciphertext.toString();
    };

    return { De: decrypt, En: encrypt };
  }
  return {};
};

// 千万不要用for in 推荐 forEach (for in 会打乱顺序)
//猫函数
const maoss = (jxurl, ref, key) => {
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
  var html;
  // @ts-ignore
  eval(getCryptoJS());
  try {
    var getVideoInfo = function (text) {
      return CryptoJS.AES.decrypt(text, key, { iv: iv, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
    };
    let temp: any = { getVideoInfo }; // 防止tree-shake
    temp.stringify({}); // 防止tree-shake
    var token_key = key == undefined ? 'dvyYRQlnPRCMdQSe' : key;
    if (ref) {
      html = request(jxurl, {
        headers: {
          Referer: ref,
        },
      });
    } else {
      html = request(jxurl);
    }

    if (html.indexOf('&btwaf=') != -1) {
      html = request(jxurl + '&btwaf' + html.match(/&btwaf(.*?)"/)[1], {
        headers: {
          Referer: ref,
        },
      });
    }
    var token_iv = html.split('_token = "')[1].split('"')[0];
    var key = CryptoJS.enc.Utf8.parse(token_key);
    var iv = CryptoJS.enc.Utf8.parse(token_iv);

    eval(html.match(/var config = {[\s\S]*?}/)[0] + '');

    // @ts-ignore
    if (!config.url.startsWith('http')) {
      // @ts-ignore
      config.url = CryptoJS.AES.decrypt(config.url, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
      }).toString(CryptoJS.enc.Utf8);
    }
    // @ts-ignore
    return config.url;
  } catch (e) {
    return '';
  }
};

const urlencode = (str) => {
  str = `${str}`;
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
};

/**
 * url编码,同 encodeURI
 * @param str
 * @returns {string}
 */
function encodeUrl(str) {
  if (typeof encodeURI == 'function') {
    return encodeURI(str);
  } else {
    str = (str + '').toString();
    return encodeURIComponent(str)
      .replace(/%2F/g, '/')
      .replace(/%3F/g, '?')
      .replace(/%3A/g, ':')
      .replace(/%40/g, '@')
      .replace(/%3D/g, '=')
      .replace(/%3A/g, ':')
      .replace(/%2C/g, ',')
      .replace(/%2B/g, '+')
      .replace(/%24/g, '$');
  }
}

const base64Encode = (text: string) => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const base64Decode = (text: string) => {
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text));
};

const md5 = (text: string) => {
  return `${CryptoJS.MD5(text)}`;
};

const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
  return btoa(binaryString);
};

const Utf8ArrayToStr = (array: Uint8Array) => {
  let out: string, i: number, len: number, c: number;
  let char2: number, char3: number;
  out = '';
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
        break;
    }
  }
  return out;
};

/**
 * gzip压缩base64|压缩率80%+
 * @param str
 * @returns {string}
 */
const gzip = (str) => {
  const arr = pako.gzip(str, {
    // to: 'string',
  });
  return uint8ArrayToBase64(arr);
};

/**
 * gzip解压base64数据
 * @param b64Data
 * @returns {string}
 */
const ungzip = (b64Data: string) => {
  let strData = atob(b64Data);
  const charData = strData.split('').map((x) => {
    return x.charCodeAt(0);
  });
  const binData = new Uint8Array(charData);
  const data = pako.inflate(binData);
  return Utf8ArrayToStr(data);
};

/**
 * 字符串按指定编码
 * @param input
 * @param encoding
 * @returns {*}
 */
const encodeStr = (input, encoding) => {
  encoding = encoding || 'gbk';

  if (encoding.startsWith('gb')) {
    const strTool = gbkTool();
    input = strTool.encode(input);
  }

  return input;
};

/**
 * 字符串指定解码
 * @param input
 * @param encoding
 * @returns {*}
 */
const decodeStr = (input, encoding) => {
  encoding = encoding || 'gbk';

  if (encoding.startsWith('gb')) {
    const strTool = gbkTool();
    input = strTool.decode(input);
  }

  return input;
};

function getCryptoJS() {
  // return request('https://ghproxy.net/https://raw.githubusercontent.com/hjdhnx/dr_py/main/libs/crypto-hiker.js');
  return 'console.log("CryptoJS已装载");';
}

// 封装的RSA加解密类
const RSA = {
  decode(data, key, option) {
    option = option || {};
    if (typeof JSEncrypt === 'function') {
      // @ts-ignore
      const chunkSize = option.chunkSize ?? 117; // 默认分段长度为117
      const privateKey = this.getPrivateKey(key);
      const decryptor = new JSEncrypt();
      decryptor.setPrivateKey(privateKey);
      return decryptor.decryptLong(data);
    }
    return false;
  },
  encode(data, key, option = {}) {
    option = option || {};
    if (typeof JSEncrypt === 'function') {
      // @ts-ignore
      const chunkSize = option.chunkSize ?? 117; // 默认分段长度为117
      const publicKey = this.getPublicKey(key);
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKey);
      // let encrypted = ''; // 加密结果
      // const textLen = data.length; // 待加密文本长度
      // let offset = 0; // 分段偏移量
      // // 分段加密
      // while (offset < textLen) {
      //   let chunk = data.substr(offset, chunkSize); // 提取分段数据
      //   let enc = encryptor.encrypt(chunk); // 加密分段数据
      //   encrypted += enc; // 连接加密结果
      //   offset += chunkSize; // 更新偏移量
      // }
      return encryptor.encryptLong(data);
    }
    return false;
  },
  fixKey(key, prefix, endfix) {
    key = key.trim();
    if (!key.startsWith(prefix)) {
      key = `${prefix}${key}`;
    }
    if (!key.endsWith(endfix)) {
      key += endfix;
    }
    return key;
  },
  getPrivateKey(key) {
    let prefix = '-----BEGIN RSA PRIVATE KEY-----';
    let endfix = '-----END RSA PRIVATE KEY-----';
    return this.fixKey(key, prefix, endfix);
  },
  getPublicKey(key) {
    let prefix = '-----BEGIN PUBLIC KEY-----';
    let endfix = '-----END PUBLIC KEY-----';
    return this.fixKey(key, prefix, endfix);
  },
};

/**
 * 获取壳子返回的代理地址
 * @returns {string|*}
 */
const getProxyUrl = () => {
  // @ts-ignore
  if (typeof getProxy === 'function') {
    //判断壳子里有getProxy函数就执行取返回结果。否则取默认的本地
    // @ts-ignore
    return getProxy(true);
  } else {
    return 'http://127.0.0.1:9978/proxy?do=js';
  }
};

/**
 * 根据正则处理原始m3u8里的广告ts片段，自动修复相对链接
 * @param m3u8_text m3u8原始文本，里面是最末级的只含ts片段的。不支持嵌套m3u8链接
 * @param m3u8_url m3u8原始地址
 * @param ad_remove 正则表达式如: reg:/video/adjump(.*?)ts
 * @returns {string|DocumentFragment|*|string}
 */
const fixAdM3u8 = (m3u8_text: string, m3u8_url: string, ad_remove: string) => {
  if ((!m3u8_text && !m3u8_url) || (!m3u8_text && m3u8_url && !m3u8_url.startsWith('http'))) {
    return '';
  }
  if (!m3u8_text) {
    log(`[t3][fixAdM3u8]m3u8_url:${m3u8_url}`);
    m3u8_text = request(m3u8_url);
  }
  log(`[t3][fixAdM3u8]len(m3u8_text):${m3u8_text.length}`);
  if (!ad_remove) {
    return m3u8_text;
  }
  if (ad_remove.startsWith('reg:')) {
    ad_remove = ad_remove.slice(4);
  } else if (ad_remove.startsWith('js:')) {
    ad_remove = ad_remove.slice(3);
  }
  let m3u8_start = m3u8_text.slice(0, m3u8_text.indexOf('#EXTINF')).trim();
  let m3u8_body = m3u8_text.slice(m3u8_text.indexOf('#EXTINF'), m3u8_text.indexOf('#EXT-X-ENDLIST')).trim();
  let m3u8_end = m3u8_text.slice(m3u8_text.indexOf('#EXT-X-ENDLIST')).trim();
  let murls: string[] = [];
  let m3_body_list = m3u8_body.split('\n');
  let m3_len = m3_body_list.length;
  let i = 0;
  while (i < m3_len) {
    let mi = m3_body_list[i];
    let mi_1 = m3_body_list[i + 1];
    if (mi.startsWith('#EXTINF')) {
      murls.push([mi, mi_1].join('&'));
      i += 2;
    } else if (mi.startsWith('#EXT-X-DISCONTINUITY')) {
      let mi_2 = m3_body_list[i + 2];
      murls.push([mi, mi_1, mi_2].join('&'));
      i += 3;
    } else {
      break;
    }
  }
  let new_m3u8_body: any = [];
  for (let murl of murls) {
    if (ad_remove && new RegExp(ad_remove).test(murl)) {
    } else {
      let murl_list = murl.split('&');
      if (!murl_list[murl_list.length - 1].startsWith('http') && m3u8_url.startsWith('http')) {
        murl_list[murl_list.length - 1] = urljoin(m3u8_url, murl_list[murl_list.length - 1]);
      }
      murl_list.forEach((it) => {
        new_m3u8_body.push(it);
      });
    }
  }
  new_m3u8_body = new_m3u8_body.join('\n').trim();
  m3u8_text = [m3u8_start, new_m3u8_body, m3u8_end].join('\n').trim();
  return m3u8_text;
};

/**
 *  智能对比去除广告。支持嵌套m3u8。只需要传入播放地址
 * @param m3u8_url m3u8播放地址
 * @param headers 自定义访问m3u8的请求头,可以不传
 * @returns {string} (m3u8_url: string, headers: object | null = null)
 */
const fixAdM3u8Ai = (m3u8_url: string, headers: object | null = null) => {
  let ts = new Date().getTime();
  let option = headers ? { headers: headers } : {};

  function b(s1, s2) {
    let i = 0;
    while (i < s1.length) {
      if (s1[i] !== s2[i]) {
        break;
      }
      i++;
    }
    return i;
  }

  function reverseString(str) {
    return str.split('').reverse().join('');
  }

  //log('播放的地址：' + m3u8_url);
  let m3u8 = request(m3u8_url, option);
  //log('m3u8处理前:' + m3u8);
  m3u8 = m3u8
    .trim()
    .split('\n')
    .map((it) => (it.startsWith('#') ? it : urljoin(m3u8_url, it)))
    .join('\n');
  //log('m3u8处理后:============:' + m3u8);
  // 获取嵌套m3u8地址
  m3u8 = m3u8.replace(/\n\n/gi, '\n'); //删除多余的换行符
  let last_url = m3u8.split('\n').slice(-1)[0];
  if (last_url.length < 5) {
    last_url = m3u8.split('\n').slice(-2)[0];
  }

  if (last_url.includes('.m3u8') && last_url !== m3u8_url) {
    m3u8_url = urljoin2(m3u8_url, last_url);
    log('嵌套的m3u8_url:' + m3u8_url);
    m3u8 = request(m3u8_url, option);
  }
  //log('----处理有广告的地址----');
  let s = m3u8
    .trim()
    .split('\n')
    .filter((it) => it.trim())
    .join('\n');
  let ss = s.split('\n');
  //找出第一条播放地址
  //let firststr = ss.find(x => !x.startsWith('#'));
  let firststr = '';
  let maxl = 0; //最大相同字符
  let kk = 0;
  let kkk = 2;
  let secondstr = '';
  for (let i = 0; i < ss.length; i++) {
    let s = ss[i];
    if (!s.startsWith('#')) {
      if (kk == 0) firststr = s;
      if (kk == 1) maxl = b(firststr, s);
      if (kk > 1) {
        if (maxl > b(firststr, s)) {
          if (secondstr.length < 5) secondstr = s;
          kkk = kkk + 2;
        } else {
          maxl = b(firststr, s);
          kkk++;
        }
      }
      kk++;
      if (kk >= 20) break;
    }
  }
  if (kkk > 30) firststr = secondstr;
  let firststrlen = firststr.length;
  //log('字符串长度：' + firststrlen);
  let ml = Math.round(ss.length / 2).toString().length; //取数据的长度的位数
  //log('数据条数的长度：' + ml);
  //找出最后一条播放地址
  let maxc = 0;
  let laststr = ss.toReversed().find((x) => {
    if (!x.startsWith('#')) {
      let k = b(reverseString(firststr), reverseString(x));
      maxl = b(firststr, x);
      maxc++;
      if (firststrlen - maxl <= ml + k || maxc > 10) {
        return true;
      }
    }
    return false;
  });
  log('最后一条切片：' + laststr);
  //log('最小相同字符长度：' + maxl);
  let ad_urls = [];
  for (let i = 0; i < ss.length; i++) {
    let s = ss[i];
    if (!s.startsWith('#')) {
      if (b(firststr, s) < maxl) {
        // @ts-ignore
        ad_urls.push(s); // 广告地址加入列表
        ss.splice(i - 1, 2);
        i = i - 2;
      } else {
        ss[i] = urljoin(m3u8_url, s);
      }
    } else {
      ss[i] = s.replace(/URI=\"(.*)\"/, 'URI="' + urljoin(m3u8_url, '$1') + '"');
    }
  }
  log('处理的m3u8地址:' + m3u8_url);
  log('----广告地址----');
  log(ad_urls);
  m3u8 = ss.join('\n');
  //log('处理完成');
  log('处理耗时：' + (new Date().getTime() - ts).toString());
  return m3u8;
};

/**
 * 强制正序算法
 * @param lists  待正序列表
 * @param key 正序键
 * @param option 单个元素处理函数
 * @returns {*}
 */
const forceOrder = (lists, key, option) => {
  const start = Math.floor(lists.length / 2);
  const end = Math.min(lists.length - 1, start + 1);

  if (start >= end) return lists;

  let first = lists[start];
  let second = lists[end];

  if (key) {
    try {
      first = first[key];
      second = second[key];
    } catch (e) {}
  }

  if (option && typeof option === 'function') {
    try {
      first = option(first);
      second = option(second);
    } catch (e) {}
  }

  first = String(first);
  second = String(second);

  // console.log(first,second);
  if (first.match(/(\d+)/) && second.match(/(\d+)/)) {
    const num1 = Number(first.match(/(\d+)/)[1]);
    const num2 = Number(second.match(/(\d+)/)[1]);

    if (num1 > num2) {
      lists.reverse();
    }
  }

  return lists;
};

let VODS: any = []; // 一级或者搜索需要的数据列表
let VOD: any = {}; // 二级的单个数据
let TABS: any = []; // 二级的自定义线路列表 如: TABS=['道长在线','道长在线2']
let LISTS: any = []; // 二级的自定义选集播放列表 如: LISTS=[['第1集$http://1.mp4','第2集$http://2.mp4'],['第3集$http://1.mp4','第4集$http://2.mp4']]

/**
 * 获取链接的query请求转为js的object字典对象
 * @param url
 * @returns {{}}
 */
const getQuery = (url: string) => {
  try {
    if (url.indexOf('?') > -1) {
      url = url.slice(url.indexOf('?') + 1);
    }
    let arr = url.split('#')[0].split('&');
    const resObj = {};
    arr.forEach((item) => {
      let arr1 = item.split('=');
      let key = arr1[0];
      let value = arr1.slice(1).join('=');
      resObj[key] = value;
    });
    return resObj;
  } catch (err) {
    console.log(`[t3][getQuery][error]${err}`);
    return {};
  }
};

/**
 *  url拼接
 * @param fromPath 初始当前页面url
 * @param nowPath 相对当前页面url
 * @returns {*}
 */
const urljoin = (fromPath, nowPath) => {
  fromPath = fromPath || '';
  nowPath = nowPath || '';
  return resolve(fromPath, nowPath);
};

var urljoin2 = urljoin;

// 内置 pdfh,pdfa,pd
const defaultParser = {
  pdfh: pdfhModule,
  pdfa: pdfaModule,
  pd: pdModule,
};

/**
 * pdfh原版优化,能取style属性里的图片链接
 * @param html 源码
 * @param parse 解析表达式
 * @returns {string|*}
 */
const pdfh2 = (html, parse) => {
  let html2 = html;

  try {
    if (typeof html !== 'string') {
      html2 = html.rr(html.ele).toString();
    }
  } catch (e) {
    // @ts-ignore
    console.log(`html对象转文本发生了错误:${e.message}`);
  }

  let result = defaultParser.pdfh(html2, parse);
  let option = parse.includes('&&') ? parse.split('&&').slice(-1)[0] : parse.split(' ').slice(-1)[0];

  if (/style/.test(option.toLowerCase()) && /url\(/.test(result)) {
    try {
      result = result.match(/url\((.*?)\)/)![1];
      result = result.replace(/^['|"](.*)['|"]$/, '$1');
    } catch (e) {}
  }

  return result;
};

/**
 * pdfa原版优化,可以转换jq的html对象
 * @param html
 * @param parse
 * @returns {*}
 */
const pdfa2 = (html, parse) => {
  let html2 = html;

  try {
    if (typeof html !== 'string') {
      html2 = html.rr(html.ele).toString();
    }
  } catch (e) {
    // @ts-ignore
    console.log(`html对象转文本发生了错误:${e.message}`);
  }

  return defaultParser.pdfa(html2, parse);
};

/**
 * pd原版方法重写-增加自动urljoin
 * @param html
 * @param parse
 * @param uri
 * @returns {*}
 */
const pd2 = (html, parse, uri) => {
  let ret = pdfh2(html, parse);

  if (typeof uri === 'undefined' || !uri) uri = '';

  if (DOM_CHECK_ATTR.test(parse) && !SPECIAL_URL.test(ret)) {
    if (/http/.test(ret)) {
      ret = ret.substring(ret.indexOf('http'));
    } else {
      ret = urljoin(MY_URL, ret);
    }
  }

  return ret;
};

const parseTags = {
  jsp: {
    pdfh: pdfh2,
    pdfa: pdfa2,
    pd: pd2,
  },
  json: {
    pdfh(html, parse) {
      if (!parse || !parse.trim()) {
        return '';
      }
      if (typeof html === 'string') {
        html = JSON.parse(html);
      }
      parse = parse.trim();
      if (!parse.startsWith('$.')) {
        parse = '$.' + parse;
      }
      parse = parse.split('||');
      for (let ps of parse) {
        let ret = cheerio.jp(ps, html);
        if (Array.isArray(ret)) {
          ret = ret[0] || '';
        } else {
          ret = ret || '';
        }
        if (ret && typeof ret !== 'string') {
          ret = ret.toString();
        }
        if (ret) {
          return ret;
        }
      }
      return '';
    },
    pdfa(html, parse) {
      if (!parse || !parse.trim()) {
        return '';
      }
      if (typeof html === 'string') {
        html = JSON.parse(html);
      }
      parse = parse.trim();
      if (!parse.startsWith('$.')) {
        parse = '$.' + parse;
      }
      let ret = cheerio.jp(parse, html);
      if (Array.isArray(ret) && Array.isArray(ret[0]) && ret.length === 1) {
        return ret[0] || [];
      }
      return ret || [];
    },
    pd(html, parse) {
      let ret = parseTags.json.pdfh(html, parse);
      if (ret) {
        return urljoin(MY_URL, ret);
      }
      return ret;
    },
  },
  jq: {
    pdfh(html, parse) {
      if (!html || !parse || !parse.trim()) {
        return '';
      }
      parse = parse.trim();
      let result = defaultParser.pdfh(html, parse);
      return result;
    },
    pdfa(html, parse) {
      if (!html || !parse || !parse.trim()) {
        return [];
      }
      parse = parse.trim();
      let result = defaultParser.pdfa(html, parse);
      return result;
    },
    pd(html, parse, base_url) {
      if (!html || !parse || !parse.trim()) {
        return '';
      }
      parse = parse.trim();
      base_url = base_url || MY_URL;
      return defaultParser.pd(html, parse, base_url);
    },
  },
  getParse(p0) {
    // 自动获取解析标签
    if (p0.startsWith('jsp:')) {
      return this.jsp;
    } else if (p0.startsWith('json:')) {
      return this.json;
    } else if (p0.startsWith('jq:')) {
      return this.jq;
    } else {
      return this.jq;
    }
  },
};

const stringify = JSON.stringify;
const jsp = parseTags.jsp;
const jq = parseTags.jq;

/*** 后台需要实现的java方法并注入到js中 ***/

/**
 * 读取本地文件->应用程序目录
 * @param filePath
 * @returns {string}
 */
const readFile = (filePath) => {
  filePath = filePath || './uri.min.js';
  // var fd = os.open(filePath);
  // var buffer = new ArrayBuffer(1024);
  // var len = os.read(fd, buffer, 0, 1024);
  // console.log(len);
  // let text = String.fromCharCode.apply(null, new Uint8Array(buffer));
  // console.log(text);
  // return text
};

/**
 * 处理返回的json数据
 * @param html
 * @returns {*}
 */
const dealJson = (html: string) => {
  try {
    html = html.trim();
    if (!/^[\[{].*[\]}]$/.test(html)) {
      const match = html.match(/.*?\{(.*)\}/m);
      if (match) {
        html = `{${match[1]}}`;
      }
    }
  } catch (e) {}

  try {
    html = JSON.parse(html);
  } catch (e) {}

  return html;
};

/**
 * 验证码识别逻辑,需要java实现(js没有bytes类型,无法调用后端的传递图片二进制获取验证码文本的接口)
 * @type {{api: string, classification: (function(*=): string)}}
 */
var OcrApi = {
  api: OCR_API,
  classification: function (img) {
    // img是byte类型,这里不方便搞啊
    let code = '';
    try {
      // let html = request(this.api,{data:{img:img},headers:{'User-Agent':PC_UA},'method':'POST'},true);
      // html = JSON.parse(html);
      // code = html.url||'';
      log('通过drpy_ocr验证码接口过验证...');
      let html = '';
      if (this.api.endsWith('drpy/text')) {
        html = request(this.api, { data: { img: img }, headers: { 'User-Agent': PC_UA }, method: 'POST' }, true);
      } else {
        html = post(this.api, { body: img });
      }
      code = html || '';
    } catch (e) {
      // @ts-ignore
      log(`OCR识别验证码发生错误:${e.message}`);
    }
    return code;
  },
};

/**
 * 验证码识别
 * @param url 验证码图片链接
 * @returns {string} 验证成功后的cookie
 */
const verifyCode = (url) => {
  let cnt = 0;
  let host = getHome(url);
  let cookie = '';

  while (cnt < OCR_RETRY) {
    try {
      let yzm_url = `${host}/index.php/verify/index.html`;
      console.log(`[t3]验证码链接: ${yzm_url}`);
      let hhtml = request(yzm_url, { withHeaders: true, toBase64: true }, true);
      let json = JSON.parse(hhtml);

      if (!cookie) {
        let setCk = Object.keys(json).find((it) => it.toLowerCase() === 'set-cookie');
        cookie = setCk ? json[setCk].split(';')[0] : '';
      }

      let img = json.body;
      let code = OcrApi.classification(img);
      console.log(`[t3]第${cnt + 1}次验证码识别结果: ${code}`);
      let submit_url = `${host}/index.php/ajax/verify_check?type=search&verify=${code}`;
      // let submit_url = `${host}/index.php/ajax/verify_check`;
      // let submit_body = `type=search&verify=${code}`;

      let html: any = request(submit_url, { headers: { Cookie: cookie }, method: 'POST' });
      // let html: any = request(submit_url, { headers: { Cookie: cookie, 'User-Agent': MOBILE_UA }, method: 'POST',body:submit_body });
      html = JSON.parse(html);

      if (html.msg === 'ok') {
        console.log(`[t3]第${cnt + 1}次验证码提交成功`);
        return cookie;
      } else if (html.msg !== 'ok' && cnt + 1 >= OCR_RETRY) {
        cookie = '';
      }
    } catch (e) {
      // @ts-ignore
      console.log(`[t3]第${cnt + 1}次验证码提交失败 ${e.message}`);
      if (cnt + 1 >= OCR_RETRY) {
        cookie = '';
      }
    }
    cnt += 1;
  }
  return cookie;
};

/**
 * 存在数据库配置表里, key字段对应值value,没有就新增,有就更新,调用此方法会清除key对应的内存缓存
 * @param k 键
 * @param v 值
 * @returns {*}
 */
const setItem = (k, v) => {
  local.set(RKEY, k, v);
  console.log(`[t3][cache][set]${RKEY}${k}:${v}`);
};

/**
 * 获取数据库配置表对应的key字段的value，没有这个key就返回value默认传参.需要有缓存,第一次获取后会存在内存里
 * @param k 键
 * @param v 值
 * @returns {*}
 */
const getItem = (k, v) => {
  const res = local.get(RKEY, k, v);
  console.log(`[t3][cache][get]${res}`);
  return res;
};

/**
 * 删除数据库key对应的一条数据,并清除此key对应的内存缓存
 * @param k
 */
const clearItem = (k) => {
  local.delete(RKEY, k);
};

/*** js自封装的方法 ***/

/**
 * 获取链接的host(带http协议的完整链接)
 * @param url 任意一个正常完整的Url,自动提取根
 * @returns {string}
 */
const getHome = (url) => {
  if (!url) return '';

  try {
    url = new URL(url).origin;
  } catch (e) {
    // @ts-ignore
    console.info(`[t3]URL 解析失败: ${e.message}`);
  }

  return url;
};

/**
 * get参数编译链接,类似python params字典自动拼接
 * @param url 访问链接
 * @param obj 参数字典
 * @returns {*}
 */
const buildUrl = (url: string, obj: any = {}) => {
  obj = obj || {};
  if (url.indexOf('?') < 0) {
    url += '?';
  }
  let param_list = [];
  let keys = Object.keys(obj);
  keys.forEach((it) => {
    // @ts-ignore
    param_list.push(it + '=' + obj[it]);
  });
  let prs = param_list.join('&');
  if (keys.length > 0 && !url.endsWith('?')) {
    url += '&';
  }
  url += prs;
  return url;
};

/**
 * 远程依赖执行函数
 * @param url 远程js地址
 */
const $require = (url) => {
  // @ts-ignore
  eval(request(url));
};

/**
 * 将obj所有key变小写
 * @param obj
 */
function keysToLowerCase(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const newKey = key.toLowerCase();
    result[newKey] = obj[key]; // 如果值也是对象，可以递归调用本函数
    return result;
  }, {});
}

/**
 * 海阔网页请求函数完整封装
 * @param url 请求链接
 * @param obj 请求对象 {headers:{},method:'',timeout:5000,body:'',withHeaders:false}
 * @param ocr_flag 标识此flag是用于请求ocr识别的,自动过滤content-type指定编码
 * @returns {string|string|DocumentFragment|*}
 */
const request = (url: string, obj: any = undefined, ocr_flag: boolean = false) => {
  if (typeof obj === 'undefined' || !obj) {
    if (!fetch_params || !fetch_params.headers) {
      const headers = {
        'User-Agent': MOBILE_UA,
      };
      if (rule['headers']) {
        Object.assign(headers, rule['headers']);
      }
      if (!fetch_params) {
        fetch_params = {};
      }
      fetch_params.headers = headers;
    }
    if (!fetch_params.headers.Referer) {
      fetch_params.headers.Referer = getHome(url);
    }
    obj = fetch_params;
  } else {
    const headers = obj.headers || {};
    const keys = Object.keys(headers).map((it) => it.toLowerCase());
    if (!keys.includes('user-agent')) {
      headers['User-Agent'] = MOBILE_UA;
      // fetch_params 里存在ua则优先，否则才默认手机UA
      if (typeof fetch_params === 'object' && fetch_params && fetch_params.headers) {
        let fetch_headers = keysToLowerCase(fetch_params.headers);
        if (fetch_headers['user-agent']) {
          headers['User-Agent'] = fetch_headers['user-agent'];
        }
      }
    }
    if (!keys.includes('referer')) {
      headers['Referer'] = getHome(url);
    }
    obj.headers = headers;
  }
  if (rule['encoding'] && rule['encoding'] !== 'utf-8' && !ocr_flag) {
    if (!obj.headers.hasOwnProperty('Content-Type') && !obj.headers.hasOwnProperty('content-type')) {
      // 手动指定了就不管
      obj.headers['Content-Type'] = 'text/html; charset=' + rule['encoding'];
    }
  }
  if (typeof obj.body !== 'undefined' && obj.body && typeof obj.body === 'string') {
    if (!obj.headers.hasOwnProperty('Content-Type') && !obj.headers.hasOwnProperty('content-type')) {
      obj.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=' + rule['encoding'];
    }
  } else if (typeof obj.body !== 'undefined' && obj.body && typeof obj.body === 'object') {
    obj.data = obj.body;
    delete obj.body;
  }
  if (!url) return obj.withHeaders ? '{}' : '';
  if (obj.toBase64) {
    // 返回base64,用于请求图片
    obj.buffer = 2;
    delete obj.toBase64;
  }
  if (obj.redirect === false) {
    obj.redirect = 0;
  }
  // 还原请求头 方便 重写改
  if (obj?.headers) {
    const customHeaders = {
      'custom-cookie': 'Cookie',
      'custom-origin': 'Origin',
      'custom-host': 'Host',
      'custom-connection': 'Connection',
      'custom-ua': 'User-Agent',
      'custom-referer': 'Referer',
    };
    obj.headers = keysToLowerCase(obj.headers);

    for (const [customHeader, originalHeader] of Object.entries(customHeaders)) {
      let originalHeaderKey = originalHeader.toLowerCase();
      if (obj.headers.hasOwnProperty(customHeader)) {
        obj.headers[originalHeaderKey] = obj.headers[customHeader];
        delete obj.headers[customHeader];
      }
    }
  }

  console.log(`[t3][request]headers:${JSON.stringify(obj.headers)}`);
  console.log(`[t3][request]url:${url}| method:${obj.method || 'GET'}| body:${obj.body || ''}`);
  const res = req(url, obj);
  const html = res['content'] || '';
  if (obj.withHeaders) {
    let htmlWithHeaders = res.headers;
    htmlWithHeaders!.body = html;
    return JSON.stringify(htmlWithHeaders);
  } else {
    return html;
  }
};

/**
 *  快捷post请求
 * @param url 地址
 * @param obj 对象
 * @returns {string|DocumentFragment|*}
 */
const post = (url: string, obj: object = {}) => {
  // @ts-ignore
  obj.method = 'POST';
  return request(url, obj);
};

// const batchFetch = batchReq;

/**
 * 快捷获取特殊地址cookie|一般用作搜索过验证
 * 用法 let {cookie,html} = reqCookie(url);
 * @param url 能返回cookie的地址
 * @param obj 常规请求参数
 * @param all_cookie 返回全部cookie.默认false只返回第一个,一般是PhpSessionId
 * @returns {{cookie: string, html: (*|string|DocumentFragment)}}
 */
const reqCookie = (url: string, obj: object = {}, all_cookie: boolean = false) => {
  // @ts-ignore
  obj.withHeaders = true;
  let html = request(url, obj);
  let json = JSON.parse(html);
  let setCk = Object.keys(json).find((it) => it.toLowerCase() === 'set-cookie');
  let cookie = setCk ? json[setCk] : '';
  if (Array.isArray(cookie)) {
    cookie = cookie.join(';');
  }
  if (!all_cookie) {
    cookie = cookie.split(';')[0];
  }
  html = json.body;
  return {
    cookie,
    html,
  };
};

fetch = request;
print = (data: any = '') => {
  if (data === undefined || data === null || data === '') {
    console.log('[t3]null or empty data');
    return;
  }

  if (typeof data === 'object') {
    if (Object.keys(data).length > 0) {
      try {
        console.log(`[t3${JSON.stringify(data)}`);
      } catch (e) {
        console.log(`[t3${typeof data}:${data.length}`);
      }
    } else {
      console.log('[t3null object');
    }
  } else {
    console.log(data);
  }
};
log = print;

/**
 * 检查宝塔验证并自动跳过获取正确源码
 * @param html 之前获取的html
 * @param url 之前的来源url
 * @param obj 来源obj
 * @returns {string|DocumentFragment|*}
 */
const checkHtml = (html, url: string, obj) => {
  const matchBtwaf = html.match(/\?btwaf=(.*?)"/);
  if (matchBtwaf) {
    const btwaf = matchBtwaf[1];
    const newUrl = url.split('#')[0] + '?btwaf' + btwaf;
    console.log('[t3]宝塔验证访问链接:' + newUrl);
    html = request(newUrl, obj);
  }

  return html;
};

/**
 * 带一次宝塔验证的源码获取
 * @param url 请求链接
 * @param obj 请求参数
 * @returns {string|DocumentFragment}
 */
const getCode = (url, obj) => {
  let html = request(url, obj);
  html = checkHtml(html, url, obj);
  return html;
};

/**
 * 源rule专用的请求方法,自动注入cookie
 * @param url 请求链接
 * @returns {string|DocumentFragment}
 */
const getHtml = (url) => {
  let obj = {};
  if (rule['headers']) obj['headers'] = rule['headers'];
  let cookie = getItem(RULE_CK, '');
  if (cookie) {
    console.log(cookie);
    if (
      obj['headers'] &&
      !Object.keys(obj['headers'])
        .map((it) => it.toLowerCase())
        .includes('cookie')
    ) {
      console.log('[t3]历史无cookie,新增过验证后的cookie');
      obj['headers']['Cookie'] = cookie;
    } else if (obj['headers'] && obj['headers'].cookie && obj['headers'].cookie !== cookie) {
      obj['headers']['Cookie'] = cookie;
      console.log('[t3]历史有小写过期的cookie,更新过验证后的cookie');
    } else if (obj['headers'] && obj['headers'].Cookie && obj['headers'].Cookie !== cookie) {
      obj['headers']['Cookie'] = cookie;
      console.log('[t3]历史有大写过期的cookie,更新过验证后的cookie');
    } else if (!obj['headers']) {
      obj['headers'] = { Cookie: cookie };
      console.log('[t3]历史无headers,更新过验证后的含cookie的headers');
    }
  }
  let html = getCode(url, obj);
  return html;
};

/**
 * 首页分类解析，筛选暂未实现
 * @param homeObj 首页传参对象
 * @returns {string}
 */
const homeParse = (homeObj) => {
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
  let classes: any = [];

  if (homeObj.class_name && homeObj.class_url) {
    let names = homeObj.class_name.split('&');
    let urls = homeObj.class_url.split('&');
    let cnt = Math.min(names.length, urls.length);

    for (let i = 0; i < cnt; i++) {
      classes.push({
        type_id: urls[i],
        type_name: names[i],
      });
    }
  }

  if (homeObj.class_parse) {
    if (homeObj.class_parse.startsWith('js:')) {
      var input = homeObj.MY_URL;
      try {
        eval(homeObj.class_parse.replace('js:', ''));
        if (Array.isArray(input)) {
          classes = input;
        }
      } catch (e) {
        console.log(`通过js动态获取分类发生了错误:${e}`);
      }
    } else {
      let p = homeObj.class_parse.split(';');
      let p0 = p[0];
      let _ps = parseTags.getParse(p0);
      let is_json = p0.startsWith('json:');
      _pdfa = _ps.pdfa;
      _pdfh = _ps.pdfh;
      _pd = _ps.pd;
      MY_URL = rule['url'];
      if (is_json) {
        try {
          let cms_cate_url = homeObj.MY_URL.replace('ac=detail', 'ac=list');
          let html = homeObj.home_html || getHtml(cms_cate_url);
          if (html) {
            if (cms_cate_url === homeObj.MY_URL) {
              homeHtmlCache = html;
            }
            let list = _pdfa(html, p0.replace('json:', ''));
            if (list && list.length > 0) {
              classes = list;
            }
          }
        } catch (e) {
          // @ts-ignore
          console.log(e.message);
        }
      } else if (p.length >= 3 && !is_json) {
        // 可以不写正则
        try {
          let html = homeObj.home_html || getHtml(homeObj.MY_URL);
          if (html) {
            homeHtmlCache = html;
            let list = _pdfa(html, p0);
            if (list && list.length > 0) {
              list.forEach((it, idex) => {
                try {
                  let name = _pdfh(it, p[1]);
                  if (homeObj.cate_exclude && new RegExp(homeObj.cate_exclude).test(name)) {
                    return;
                  }
                  let url = _pd(it, p[2]);
                  if (p.length > 3 && p[3] && !homeObj.home_html) {
                    let exp = new RegExp(p[3]);
                    url = url.match(exp)[1];
                  }

                  classes.push({
                    type_id: url.trim(),
                    type_name: name.trim(),
                  });
                } catch (e) {
                  // @ts-ignore
                  console.log(`分类列表定位第${idex}个元素正常报错:${e.message}`);
                }
              });
            }
          }
        } catch (e) {
          // @ts-ignore
          console.log(e.message);
        }
      }
    }
  }
  // 排除分类
  classes = classes.filter((it) => !homeObj.cate_exclude || !new RegExp(homeObj.cate_exclude).test(it['type_name']));

  let resp = {
    class: classes,
  };

  if (homeObj.filter) resp['filters'] = homeObj.filter;

  return resp;
};

/**
 * 推荐和搜索单字段继承一级
 * @param p 推荐或搜索的解析分割;列表
 * @param pn 自身列表序号
 * @param pp  一级解析分割;列表
 * @param ppn 继承一级序号
 * @returns {*}
 */
const getPP = (p, pn, pp, ppn) => {
  let ps = '';
  try {
    ps = p[pn] === '*' && pp.length > ppn ? pp[ppn] : p[pn];
  } catch (e) {}
  return ps;
};

/**
 *  首页推荐列表解析
 * @param homeVodObj
 * @returns {string}
 */
const homeVodParse = (homeVodObj) => {
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
  MY_URL = homeVodObj.homeUrl;
  let d: any = [];
  let t1 = Date.now();
  let p = homeVodObj['推荐'];

  if (p === '*' && rule['一级']) {
    homeVodObj.double = false;
    p = rule['一级'];
  }

  if (!p || typeof p !== 'string') return '{}';

  p = p.trim();
  let pp = rule['一级'] ? rule['一级'].split(';') : [];

  if (p.startsWith('js:')) {
    const TYPE = 'home';
    var input = MY_URL;
    [TYPE, input].map((item) => {
      item.length;
    }); // 防止tree-shake
    HOST = rule['host'];
    eval(p.replace('js:', ''));
    d = VODS;
  } else {
    p = p.split(';');

    if (!homeVodObj.double && p.length < 5) return '{}';
    else if (homeVodObj.double && p.length < 6) return '{}';

    let p0 = getPP(p, 0, pp, 0);
    let _ps = parseTags.getParse(p0);
    _pdfa = _ps.pdfa;
    _pdfh = _ps.pdfh;
    _pd = _ps.pd;
    const is_json = p0.startsWith('json:');
    p0 = p0.replace(/^(jsp:|json:|jq:)/, '');

    let html = homeHtmlCache || getHtml(MY_URL);
    homeHtmlCache = undefined;

    if (is_json) html = dealJson(html);

    try {
      if (homeVodObj.double) {
        let items = _pdfa(html, p0);
        const p1 = getPP(p, 1, pp, 0);
        const p2 = getPP(p, 2, pp, 1);
        const p3 = getPP(p, 3, pp, 2);
        const p4 = getPP(p, 4, pp, 3);
        const p5 = getPP(p, 5, pp, 4);
        const p6 = getPP(p, 6, pp, 5);

        for (let item of items) {
          let items2 = _pdfa(item, p1);
          for (let item2 of items2) {
            try {
              const title = _pdfh(item2, p2);
              const img = _pd(item2, p3) || '';
              const desc = _pdfh(item2, p4) || '';
              let links: any = [];

              for (let _p5 of p5.split('+')) {
                let link = !homeVodObj.detailUrl ? _pd(item2, _p5, MY_URL) : _pdfh(item2, _p5);
                links.push(link);
              }

              let content = p.length > 6 && p[6] ? _pdfh(item2, p6) : '';
              let vid = links.join('$');

              if (rule['二级'] === '*') vid += `@@${title}@@${img}`;

              const vod = {
                vod_name: title,
                vod_pic: img,
                vod_remarks: desc,
                vod_content: content,
                vod_id: vid,
              };

              d.push(vod);
            } catch (e) {
              // @ts-ignore
              console.log(`[t3]首页列表双层定位处理发生错误:${e.message}`);
            }
          }
        }
      } else {
        let items = _pdfa(html, p0);
        const p1 = getPP(p, 1, pp, 1);
        const p2 = getPP(p, 2, pp, 2);
        const p3 = getPP(p, 3, pp, 3);
        const p4 = getPP(p, 4, pp, 4);
        const p5 = getPP(p, 5, pp, 5);

        for (let item of items) {
          try {
            const title = _pdfh(item, p1);
            const img = _pd(item, p2, MY_URL) || '';
            const desc = _pdfh(item, p3) || '';
            let links: any = [];

            for (let _p5 of p4.split('+')) {
              let link = !homeVodObj.detailUrl ? _pd(item, _p5, MY_URL) : _pdfh(item, _p5);
              links.push(link);
            }

            let content = p.length > 5 && p[5] ? _pdfh(item, p5) : '';
            let vid = links.join('$');
            if (rule['二级'] === '*') vid += `@@${title}@@${img}`;

            const vod = {
              vod_name: title,
              vod_pic: img,
              vod_remarks: desc,
              vod_content: content,
              vod_id: vid,
            };

            d.push(vod);
          } catch (e) {
            // @ts-ignore
            console.log(`首页列表单层定位处理发生错误:${e.message}`);
          }
        }
      }
    } catch (e) {}
  }

  let t2 = Date.now();
  console.log(`[t3]加载首页推荐耗时:${t2 - t1}毫秒`);

  if (rule['图片替换']) {
    if (rule['图片替换'].startsWith('js:')) {
      d.forEach((it) => {
        try {
          var input = it.vod_pic;
          eval(rule['图片替换'].trim().replace('js:', ''));
          it.vod_pic = input;
        } catch (e) {
          // @ts-ignore
          log(`图片:${it.vod_pic}替换错误:${e.message}`);
        }
      });
    } else if (rule['图片替换'].includes('=>')) {
      let replace_from = rule['图片替换'].split('=>')[0];
      let replace_to = rule['图片替换'].split('=>')[1];
      d.forEach((it) => {
        if (it.vod_pic && it.vod_pic.startsWith('http')) {
          it.vod_pic = it.vod_pic.replace(replace_from, replace_to);
        }
      });
    }
  }

  if (rule['图片来源']) {
    // @ts-ignore
    d.filter((it) => it['vod_pic'] && it['vod_pic'].startsWith('http')).forEach((it) => {
      // @ts-ignore
      it['vod_pic'] += rule['图片来源'];
    });
  }

  return { list: d };
};

/**
 * 一级分类页数据解析
 * @param cateObj
 * @returns {string}
 */
const categoryParse = (cateObj) => {
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
  let p = cateObj['一级'];
  if (!p || typeof p !== 'string') return '{}';
  let d: any = [];
  let url = cateObj.url.replaceAll('fyclass', cateObj.tid);

  if (cateObj.pg === 1 && url.includes('[') && url.includes(']')) {
    url = url.split('[')[1].split(']')[0];
  } else if (cateObj.pg > 1 && url.includes('[') && url.includes(']')) {
    url = url.split('[')[0];
  }

  if (rule['filter_url']) {
    if (!/fyfilter/.test(url)) {
      url += !url.endsWith('&') && !rule['filter_url'].startsWith('&') ? '&' : '';
      url += rule['filter_url'];
    } else {
      url = url.replace('fyfilter', rule['filter_url']);
    }
    // filter_url支持fyclass
    url = url.replaceAll('fyclass', cateObj.tid);
    let fl = cateObj.filter ? cateObj.extend : {};
    // 自动合并 不同分类对应的默认筛选
    if (rule['filter_def'] && typeof rule['filter_def'] === 'object') {
      try {
        if (Object.keys(rule['filter_def']).length > 0 && rule['filter_def'].hasOwnProperty(cateObj.tid)) {
          let self_fl_def = rule['filter_def'][cateObj.tid];
          if (self_fl_def && typeof self_fl_def === 'object') {
            // 引用传递转值传递,避免污染self变量
            let fl_def = JSON.parse(JSON.stringify(self_fl_def));
            fl = Object.assign(fl_def, fl);
          }
        }
      } catch (e) {
        // @ts-ignore
        console.log(`合并不同分类对应的默认筛选出错:${e.message}`);
      }
    }

    let new_url = cheerio.jinja2(url, { fl: fl, fyclass: cateObj.tid });
    url = new_url;
  }
  if (/fypage/.test(url)) {
    if (url.includes('(') && url.includes(')')) {
      let url_rep = url.match(/.*?\((.*)\)/)[1];
      let cnt_page = url_rep.replaceAll('fypage', cateObj.pg);
      let cnt_pg = eval(cnt_page);
      url = url.replaceAll(url_rep, cnt_pg).replaceAll('(', '').replaceAll(')', '');
    } else {
      url = url.replaceAll('fypage', cateObj.pg);
    }
  }

  MY_URL = url;
  p = p.trim();
  const MY_CATE = cateObj.tid;

  if (p.startsWith('js:')) {
    var MY_FL = cateObj.extend;
    const TYPE = 'cate';
    var input = MY_URL;
    const MY_PAGE = cateObj.pg;
    var desc = '';
    [MY_FL, TYPE, input, MY_PAGE, desc].map((item) => {
      item.length;
    }); // 防止tree-shake
    eval(p.trim().replace('js:', ''));
    d = VODS;
  } else {
    p = p.split(';');
    if (p.length < 5) return '{}';
    const _ps = parseTags.getParse(p[0]);
    _pdfa = _ps.pdfa;
    _pdfh = _ps.pdfh;
    _pd = _ps.pd;
    const is_json = p[0].startsWith('json:');
    p[0] = p[0].replace(/^(jsp:|json:|jq:)/, '');

    try {
      let html: any = getHtml(MY_URL);
      if (html) {
        if (is_json) html = dealJson(html);
        let list = _pdfa(html, p[0]);
        list.forEach((it) => {
          let links = p[4].split('+').map((p4) => {
            return !rule['detailUrl'] ? _pd(it, p4, MY_URL) : _pdfh(it, p4);
          });

          let link = links.join('$');
          let vod_id = rule['detailUrl'] ? MY_CATE + '$' + link : link;

          let vod_name = _pdfh(it, p[1]).replace(/\n|\t/g, '').trim();
          let vod_pic = _pd(it, p[2], MY_URL);

          if (rule['二级'] === '*') vod_id += `@@${vod_name}@@${vod_pic}`;

          d.push({
            vod_id,
            vod_name,
            vod_pic,
            vod_remarks: _pdfh(it, p[3]).replace(/\n|\t/g, '').trim(),
          });
        });
      }
    } catch (e) {
      // @ts-ignore
      console.log(e.message);
    }
  }

  if (rule['图片替换']) {
    if (rule['图片替换'].startsWith('js:')) {
      d.forEach((it) => {
        try {
          var input = it.vod_pic;
          eval(rule['图片替换'].trim().replace('js:', ''));
          it.vod_pic = input;
        } catch (e) {
          // @ts-ignore
          log(`图片:${it.vod_pic}替换错误:${e.message}`);
        }
      });
    } else if (rule['图片替换'].includes('=>')) {
      let replace_from = rule['图片替换'].split('=>')[0];
      let replace_to = rule['图片替换'].split('=>')[1];
      d.forEach((it) => {
        if (it.vod_pic && it.vod_pic.startsWith('http')) {
          it.vod_pic = it.vod_pic.replace(replace_from, replace_to);
        }
      });
    }
  }

  if (rule['图片来源']) {
    d.filter((it) => it['vod_pic'] && it['vod_pic'].startsWith('http')).forEach((it) => {
      it['vod_pic'] += rule['图片来源'];
    });
  }

  let pagecount = 0;
  if (rule['pagecount'] && typeof rule['pagecount'] === 'object' && rule['pagecount'].hasOwnProperty(MY_CATE)) {
    pagecount = parseInt(rule['pagecount'][MY_CATE]);
  }

  const nodata = {
    list: [
      {
        vod_name: '无数据,防无限请求',
        vod_id: 'no_data',
        vod_remarks: '不要点,会崩的',
        vod_pic: 'https://ghproxy.net/https://raw.githubusercontent.com/hjdhnx/dr_py/main/404.jpg',
      },
    ],
    total: 1,
    pagecount: 1,
    page: 1,
    limit: 1,
  };

  const vod =
    d.length < 1
      ? nodata
      : {
          page: parseInt(cateObj.pg),
          pagecount: pagecount || 999,
          limit: 20,
          total: 999,
          list: d,
        };

  return vod;
};

/**
 * 搜索列表数据解析
 * @param searchObj
 * @returns {string}
 */
const searchParse = (searchObj) => {
  if (!searchObj.searchUrl) return '{}';

  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
  let d: any = [];
  let p = searchObj['搜索'] === '*' && rule['一级'] ? rule['一级'] : searchObj['搜索'];

  if (!p || typeof p !== 'string') return '{}';

  p = p.trim();
  let pp = rule['一级'] ? rule['一级'].split(';') : [];
  let url = searchObj.searchUrl.replaceAll('**', searchObj.wd);

  if (searchObj.pg === 1 && url.includes('[') && url.includes(']') && !url.includes('#')) {
    url = url.split('[')[1].split(']')[0];
  } else if (searchObj.pg > 1 && url.includes('[') && url.includes(']') && !url.includes('#')) {
    url = url.split('[')[0];
  }

  if (/fypage/.test(url)) {
    if (url.includes('(') && url.includes(')')) {
      let url_rep = url.match(/.*?\((.*)\)/)[1];
      let cnt_page = url_rep.replaceAll('fypage', searchObj.pg);
      let cnt_pg = eval(cnt_page);
      url = url.replaceAll(url_rep, cnt_pg).replaceAll('(', '').replaceAll(')', '');
    } else {
      url = url.replaceAll('fypage', searchObj.pg);
    }
  }

  MY_URL = url;
  console.log(MY_URL);
  if (p.startsWith('js:')) {
    const TYPE = 'search';
    const MY_PAGE = searchObj.pg;
    const KEY = searchObj.wd;
    var input = MY_URL;
    var detailUrl = rule['detailUrl'] || '';
    [TYPE, MY_PAGE, KEY, input, detailUrl].map((item) => {
      item.length;
    }); // 防止tree-shake
    eval(p.trim().replace('js:', ''));
    d = VODS;
  } else {
    p = p.split(';');

    if (p.length < 5) return '{}';

    let p0 = getPP(p, 0, pp, 0);
    let _ps = parseTags.getParse(p0);
    _pdfa = _ps.pdfa;
    _pdfh = _ps.pdfh;
    _pd = _ps.pd;
    let is_json = p0.startsWith('json:');
    p0 = p0.replace(/^(jsp:|json:|jq:)/, '');

    try {
      let req_method = MY_URL.split(';').length > 1 ? MY_URL.split(';')[1].toLowerCase() : 'get';
      let html;

      if (req_method === 'post' || req_method === 'postjson') {
        let rurls = MY_URL.split(';')[0].split('#');
        let rurl = rurls[0];
        let params = rurls.length > 1 ? rurls[1] : '';

        if (req_method === 'postjson') {
          try {
            params = JSON.parse(params);
          } catch (e) {
            params = '{}';
          }
        }

        let _fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
        let postData = { body: params };
        Object.assign(_fetch_params, postData);
        html = post(rurl, _fetch_params);
      } else {
        html = getHtml(MY_URL);
      }

      if (html) {
        if (/系统安全验证|输入验证码/.test(html)) {
          let cookie = verifyCode(MY_URL);
          if (cookie) {
            console.log(`[t3][search]本次成功过验证, cookie:${cookie}`);
            setItem(RULE_CK, cookie);
          } else {
            console.log(`[t3][search]本次自动过搜索验证失败, cookie:${cookie}`);
          }
          html = getHtml(MY_URL);
        }

        if (!html.includes(searchObj.wd)) {
          console.log(`[t3][search]疑似搜索失败, 结果未包含关键字, 源数据:${html}`);
        }

        if (is_json) html = dealJson(html);

        let list = _pdfa(html, p0);
        let p1 = getPP(p, 1, pp, 1);
        let p2 = getPP(p, 2, pp, 2);
        let p3 = getPP(p, 3, pp, 3);
        let p4 = getPP(p, 4, pp, 4);
        let p5 = getPP(p, 5, pp, 5);

        list.forEach((it) => {
          let links = p4.split('+').map((_p4) => {
            return !rule['detailUrl'] ? _pd(it, _p4, MY_URL) : _pdfh(it, _p4);
          });
          let link = links.join('$');
          let content = p.length > 5 && p[5] ? _pdfh(it, p5) : '';
          let vod_id = link;
          let vod_name = _pdfh(it, p1).replace(/\n|\t/g, '').trim();
          let vod_pic = _pd(it, p2, MY_URL);

          if (rule['二'] === '*') vod_id += `@@${vod_name}@@${vod_pic}`;

          const ob = {
            vod_id: vod_id,
            vod_name: vod_name,
            vod_pic: vod_pic,
            vod_remarks: _pdfh(it, p3).replace(/\n|\t/g, '').trim(),
            vod_content: content.replace(/\n|\t/g, '').trim(),
          };
          d.push(ob);
        });
      }
    } catch (e) {
      // @ts-ignore
      console.log(`[t3][search]错误:${e.message}`);
      return '{}';
    }
  }

  if (rule['图片替换']) {
    if (rule['图片替换'].startsWith('js:')) {
      d.forEach((it) => {
        try {
          var input = it.vod_pic;
          eval(rule['图片替换'].trim().replace('js:', ''));
          it.vod_pic = input;
        } catch (e) {
          // @ts-ignore
          log(`图片:${it.vod_pic}替换错误:${e.message}`);
        }
      });
    } else if (rule['图片替换'].includes('=>')) {
      let replace_from = rule['图片替换'].split('=>')[0];
      let replace_to = rule['图片替换'].split('=>')[1];
      d.forEach((it) => {
        if (it.vod_pic && it.vod_pic.startsWith('http')) {
          it.vod_pic = it.vod_pic.replace(replace_from, replace_to);
        }
      });
    }
  }

  if (rule['图片来源']) {
    // @ts-ignore
    d.filter((it) => it['vod_pic'] && it['vod_pic'].startsWith('http')).forEach((it) => {
      // @ts-ignore
      it['vod_pic'] += rule['图片来源'];
    });
  }

  return {
    page: parseInt(searchObj.pg),
    pagecount: 10,
    limit: 20,
    total: 100,
    list: d,
  };
};

/**
 * 二级详情页数据解析
 * @param detailObj
 * @returns {string}
 */
const detailParse = (detailObj) => {
  let t1 = Date.now();
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
  let orId = detailObj.orId;
  let vod_name = '片名';
  let vod_pic = '';
  let vod_id = orId;
  if (rule['二级'] === '*') {
    let extra = orId.split('@@');
    vod_name = extra.length > 1 ? extra[1] : vod_name;
    vod_pic = extra.length > 2 ? extra[2] : vod_pic;
  }

  let vod = {
    vod_id: vod_id,
    vod_name: vod_name,
    vod_pic: vod_pic,
    type_name: '类型',
    vod_year: '年份',
    vod_area: '地区',
    vod_remarks: '更新信息',
    vod_actor: '主演',
    vod_director: '导演',
    vod_content: '简介',
  };
  let p = detailObj.二级;
  let url = detailObj.url;
  let detailUrl = detailObj.detailUrl;
  let fyclass = detailObj.fyclass;
  [fyclass].map((item) => {
    item.length;
  }); // 防止tree-shake
  let tab_exclude = detailObj.tab_exclude;
  let html = detailObj.html || '';
  MY_URL = url;
  if (detailObj.二级访问前) {
    try {
      console.log(`[t3]尝试在二级访问前执行代码:${detailObj.二级访问前}`);
      eval(detailObj.二级访问前.trim().replace('js:', ''));
    } catch (e) {
      // @ts-ignore
      console.log(`[t3]二级访问前执行代码出现错误:${e.message}`);
    }
  }

  if (p === '*') {
    vod['vod_play_from'] = '道长在线';
    vod['vod_remarks'] = detailUrl;
    vod['vod_actor'] = '没有二级,只有一级链接直接嗅探播放';
    vod['vod_content'] = MY_URL;
    vod['vod_play_url'] = '嗅探播放$' + MY_URL.split('@@')[0];
  } else if (typeof p === 'string' && p.trim().startsWith('js:')) {
    const TYPE = 'detail';
    var input = MY_URL;
    var play_url = '';
    [TYPE, input, play_url].map((item) => {
      item.length;
    }); // 防止tree-shake
    eval(p.trim().replace('js:', ''));
    vod = VOD;
  } else if (p && typeof p === 'object') {
    let tt1 = Date.now();
    if (!html) html = getHtml(MY_URL);
    console.log(`[t3]二级${MY_URL}仅获取源码耗时:${Date.now() - tt1}毫秒`);
    let _ps;
    if (p.is_json) {
      console.log('[t3]二级是json');
      _ps = parseTags.json;
      html = dealJson(html);
    } else if (p.is_jsp) {
      console.log('[t3]二级是jsp');
      _ps = parseTags.jsp;
    } else if (p.is_jq) {
      console.log('[t3]二级是jq');
      _ps = parseTags.jq;
    } else {
      console.log('[t3]二级默认jq');
      _ps = parseTags.jq;
    }
    let tt2 = Date.now();
    console.log(`[t3]二级${MY_URL}获取并装载源码耗时:${tt2 - tt1}毫秒`);
    _pdfa = _ps.pdfa;
    _pdfh = _ps.pdfh;
    _pd = _ps.pd;
    if (p.title) {
      let p1 = p.title.split(';');
      vod.vod_name = _pdfh(html, p1[0]).replace(/\n|\t/g, '').trim();
      let type_name = p1.length > 1 ? _pdfh(html, p1[1]).replace(/\n|\t/g, '').replace(/ /g, '').trim() : '';
      vod.type_name = type_name || vod.type_name;
    }
    if (p.desc) {
      try {
        let p1 = p.desc.split(';');
        vod.vod_remarks = _pdfh(html, p1[0]).replace(/\n|\t/g, '').trim();
        vod.vod_year = p1.length > 1 ? _pdfh(html, p1[1]).replace(/\n|\t/g, '').trim() : '';
        vod.vod_area = p1.length > 2 ? _pdfh(html, p1[2]).replace(/\n|\t/g, '').trim() : '';
        vod.vod_actor = p1.length > 3 ? _pdfh(html, p1[3]).replace(/\n|\t/g, '').trim() : '';
        vod.vod_director = p1.length > 4 ? _pdfh(html, p1[4]).replace(/\n|\t/g, '').trim() : '';
      } catch (e) {}
    }
    if (p.content) {
      try {
        let p1 = p.content.split(';');
        vod.vod_content = _pdfh(html, p1[0]).replace(/\n|\t/g, '').trim();
      } catch (e) {}
    }
    if (p.img) {
      try {
        let p1 = p.img.split(';');
        vod.vod_pic = _pd(html, p1[0], MY_URL);
      } catch (e) {}
    }

    let vod_play_from = '$$$';
    let playFrom: any = [];
    if (p['重定向'] && p['重定向'].startsWith('js:')) {
      console.log('开始执行重定向代码:' + p.重定向);
      html = eval(p['重定向'].replace('js:', ''));
    }

    if (p.tabs) {
      if (p.tabs.startsWith('js:')) {
        console.log('[t3]开始执行tabs代码:' + p.tabs);
        var input = MY_URL;
        eval(p.tabs.replace('js:', ''));
        playFrom = TABS;
      } else {
        let p_tab = p.tabs.split(';')[0];
        let vHeader = _pdfa(html, p_tab);
        let tab_text = p.tab_text || 'body&&Text';
        let new_map = {};
        for (let v of vHeader) {
          let v_title = _pdfh(v, tab_text).trim();
          if (!v_title) {
            v_title = '线路空';
          }
          if (tab_exclude && new RegExp(tab_exclude).test(v_title)) {
            continue;
          }
          if (!new_map.hasOwnProperty(v_title)) {
            new_map[v_title] = 1;
          } else {
            new_map[v_title] += 1;
          }
          if (new_map[v_title] > 1) {
            v_title += Number(new_map[v_title] - 1);
          }
          playFrom.push(v_title);
        }
      }
    } else {
      playFrom = ['道长在线'];
    }
    vod['vod_play_from'] = playFrom.join(vod_play_from);

    let vod_play_url = '$$$';
    let vod_tab_list: any = [];
    if (p.lists) {
      if (p.lists.startsWith('js:')) {
        print('开始执行lists代码:' + p.lists);
        try {
          var input = MY_URL;
          var play_url = '';
          eval(p.lists.replace('js:', ''));
          for (let i in LISTS) {
            if (LISTS.hasOwnProperty(i)) {
              try {
                LISTS[i] = LISTS[i].map((it) => it.split('$').slice(0, 2).join('$'));
              } catch (e) {
                // @ts-ignore
                console.log(`格式化LISTS发生错误:${e.message}`);
              }
            }
          }
          vod_play_url = LISTS.map((it) => it.join('#')).join(vod_play_url);
        } catch (e) {
          // @ts-ignore
          console.log(`js执行lists: 发生错误:${e.message}`);
        }
      } else {
        let list_text = p.list_text || 'body&&Text';
        let list_url = p.list_url || 'a&&href';
        let list_url_prefix = p.list_url_prefix || '';
        let is_tab_js = p.tabs.trim().startsWith('js:');
        for (let i = 0; i < playFrom.length; i++) {
          let tab_name = playFrom[i];
          let tab_ext = p.tabs.split(';').length > 1 && !is_tab_js ? p.tabs.split(';')[1] : '';
          let p1 = p.lists.replaceAll('#idv', tab_name).replaceAll('#id', i);
          tab_ext = tab_ext.replaceAll('#idv', tab_name).replaceAll('#id', i);
          let tabName = tab_ext ? _pdfh(html, tab_ext) : tab_name;
          [tabName].map((item) => {
            item.length;
          }); // 防止tree-shake
          let new_vod_list: any = [];
          let tt1 = Date.now();
          // @ts-ignore
          if (typeof pdfl === 'function') {
            // @ts-ignore
            new_vod_list = pdfl(html, p1, list_text, list_url, MY_URL);
            if (list_url_prefix) {
              new_vod_list = new_vod_list.map(
                (it) => it.split('$')[0] + '$' + list_url_prefix + it.split('$').slice(1).join('$'),
              );
            }
          } else {
            let vodList = [];
            try {
              vodList = _pdfa(html, p1);
            } catch (e) {}
            for (let i = 0; i < vodList.length; i++) {
              let it = vodList[i];
              new_vod_list.push(_pdfh(it, list_text).trim() + '$' + list_url_prefix + _pd(it, list_url, MY_URL));
            }
          }
          if (new_vod_list.length > 0) {
            new_vod_list = forceOrder(new_vod_list, '', (x) => x.split('$')[0]);
            console.log(`[t3]drpy影响性能代码共计列表数循环次数:${new_vod_list.length},耗时:${Date.now() - tt1}毫秒`);
          }
          let vlist = new_vod_list.join('#');
          vod_tab_list.push(vlist);
        }
        vod_play_url = vod_tab_list.join(vod_play_url);
      }
    }
    vod['vod_play_url'] = vod_play_url;
  }
  if (rule['图片替换'] && rule['图片替换'].includes('=>')) {
    const [replace_from, replace_to] = rule['图片替换'].split('=>');
    vod.vod_pic = vod.vod_pic.replace(replace_from, replace_to);
  }
  if (rule['图片来源'] && vod.vod_pic && vod.vod_pic.startsWith('http')) {
    vod.vod_pic = vod.vod_pic + rule['图片来源'];
  }
  if (!vod.vod_id || (vod_id.includes('$') && vod.vod_id !== vod_id)) {
    vod.vod_id = vod_id;
  }
  let t2 = Date.now();
  console.log(`[t3]加载二级界面${MY_URL}耗时:${t2 - t1}毫秒`);
  try {
    vod = vodDeal(vod);
  } catch (err) {
    console.log(`[t3]vodDeal发生错误:${err}`);
  }

  return {
    list: [vod],
  };
};

/**
 * 获取二级待返回的播放线路没处理时的索引关系
 * @param vod
 * @returns {{}}
 */
const get_tab_index = (vod) => {
  const obj = {};
  vod.vod_play_from.split('$$$').forEach((it, index) => {
    obj[it] = index;
  });
  return obj;
};

/**
 * 处理待返回的vod数据|线路去除,排序,重命名
 * @param vod
 * @returns {*}
 */
const vodDeal = (vod) => {
  let vod_play_from = vod.vod_play_from.split('$$$');
  let vod_play_url = vod.vod_play_url.split('$$$');

  // 移除指定线路后的列表
  let tab_removed_list = vod_play_from;
  // 排序后的线路列表
  let tab_ordered_list = vod_play_from;
  // 线路重命名后的列表
  let tab_renamed_list = vod_play_from;
  // 定义实际要返回线路
  let tab_list = vod_play_from;
  // 选集列表根据线路排序
  let play_ordered_list = vod_play_url;

  // 判断有移除线路或者线路排序
  if (rule['tab_remove']?.length > 0 || rule['tab_order']?.length > 0) {
    // 获取原来线路的索引下标
    let tab_index_dict = get_tab_index(vod);

    if (rule['tab_remove']?.length > 0) {
      tab_removed_list = vod_play_from.filter((it) => !rule['tab_remove'].includes(it));
      tab_list = tab_removed_list;
    }

    if (rule['tab_order']?.length > 0) {
      let tab_order = rule['tab_order'];
      tab_ordered_list = tab_removed_list.sort((a, b) => {
        return (
          (tab_order.indexOf(a) === -1 ? 9999 : tab_order.indexOf(a)) -
          (tab_order.indexOf(b) === -1 ? 9999 : tab_order.indexOf(b))
        );
      });
      tab_list = tab_ordered_list;
    }
    play_ordered_list = tab_list.map((it) => vod_play_url[tab_index_dict[it]]);
  }

  if (rule['tab_rename'] && typeof rule['tab_rename'] === 'object' && Object.keys(rule['tab_rename']).length > 0) {
    tab_renamed_list = tab_list.map((it) => rule['tab_rename'][it] || it);
    tab_list = tab_renamed_list;
  }
  vod.vod_play_from = tab_list.join('$$$');
  vod.vod_play_url = play_ordered_list.join('$$$');
  return vod;
};

/**
 * 判断是否需要解析
 * @param url
 * @returns {number|number}
 */
const tellIsJx = (url: string) => {
  try {
    const is_vip = !/\.(m3u8|mp4|m4a)$/.test(url.split('?')[0]) && isGenuine(url);
    return is_vip ? 1 : 0;
  } catch (e) {
    // @ts-ignore
    console.info(`Error in tellIsJx:${e.message}`);
    return 1;
  }
};

/**
 * 选集播放点击事件解析
 * @param playObj
 * @returns {string}
 */
const playParse = (playObj) => {
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
  MY_URL = playObj.url;
  var MY_FLAG = playObj.flag;
  if (!/http/.test(MY_URL)) {
    try {
      MY_URL = base64Decode(MY_URL);
    } catch (e) {}
  }
  MY_URL = decodeURIComponent(MY_URL);
  var input = MY_URL; // 注入给免嗅js
  var flag = MY_FLAG; // 注入播放线路名称给免嗅js

  const common_play = {
    parse: SPECIAL_URL.test(input) || /^(push:)/.test(input) ? 0 : 1,
    url: input,
    flag: flag,
    jx: tellIsJx(input),
  };

  let lazy_play = common_play;
  if (rule['play_parse'] && rule['lazy'] && typeof rule['lazy'] === 'string') {
    try {
      let lazy_code = rule['lazy'].trim();
      if (lazy_code.startsWith('js:')) {
        lazy_code = lazy_code.replace('js:', '').trim();
      }
      console.log('开始执行js免嗅=>' + lazy_code);
      eval(lazy_code);
      lazy_play =
        typeof input === 'object'
          ? input
          : {
              parse: SPECIAL_URL.test(input) || /^(push:)/.test(input) ? 0 : 1,
              jx: tellIsJx(input),
              url: input,
            };
    } catch (e) {
      // @ts-ignore
      console.log(`js免嗅错误:${e.message}`);
    }
  }
  // print('play_json:'+typeof(rule.play_json));
  // console.log(Array.isArray(rule.play_json));
  if (Array.isArray(rule['play_json']) && rule['play_json'].length > 0) {
    // 数组情况判断长度大于0
    const web_url = lazy_play.url;
    for (const pjson of rule['play_json']) {
      if (pjson.re && (pjson.re === '*' || web_url.match(new RegExp(pjson.re)))) {
        if (pjson.json && typeof pjson.json === 'object') {
          lazy_play = Object.assign(lazy_play, pjson.json);
          break;
        }
      }
    }
  } else if (rule['play_json'] && !Array.isArray(rule['play_json'])) {
    // 其他情况 非[] 判断true/false
    lazy_play = Object.assign(lazy_play, { jx: 1 });
  } else if (!rule['play_json']) {
    // 不解析传0
    lazy_play = Object.assign(lazy_play, { jx: 0 });
  }

  console.log(JSON.stringify(lazy_play));
  return lazy_play;
};

/**
 * 本地代理解析规则
 * @param params
 */
const proxyParse = (proxyObj) => {
  var input = proxyObj.params;

  if (proxyObj.proxy_rule) {
    console.log(`[t3][proxy][proxyParse]准备执行本地代理规则:${proxyObj.proxy_rule}`);

    try {
      eval(proxyObj.proxy_rule);

      if (input && input !== proxyObj.params && Array.isArray(input) && input.length >= 3) {
        return input;
      } else {
        return [404, 'text/plain', 'Not Found'];
      }
    } catch (err) {
      return [500, 'text/plain', `代理规则错误:${err}`];
    }
  } else {
    return [404, 'text/plain', 'Not Found'];
  }
};

/**
 * 辅助嗅探解析规则
 * @param isVideoObj
 * @returns {boolean}
 */
const isVideoParse = (isVideoObj) => {
  var input = isVideoObj.url;

  if (!isVideoObj.t) {
    // t为假代表默认传的正则字符串
    const re_matcher = new RegExp(isVideoObj.isVideo, 'i'); // /g匹配多个,/i不区分大小写,/m匹配多行
    return re_matcher.test(input);
  } else {
    try {
      eval(isVideoObj.isVideo);
      return typeof input === 'boolean' ? input : false;
    } catch (e) {
      // @ts-ignore
      console.log(`执行嗅探规则发生错误:${e.message}`);
      return false;
    }
  }
};

/**
 * 获取加密前的原始的js源文本
 * @param js_code
 */
function getOriginalJs(js_code) {
  let current_match = /var rule|[\u4E00-\u9FA5]+|function|let |var |const |\(|\)|"|'/;
  if (current_match.test(js_code)) {
    return js_code;
  }
  let decode_content = '';

  function aes_decrypt(data) {
    const key = CryptoJS.enc.Hex.parse(aes_key.key);
    const iv = CryptoJS.enc.Hex.parse(aes_key.iv);

    let encrypted = CryptoJS.AES.decrypt(
      {
        ciphertext: CryptoJS.enc.Base64.parse(data),
      },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    ).toString(CryptoJS.enc.Utf8);

    return encrypted;
  }

  let error_log = true;

  function logger(text) {
    if (error_log) {
      log(text);
    }
  }

  let decode_funcs = [
    (text) => {
      try {
        return ungzip(text);
      } catch (e) {
        logger('非gzip加密');
        return '';
      }
    },
    (text) => {
      try {
        return base64Decode(text);
      } catch (e) {
        logger('非b64加密');
        return '';
      }
    },
    (text) => {
      try {
        return aes_decrypt(text);
      } catch (e) {
        logger('非aes加密');
        return '';
      }
    },
    (text) => {
      try {
        return RSA.decode(text, rsa_private_key, null);
      } catch (e) {
        logger('非rsa加密');
        return '';
      }
    },
  ];
  let func_index = 0;
  while (!current_match.test(decode_content)) {
    decode_content = decode_funcs[func_index](js_code);
    func_index++;
    if (func_index >= decode_funcs.length) {
      break;
    }
  }
  return decode_content;
}

function encryptJs(js_code: string, type: string | null = null) {
  const encode_dict = {
    gzip: 'gzip',
    base64: 'base64',
    rsa: 'rsa',
    aes: 'aes',
  };

  function getRandomKey(dict) {
    const keys = Object.keys(dict);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  let encode_method = type ? type : getRandomKey(encode_dict);

  let decode_txt = '';
  switch (encode_method) {
    case 'gzip':
      decode_txt = gzip(js_code);
      break;
    case 'base64':
      decode_txt = base64Encode(js_code);
      break;
    case 'rsa':
      decode_txt = RSA.encode(js_code, rsa_private_key);
      break;
    case 'aes':
      function aes_encrypt(data) {
        const key = CryptoJS.enc.Hex.parse(aes_key.key);
        const iv = CryptoJS.enc.Hex.parse(aes_key.iv);

        const ciphertext = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();

        return ciphertext;
      }
      decode_txt = aes_encrypt(js_code);
      break;
  }

  return decode_txt;
}

/**
 * 执行main函数
 * 示例  function main(text){return gzip(text)}
 * @param main_func_code
 * @param arg
 */
function runMain(main_func_code, arg) {
  // @ts-ignore
  let mainFunc = function (arg) {
    return '';
  };
  try {
    eval(main_func_code + '\nmainFunc=main;');
    return mainFunc(arg);
  } catch (e) {
    // @ts-ignore
    log(`执行main_funct发生了错误:${e.message}`);
    return '';
  }
}

// @ts-ignore
/**
 * js源预处理特定返回对象中的函数
 * @param ext
 */
const init = (ext: string | object) => {
  console.log('[t3]init');
  // init前重置rule和fetch_params
  rule = {};
  rule_fetch_params = {};
  fetch_params = null;
  try {
    let muban = getMubans();
    if (typeof ext == 'object') rule = ext;
    else if (typeof ext == 'string') {
      if (ext.startsWith('http') || ext.startsWith('file://')) {
        let query = getQuery(ext); // 获取链接传参
        let js: any = request(ext, { method: 'GET' });
        if (js) {
          js = getOriginalJs(js);
          // eval(js.replace('var rule', 'rule'));
          // eval("(function(){'use strict';"+js.replace('var rule', 'rule')+"})()");
          eval('(function(){' + js.replace('var rule', 'rule') + '})()');
        }
        if (query['type'] === 'url' && query['params']) {
          // 指定type是链接并且传了params支持简写如 ./xx.json
          rule['params'] = urljoin(ext, query['params']);
        } else if (query['params']) {
          // 没指定type直接视为字符串
          rule['params'] = query['params'];
        }
      } else {
        ext = getOriginalJs(ext);
        // eval(ext.replace('var rule', 'rule'));
        // eval("(function(){'use strict';"+ext.replace('var rule', 'rule')+"})()");
        // @ts-ignore
        eval('(function(){' + ext.replace('var rule', 'rule') + '})()');
      }
    } else {
      console.log(`规则加载失败,不支持的规则类型:${typeof ext}`);
      return;
    }
    rule['host'] = (rule['host'] || '').rstrip('/');
    HOST = rule['host'];
    if (rule['hostJs']) {
      console.log(`[t3][publish]检测到hostJs,准备执行...`);
      try {
        eval(rule['hostJs']);
        rule['host'] = HOST.rstrip('/');
        console.log(`[t3][publish]最新域名为${rule['host']}`);
      } catch (e) {
        // @ts-ignore
        console.log(`[t3][publish]执行${rule['hostJs']}获取host发生错误:${e.message}`);
      }
    }
    if (rule['模板'] === '自动') {
      try {
        let host_headers = rule['headers'] || {};
        let host_html = getCode(HOST, { headers: host_headers });
        let match_muban = '';
        let muban_keys = Object.keys(muban).filter((it) => !/默认|短视2|采集1/.test(it));
        for (let muban_key of muban_keys) {
          try {
            let host_data = home({}, host_html, muban[muban_key].class_parse);
            if (host_data.class && host_data.class.length > 0) {
              match_muban = muban_key;
              console.log(`自动匹配模板:【${muban_key}】`);
              break;
            }
          } catch (e) {
            // @ts-ignore
            console.log(`自动匹配模板:【${muban_key}】错误:${e.message}`);
          }
        }
        if (match_muban) {
          muban['自动'] = muban[match_muban];
          if (rule['模板修改'] && rule['模板修改'].startsWith('js:')) {
            // 模板修改:$js.toString(()=>{ muban.自动.class_parse = ''});
            eval(rule['模板修改'].replace('js:', '').trim());
          }
        } else {
          delete rule['模板'];
        }
      } catch (e) {
        delete rule['模板'];
      }
    }
    if (rule['模板'] && muban.hasOwnProperty(rule['模板'])) {
      console.log(`继承模板:${rule['模板']}`);
      rule = Object.assign(muban[rule['模板']], rule);
    }
    /** 处理一下 rule规则关键字段没传递的情况 **/
    let rule_cate_excludes = (rule['cate_exclude'] || '').split('|').filter((it) => it.trim());
    let rule_tab_excludes = (rule['tab_exclude'] || '').split('|').filter((it) => it.trim());
    rule_cate_excludes = rule_cate_excludes.concat(CATE_EXCLUDE.split('|').filter((it) => it.trim()));
    rule_tab_excludes = rule_tab_excludes.concat(TAB_EXCLUDE.split('|').filter((it) => it.trim()));

    rule['cate_exclude'] = rule_cate_excludes.join('|');
    rule['tab_exclude'] = rule_tab_excludes.join('|');

    rule['类型'] = rule['类型'] || '影视'; // 影视|听书|漫画|小说
    rule['url'] = rule['url'] || '';
    rule['double'] = rule['double'] || false;
    rule['homeUrl'] = rule['homeUrl'] || '';
    rule['detailUrl'] = rule['detailUrl'] || '';
    rule['searchUrl'] = rule['searchUrl'] || '';
    rule['homeUrl'] =
      rule['host'] && rule['homeUrl'] ? urljoin(rule['host'], rule['homeUrl']) : rule['homeUrl'] || rule['host'];
    rule['homeUrl'] = cheerio.jinja2(rule['homeUrl'], { rule: rule });
    rule['detailUrl'] =
      rule['host'] && rule['detailUrl'] ? urljoin(rule['host'], rule['detailUrl']) : rule['detailUrl'];
    rule['二级访问前'] = rule['二级访问前'] || '';
    if (rule['url'].includes('[') && rule['url'].includes(']')) {
      let u1 = rule['url'].split('[')[0];
      let u2 = rule['url'].split('[')[1].split(']')[0];
      rule['url'] =
        rule['host'] && rule['url'] ? urljoin(rule['host'], u1) + '[' + urljoin(rule['host'], u2) + ']' : rule['url'];
    } else {
      rule['url'] = rule['host'] && rule['url'] ? urljoin(rule['host'], rule['url']) : rule['url'];
    }
    if (rule['searchUrl'].includes('[') && rule['searchUrl'].includes(']') && !rule['searchUrl'].includes('#')) {
      let u1 = rule['searchUrl'].split('[')[0];
      let u2 = rule['searchUrl'].split('[')[1].split(']')[0];
      rule['searchUrl'] =
        rule['host'] && rule['searchUrl']
          ? urljoin(rule['host'], u1) + '[' + urljoin(rule['host'], u2) + ']'
          : rule['searchUrl'];
    } else {
      rule['searchUrl'] =
        rule['host'] && rule['searchUrl'] ? urljoin(rule['host'], rule['searchUrl']) : rule['searchUrl'];
    }

    rule['timeout'] = rule['timeout'] || 5000;
    rule['encoding'] = rule['编码'] || rule['encoding'] || 'utf-8';
    rule['search_encoding'] = rule['搜索编码'] || rule['search_encoding'] || '';
    rule['图片来源'] = rule['图片来源'] || '';
    rule['图片替换'] = rule['图片替换'] || '';
    rule['play_json'] = rule.hasOwnProperty('play_json') ? rule['play_json'] : [];
    rule['pagecount'] = rule.hasOwnProperty('pagecount') ? rule['pagecount'] : {};
    rule['proxy_rule'] = rule.hasOwnProperty('proxy_rule') ? rule['proxy_rule'] : '';
    if (!rule.hasOwnProperty('sniffer')) {
      // 默认关闭辅助嗅探
      rule['sniffer'] = false;
    }
    rule['sniffer'] = rule.hasOwnProperty('sniffer') ? rule['sniffer'] : '';
    rule['sniffer'] = !!(rule['sniffer'] && rule['sniffer'] !== '0' && rule['sniffer'] !== 'false');

    rule['isVideo'] = rule.hasOwnProperty('isVideo') ? rule['isVideo'] : '';
    if (rule['sniffer'] && !rule['isVideo']) {
      // 默认辅助嗅探自动增强嗅探规则
      rule['isVideo'] =
        'http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*|http((?!http).)*?obj/tos*';
    }

    rule['tab_remove'] = rule.hasOwnProperty('tab_remove') ? rule['tab_remove'] : [];
    rule['tab_order'] = rule.hasOwnProperty('tab_order') ? rule['tab_order'] : [];
    rule['tab_rename'] = rule.hasOwnProperty('tab_rename') ? rule['tab_rename'] : {};

    if (rule['headers'] && typeof rule['headers'] === 'object') {
      try {
        let header_keys = Object.keys(rule['headers']);
        for (let k of header_keys) {
          if (k.toLowerCase() === 'user-agent') {
            let v = rule['headers'][k];
            if (['MOBILE_UA', 'PC_UA', 'UC_UA', 'IOS_UA', 'UA'].includes(v)) {
              rule['headers'][k] = eval(v);
            }
          } else if (k.toLowerCase() === 'cookie') {
            let v = rule['headers'][k];
            if (v && v.startsWith('http')) {
              try {
                v = fetch(v);
                rule['headers'][k] = v;
              } catch (e) {
                // @ts-ignore
                console.log(`[t3][init]从${v}获取cookie发生错误:${e.message}`);
              }
            }
          }
        }
      } catch (e) {
        // @ts-ignore
        console.log(`[t3][init]处理headers发生错误:${e.message}`);
      }
    }

    rule_fetch_params = { headers: rule['headers'] || false, timeout: rule['timeout'], encoding: rule['encoding'] };
    oheaders = rule['headers'] || {};
    // @ts-ignore
    RKEY = typeof key !== 'undefined' && key ? key : 'drpy_' + (rule['title'] || rule['host']);
    pre();
    return init_test();
  } catch (e) {
    // @ts-ignore
    console.info(`[t3][init]init_test发生错误:${e.message}`);
    return {
      version: VERSION,
      rkey: RKEY,
      rule: {},
    };
  }
};

let homeHtmlCache: any = undefined;

/**
 * js源获取首页分类和筛选特定返回对象中的函数
 * @param filter 筛选条件字典对象
 * @param home_html 指定了源码。无需内部再请求
 * @param class_parse 自动匹配传入的模板的动态分类
 * @returns {string}
 */
const home = (filter: object = {}, home_html: string = '', class_parse: string = '') => {
  filter = filter || {};
  home_html = home_html || '';
  class_parse = class_parse || '';
  if (typeof rule['filter'] === 'string' && rule['filter'].trim().length > 0) {
    try {
      let filter_json = ungzip(rule['filter'].trim());
      rule['filter'] = JSON.parse(filter_json);
    } catch (e) {
      rule['filter'] = {};
    }
  }

  const homeObj = {
    filter: rule['filter'] || false,
    MY_URL: rule['homeUrl'],
    class_name: rule['class_name'] || '',
    class_url: rule['class_url'] || '',
    class_parse: class_parse || rule['class_parse'] || '',
    cate_exclude: rule['cate_exclude'],
    home_html: home_html,
  };

  console.log('[t3]home');
  return homeParse(homeObj);
};

/**
 * js源获取首页推荐数据列表特定返回对象中的函数
 * @param params
 * @returns {string}
 */
const homeVod = () => {
  const homeVodObj = {
    推荐: rule['推荐'],
    double: rule['double'],
    homeUrl: rule['homeUrl'],
    detailUrl: rule['detailUrl'],
  };

  console.log('[t3]homeVod');
  return homeVodParse(homeVodObj);
};

/**
 * js源获取分类页一级数据列表特定返回对象中的函数
 * @param tid 分类id
 * @param pg 页数
 * @param filter 当前选中的筛选条件
 * @param extend 扩展
 * @returns {string}
 */
const category = (tid, pg, filter, extend) => {
  const cateObj = {
    url: rule['url'],
    一级: rule['一级'],
    tid: `${tid}`,
    pg: parseInt(pg),
    filter: filter,
    extend: extend,
  };

  console.log('[t3]category');
  return categoryParse(cateObj);
};

/**
 * js源获取二级详情页数据特定返回对象中的函数
 * @param vod_url 一级列表中的vod_id或者是带分类的自拼接 vod_id 如 fyclass$vod_id
 * @returns {string}
 */
const detail = (vod_url) => {
  let orId = vod_url;
  let fyclass = '';

  if (vod_url.includes('$')) {
    let tmp = vod_url.split('$');
    fyclass = tmp[0];
    vod_url = tmp[1];
  }

  let detailUrl = vod_url.split('@@')[0];
  let url;

  if (!detailUrl.startsWith('http') && !detailUrl.includes('/')) {
    url = rule['detailUrl'].replaceAll('fyid', detailUrl).replaceAll('fyclass', fyclass);
  } else if (detailUrl.includes('/')) {
    url = urljoin(rule['homeUrl'], detailUrl);
  } else {
    url = detailUrl;
  }

  let detailObj = {
    orId: orId,
    url: url,
    二级: rule['二级'],
    二级访问前: rule['二级访问前'],
    detailUrl: detailUrl,
    fyclass: fyclass,
    tab_exclude: rule['tab_exclude'],
  };

  console.log('[t3]detail');
  return detailParse(detailObj);
};

/**
 * js源选集按钮播放点击事件特定返回对象中的函数
 * @param flag 线路名
 * @param id 播放按钮的链接
 * @param flags 全局配置的flags是否需要解析的标识列表
 * @returns {string}
 */
const play = (flag, id, flags) => {
  const playObj = {
    url: id,
    flag,
    flags,
  };

  console.log('[t3]play');
  return playParse(playObj);
};

/**
 * js源搜索返回的数据列表特定返回对象中的函数
 * @param wd 搜索关键字
 * @param quick 是否来自快速搜索
 * @returns {string}
 */
const search = (wd, quick, pg) => {
  let search_encoding = rule['search_encoding']?.toLowerCase() || rule['encoding']?.toLowerCase();

  if (search_encoding !== 'utf-8') {
    wd = encodeStr(wd, search_encoding);
  }

  const searchObj = {
    searchUrl: rule['searchUrl'],
    搜索: rule['搜索'],
    wd,
    pg: pg || 1,
    quick: quick,
  };

  return searchParse(searchObj);
};

/**
 * js源本地代理返回的数据列表特定返回对象中的函数
 * @param params 代理链接参数比如 /proxy?do=js&url=https://wwww.baidu.com => params就是 {do:'js','url':'https://wwww.baidu.com'}
 * @returns {*}
 */
const proxy = (params) => {
  let proxy_rule = rule['proxy_rule']?.trim() || '';

  if (proxy_rule.startsWith('js:')) {
    proxy_rule = proxy_rule.replace('js:', '');
  }

  const proxyObj = {
    params: params,
    proxy_rule: proxy_rule,
  };

  return proxyParse(proxyObj);
};

/**
 * 是否启用辅助嗅探功能,启用后可以根据isVideo函数进行手动识别为视频的链接地址。默认为false
 * @returns {*|boolean|boolean}
 */
const sniffer = () => {
  const enable_sniffer = rule['sniffer'] || false;

  if (enable_sniffer) {
    console.log('开始执行辅助嗅探代理规则...');
  }

  return enable_sniffer;
};

/**
 * 启用辅助嗅探功能后根据次函数返回的值识别地址是否为视频
 * @param url
 * @returns {boolean}
 */
const isVideo = (url: string) => {
  let t = 0;
  let is_video = rule['isVideo']?.trim();

  if (is_video?.startsWith('js:')) {
    is_video = is_video.replace('js:', '');
    t = 1;
  }

  const isVideoObj = {
    url: url,
    isVideo: is_video,
    t: t,
  };

  const result = isVideoParse(isVideoObj);

  if (result) {
    console.log(`成功执行辅助嗅探规则并检测到视频地址:\n${rule['isVideo']}`);
  }
  return result;
};

/**
 * 获取规则
 * @returns {{}}
 */
function getRule(key) {
  return key ? rule[key] || '' : rule;
}

// [重要]防止树摇
const keepUnUse = {
  useful: (): void => {
    const _ = {
      batchFetch,
      UA,
      UC_UA,
      IOS_UA, // UA
      pdfa,
      pdfh,
      pd, // html parser
      log,
      oheaders, // global parms
      NOADD_INDEX,
      URLJOIN_ATTR,
      SELECT_REGEX,
      SELECT_REGEX_A, // REGEX
      urlDeal,
      setResult2,
      setHomeResult,
      rc,
      maoss,
      getProxyUrl,
      urljoin2,
      urlencode,
      encodeUrl,
      stringify,
      jsp,
      jq,
      buildUrl,
      $require,
      proxy,
      sniffer,
      isVideo,
      getRule,
      runMain,
      gzip,
      readFile,
      fixAdM3u8,
      fixAdM3u8Ai, // ad
      base64Encode,
      NODERSA,
      md5,
      decodeStr,
      RSA, // encryption and decryption
      clearItem, // cache
      $js, // $工具
      ocr_demo_test, // ocr测试
      rsa_demo_test, // rsa测试
      reqCookie, // cookie获取
      JSON5, // json5.js的库
    };
    let temp = _;
    temp.stringify({});
  },
};

export {
  category,
  clearConsoleHistory,
  detail,
  encryptJs,
  getConsoleHistory,
  getOriginalJs,
  getRule,
  home,
  homeVod,
  init,
  keepUnUse,
  play,
  proxy,
  runMain,
  search,
};
