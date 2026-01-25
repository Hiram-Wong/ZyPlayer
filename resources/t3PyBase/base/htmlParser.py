# -*- coding: utf-8 -*-
# File  : htmlParser.py
# Author: DaShenHan&道长-----先苦后甜, 任凭晚风拂柳颜------
# Date  : 2022/8/25
# upDate  : 2022/11/17 支持 -- 剔除元素 多个剔除
# upDate  : 2024/04/09 取html返回的文本自动解除转义, 防止script里取Html的内容被转义无法执行
# upDate  : 2024/05/16 支持:not,even,odd,has,contans,matches,empty 新特性, pdfh取属性支持||

import ujson
from pyquery import PyQuery as pq
from urllib.parse import urljoin
import re
from jsonpath import jsonpath
from html import escape, unescape

PARSE_CACHE = True  # 解析缓存
NOADD_INDEX = ':eq|:lt|:gt|:first|:last|:not|:even|:odd|:has|:contains|:matches|:empty|^body$|^#'  # 不自动加eq下标索引
URLJOIN_ATTR = '(url|src|href|-original|-src|-play|-url|style)$'  # 需要自动urljoin的属性
SPECIAL_URL = '^(ftp|magnet|thunder|ws):'  # 过滤特殊链接,不走urlJoin

class Jsoup:
    def __init__(self, MY_URL=''):
        self.MY_URL = MY_URL
        self.pdfh_html = ''
        self.pdfa_html = ''

        self.pdfh_doc = None
        self.pdfa_doc = None

    def test(self, text: str, string: str):
        """
        正则判断字符串包含, 模仿js的 //.test()
        :param text:
        :param string:
        :return:
        """
        searchObj = re.search(rf'{text}', string, re.M | re.I)
        test_ret = True if searchObj else False
        return test_ret

    def contains(self, text: str, match: str):
        # return match in text
        return text.find(match) > -1

    def parseHikerToJq(self, parse, first=False):
        """
         海阔解析表达式转原生表达式,自动补eq,如果传了first就最后一个也取eq(0)
        :param parse:
        :param first:
        :return:
        """
        if self.contains(parse, '&&'):
            parse = parse.split('&&')  # 带&&的重新拼接
            new_parses = []  # 构造新的解析表达式列表
            for i in range(len(parse)):
                ps = parse[i].split(' ')[-1]  # 如果分割&&后带空格就取最后一个元素
                if not self.test(NOADD_INDEX, ps):
                    if not first and i >= len(parse) - 1:  # 不传first且遇到最后一个,不用补eq(0)
                        new_parses.append(parse[i])
                    else:
                        new_parses.append(f'{parse[i]}:eq(0)')
                else:
                    new_parses.append(parse[i])
            parse = ' '.join(new_parses)
        else:
            ps = parse.split(' ')[-1]  # 如果带空格就取最后一个元素
            if not self.test(NOADD_INDEX, ps) and first:
                parse = f'{parse}:eq(0)'

        return parse

    def getParseInfo(self, nparse):
        """
        根据传入的单规则获取 parse规则, 索引位置,排除列表  -- 可以用于剔除元素,支持多个, 按标签剔除, 按id剔除等操作
        :param nparse:
        :return:
        """
        excludes = []  # 定义排除列表默认值为空
        nparse_index = 0  # 定义位置索引默认值为0
        nparse_rule = nparse  # 定义规则默认值为本身
        if self.contains(nparse, ':eq'):
            nparse_rule = nparse.split(':eq')[0]
            nparse_pos = nparse.split(':eq')[1]
            # print(nparse_rule)
            if self.contains(nparse_rule, '--'):
                excludes = nparse_rule.split('--')[1:]
                nparse_rule = nparse_rule.split('--')[0]
            elif self.contains(nparse_pos, '--'):
                excludes = nparse_pos.split('--')[1:]
                nparse_pos = nparse_pos.split('--')[0]
            try:
                nparse_index = int(nparse_pos.split('(')[1].split(')')[0])
            except:
                pass

        elif self.contains(nparse, '--'):
            nparse_rule = nparse.split('--')[0]
            excludes = nparse.split('--')[1:]

        # if nparse_index > 0:
        #     print(f'nparse_rule:{nparse_rule},nparse_index:{nparse_index},excludes:{excludes}')
        return nparse_rule, nparse_index, excludes

    def parseOneRule(self, doc, nparse, ret=None):
        """
        解析空格分割后的原生表达式中的一条记录,正确处理eq的索引, 返回处理后的ret
        :param doc: pq(html) load 后的pq对象
        :param nparse: 当前单个解析表达式
        :param ret: pd对象结果
        :return:
        """
        nparse_rule, nparse_index, excludes = self.getParseInfo(nparse)
        # print('nparse_rule:', nparse_rule)
        # print('nparse:', nparse)

        not_prefix = nparse_rule
        not_regex = ''
        not_endfix = ''
        if self.contains(nparse_rule, ':not'):
            not_prefix = nparse_rule.split(':not')[0]
            not_reg_array = re.search(r':not\((.*)\)(.*)', nparse_rule, re.M | re.I).groups()
            not_regex = not_reg_array[0] if len(not_reg_array) > 0 else not_regex
            not_endfix = not_reg_array[1] if len(not_reg_array) > 1 else not_endfix

        if not ret:
            ret = doc(not_prefix)
        else:
            ret = ret(not_prefix)

        if not_regex:
            ret = ret.not_(not_regex)
        if not_endfix:
            ret = ret(not_endfix)

        # print(ret)
        # print(f'nparse_rule:{nparse_rule},nparse_index:{nparse_index},excludes:{excludes},ret:{ret}')
        if self.contains(nparse, ':eq'):
            ret = ret.eq(nparse_index)
            # if nparse_index > 4:
            #     print('nparse_index',ret,not ret)

        if excludes and ret:
            # print(excludes)
            ret = ret.clone()  # 克隆一个,免得直接remove会影响doc的缓存
            for exclude in excludes:
                # ret.remove(exclude)
                ret(exclude).remove()
        return ret

    def pdfa(self, html, parse: str):
        # 看官方文档才能解决这个问题!!!
        # https://pyquery.readthedocs.io/en/latest/api.html
        if not all([html, parse]):
            return []
        parse = self.parseHikerToJq(parse)
        # print(f'pdfa:{parse}')
        if PARSE_CACHE:
            if self.pdfa_html != html:
                self.pdfa_html = html
                self.pdfa_doc = pq(html)
            doc = self.pdfa_doc
        else:
            doc = pq(html)

        parses = parse.split(' ')
        # print(parses)
        ret = None
        for nparse in parses:
            ret = self.parseOneRule(doc, nparse, ret)
            if not ret:  # 可能循环取值后ret 对应eq取完无值了, pdfa直接返回空列表
                return []
        res = [item.outerHtml() for item in ret.items()]
        return res

    def pdfh(self, html, parse: str, base_url: str = ''):
        if not all([html, parse]):
            return ''
        if PARSE_CACHE:
            if self.pdfh_html != html:
                self.pdfh_html = html
                self.pdfh_doc = pq(html)
            doc = self.pdfh_doc
        else:
            doc = pq(html)
        if parse == 'body&&Text' or parse == 'Text':
            return doc.text()
        elif parse == 'body&&Html' or parse == 'Html':
            return unescape(doc.html())

        option = None
        if self.contains(parse, '&&'):
            option = parse.split('&&')[-1]
            parse = '&&'.join(parse.split('&&')[:-1])
        parse = self.parseHikerToJq(parse, True)
        # print(f'pdfh:{parse},option:{option}')
        parses = parse.split(' ')
        # print(parses)
        ret = None
        for nparse in parses:
            ret = self.parseOneRule(doc, nparse, ret)
            # print(nparse,ret)
            if not ret:  # 可能循环取值后ret 对应eq取完无值了, pdfh直接返回空字符串
                return ''

        if option:
            if option == 'Text':
                ret = ret.text()
            elif option == 'Html':
                ret = unescape(ret.html())
            else:
                # 保留原来的ret
                original_ret = ret.clone()
                options = option.split('||')
                opt_index = 0
                for opt in options:
                    # print(f'opt_index:{opt_index},opt:{opt}')
                    opt_index += 1
                    ret = original_ret.attr(opt) or ''
                    if self.contains(opt.lower(), 'style') and self.contains(ret, 'url('):
                        try:
                            ret = re.search('url\((.*?)\)', ret, re.M | re.S).groups()[0]
                            # 2023/07/28新增 style取内部链接自动去除首尾单双引号
                            ret = re.sub(r"^['\"]|['\"]$", '', ret)
                        except:
                            pass
                    if ret and base_url:
                        # need_add = re.search(URLJOIN_ATTR, opt, re.M | re.I)
                        need_add = self.test(URLJOIN_ATTR, opt) and not self.test(SPECIAL_URL, ret)
                        if need_add:
                            if 'http' in ret:
                                ret = ret[ret.find('http'):]
                            else:
                                ret = urljoin(base_url, ret)
                    if ret:
                        break
        else:
            ret = ret.outerHtml()
        return ret

    def pd(self, html, parse: str, base_url: str = ''):
        if not base_url:
            base_url = self.MY_URL
        return self.pdfh(html, parse, base_url)

    def pq(self, html: str):
        return pq(html)

    def pjfh(self, html, parse: str, add_url=False):
        if not all([html, parse]):
            return ''
        if isinstance(html, str):
            # print(html)
            try:
                html = ujson.loads(html)
                # html = eval(html)
            except:
                print('字符串转json失败')
                return ''
        if not parse.startswith('$.'):
            parse = f'$.{parse}'
        ret = ''
        for ps in parse.split('||'):
            ret = jsonpath(html, ps)
            if isinstance(ret, list):
                ret = str(ret[0]) if ret[0] else ''
            else:
                ret = str(ret) if ret else ''
            if add_url and ret:
                ret = urljoin(self.MY_URL, ret)
            if ret:
                break
        # print(ret)
        return ret

    def pj(self, html, parse: str):
        return self.pjfh(html, parse, True)

    def pjfa(self, html, parse: str):
        if not all([html, parse]):
            return []
        if isinstance(html, str):
            try:
                html = ujson.loads(html)
            except:
                return []
        if not parse.startswith('$.'):
            parse = f'$.{parse}'
        # print(html)
        # print(parse)
        ret = jsonpath(html, parse)
        # print(ret)
        # print(type(ret))
        # print(type(ret[0]))
        # print(len(ret))
        if isinstance(ret, list) and isinstance(ret[0], list) and len(ret) == 1:
            # print('自动解包')
            ret = ret[0]  # 自动解包
        return ret or []

def pd(html, parse: str, base_url: str =''):
    jsp = Jsoup(base_url)
    return jsp.pd(html, parse, base_url)

def pdfa(html, parse: str):
    jsp = Jsoup()
    return jsp.pdfa(html, parse)

def pdfh(html, parse: str, base_url: str =''):
    jsp = Jsoup(base_url)
    return jsp.pdfh(html, parse, base_url)
