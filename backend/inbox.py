"""Local-only admin commands: no HTTP endpoint, credentials, or public inbox."""
import argparse
import json
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description='查看、导出或备份私有建议箱')
    parser.add_argument('command', choices=['list', 'export', 'backup'])
    parser.add_argument('--data-dir', default='/var/lib/zhen-inbox')
    parser.add_argument('--limit', type=int, default=20)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    database = (Path(args.data_dir) / 'inbox.sqlite3').resolve()
    if not database.exists():
        parser.error('数据库尚未创建，请先启动服务。')
    with closing(sqlite3.connect(database.as_uri() + '?mode=ro', uri=True)) as db:
        if args.command == 'backup':
            if not args.output:
                parser.error('备份需要 --output 路径')
            if args.output.exists():
                parser.error('输出文件已存在，请选择新路径')
            with closing(sqlite3.connect(args.output)) as destination:
                db.backup(destination)
            args.output.chmod(0o600)
            return
        rows = db.execute('SELECT id, created_at, message FROM suggestions ORDER BY created_at DESC, rowid DESC' + (' LIMIT ?' if args.command == 'list' else ''), (max(1, min(args.limit, 1000)),) if args.command == 'list' else ()).fetchall()
        records = [{'id': row[0], 'createdAt': datetime.fromtimestamp(row[1], timezone.utc).isoformat(), 'message': row[2]} for row in rows]
        if args.command == 'export':
            if not args.output:
                parser.error('导出需要 --output 路径')
            with args.output.open('x', encoding='utf-8') as stream:
                json.dump(records, stream, ensure_ascii=False, indent=2)
            args.output.chmod(0o600)
        else:
            # JSON escapes control characters so visitor text cannot control the terminal.
            print(json.dumps(records, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
