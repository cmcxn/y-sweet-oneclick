# Y‑Sweet + MinIO + Auth 一键启动

## 目录
- `docker-compose.yml`
- `.env.example`（复制为 `.env` 后修改）
- `auth/server.js` + `auth/package.json`（签发客户端 Token 的最小后端）
- `frontend-test.html`（YJS 基本数据类型测试页面）

## 快速开始
```bash
cd y-sweet-oneclick
cp .env.example .env
# 如需修改：S3_BUCKET、MINIO_ROOT_* 等变量
docker compose up -d
```

### 查看服务
- MinIO 控制台: http://localhost:9001  （用户名/密码见 `.env`）
- Y‑Sweet 服务: `ys://localhost:8080`  （容器发布到 8080）
- Auth 后端: http://localhost:3000
- **YJS 测试页面**: http://localhost:3000/test

### 客户端连接（示例）
前端调用你的后端 `/api/auth` 获取 Token：
```ts
import * as Y from 'yjs'
import { createYjsProvider } from '@y-sweet/client'

const doc = new Y.Doc()
const docId = 'demo-1'
// 后端会用 DocumentManager 按 docId 签发 Token
createYjsProvider(doc, docId, 'http://localhost:3000/api/auth')
```

## YJS 基本数据类型测试

项目包含一个完整的前端测试页面 `frontend-test.html`，用于测试和验证 YJS 的基本数据类型操作。

### 功能特性
- **Y.Map 测试**：键值对数据结构的设置、获取、删除操作
- **Y.Array 测试**：数组的添加、插入、删除、清空操作
- **Y.Text 测试**：文本的插入、删除、清空操作
- **Y.XmlElement 测试**：XML 元素的创建和属性设置
- **实时协作演示**：多个浏览器标签页之间的实时数据同步
- **操作日志**：详细的操作记录和状态监控

### 使用方法
1. 确保 Y-Sweet 服务已启动：`docker compose up -d`
2. 在浏览器中访问 http://localhost:3000/test
3. 等待连接到 Y-Sweet 服务器
4. 使用各个测试区域验证不同的数据类型操作
5. 打开多个浏览器标签页测试实时协作功能

### 注意事项
- 测试页面会自动连接到 `http://localhost:3000/api/auth` 获取授权
- 每次打开页面会创建一个唯一的文档 ID 进行测试
- 实时协作功能可以在不同的浏览器标签页、不同浏览器甚至不同设备之间工作
```

### 生产要点
- **持久化**：数据保存在 MinIO（S3 兼容）；桶名在 `.env` 的 `S3_BUCKET`。
- **鉴权**：在 `auth/server.js` 里实现你的用户校验与 ACL 再签发 Token。
- **外网访问**：若要浏览器外网访问，把 `.env` 中的 `CONNECTION_STRING` 改成可达的域名/IP：
  ```env
  CONNECTION_STRING=ys://example.com:8080
  ```
  并在云防火墙/路由器上放通 8080/3000（或放到反向代理后面）。
- **数据备份**：建议开启 MinIO 的生命周期/版本控制，或定期 `mc mirror` 到冷备桶。

> 如果你已有 S3（如 AWS S3），可把 `ysweet` 服务的 `AWS_*` 环境变量指向真实 S3（并删掉 minio/minio-init 两个服务）。
