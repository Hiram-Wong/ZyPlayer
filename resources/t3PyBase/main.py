import importlib.util
import sys
import json
import requests

def load_module_from_source(module_name, source_code):
    """
    从字符串形式的源代码加载模块
    :param module_name: 模块名
    :param source_code: 模块的源代码（字符串形式）
    :return: 加载后的模块对象
    """
    # 创建一个模块规范
    spec = importlib.util.spec_from_loader(module_name, loader=None)
    # 创建一个模块对象
    module = importlib.util.module_from_spec(spec)
    # 将模块添加到 sys.modules 中
    sys.modules[module_name] = module
    # 执行模块代码
    exec(source_code, module.__dict__)
    return module

if __name__ == '__main__':
    try:
        # 参数获取
        source_url = sys.argv[1] # 源地址
        method_name = sys.argv[2] # 方法
        # 参数
        method_parms_str = sys.argv[3]
        method_parms = json.loads(method_parms_str)
        # 初始化参数
        init_extend = sys.argv[4] if len(sys.argv) == 5 else ""
        module_name = "dynamic_module"
        source_code = requests.get(source_url).text

        # 加载模块
        module = load_module_from_source(module_name, source_code)

        # 使用模块中的类和方法
        spider = module.Spider()
        if method_name != 'init':
            spider.init(init_extend)
        map_method = getattr(spider, method_name)
        result = map_method(*method_parms)

        print(json.dumps(result))
    except Exception as e:
        print(e)

 # python main.py 'http://127.0.0.1:9978/api/v1/file/py/芒.py' 'homeContent' '[]'
