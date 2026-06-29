# 服务器部署文档

> **记录所有服务器环境、密码、路径、踩坑、当前状态。**

---

## 一、当前生产服务器（新 ECS）

| 项目 | 值 |
|------|-----|
| IP | **8.152.100.211** |
| 类型 | 阿里云 ECS |
| OS | Ubuntu 26.04 LTS |
| CPU | 2 vCPU |
| 内存 | 4GB |
| 磁盘 | 80GB (69GB 可用) |
| SSH | `ssh root@8.152.100.211` 密码 `HENGloveXUE1314.` |

### 已安装环境

| 工具 | 版本 | 安装方式 |
|------|------|---------|
| Node.js | v20.20.2 | NodeSource deb |
| npm | 10.8.2 | 随 Node |
| pnpm | 9.15.9 | `npm install -g pnpm@9` |
| PM2 | 7.0.3 | `npm install -g pm2` |
| MySQL | 8.4.10 | `apt install mysql-server` |
| Git | 2.53.0 | `apt install git` |

### 数据库

| 项目 | 值 |
|------|-----|
| Host | localhost:3306 |
| User | root |
| Password | DCHdch1234. |
| Database | en |
| 连接串 | `mysql://root:DCHdch1234.@localhost:3306/en?timezone=%2B08%3A00` |

**可视化工具连接**（DataGrip/Navicat/TablePlus）:
- Host: `8.152.100.211`
- Port: `3306`
- User: `root`
- Password: `DCHdch1234.`
- Database: `en`
- 安全组需开放 3306 端口

### 项目路径

| 路径 | 说明 |
|------|------|
| `/opt/english-learning-platform/` | 项目根目录 |
| `/opt/english-learning-platform/apps/server/` | 后端 |
| `/opt/english-learning-platform/apps/web/` | 前端 |

### 运行端口

| 端口 | 服务 | 安全组 |
|------|------|--------|
| 22 | SSH | ✅ 已开放 |
| 5200 | 前端 Next.js | ✅ 已开放 |
| 5201 | 后端 Express API | ✅ 已开放 |
| 3306 | MySQL | 需手动开放 |

### 环境变量

**`apps/server/.env`**:
```
DATABASE_URL=mysql://root:DCHdch1234.@localhost:3306/en?timezone=%2B08%3A00
JWT_ACCESS_SECRET=k8m3n2p5q8r1t4v7w0x3y6z9c2e5g8h1j4m7n0p3q6t9v2w5x8y1
JWT_REFRESH_SECRET=w5x8y1z4a7b0c3d6e9f2g5h8i1j4k7l0m3n6o9p2q5r8s1t4
CORS_ORIGIN=http://8.152.100.211:5200
PORT=5201
NODE_ENV=production
```

**`apps/web/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://8.152.100.211:5201/api/v1
```

### PM2 管理

```bash
pm2 status          # 查看进程状态
pm2 logs            # 查看日志
pm2 logs backend    # 后端日志
pm2 logs frontend   # 前端日志
pm2 restart all     # 重启全部
pm2 stop all        # 停止全部
```

### 更新部署流程

```bash
cd /opt/english-learning-platform
git pull
pnpm install
pnpm run build
pm2 restart all
```

---

## 二、旧服务器（已废弃）

| 项目 | 值 |
|------|-----|
| IP | 123.56.146.148 |
| OS | CentOS 7 |
| 状态 | MySQL 已停，待退订 |

---

## 三、部署记录

### 2026-06-29 部署过程

1. **22:05** - SSH 连新 ECS，确认环境（Ubuntu 26.04, 4GB, 80GB）
2. **22:12** - 安装 Node 20、MySQL 8.4、Git、pnpm、PM2
3. **22:15** - 从旧服务器导出 17MB SQL dump，经 Mac 中转上传至新服务器
4. **22:18** - 导入数据库：16,953 词条、960 题、6,165 搭配全部迁移
5. **22:19** - Clone 仓库、配置 .env、`pnpm install`
6. **22:25** - `pnpm run build` 成功（耗时 1m44s），PM2 启动前后端
7. **22:28** - 修复 `@english/shared` package.json 指向 dist
8. **22:30** - 修复 `Resend` API key 缺失导致后端崩溃 → 改为懒加载
9. **22:32** - 开放安全组 5200/5201，外部访问验证通过
10. **22:35** - 配置 MySQL 远程访问

### 遇到的坑

1. **`@english/shared` 指向 TS 源文件**: `package.json` 的 `main` 字段是 `src/index.ts`，Node 生产环境无法加载。解决：`npx tsc` 编译 + 改 package.json 指向 `dist/index.js`
2. **Resend 启动崩溃**: 模块顶层 `new Resend(undefined)` 导致整个服务启动失败。解决：改为懒加载 `getResend()`
3. **MySQL 8.4 默认 auth_socket**: root 只能本地 socket 登录。解决：`ALTER USER` 设置密码 + `CREATE USER root@'%'`

### 与旧服务器对比

| 操作 | 旧服务器 (CentOS 7) | 新 ECS (Ubuntu 26.04) |
|------|---------------------|----------------------|
| 装 Node 20 | ❌ GLIBC 太老 | ✅ 一行命令 |
| Docker | ❌ 1.13.1 + 被墙 | 未尝试（不需要） |
| npm install | ❌ OOM kill | ✅ 正常 |
| pnpm install | ❌ OOM kill | ✅ 正常 |
| 构建 | 只能在 Mac 构建后 SCP | ✅ 服务器直接构建 |
| 部署耗时 | 3 小时（大量踩坑） | 15 分钟 |
