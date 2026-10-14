# -*- coding: utf-8 -*-
# File  : main.py

import argparse
import asyncio
import builtins
from concurrent import futures
from functools import lru_cache
import grpc
import hmac
import importlib.util
import inspect
import json
import os
import signal
import sys
from typing import Any, Dict, List, Optional
import traceback

signal.signal(signal.SIGINT, lambda signum, frame: sys.exit(130))
builtins.original_print = builtins.print


def custom_print(*args: Any, **kwargs: Any) -> None:
    try:
        msg: Dict[str, Any] = {
            "type": "multiple" if len(args) > 0 else "single",
            "msg": [*args, *[f'{k}={v}' for k, v in kwargs.items()]]
        }
        log: Dict[str, Any] = {
            "type": "log",
            "level": "verbose",
            "msg": msg
        }
        builtins.original_print(json.dumps(log, ensure_ascii=False))  # type: ignore[attr-defined]
        sys.stdout.flush()
    except Exception:
        pass


def ensure_json_str(val: Any) -> str:
    if isinstance(val, str):
        return val
    try:
        return json.dumps(val)
    except (TypeError, ValueError):
        return val


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Spider gRPC server")
    parser.add_argument("--port", type=int, default=19979, help="Port")
    return parser.parse_args()


def load_module_from_code(module_name: str, source_code: str) -> Any:
    spec = importlib.util.spec_from_loader(module_name, loader=None)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    exec(source_code, module.__dict__)
    return module


def sync_wrapper(func: Any, params: Optional[List[Any]]) -> Any:
    if params is None or not params:
        if inspect.iscoroutinefunction(func):
            return asyncio.run(func())
        return func()
    if inspect.iscoroutinefunction(func):
        return asyncio.run(func(*params))
    return func(*params)


@lru_cache(maxsize=10)
def get_spider(code_hash: int, code_str: str) -> Any:
    module_name = f"dynamic_module_{code_hash}"
    module = load_module_from_code(module_name, code_str)

    spider_cls = getattr(module, "Spider", None)
    if spider_cls is None:
        raise ImportError("Spider class not found in module")

    spider = spider_cls()
    return spider


def core(method: str, source_code: str, opts: List[Any]) -> Any:
    # print(f"Received request: method={method}, options={opts}")

    if not source_code:
        raise RuntimeError("Source content is empty")

    uuid = hash(source_code)
    spider = get_spider(uuid, source_code)

    method_obj = getattr(spider, method, None)
    if not method_obj:
        raise RuntimeError(f"Method '{method}' not found in Spider class")

    try:
        return sync_wrapper(method_obj, opts)
    except Exception as exc_e:
        full_tb = traceback.format_exc()
        raise RuntimeError(f"Failed to execute method '{method}':\n{full_tb}") from exc_e


def serialize_response(payload: Dict[str, Any]) -> bytes:
    return json.dumps(payload, ensure_ascii=False).encode('utf-8')


def deserialize_request(raw: bytes) -> Dict[str, Any]:
    return json.loads(raw.decode('utf-8'))


class SpiderService:
    def __init__(self, token: str) -> None:
        self.token = token

    def Exec(self, request: Dict[str, Any], context: grpc.ServicerContext) -> Dict[str, Any]:
        token = str(request.get("token", ""))
        if not hmac.compare_digest(token, self.token):
            context.abort(grpc.StatusCode.UNAUTHENTICATED, "Invalid service token")

        try:
            code: str = request.get("code", "")
            method_name: str = request.get("type", "")
            options: List[Any] = request.get("options", [])

            if method_name == "init":
                if not options:
                    options = ['']
                options = [ensure_json_str(options[0])]

            result: Any = core(method_name, code, options)
            return {"result": result}
        except Exception as e:
            log_payload = {
                "type": "single",
                "msg": [f"{str(e) or 'Unknown error'}"]
            }
            builtins.original_print(json.dumps(log_payload, ensure_ascii=False))  # type: ignore[attr-defined]
            sys.stdout.flush()
            return {"error": f"{str(e) or 'Unknown error'}"}


def serve(port: int, token: str) -> None:
    service = SpiderService(token)

    # Key is RPC method name, value defines handler + codec.
    rpc_method_handlers = {
        'Exec': grpc.unary_unary_rpc_method_handler(
            service.Exec,
            request_deserializer=deserialize_request,
            response_serializer=serialize_response,
        ),
    }

    # Register a generic handler without generated proto stubs.
    generic_handler = grpc.method_handlers_generic_handler('t3py.SpiderService', rpc_method_handlers)

    # Thread pool allows concurrent RPC calls.
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
    server.add_generic_rpc_handlers((generic_handler,))
    # Bind the control endpoint on the configured port.
    server.add_insecure_port(f'127.0.0.1:{port}')
    server.start()

    sys.stdout.write(f"Spider gRPC server started\n")
    sys.stdout.flush()

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(grace=0)


if __name__ == '__main__':
    cli_args = parse_args()
    PORT = cli_args.port
    TOKEN = os.environ.get("ZYFUN_T3PY_TOKEN", "")
    if not TOKEN:
        raise RuntimeError("Missing service token")

    try:
        builtins.print = custom_print
        serve(PORT, TOKEN)

    except SystemExit:
        sys.stdout.write("Spider gRPC server exited")
        sys.stdout.flush()
        sys.exit(130)

    except Exception as main_e:
        sys.stdout.write(f"Spider exited: {str(main_e)}")
        sys.stdout.flush()
        sys.exit(1)
