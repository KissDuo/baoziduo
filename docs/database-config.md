# 数据库配置

## 连接信息

| 项目 | 值 |
|------|-----|
| 主机 | 123.56.146.148:3306 |
| 用户 | root |
| 密码 | DCHdch1234. |
| 数据库 | en |
| 时区 | +08:00 |

**连接字符串**:
```
mysql://root:DCHdch1234.@123.56.146.148:3306/en?timezone=%2B08%3A00
```

**环境变量** (`apps/server/.env`):
```
DATABASE_URL=mysql://root:DCHdch1234.@123.56.146.148:3306/en?timezone=%2B08%3A00
```

## 安全规则

**绝对禁止**: 未经用户明确同意，不得执行任何 DELETE / DROP / TRUNCATE 操作。

**必须确认**:
1. 操作影响多少行/哪些表
2. 是否有备份/恢复方案
3. 用户明确说"可以"后才能执行

**种子文件**: prisma/ 下的 SQL 种子文件开头的 DELETE 语句会清空整个考试的数据，重新运行时必须特别谨慎。

## IELTS 题库种子备份

完整的 C18/C19/C20 数据已导出为 SQL 种子文件，位于 `apps/server/prisma/`：

| 文件 | 大小 | 内容 |
|------|------|------|
| `seed-ielts-c18.sql` | 112 KB | C18 听力+阅读，4 Tests，320 题 |
| `seed-ielts-c19.sql` | 222 KB | C19 听力+阅读，4 Tests，320 题 |
| `seed-ielts-c20.sql` | 225 KB | C20 听力+阅读，4 Tests，320 题 |

### 恢复方法
```bash
mysql -u root -pDCHdch1234. -h 123.56.146.148 en < apps/server/prisma/seed-ielts-c18.sql
mysql -u root -pDCHdch1234. -h 123.56.146.148 en < apps/server/prisma/seed-ielts-c19.sql
mysql -u root -pDCHdch1234. -h 123.56.146.148 en < apps/server/prisma/seed-ielts-c20.sql
```

### 导出方法
每次修改题库数据后，运行以下命令重新导出：
```bash
DATABASE_URL="mysql://root:DCHdch1234.@123.56.146.148:3306/en?timezone=%2B08%3A00" \
  ./apps/server/node_modules/.bin/tsx /tmp/export-seeds.ts
```

导出脚本位于 `/tmp/export-seeds.ts`。

## 音频文件

听力音频存储在阿里云 OSS，命名格式：

```
https://yxzm-audio.oss-cn-beijing.aliyuncs.com/Cambridge-IELTS-{book}/T{test}/S{section}.mp3
```

| 参数 | 说明 | 示例 |
|------|------|------|
| `{book}` | 剑雅书号 | 18, 19, 20 |
| `{test}` | Test 编号 | 1-4 |
| `{section}` | Part 编号 | 1-4 |

示例：`https://yxzm-audio.oss-cn-beijing.aliyuncs.com/Cambridge-IELTS-19/T1/S1.mp3`

已为 C18/C19/C20 共 48 个听力 section 写入 `IELTSExamSection.audioUrl`。
