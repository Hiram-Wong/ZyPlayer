import zmq
import builtins
import sys
import json


LOG_ADDR = "tcp://127.0.0.1:19980"

def listen_logs():
    ctx = zmq.Context()
    log_socket = ctx.socket(zmq.SUB)
    log_socket.connect(LOG_ADDR)
    log_socket.setsockopt_string(zmq.SUBSCRIBE, "")

    print("[Main] Log listening started...")
    try:
        while True:
            msg_raw = log_socket.recv_string()
            msg = json.loads(msg_raw)

            msg_type = msg.get("type")
            msg_list = msg.get("msg", [])

            print(
                "[LOG]",
                *(
                    msg_list
                    if msg_type == "multiple"
                    else (msg_list[:1] if msg_list else [])
                )
            )

    except zmq.ZMQError:
        print("[Main] Stop listening to logs")
    finally:
        log_socket.close()
        ctx.term()

if __name__ == "__main__":
    try:
        while True:
            listen_logs()
    except KeyboardInterrupt:
        print("[Main] Exiting log listener")
