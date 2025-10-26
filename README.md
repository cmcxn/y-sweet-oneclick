# Y‑Sweet + MinIO + Auth 一键启动

## 目录
- `docker-compose.yml`
- `.env.example`（复制为 `.env` 后修改）
- `auth/server.js` + `auth/package.json`（签发客户端 Token 的最小后端）

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
