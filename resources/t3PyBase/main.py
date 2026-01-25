import argparse
import asyncio
import builtins
from functools import lru_cache
import importlib.util
import inspect
import json
import signal
import sys
import zmq


signal.signal(signal.SIGINT, lambda signum, frame: sys.exit(130))
builtins._real_print = builtins.print

def custom_print(*args, **kwargs):
    try:
        log = {
            "type": "multiple" if len(args) > 0 else "single",
            "msg": [*args, *[f'{k}={v}' for k, v in kwargs.items()]]
        }
        builtins._real_print(log)
        log_socket.send_string(json.dumps(log, ensure_ascii=False))
    except zmq.ZMQError:
        pass


def parse_args():
    parser = argparse.ArgumentParser(description="Spider ZMQ server")
    parser.add_argument("--ctrl-port", type=int, default=19979, help="Control port")
    parser.add_argument("--log-port", type=int, help="Log port (default=ctrl_port+1)")
    return parser.parse_args()


def load_module_from_code(module_name: str, source_code: str):
    spec = importlib.util.spec_from_loader(module_name, loader=None)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    exec(source_code, module.__dict__)
    return module


def sync_wrapper(func, params):
    if inspect.iscoroutinefunction(func):
        return asyncio.run(func(*params))
    return func(*params)


@lru_cache(maxsize=10)
def get_spider(code_hash: int, code: str):
    module_name = f"dynamic_module_{code_hash}"
    module = load_module_from_code(module_name, code)
    spider_cls = getattr(module, "Spider", None)
    if not spider_cls:
        raise RuntimeError("Spider class not found in module")
    return spider_cls()


def core(method_name: str, code: str, options: list):
    uuid = hash(code)
    try:
        spider = get_spider(uuid, code)
    except Exception as e:
        raise RuntimeError(f"Failed to load spider: {e}")

    method = getattr(spider, method_name, None)
    if not method:
        raise RuntimeError(f"Method '{method_name}' not found in Spider class")

    try:
        return sync_wrapper(method, options)
    except Exception as e:
        raise RuntimeError(f"Failed to execute method '{method_name}': {e}")


if __name__ == '__main__':
    args = parse_args()
    CTRL_PORT = args.ctrl_port
    LOG_PORT = args.log_port or (CTRL_PORT + 1)

    try:
        context = zmq.Context()

        log_socket = context.socket(zmq.PUB)
        log_socket.bind(f"tcp://*:{LOG_PORT}")

        builtins.print = custom_print

        ctrl_socket = context.socket(zmq.REP)
        ctrl_socket.bind(f"tcp://*:{CTRL_PORT}")

        sys.stdout.write(f"Spider ZMQ server started. CTRL_PORT={CTRL_PORT}, LOG_PORT={LOG_PORT}\n")
        sys.stdout.flush()

        while True:
            try:
                message = ctrl_socket.recv_string()
                request = json.loads(message)

                code = request.get("code", "")
                method_name = request.get("type", "")
                options = request.get("options", [])

                res = core(method_name, code, options)
                ctrl_socket.send_string(json.dumps(res, ensure_ascii=False))

            except Exception as e:
                ctrl_socket.send_string(json.dumps({"error": str(e)}, ensure_ascii=False))

    except SystemExit:
        sys.stdout.write('Spider ZMQ server exiting...')
        sys.stdout.flush()
        sys.exit(130)

    except Exception as e:
        sys.stdout.write(str(e))
        sys.stdout.flush()
        sys.exit(1)
