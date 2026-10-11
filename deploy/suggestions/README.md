# 部署建议箱

前提：现有网站 HTTPS 已配置。无需增加安全组端口；服务只监听本机 8787。

将部署包上传到 `/home/ecs-user`，解压到独立目录，进入该目录后执行：

```bash
sudo bash deploy/suggestions/install.sh
```

安装脚本备份 Nginx 配置，添加 `/api/` 转发，测试配置后才重载。含 `site/` 的部署包会在服务健康检查成功后备份现有网页并更新前端，先复制资源、最后更新入口文件，保留旧哈希资源供已打开的页面使用。安装后确认 `curl https://zhen0504.cn/api/health` 返回 `{"ok": true}`。

查看最近 20 条留言：

```bash
sudo -u zhen-inbox python3 /opt/zhen-inbox/inbox.py list
```

导出到私有目录（文件名不能重复）：

```bash
sudo -u zhen-inbox python3 /opt/zhen-inbox/inbox.py export --output /var/lib/zhen-inbox/messages-20261010.json
sudo -u zhen-inbox python3 /opt/zhen-inbox/inbox.py backup --output /var/lib/zhen-inbox/backup-20261010.sqlite3
```

数据库、备份及导出文件不可移动到网站目录。建议定期备份并清理不再需要的留言。留言无公开读取接口，不自动发布。接口限每来源每分钟 1 次、每天 20 次，全站每天 1000 次；共享网络可能共享限额。幂等标识有效 24 小时，超出后重试可能形成新留言。数据库保存留言与时间，不保存原始 IP；限流指纹使用服务器密钥生成，24 小时后在后续请求中清理。Nginx 现有访问日志可能仍记录 IP。

诊断：`sudo systemctl status zhen-inbox --no-pager`；`sudo journalctl -u zhen-inbox -n 30 --no-pager`。

本地地图定位：`sudo bash deploy/suggestions/install-map.sh`，使用已下载、核验的 DB-IP City Lite 2026-10 数据库与 Ubuntu `python3-maxminddb`。仅返回查询者自身的近似城市和坐标，不提供任意 IP 查询，不调用外部定位 API。数据库约 121MB，内存映射按需读取。以后数据库更新应核对官方许可、下载地址和校验值，再安装替换并重启服务。当前版本不添加自动更新任务。

回滚：恢复安装输出中的 Nginx 备份，执行 `sudo nginx -t && sudo systemctl reload nginx`，然后 `sudo systemctl stop zhen-inbox`。数据库保留。前端使用上线前的备份恢复。
