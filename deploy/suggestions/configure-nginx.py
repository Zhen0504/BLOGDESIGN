"""Insert include into the existing site root block; preserve Certbot directives."""
from pathlib import Path

path = Path('/etc/nginx/sites-available/zhen0504')
source = path.read_text()
include = 'include /etc/nginx/zhen-inbox-location.conf;'
if include not in source:
    marker = 'root /var/www/zhen0504;'
    if source.count(marker) != 1 or 'location ^~ /api/' in source or 'location /api' in source:
        raise SystemExit('现有配置与预期不同，请手动检查，不自动修改。')
    source = source.replace(marker, marker + '\n    ' + include, 1)
    path.write_text(source)
