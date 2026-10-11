"""Private suggestion inbox. Python 3.10+, no third-party dependencies."""
import argparse
import hashlib
import hmac
import ipaddress
import json
import os
import secrets
import sqlite3
import time
import uuid
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from geolocation import CityLookup


class Inbox:
    def __init__(self, directory, clock=time.time):
        self.directory = Path(directory)
        self.directory.mkdir(parents=True, exist_ok=True)
        self.clock = clock
        secret_path = self.directory / 'secret'
        if not secret_path.exists():
            try:
                with secret_path.open('x') as stream:
                    stream.write(secrets.token_hex(32))
                secret_path.chmod(0o600)
            except FileExistsError:
                pass
        self.secret = bytes.fromhex(secret_path.read_text().strip())
        self.database = self.directory / 'inbox.sqlite3'
        with self.connect() as db:
            db.executescript('''
                CREATE TABLE IF NOT EXISTS suggestions (
                    id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, message TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS receipts (
                    request_id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL,
                    suggestion_id TEXT NOT NULL, created_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS submissions (
                    fingerprint TEXT NOT NULL, created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS submissions_time ON submissions(created_at);
                CREATE INDEX IF NOT EXISTS submissions_client ON submissions(fingerprint, created_at);
            ''')
        self.database.chmod(0o600)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.database, timeout=5)
        try:
            with db:
                yield db
        finally:
            db.close()

    def submit(self, payload, address):
        if not isinstance(payload, dict):
            return 400, {'error': '请求格式不正确。'}
        message = payload.get('message')
        request_id = payload.get('requestId')
        if not isinstance(message, str) or not 1 <= len(message.strip()) <= 1000:
            return 400, {'error': '请填写 1～1000 字的建议。'}
        if any(ord(char) < 32 and char not in '\n\r\t' for char in message):
            return 400, {'error': '建议包含不支持的字符。'}
        try:
            request_id = str(uuid.UUID(request_id))
        except (ValueError, TypeError, AttributeError):
            return 400, {'error': '提交标识无效，请刷新页面重试。'}
        if payload.get('website'):
            return 400, {'error': '提交未通过验证。'}
        now = int(self.clock())
        # Only a keyed fingerprint is stored, never the raw IP. Expire after 24h.
        fingerprint = hmac.new(self.secret, address.encode(), hashlib.sha256).hexdigest()
        message = message.strip()
        with self.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            db.execute('DELETE FROM submissions WHERE created_at <= ?', (now - 86400,))
            db.execute('DELETE FROM receipts WHERE created_at <= ?', (now - 86400,))
            receipt = db.execute('SELECT fingerprint, suggestion_id FROM receipts WHERE request_id = ?', (request_id,)).fetchone()
            if receipt:
                saved = db.execute('SELECT message FROM suggestions WHERE id = ?', (receipt[1],)).fetchone()
                if receipt[0] != fingerprint or not saved or saved[0] != message:
                    return 409, {'error': '提交标识已使用，请重新提交。'}
                return 200, {'ok': True, 'id': receipt[1]}
            recent = db.execute('SELECT COUNT(*), MAX(created_at) FROM submissions WHERE fingerprint = ?', (fingerprint,)).fetchone()
            if recent[0] >= 20 or (recent[1] is not None and now - recent[1] < 60):
                return 429, {'error': '提交太频繁，请稍后再试。'}
            # Also bound global daily writes to keep the small server manageable.
            if db.execute('SELECT COUNT(*) FROM submissions').fetchone()[0] >= 1000:
                return 429, {'error': '建议箱暂时繁忙，请稍后再试。'}
            suggestion_id = str(uuid.uuid4())
            db.execute('INSERT INTO suggestions VALUES (?, ?, ?)', (suggestion_id, now, message))
            db.execute('INSERT INTO receipts VALUES (?, ?, ?, ?)', (request_id, fingerprint, suggestion_id, now))
            db.execute('INSERT INTO submissions VALUES (?, ?)', (fingerprint, now))
        return 201, {'ok': True, 'id': suggestion_id}


def make_handler(inbox, origins, behind_proxy=False, city_lookup=None):
    class Handler(BaseHTTPRequestHandler):
        server_version = 'Inbox'
        sys_version = ''

        def setup(self):
            super().setup()
            self.connection.settimeout(10)

        def log_message(self, *args):
            # Avoid raw IPs, request bodies, and user-supplied log content.
            pass

        def respond(self, status, data):
            encoded = json.dumps(data, ensure_ascii=False).encode('utf-8')
            self.send_response(status)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(encoded)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Connection', 'close')
            if status == 429:
                self.send_header('Retry-After', '60')
            self.end_headers()
            self.wfile.write(encoded)

        def do_GET(self):
            if self.path == '/api/health':
                self.respond(200, {'ok': True})
            elif self.path == '/api/location':
                address = self.headers.get('X-Real-IP', '') if behind_proxy else self.client_address[0]
                self.respond(200, city_lookup.locate(address) if city_lookup else {'available': False})
            else:
                self.respond(404, {'error': '接口不存在。'})

        def do_POST(self):
            if self.path != '/api/suggestions':
                return self.respond(404, {'error': '接口不存在。'})
            if self.headers.get('Origin') not in origins:
                return self.respond(403, {'error': '请求来源不被允许。'})
            if self.headers.get_content_type() != 'application/json':
                return self.respond(415, {'error': '请使用 JSON 请求。'})
            if self.headers.get('Transfer-Encoding'):
                return self.respond(400, {'error': '请求格式不正确。'})
            try:
                length = int(self.headers.get('Content-Length', '0'))
                if not 1 <= length <= 8192:
                    return self.respond(413, {'error': '提交内容过大或为空。'})
                payload = json.loads(self.rfile.read(length))
                address = self.headers.get('X-Real-IP', '') if behind_proxy else self.client_address[0]
                address = str(ipaddress.ip_address(address))
                status, result = inbox.submit(payload, address)
            except (ValueError, UnicodeDecodeError):
                return self.respond(400, {'error': '请求格式不正确。'})
            except (sqlite3.Error, OSError):
                return self.respond(503, {'error': '暂时无法保存，请稍后重试。'})
            self.respond(status, result)

    return Handler


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', default='/var/lib/zhen-inbox')
    parser.add_argument('--port', type=int, default=8787)
    parser.add_argument('--origins', default='https://zhen0504.cn,https://www.zhen0504.cn')
    parser.add_argument('--behind-proxy', action='store_true')
    parser.add_argument('--geoip-db', default='/opt/zhen-inbox/geoip-city.mmdb')
    args = parser.parse_args()
    os.umask(0o077)
    inbox = Inbox(args.data_dir)
    server = ThreadingHTTPServer(('127.0.0.1', args.port), make_handler(inbox, set(args.origins.split(',')), args.behind_proxy, CityLookup(args.geoip_db)))
    server.serve_forever()


if __name__ == '__main__':
    main()
