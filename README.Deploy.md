## 生产环境部署（Ubuntu 24.04）

### 一、安装依赖组件

```bash
# 更新包索引
apt update

# Git
apt install -y git

# Python 3 + venv
apt install -y python3 python3-venv python3-pip

# Node.js 18（通过 NodeSource）
#curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
#apt install -y nodejs

#Vite 6 要求 20.19+ 或 22.12+。升级到 Node.js 22：
# 重新安装 NodeSource 源（22.x）
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs


# Nginx
apt install -y nginx
systemctl enable nginx && systemctl start nginx

# MySQL
apt install -y mysql-server

```

### 二、首次部署

```bash
# 1. 拉取代码
git clone <repo-url> /opt/vibcheck

# 2. 创建 Python 虚拟环境 + 安装依赖
cd /opt/vibcheck
python3 -m venv venv
venv/bin/pip install -r backend/requirements.txt

# 3. 配置数据库连接（MySQL 在本机，host 用 127.0.0.1）
cp backend/.env.example backend/.env
nano backend/.env   # 填入 user / password / dbname

# 4. 构建前端
cd /opt/vibcheck/frontend
npm install && npm run build

# 5. 注册 systemd 服务
cp /opt/vibcheck/deploy/vibcheck.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable vibcheck
systemctl start vibcheck

# 6. 配置 Nginx
cp /opt/vibcheck/deploy/nginx.conf /etc/nginx/conf.d/vibcheck.conf
nginx -t && systemctl reload nginx