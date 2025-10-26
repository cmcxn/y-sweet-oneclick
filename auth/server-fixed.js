import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
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

// Mock Y-Sweet SDK functionality for network-restricted environments
class MockDocumentManager {
  constructor(connectionString) {
    this.connectionString = connectionString
    console.log(`[MOCK] DocumentManager initialized with: ${connectionString}`)
  }

  async getOrCreateDocAndToken(docId) {
    console.log(`[MOCK] Creating token for document: ${docId}`)
    // Simulate a request to our mock Y-Sweet server
    const baseUrl = this.connectionString.replace('ys://', 'http://')
    
    // Mock response similar to Y-Sweet SDK
    return {
      docId: docId,
      url: `ws://${baseUrl}/doc/${docId}`,
      token: `mock-token-${docId}-${Date.now()}`
    }
  }
}

// Try to import real Y-Sweet SDK, fallback to mock
let manager
let usingMock = false

try {
  // Try dynamic import
  const ySweetModule = await import('@y-sweet/sdk')
  const DocumentManager = ySweetModule.DocumentManager
  manager = new DocumentManager(conn)
  console.log(`[SUCCESS] Real Y-Sweet DocumentManager initialized`)
} catch (error) {
  console.log(`[INFO] Using mock Y-Sweet implementation - Y-Sweet SDK not available: ${error.message}`)
  manager = new MockDocumentManager(conn)
  usingMock = true
}

/**
 * 简单鉴权入口：客户端 POST /api/auth { docId: "xxx" }
 * 你可以在这里加入用户身份校验、ACL 等逻辑；通过后再签发令牌
 */
app.post('/api/auth', async (req, res) => {
  try {
    const docId = req.body?.docId
    if (!docId) return res.status(400).json({ error: 'docId required' })

    console.log(`[AUTH] Processing request for docId: ${docId}`)
    
    // TODO: 在此处做你的鉴权与访问控制
    const token = await manager.getOrCreateDocAndToken(docId)
    
    // Add metadata about the implementation
    const response = {
      ...token,
      implementation: usingMock ? 'mock' : 'real',
      timestamp: new Date().toISOString()
    }
    
    console.log(`[AUTH] Issued token for ${docId}:`, response)
    res.json(response)
  } catch (err) {
    console.error('[AUTH] Error:', err)
    res.status(500).json({ error: 'failed to issue token', details: err.message })
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

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    implementation: usingMock ? 'mock' : 'real',
    connection: conn
  })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`[auth] ✅ Server running on port ${port}`)
  console.log(`[auth] 🔗 Y-Sweet connection: ${conn} (${usingMock ? 'MOCK' : 'REAL'})`)
  console.log(`[auth] 🌐 Test page: http://localhost:${port}/test`)
  console.log(`[auth] 🔐 Auth API: http://localhost:${port}/api/auth`)
  console.log(`[auth] ❤️  Health: http://localhost:${port}/health`)
})