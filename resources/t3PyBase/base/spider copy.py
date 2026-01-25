# -*- coding: utf-8 -*-
# File  : spider.py
# Author: DaShenHan&道长-----先苦后甜，任凭晚风拂柳颜------
# Author's Blog: https://blog.csdn.net/qq_32394351
# Date  : 2024/1/9
# UpDate  : 2024/1/9 增加多个静态函数以及个性化函数
import hashlib
import re
import json
import zlib
import gzip
from typing import List

import requests
import warnings
import time
from lxml import etree
from abc import abstractmethod, ABCMeta
from importlib.machinery import SourceFileLoader
from urllib3 import encode_multipart_formdata
from urllib.parse import urljoin, quote, unquote

import base64
import io
import tokenize
from Crypto.Cipher import AES, PKCS1_v1_5 as PKCS1_cipher
from Crypto.Util.Padding import unpad
from Crypto.PublicKey import RSA

_ENV = 'T4'
_log = print

# 关闭警告
warnings.filterwarnings("ignore")
requests.packages.urllib3.disable_warnings()

class BaseSpider(metaclass=ABCMeta):  # 元类 默认的元类 type
    _instance = None
    ENV: str

    def __init__(self, query_params=None, t4_api=None):
        self.query_params = query_params or {}
        self.t4_api = t4_api or ''
        self.extend = ''
        self.ENV = _ENV
        self._cache = {}
        self.log(f'BaseSpider __init__ t4_api:{t4_api}')

    def __new__(cls, *args, **kwargs):
        if cls._instance:
            return cls._instance  # 有实例则直接返回
        else:
            cls._instance = super().__new__(cls)  # 没有实例则new一个并保存
            return cls._instance  # 这个返回是给是给init，再实例化一次，也没有关系

    # # 这是简化的写法，上面注释的写法更容易提现判断思路
    # if not cls._instance:
    #   cls._instance = super().__new__(cls)
    # return cls._instance

    @abstractmethod
    def init(self, extend=""):
        pass

    @abstractmethod
    def homeContent(self, filter):
        pass

    @abstractmethod
    def homeVideoContent(self):
        pass

    @abstractmethod
    def categoryContent(self, tid, pg, filter, extend):
        pass

    @abstractmethod
    def detailContent(self, ids):
        pass

    @abstractmethod
    def searchContent(self, key, quick, pg=1):
        pass

    @abstractmethod
    def playerContent(self, flag, id, vipFlags=None):
        pass

    @abstractmethod
    def localProxy(self, params):
        pass

    @abstractmethod
    def isVideoFormat(self, url):
        pass

    @abstractmethod
    def manualVideoCheck(self):
        pass

    # @abstractmethod
    def getName(self):
        return 'BaseSpider'

    def init_api_ext_file(self):
        pass

    def getProxyUrl(self, flag=False):
        """
        获取本地代理地址
        @return:
        """
        if self.ENV.lower() == 't3':
            # return getProxy(True)
            return PyUtil.getProxy(flag)
            # return 'http://127.0.0.1:9978/proxy?do=py'
        elif self.ENV.lower() == 't4':
            return self.t4_api
        else:
            return ''

    def getDependence(self):
        return []

    def setExtendInfo(self, extend):
        self.extend = extend

    def setCache(self, key, value, expire=None):
        """
        设置缓存键值对，可选的过期时间

        参数:
            key: 缓存键
            value: 缓存值
            expire: 过期时间（秒），None表示永不过期
        """
        self._cache[key] = {
            'value': value,
            'expire': time.time() + expire if expire else None
        }

    def getCache(self, key):
        """
        获取缓存值，如果已过期则返回None并删除该键

        参数:
            key: 缓存键

        返回:
            对应的缓存值，如果键不存在或已过期则返回 None
        """
        if key not in self._cache:
            return None

        item = self._cache[key]

        # 检查是否过期
        if item['expire'] and time.time() > item['expire']:
            del self._cache[key]  # 删除过期项
            return None

        return item['value']

    def cleanup(self):
        """清理所有过期的缓存项"""
        current_time = time.time()
        expired_keys = [
            key for key, item in self._cache.items()
            if item['expire'] and current_time > item['expire']
        ]

        for key in expired_keys:
            del self._cache[key]

    def regStr(self, src, reg, group=1):
        m = re.search(reg, src)
        src = ''
        if m:
            src = m.group(group)
        return src

    def custom_RegexGetText(self, Text, RegexText, Index, find_all=False):
        """改进版：支持返回所有匹配结果或单个匹配"""
        if not find_all:
            match = re.search(RegexText, Text, re.M | re.S)
            return match.group(Index) if match else ""
        else:
            return [m.group(Index) for m in re.finditer(RegexText, Text, re.M | re.S)]

    # cGroup = re.compile('[\U00010000-\U0010ffff]')
    # clean = cGroup.sub('',rsp.text)
    def cleanText(self, src):
        clean = re.sub('[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]', '',
                       src)
        return clean

    def fetch(self, url, params=None, headers=None, cookies=None, timeout=5, verify=True,
              allow_redirects=True, stream=None):
        rsp = requests.get(url, params=params, headers=headers, cookies=cookies, timeout=timeout,
                           verify=verify,
                           allow_redirects=allow_redirects, stream=stream)
        rsp.encoding = 'utf-8'
        return rsp

    def post(self, url, data=None, headers=None, cookies=None, timeout=5, verify=True, allow_redirects=True,
             stream=None):
        rsp = requests.post(url, data=data, headers=headers, cookies=cookies, timeout=timeout, verify=verify,
                            allow_redirects=allow_redirects, stream=stream)
        rsp.encoding = 'utf-8'
        return rsp

    def postJson(self, url, json, headers=None, cookies=None, timeout=5, verify=True, allow_redirects=True,
                 stream=None):
        rsp = requests.post(url, json=json, headers=headers, cookies=cookies, timeout=timeout, verify=verify,
                            allow_redirects=allow_redirects, stream=stream)
        rsp.encoding = 'utf-8'
        return rsp

    def postBinary(self, url, data: dict, boundary=None, headers=None, cookies=None, timeout=5, verify=True,
                   allow_redirects=True, stream=None):
        if boundary is None:
            boundary = f'--dio-boundary-{int(time.time())}'
        if headers is None:
            headers = {}
        headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'
        fields = []
        for key, value in data.items():
            fields.append((key, (None, value, None)))
        m = encode_multipart_formdata(fields, boundary=boundary)
        data = m[0]
        rsp = requests.post(url, data=data, headers=headers, cookies=cookies, timeout=timeout, verify=verify,
                            allow_redirects=allow_redirects, stream=stream)
        rsp.encoding = 'utf-8'
        return rsp

    def html(self, content):
        return etree.HTML(content)

    def xpText(self, root, expr):
        ele = root.xpath(expr)
        if len(ele) == 0:
            return ''
        else:
            return ele[0]

    def loadModule(self, name, fileName):
        return SourceFileLoader(name, fileName).load_module()

    # ==================== 静态函数 ======================
    def log(self, msg):
        """
        打印日志文本
        @param msg:
        @return:
        """
        if isinstance(msg, dict) or isinstance(msg, list):
            msg = self.json2str(msg)
        else:
            msg = f'{msg}'

        _log(msg)

    @staticmethod
    def isVideo():
        """
        返回是否为视频的匹配字符串
        @return: None空 reg:正则表达式  js:input js代码
        """
        pass

    @staticmethod
    def adRemove():
        """
        m3u8广告移除函数。将自动执行返回的字符串的本地代理功能
        @return: None空 reg:正则表达式  js:input js代码
        """
        pass

    @staticmethod
    def replaceAll(text, mtext, rtext):
        """
        字符串替换全部
        @param text: 原始字符串: 如 xxx.ts
        @param mtext: 匹配想要替换的字符串 如 r'(.*?ts)'
        @param rtext: 用于替换的字符串 如 r'https://www.bdys03.com/\1' 其中\1代表匹配的第1项类似于js的 $1
        @return: 替换后的字符串结果
        """
        return re.sub(mtext, rtext, text)

    @staticmethod
    def str2json(str):
        return json.loads(str)

    @staticmethod
    def json2str(str):
        return json.dumps(str, ensure_ascii=False)

    @staticmethod
    def encodeStr(input, encoding='GBK'):
        """
        指定字符串编码
        :param input:
        :param encoding:
        :return:
        """
        return quote(input.encode(encoding, 'ignore'))

    @staticmethod
    def decodeStr(input, encoding='GBK'):
        """
        指定字符串解码
        :param input:
        :param encoding:
        :return:
        """
        return unquote(input, encoding)

    @staticmethod
    def hexStringTobytes(_str):
        """
        将hex字符串转成byte字节
        @param _str: hex字符串
        @return: byte字节
        """
        _str = _str.replace(" ", "")
        return bytes.fromhex(_str)

    @staticmethod
    def bytesToHexString(_bytes, no_space=True):
        """
        将byte字节转成hex字符串
        @param _bytes: byte字节
        @param no_space: 是否不带空格返回，默认是
        @return: hex字符串
        """
        _str = ''.join(['%02X ' % b for b in _bytes])
        if no_space:
            _str = _str.replace(" ", "")
        return _str

    @staticmethod
    def urljoin(base_url, path):
        """
        链接拼接
        @param base_url: 原链接
        @param path: 路径
        @return: 拼接后的链接
        """
        return urljoin(base_url, path)

    @staticmethod
    def coverDict2form(data: dict):
        """
        字典转form
        @param data:
        @return:
        """
        forms = []
        for k, v in data.items():
            forms.append(f'{k}={v}')
        return '&'.join(forms)

    @staticmethod
    def buildUrl(url: str, obj: dict = None):
        """
        @param url:基础链接可以带query
        @param obj:要更新的query字典。会覆盖基础链接中同名query
        @return:
        """
        if obj is None:
            return url
        if '?' in url:
            old_query = url.split('?')[1]
            old_params = {}
            for text in old_query.split('&'):
                key = text.split('=')[0]
                value = text.split('=')[1]
                old_params[key] = value
        else:
            old_params = {}

        new_obj = old_params.copy()
        new_obj.update(obj)
        param_list = [f'{i}={new_obj[i]}' for i in new_obj]
        prs = '&'.join(param_list)
        if param_list:
            url = url.split('?')[0] + '?' + prs
        return url

    @staticmethod
    def to_lower_camel_case(x):
        """转小驼峰法命名：下划线转驼峰且首字母小写"""
        s = re.sub('_([a-zA-Z])', lambda m: (m.group(1).upper()), x)
        return s[0].lower() + s[1:]

    @staticmethod
    def md5(text):
        """
        md5加密
        @param text: 明文
        @return: 加密结果
        """
        return hashlib.md5(text.encode(encoding='UTF-8')).hexdigest()

    @staticmethod
    def gzinflate(compressed: bytes) -> bytes:
        """
        gzip解压
        @param compressed: 压缩后的字节
        @return:
        """
        return zlib.decompress(compressed, -zlib.MAX_WBITS)

    @staticmethod
    def gzipCompress(compressed: bytes) -> bytes:
        """
        gzip解压
        @param compressed: 压缩后的字节
        @return:
        """
        return gzip.decompress(compressed)

    @staticmethod
    def gzip(input_str: str) -> str:
        """
        将字符串进行 gzip 压缩，并返回 base64 编码的结果

        Args:
            input_str: 要压缩的字符串

        Returns:
            base64 编码的压缩数据
        """
        try:
            # 将字符串编码为 UTF-8 字节
            utf8_bytes = input_str.encode('utf-8')

            # 使用 zlib 进行 gzip 压缩
            # wbits 参数设置为 31 表示使用 gzip 头部和尾部
            compressed_data = zlib.compress(utf8_bytes, level=zlib.Z_BEST_COMPRESSION, wbits=31)

            # 将压缩数据编码为 base64 字符串
            b64_data = base64.b64encode(compressed_data).decode('ascii')

            return b64_data

        except Exception as e:
            raise ValueError(f"压缩过程中出错: {str(e)}")

    @staticmethod
    def ungzip(b64_data: str) -> str:
        """
        解码 base64 字符串，进行 gzip 解压缩，并返回 UTF-8 字符串

        Args:
            b64_data: base64 编码的压缩数据

        Returns:
            解压缩后的 UTF-8 字符串
        """
        try:
            # 解码 base64 字符串
            compressed_data = base64.b64decode(b64_data)

            # 使用 zlib 进行 gzip 解压缩
            # wbits 参数设置为 15+32 表示自动检测 gzip 头部
            decompressed_data = zlib.decompress(compressed_data, zlib.MAX_WBITS | 32)

            # 将字节数据解码为 UTF-8 字符串
            return decompressed_data.decode('utf-8')

        except Exception as e:
            raise ValueError(f"解压缩过程中出错: {str(e)}")

    # 辅助函数：将字节数组转换为 UTF-8 字符串（如果需要）
    @staticmethod
    def utf8_array_to_str(data: List[int]) -> str:
        """将整数列表（字节值）转换为 UTF-8 字符串"""
        byte_array = bytes(data)
        return byte_array.decode('utf-8')

    @staticmethod
    def bytes2stream(some_bytes: bytes):
        """
        字节转文件流
        @param some_bytes:
        @return:
        """
        return io.BytesIO(some_bytes)

    @staticmethod
    def stream2bytes(some_stream):
        """
        文件流转字节
        @param some_stream:
        @return:
        """
        return some_stream.read()

    def skip_bytes(self, some_bytes: bytes, pos=0) -> bytes:
        """
        跳过位置之前的字节并返回
        @param some_bytes:
        @param pos: 待跳过的位置，默认0不跳过
        @return:
        """

        some_stream = self.bytes2stream(some_bytes)
        some_stream.seek(pos)
        return self.stream2bytes(some_stream)

    @staticmethod
    def base64Encode(text):
        """
        base64编码文本
        @param text:
        @return:
        """
        return base64.b64encode(text.encode("utf8")).decode("utf-8")  # base64编码

    @staticmethod
    def base64Decode(text: str):
        """
        base64文本解码
        @param text:
        @return:
        """
        return base64.b64decode(text).decode("utf-8")  # base64解码

    @staticmethod
    def atob(text):
        """
        base64编码文本-同浏览器
        :param text:
        :return:
        """
        return base64.b64decode(text.encode("utf8")).decode("latin1")

    @staticmethod
    def btoa(text):
        """
        base64文本解码-同浏览器
        :param text:
        :return:
        """
        return base64.b64encode(text.encode("latin1")).decode("utf8")

    @staticmethod
    def check_unsafe_attributes(string):
        """
        安全检测需要exec执行的python代码
        :param string:
        :return:
        """
        g = tokenize.tokenize(io.BytesIO(string.encode('utf-8')).readline)
        pre_op = ''
        for toktype, tokval, _, _, _ in g:
            if toktype == tokenize.NAME and pre_op == '.' and tokval.startswith('_'):
                attr = tokval
                msg = "access to attribute '{0}' is unsafe.".format(attr)
                raise AttributeError(msg)
            elif toktype == tokenize.OP:
                pre_op = tokval

    @staticmethod
    def aes_cbc_decode(ciphertext, key, iv):
        """
        aes cbc格式解密
        @param ciphertext:加密的字符串
        @param key: 加密密钥
        @param iv: 加密偏移量
        @return:解密后的文本明文
        """
        # 将密文转换成byte数组
        ciphertext = base64.b64decode(ciphertext)
        # 构建AES解密器
        decrypter = AES.new(key.encode(), AES.MODE_CBC, iv.encode())
        # 解密
        plaintext = decrypter.decrypt(ciphertext)
        # 去除填充
        plaintext = unpad(plaintext, AES.block_size)
        # 输出明文
        return plaintext.decode('utf-8')

    @staticmethod
    def rsa_private_decode(ciphertext, private_key, default_length=256):
        """
        rsa私钥解密
        @param ciphertext: 加密的字符串
        @param private_key: 私钥
        @param default_length: 分段加密长度,默认256位
        @return: 解密后的文本明文
        """
        # 计算需要添加的等号数
        b64_ciphertext = ciphertext
        num_padding = 4 - (len(b64_ciphertext) % 4)
        if num_padding < 4:
            b64_ciphertext += "=" * num_padding
        # 将密文转换成byte数组
        ciphertext = base64.b64decode(b64_ciphertext)
        # 构建RSA解密器
        private_key = f'-----BEGIN RSA PRIVATE KEY-----\n{private_key}\n-----END RSA PRIVATE KEY-----'
        pri_Key = RSA.importKey(private_key)
        decrypter = PKCS1_cipher.new(pri_Key)
        # 解密
        length = len(ciphertext)
        # 长度不用分段
        if length < default_length:
            plaintext = b''.join(decrypter.decrypt(ciphertext, b' '))
        else:
            # 需要分段
            offset = 0
            res = []
            while length - offset > 0:
                if length - offset > default_length:
                    res.append(decrypter.decrypt(ciphertext[offset:offset + default_length], b' '))
                else:
                    res.append(decrypter.decrypt(ciphertext[offset:], b' '))
                offset += default_length

            plaintext = b''.join(res)
        return plaintext.decode('utf-8')

    @staticmethod
    def rsa_public_encode(text, public_key, default_length=256):
        """
        rsa公钥加密
        @param text: 明文
        @param public_key: 公钥
        @param default_length: 分段加密长度默认 256
        @return: 密文
        """
        public_key = "-----BEGIN RSA PRIVATE KEY-----\n" + public_key + "\n-----END RSA PRIVATE KEY-----"
        pub_key = RSA.importKey(public_key)
        cipher = PKCS1_cipher.new(pub_key)
        text = text.encode("utf-8)")
        length = len(text)
        if length < default_length:
            rsa_text = base64.b64encode(cipher.encrypt(text))  # 加密并转为b64编码
        else:
            # 需要分段
            offset = 0
            res = []
            while length - offset > 0:
                if length - offset > default_length:
                    res.append(cipher.encrypt(text[offset:offset + default_length]))
                else:
                    res.append(cipher.encrypt(text[offset:]))
                offset += default_length
            byte_data = b''.join(res)

            rsa_text = base64.b64encode(byte_data)

        ciphertext = rsa_text.decode("utf8")
        return ciphertext

    @staticmethod
    def remove_comments(text):
        """
        字符串删除注释
        @param text:带注释的字符串
        @return:
        """

        pattern = re.compile(r'\s*[\'\"]{3}[\S\s]*?[\'\"]{3}')
        text = pattern.sub('', text)
        pattern = re.compile(r'\s*/\*[\S\s]*?\*/')
        text = pattern.sub('', text)
        text = text.splitlines()
        text = [txt for txt in text if not (txt.strip().startswith('//') or txt.strip().startswith('#'))]
        text = '\n'.join(text)
        return text.strip()

    # ==================== 个性化函数 ======================
    def superStr2dict(self, text: str):
        text = self.remove_comments(text)
        localdict = {'true': True, 'false': False, 'null': None}
        self.safe_eval(f'result={text}', localdict)
        result = localdict.get('result') or {}
        return result

    def fixAdM3u8(self, m3u8_text, m3u8_url='', ad_remove=''):
        """
        修复带广告的m3u8文本
        @param m3u8_text: 带广告的m3u8文本
        @param m3u8_url: m3u8原地址链接
        @param ad_remove: 广告去除正则表达式字符串如: reg:/video/adjump(.*?)ts
        @return:
        """
        # ad_remove = 'reg:/video/adjump(.*?)ts'
        if ad_remove.startswith('reg:'):
            ad_remove = ad_remove[4:]
        elif ad_remove.startswith('js:'):
            ad_remove = ad_remove[3:]
        else:
            ad_remove = None

        print(ad_remove)

        # 开头
        m3u8_start = m3u8_text[:m3u8_text.find('#EXTINF')].strip()
        # 中间
        m3u8_body = m3u8_text[m3u8_text.find('#EXTINF'):m3u8_text.find('#EXT-X-ENDLIST')].strip()
        # 结尾
        m3u8_end = m3u8_text[m3u8_text.find('#EXT-X-ENDLIST'):].strip()

        murls = []
        m3_body_list = m3u8_body.splitlines()
        m3_len = len(m3_body_list)
        i = 0
        while i < m3_len:
            mi = m3_body_list[i]
            mi_1 = m3_body_list[i + 1]
            if mi.startswith('#EXTINF'):
                murls.append('&'.join([mi, mi_1]))
                i += 2
            elif mi.startswith('#EXT-X-DISCONTINUITY'):
                mi_2 = m3_body_list[i + 2]
                murls.append('&'.join([mi, mi_1, mi_2]))
                i += 3
            else:
                break
        new_m3u8_body = []
        for murl in murls:
            if ad_remove and self.regStr(murl, ad_remove):
                pass
            else:
                murl_list = murl.split('&')
                if not murl_list[-1].startswith('http') and m3u8_url.startswith('http'):
                    murl_list[-1] = self.urljoin(m3u8_url, murl_list[-1])
                new_m3u8_body.extend(murl_list)

        new_m3u8_body = '\n'.join(new_m3u8_body).strip()
        m3u8_text = '\n'.join([m3u8_start, new_m3u8_body, m3u8_end]).strip()
        return m3u8_text

    def eval_computer(self, text):
        """
        自定义的字符串安全计算器
        @param text:字符串的加减乘除
        @return:计算后得到的值
        """
        localdict = {}
        self.safe_eval(f'ret={text.replace("=", "")}', localdict)
        ret = localdict.get('ret') or None
        return ret

    def safe_eval(self, code: str = '', localdict: dict = None):
        """
        安全执行python代码，返回执行后的数据字典
        @param code: python代码文本
        @param localdict: 待返回字典参数
        @return: localdict
        """
        code = code.strip()
        if not code:
            return {}
        if localdict is None:
            localdict = {}
        builtins = __builtins__
        if not isinstance(builtins, dict):
            builtins = builtins.__dict__.copy()
        else:
            builtins = builtins.copy()
        for key in ['__import__', 'eval', 'exec', 'globals', 'dir', 'copyright', 'open', 'quit']:
            del builtins[key]  # 删除不安全的关键字
        # print(builtins)
        global_dict = {'__builtins__': builtins,
                       'json': json, 'print': print,
                       're': re, 'time': time, 'base64': base64
                       }  # 禁用内置函数,不允许导入包
        try:
            self.check_unsafe_attributes(code)
            exec(code, global_dict, localdict)
            return localdict
        except Exception as e:
            return {'error': f'执行报错:{e}'}


Spider = BaseSpider
