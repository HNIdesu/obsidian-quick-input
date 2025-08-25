from argparse import ArgumentParser
from threading import Thread
import time
import subprocess
from datetime import datetime as DateTime
import colorama
import os.path as p
from http.server import HTTPServer,BaseHTTPRequestHandler

class Logger:
    def __init__(self, name="server",verbose=False):
        self.name = name
        self.verbose = verbose
        colorama.init(autoreset=True)

    def _prefix(self, level: str) -> str:
        ts = DateTime.now().strftime("%Y-%m-%d %H:%M:%S")
        return f"[{ts}] [{self.name}] [{level}]"

    def log(self, message: str):
        print(f"{self._prefix('LOG')} {message}")

    def warn(self, message: str):
        print(f"{self._prefix('WARN')} {colorama.Fore.YELLOW}{colorama.Style.DIM}{message}")

    def error(self, message: str):
        print(f"{self._prefix('ERROR')} {colorama.Fore.RED}{colorama.Style.BRIGHT}{message}")

    def debug(self, message: str):
        if self.verbose:
            print(f"{self._prefix('DEBUG')} {colorama.Fore.GREEN}{message}")

class LocationServerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        user_agent = self.headers.get('User-Agent', "")
        origin = 'http://localhost' if "Android" in user_agent else 'app://obsidian.md'

        if self.path == "/":
            file_path = "termux_location_result"
            if p.exists(file_path):
                self.send_response(200)
                with open(file_path, "rb") as f:
                    data = f.read()
            else:
                self.send_response(425)
                data = None
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "GET")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.send_header("Content-Type", "application/json")
            if data:
                self.send_header("Content-Length",str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_header("Content-Length","0")
                self.end_headers()
                self.wfile.write(b'{"error":"Location not found"}')
        else:
            self.send_response(404)
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "GET")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"error":"Invalid path"}')

    def do_OPTIONS(self):
        self.send_response(204)
        user_agent = self.headers.get('User-Agent', "")
        origin = 'http://localhost' if "Android" in user_agent else 'app://obsidian.md'
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods","GET")
        self.send_header("Access-Control-Allow-Headers","*")
        self.end_headers()

parser = ArgumentParser()
parser.add_argument("--bind-address", default="127.0.0.1", type=str, required=False)
parser.add_argument("--port", default=3323, type=int, required=False)
parser.add_argument("--verbose", action="store_true",default=False,required=False)
parser.add_argument("--location-timeout",default=30,type=float,required=False)
parser.add_argument("--location-interval",default=30,type=float,required=False)
args = parser.parse_args()

logger = Logger("location-server",verbose=args.verbose)
server = HTTPServer((args.bind_address,args.port),RequestHandlerClass=LocationServerHandler)
Thread(target=server.serve_forever).start()
logger.log(f"Listening on {args.bind_address}:{args.port}...")

while True:
    try:
        logger.debug("Starting location fetch...")
        result = subprocess.run(
            ["termux-location"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=args.location_timeout
        )
        if result.returncode != 0:
            logger.warn(f"termux-location failed: {result.stderr.decode().strip()}")
        else:
            location_data = result.stdout.decode("utf-8").strip()
            logger.debug(f"Location: {location_data}")
            with open("termux_location_result", "w", encoding="utf-8") as f:
                f.write(location_data)

        time.sleep(args.location_interval)

    except subprocess.TimeoutExpired:
        logger.warn(f"termux-location timed out after {args.location_timeout} seconds")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        time.sleep(5)
    except KeyboardInterrupt:
        server.shutdown()
        break