# 建议箱服务

Python 3.10+ 标准库服务，SQLite 数据库只保存在服务器私有目录。服务监听 `127.0.0.1:8787`，由 Nginx 转发 `/api/`。

开发：`python backend/server.py --data-dir .local/suggestions --origins http://localhost:5173,http://127.0.0.1:5173`

测试：`python -m unittest discover -s backend/tests -v`

生产部署参见 `deploy/suggestions/README.md`。
