import importlib.util
import sys
import json
import requests
import asyncio
import inspect

def load_module_from_source(module_name, source_code):
    """
    从字符串形式的源代码加载模块
    """
    spec = importlib.util.spec_from_loader(module_name, loader=None)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    exec(source_code, module.__dict__)
    return module

def sync_wrapper(func, params):
    """
    同步方法包装器，兼容协程和普通函数
    """
    if inspect.iscoroutinefunction(func):
        return asyncio.run(func(*params))
    else:
        return func(*params)

if __name__ == '__main__':
    try:
        # 解决不同操作系统下的参数传递问题
        args = [arg.strip("'\"") for arg in sys.argv[1:]]
        source_url = args[0]  # 模块地址
        method_name = args[1]  # 调用的方法
        method_params_str = args[2]  # 方法参数 JSON 字符串
        method_params = json.loads(method_params_str)  # 转换成 Python 对象
        init_extend = args[3] if len(args) == 4 else ""

        # 下载并加载模块
        module_name = "dynamic_module"
        source_code = requests.get(source_url).text
        module = load_module_from_source(module_name, source_code)

        # 创建类实例并初始化（如果有 init 方法）
        spider = module.Spider()
        # if hasattr(spider, 'init'):
        #     sync_wrapper(spider.init, [init_extend])
        if method_name != 'init':
            sync_wrapper(spider.init, [init_extend])

        # 调用指定方法
        method = getattr(spider, method_name)
        result = sync_wrapper(method, method_params)

        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}, ensure_ascii=False))
