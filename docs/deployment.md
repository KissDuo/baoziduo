# 服务器部署文档

> **记录所有服务器环境、密码、路径、踩坑、当前状态。**

---

## 一、服务器信息

| 项目 | 值 |
|------|-----|
| IP | 123.56.146.148 |
| 类型 | 阿里云轻量应用服务器 |
| OS | CentOS 7 (Core) |
| GLIBC | 2.17 (极老，是最大坑) |
| CPU | x86_64 |
| 内存 | 1GB (992MB) |
| 磁盘 | 40GB (17GB 可用) |
| MySQL | 5.7.33 (localhost:3306) |
| SSH | root / `DCHdch1234.` |

---

## 二、已安装环境

| 工具 | 版本 | 安装方式 |
|------|------|---------|
| Node.js | v14.16.0 (系统) / v16.5.0 (nvm) | 系统 + nvm |
| npm | 6.14.11 | 系统 |
| pnpm | 9.14.1 | `npm install -g pnpm@9` |
| pm2 | 7.0.3 | `npm install -g pm2` |
| nvm | 已安装 | `/root/nvm/` |
| Docker | 1.13.1 | `yum install docker` |
| Git | 1.8.3.1 | 系统 |

---

## 三、路径

| 路径 | 说明 |
|------|------|
| `/root/daodaodao/` | 旧项目目录 |
| `/root/english-learning-platform/` | 本项目（已 clone） |
| `/root/nvm/` | nvm 安装目录（非标准路径！） |

---

## 四、踩坑记录

### 坑1: CentOS 7 GLIBC 太老（核心问题）
- **症状**: Node 18+ 报 `GLIBC_2.25 not found` / `GLIBC_2.28 not found`
- **原因**: CentOS 7 只有 GLIBC 2.17
- **最终方案**: 用 Node.js 非官方构建 `node-v18.20.8-linux-x64-glibc-217.tar.xz`（已下载到本地 `/tmp/`，待传服务器）

### 坑2: nvm 路径非标准
- **症状**: `source ~/.nvm/nvm.sh` 找不到
- **原因**: nvm 装在 `/root/nvm/` 而非默认的 `~/.nvm/`
- **解决**: `export NVM_DIR="/root/nvm"`

### 坑3: Docker Hub 被墙
- **症状**: `docker pull node:18-alpine` 超时
- **原因**: 服务器在国内，Docker Hub 不可达
- **尝试**: 阿里云镜像、DaoCloud 镜像 → Docker 1.13.1 不兼容新配置格式，systemd override 导致 Docker 启动失败
- **结论**: Docker 路线放弃，改用原生 Node + PM2

### 坑4: GitHub 被墙
- **症状**: `git pull` 失败 `Encountered end of file`
- **解决**: 用 `scp` 传文件替代 git pull

### 坑5: Docker 版本极老
- CentOS 7 yum 装的 Docker 是 1.13.1 (2017年)，不兼容 registry mirror 配置

### 坑6: 内存紧张
- 1GB 内存，空闲仅 150MB
- Docker 方案不可行也和内存有关

## 五、部署方案变更记录

| 方案 | 结果 | 原因 |
|------|------|------|
| 原生 Node 20 | ❌ | GLIBC 太老 |
| Docker + Node 18 Alpine | ❌ | Docker Hub 被墙 + Docker 太老 |
| Node 18 glibc-217 二进制 | 🔄 | 已下载，待传到服务器 |

## 六、当前进度（2026-06-29 18:30）

**已完成**:
- [x] 服务器环境检查
- [x] pnpm、pm2 安装
- [x] 项目代码 clone 到 `/root/english-learning-platform/`
- [x] 本地构建成功（server dist + web standalone）
- [x] 构建产物已传至服务器（dist/ + .next/standalone/）
- [x] Node 18 glibc-217 二进制下载到本地 `/tmp/node18-glibc217.tar.xz`

**待完成**:
- [ ] SCP Node 18 二进制到服务器并解压
- [ ] 配置 PATH 使用 Node 18
- [ ] 用 PM2 启动后端（port 5201）+ 前端（port 5200）
- [ ] 开放阿里云安全组端口
- [ ] 验证访问

## 七、数据库

| 项目 | 值 |
|------|-----|
| Host | localhost:3306 |
| User | root |
| Password | DCHdch1234. |
| Database | en |
| 连接串 | `mysql://root:DCHdch1234.@localhost:3306/en?timezone=%2B08%3A00` |

## 六、当前状态

- [ ] Docker 镜像构建
- [ ] 项目运行
- [ ] 端口 5200/5201 开放

---

## 七、本地开发环境

| 项目 | 值 |
|------|-----|
| GitHub | github.com/KissDuo/baoziduo (公开) |
| 工作流 | 本地改 → push GitHub → SSH 服务器 git pull → 重新构建/重启 |
