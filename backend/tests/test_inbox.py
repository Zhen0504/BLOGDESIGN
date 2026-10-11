import concurrent.futures
import http.client
import json
import sqlite3
import sys
import subprocess
import tempfile
import threading
import unittest
import uuid
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from server import Inbox, make_handler


def payload(text='中文建议：希望多写一些开发记录。'):
    return {'requestId': str(uuid.uuid4()), 'message': text, 'website': ''}


class InboxTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.now = 100000
        self.inbox = Inbox(self.temp.name, lambda: self.now)

    def tearDown(self):
        self.temp.cleanup()

    def count(self):
        with self.inbox.connect() as db:
            return db.execute('SELECT COUNT(*) FROM suggestions').fetchone()[0]

    def test_persist_and_idempotent_retry(self):
        data = payload()
        first = self.inbox.submit(data, '192.0.2.1')
        self.assertEqual(first[0], 201)
        self.assertEqual(self.inbox.submit(data, '192.0.2.1'), (200, first[1]))
        self.assertEqual(self.count(), 1)
        self.assertEqual(self.inbox.submit({**data, 'message': '另一条'}, '192.0.2.1')[0], 409)
        fresh = Inbox(self.temp.name, lambda: self.now)
        self.assertEqual(fresh.submit(data, '192.0.2.1')[0], 200)
        with self.inbox.connect() as db:
            self.assertEqual(db.execute('SELECT message FROM suggestions').fetchone()[0], data['message'])
            self.assertNotIn('192.0.2.1', str(db.execute('SELECT * FROM submissions').fetchall()))

    def test_invalid_payloads_do_not_save(self):
        for data in [None, [], {}, payload('  '), payload('a' * 1001), payload('a\x1bb'), {**payload(), 'requestId': 'wrong'}, {**payload(), 'website': 'spam'}]:
            self.assertEqual(self.inbox.submit(data, '192.0.2.1')[0], 400)
        self.assertEqual(self.count(), 0)

    def test_rate_limit_and_expiry(self):
        self.assertEqual(self.inbox.submit(payload(), '192.0.2.1')[0], 201)
        self.assertEqual(self.inbox.submit(payload(), '192.0.2.1')[0], 429)
        self.now += 60
        for _ in range(19):
            self.assertEqual(self.inbox.submit(payload(), '192.0.2.1')[0], 201)
            self.now += 60
        self.assertEqual(self.inbox.submit(payload(), '192.0.2.1')[0], 429)
        self.now += 86400
        self.assertEqual(self.inbox.submit(payload(), '192.0.2.1')[0], 201)
        self.assertEqual(self.count(), 21)

    def test_concurrent_duplicate(self):
        data = payload()
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(lambda _: self.inbox.submit(data, '192.0.2.2'), range(6)))
        self.assertEqual(sum(status == 201 for status, _ in results), 1)
        self.assertEqual(self.count(), 1)

    def test_admin_list_export_and_backup(self):
        self.inbox.submit(payload('管理员查看测试'), '192.0.2.1')
        command = [sys.executable, str(Path(__file__).resolve().parents[1] / 'inbox.py')]
        listed = subprocess.run(command + ['list', '--data-dir', self.temp.name], capture_output=True, check=True, encoding='utf-8', env={**__import__('os').environ, 'PYTHONIOENCODING': 'utf-8'})
        self.assertEqual(json.loads(listed.stdout)[0]['message'], '管理员查看测试')
        for mode, filename in [('export', 'messages.json'), ('backup', 'backup.sqlite3')]:
            target = Path(self.temp.name) / filename
            subprocess.run(command + [mode, '--data-dir', self.temp.name, '--output', str(target)], check=True)
            self.assertTrue(target.exists())
        with sqlite3.connect(Path(self.temp.name) / 'backup.sqlite3') as backup:
            self.assertEqual(backup.execute('SELECT COUNT(*) FROM suggestions').fetchone()[0], 1)
        backup.close()


class HttpTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.inbox = Inbox(self.temp.name)
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), make_handler(self.inbox, {'https://zhen0504.cn'}, True))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temp.cleanup()

    def request(self, method='POST', path='/api/suggestions', data=None, headers=None):
        body = json.dumps(data if data is not None else payload()).encode() if method == 'POST' else None
        defaults = {'Origin': 'https://zhen0504.cn', 'Content-Type': 'application/json', 'X-Real-IP': '192.0.2.3'}
        defaults.update(headers or {})
        connection = http.client.HTTPConnection(*self.server.server_address, timeout=3)
        connection.request(method, path, body, defaults)
        response = connection.getresponse()
        result = (response.status, json.loads(response.read()))
        connection.close()
        return result

    def test_http_save_and_no_public_read(self):
        self.assertEqual(self.request()[0], 201)
        self.assertEqual(self.request('GET')[0], 404)
        self.assertEqual(self.request('GET', '/api/health'), (200, {'ok': True}))
        self.assertEqual(self.request('GET', '/api/export')[0], 404)
        self.assertEqual(self.request('GET', '/api/location'), (200, {'available': False}))

    def test_origin_body_and_address_validation(self):
        self.assertEqual(self.request(headers={'Origin': 'https://evil.example'})[0], 403)
        self.assertEqual(self.request(headers={'Content-Type': 'text/plain'})[0], 415)
        self.assertEqual(self.request(headers={'X-Real-IP': 'fake'})[0], 400)
        self.assertEqual(self.request(data=payload('a' * 9000))[0], 413)
        self.assertEqual(self.request('POST', '/api/missing')[0], 404)


if __name__ == '__main__':
    unittest.main()
