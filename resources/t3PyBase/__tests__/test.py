import zmq, json
from pathlib import Path

CTRL_ADDR = "tcp://127.0.0.1:19979"
code = Path("demo.py").read_text(encoding="utf-8")

ctx = zmq.Context()
ctrl_socket = ctx.socket(zmq.REQ)
ctrl_socket.connect(CTRL_ADDR)

def send_request(method, options=None):
    if options is None:
        options = []
    req = {"type": method, "options": options, "code": code}
    ctrl_socket.send_string(json.dumps(req))
    reply = ctrl_socket.recv_string()
    return reply

reply_init = send_request("init")
print("init reply:", reply_init)

reply_home = send_request("homeContent", [""])
print("homeContent reply:", reply_home)

