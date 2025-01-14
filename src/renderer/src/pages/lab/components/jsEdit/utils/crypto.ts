import pako from 'pako';
import WxmpRsa from 'wxmp-rsa';
import CryptoJS from 'crypto-js';

function rsaDecode(text) {
  const key =
    'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqin/jUpqM6+fgYP/oMqj9zcdHMM0mEZXLeTyixIJWP53lzJV2N2E3OP6BBpUmq2O1a9aLnTIbADBaTulTNiOnVGoNG58umBnupnbmmF8iARbDp2mTzdMMeEgLdrfXS6Y3VvazKYALP8EhEQykQVarexR78vRq7ltY3quXx7cgI0ROfZz5Sw3UOLQJ+VoWmwIxu9AMEZLVzFDQN93hzuzs3tNyHK6xspBGB7zGbwCg+TKi0JeqPDrXxYUpAz1cQ/MO+Da0WgvkXnvrry8NQROHejdLVOAslgr6vYthH9bKbsGyNY3H+P12kcxo9RAcVveONnZbcMyxjtF5dWblaernAgMBAAECggEAGdEHlSEPFmAr5PKqKrtoi6tYDHXdyHKHC5tZy4YV+Pp+a6gxxAiUJejx1hRqBcWSPYeKne35BM9dgn5JofgjI5SKzVsuGL6bxl3ayAOu+xXRHWM9f0t8NHoM5fdd0zC3g88dX3fb01geY2QSVtcxSJpEOpNH3twgZe6naT2pgiq1S4okpkpldJPo5GYWGKMCHSLnKGyhwS76gF8bTPLoay9Jxk70uv6BDUMlA4ICENjmsYtd3oirWwLwYMEJbSFMlyJvB7hjOjR/4RpT4FPnlSsIpuRtkCYXD4jdhxGlvpXREw97UF2wwnEUnfgiZJ2FT/MWmvGGoaV/CfboLsLZuQKBgQDTNZdJrs8dbijynHZuuRwvXvwC03GDpEJO6c1tbZ1s9wjRyOZjBbQFRjDgFeWs9/T1aNBLUrgsQL9c9nzgUziXjr1Nmu52I0Mwxi13Km/q3mT+aQfdgNdu6ojsI5apQQHnN/9yMhF6sNHg63YOpH+b+1bGRCtr1XubuLlumKKscwKBgQDOtQ2lQjMtwsqJmyiyRLiUOChtvQ5XI7B2mhKCGi8kZ+WEAbNQcmThPesVzW+puER6D4Ar4hgsh9gCeuTaOzbRfZ+RLn3Aksu2WJEzfs6UrGvm6DU1INn0z/tPYRAwPX7sxoZZGxqML/z+/yQdf2DREoPdClcDa2Lmf1KpHdB+vQKBgBXFCVHz7a8n4pqXG/HvrIMJdEpKRwH9lUQS/zSPPtGzaLpOzchZFyQQBwuh1imM6Te+VPHeldMh3VeUpGxux39/m+160adlnRBS7O7CdgSsZZZ/dusS06HAFNraFDZf1/VgJTk9BeYygX+AZYu+0tReBKSs9BjKSVJUqPBIVUQXAoGBAJcZ7J6oVMcXxHxwqoAeEhtvLcaCU9BJK36XQ/5M67ceJ72mjJC6/plUbNukMAMNyyi62gO6I9exearecRpB/OGIhjNXm99Ar59dAM9228X8gGfryLFMkWcO/fNZzb6lxXmJ6b2LPY3KqpMwqRLTAU/zy+ax30eFoWdDHYa4X6e1AoGAfa8asVGOJ8GL9dlWufEeFkDEDKO9ww5GdnpN+wqLwePWqeJhWCHad7bge6SnlylJp5aZXl1+YaBTtOskC4Whq9TP2J+dNIgxsaF5EFZQJr8Xv+lY9lu0CruYOh9nTNF9x3nubxJgaSid/7yRPfAGnsJRiknB5bsrCvgsFQFjJVs=';
  const prefix = '-----BEGIN RSA PRIVATE KEY-----';
  const endfix = '-----END RSA PRIVATE KEY-----';
  const privateKey = prefix + '\n' + key + '\n' + endfix;
  const rsa = new WxmpRsa()
  rsa.setPrivateKey(privateKey)
  return rsa.decryptLong(text);
};

function base64Decode(text) {
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text));
}

function gzipDecode(b64Data) {
  const strData = window.
  atob(b64Data);
  const charData = Uint8Array.from(strData, (x) => x.charCodeAt(0));
  const data = pako.inflate(charData);
  return new TextDecoder().decode(data);
}

function aesDecode(text) {
  const key = CryptoJS.enc.Hex.parse('686A64686E780A0A0A0A0A0A0A0A0A0A');
  const iv = CryptoJS.enc.Hex.parse('647A797964730A0A0A0A0A0A0A0A0A0A');
  return CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(text),
    },
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  ).toString(CryptoJS.enc.Utf8);
}

const decodeFuncs = {
  gzip: (text) => gzipDecode(text),
  base64: (text) => base64Decode(text),
  aes: (text) => aesDecode(text),
  rsa: (text) => rsaDecode(text)
};

function getOriginalJs(jsCode) {
  const jsCodeMatchRegex = /var rule|[\u4E00-\u9FA5]+|function|let |var |const |\(|\)|"|'/;
  if (jsCodeMatchRegex.test(jsCode)) {
    return jsCode;
  }

  let decodeContent = '';
  for (const funcName in decodeFuncs) {
    try {
      decodeContent = decodeFuncs[funcName](jsCode);
      if (jsCodeMatchRegex.test(decodeContent)) {
        break;
      }
    } catch (err) {
      console.log(`${funcName}解码失败：${err.message}`);
    }
  }
  return decodeContent;
};

export { getOriginalJs };
