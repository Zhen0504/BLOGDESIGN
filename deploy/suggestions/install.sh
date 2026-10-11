#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
test "$(id -u)" = 0 || { echo '请使用 sudo bash 执行'; exit 1; }
test -f /etc/nginx/sites-available/zhen0504
command -v python3 >/dev/null
id zhen-inbox >/dev/null 2>&1 || useradd --system --home-dir /var/lib/zhen-inbox --shell /usr/sbin/nologin zhen-inbox
if test -f /opt/zhen-inbox/server.py; then
    install -d -m 700 /var/backups/zhen0504
    tar --exclude='geoip-city.mmdb' -czf "/var/backups/zhen0504/backend.$(date +%Y%m%d%H%M%S).tar.gz" -C /opt/zhen-inbox .
fi
install -d -m 755 /opt/zhen-inbox
install -m 644 backend/server.py backend/inbox.py backend/geolocation.py /opt/zhen-inbox/
install -m 644 deploy/suggestions/zhen-inbox.service /etc/systemd/system/zhen-inbox.service
install -m 644 deploy/suggestions/nginx-location.conf /etc/nginx/zhen-inbox-location.conf
backup="/etc/nginx/sites-available/zhen0504.before-inbox.$(date +%Y%m%d%H%M%S)"
cp -p /etc/nginx/sites-available/zhen0504 "$backup"
python3 deploy/suggestions/configure-nginx.py
if ! nginx -t; then
    cp -p "$backup" /etc/nginx/sites-available/zhen0504
    echo "配置检查失败，已恢复 $backup"
    exit 1
fi
systemctl daemon-reload
systemctl enable --now zhen-inbox
systemctl restart zhen-inbox
curl --fail --silent --retry 5 --retry-connrefused --retry-delay 1 http://127.0.0.1:8787/api/health
systemctl reload nginx
printf '\n后端安装完成。Nginx 备份：%s\n' "$backup"
if test -f site/index.html; then
    install -d -m 700 /var/backups/zhen0504
    site_backup="/var/backups/zhen0504/site-before-inbox.$(date +%Y%m%d%H%M%S).tar.gz"
    tar --exclude='*.tar.gz' -czf "$site_backup" -C /var/www/zhen0504 .
    # Copy resources before index, preserve older hashed resources for open tabs.
    for source in site/*; do
        test "$(basename "$source")" = index.html && continue
        cp -a "$source" /var/www/zhen0504/
    done
    install -m 644 site/index.html /var/www/zhen0504/index.html
    printf '前端已更新。网站备份：%s\n' "$site_backup"
fi
