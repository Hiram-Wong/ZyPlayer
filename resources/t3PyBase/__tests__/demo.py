import re,sys,json,urllib3
from base.spider import Spider
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
sys.path.append('..')

class Spider(Spider):
    host = 'https://example.com'
    headers = {}

    def homeContent(self, filter):
        print(1,2,3)
        print()
        self.a = {'class':[{'type_id':'1','type_name':'电影'},{'type_id':'2','type_name':'电视剧'},{'type_id':'3','type_name':'综艺'},{'type_id':'5','type_name':'动漫'},{'type_id':'4','type_name':'纪录片'},{'type_id':'6','type_name':'短剧'},{'type_id':'7','type_name':'特别节目'},{'type_id':'8','type_name':'少儿内容'}]}
        print(self.a)
        return self.a

    def homeVideoContent(self):
        return []

    def categoryContent(self, tid, pg, filter, extend):
        return {'list': [], 'pagecount':10, 'page': pg}

    def searchContent(self, key, quick, pg='1'):
        return {'list': [], 'page': pg}

    def detailContent(self, ids):
        return {'list': []}

    def playerContent(self, flag, vid, vip_flags):
        return { 'jx': 0, 'parse': 0, 'url': '', 'header': this.headers }

    def init(self, extend=''):
        pass

    def getName(self):
        pass

    def isVideoFormat(self, url):
        pass

    def manualVideoCheck(self):
        pass

    def destroy(self):
        pass

    def localProxy(self, param):
        pass
