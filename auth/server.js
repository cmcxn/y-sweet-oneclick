import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { DocumentManager } from '@y-sweet/sdk'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.use(cors())
app.use(bodyParser.json())

// 推荐把 CONNECTION_STRING 放在 .env 中（compose 已传递进来）
const conn = process.env.CONNECTION_STRING || 'ys://ysweet:8080'
const manager = new DocumentManager(conn)

/**
 * 简单鉴权入口：客户端 POST /api/auth { docId: "xxx" }
 * 你可以在这里加入用户身份校验、ACL 等逻辑；通过后再签发令牌
 */
app.post('/api/auth', async (req, res) => {
  try {
    const docId = req.body?.docId
    if (!docId) return res.status(400).json({ error: 'docId required' })

    // TODO: 在此处做你的鉴权与访问控制
    const token = await manager.getOrCreateDocAndToken(docId)
    res.json(token)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed to issue token' })
  }
})

/**
 * 提供前端测试页面
 */
app.get('/test', async (req, res) => {
  try {
    const htmlPath = join(__dirname, 'frontend-test.html')
    const htmlContent = await readFile(htmlPath, 'utf8')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(htmlContent)
  } catch (err) {
    console.error('Failed to load frontend-test.html:', err)
    res.status(500).send('无法加载测试页面')
  }
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`[auth] running on :${port}, using CONNECTION_STRING=${conn}`)
  console.log(`[auth] frontend test page available at: http://localhost:${port}/test`)
})
