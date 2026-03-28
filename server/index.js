import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.deepseek.com'
const MODEL = process.env.MODEL || 'deepseek-chat'

console.log('🔍 API Key 状态:', API_KEY ? '已配置' : '未配置')
console.log('🔍 API Base URL:', API_BASE_URL)
console.log('🔍 Model:', MODEL)

app.use(cors())
app.use(express.json())

app.get('/api/test', (req, res) => {
  res.json({
    message: '后端服务运行正常！',
    timestamp: new Date().toISOString(),
    port: PORT
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

function buildPrompt(question, story) {
  return `## 角色
你是一个神秘的海龟汤游戏主持人。你必须严格遵守以下规则。

## 背景信息
- 汤面（题目）：${story.surface}
- 汤底（真相）：${story.bottom}

## 你的回答规则
玩家向你提问，你只能从以下三个词中选择一个回答：
- "是"：玩家的猜测与汤底完全一致
- "否"：玩家的猜测与汤底相悖或错误
- "无关"：玩家的猜测与汤底无关，或者无法判断

## 严格禁止
1. 禁止透露汤底的任何细节
2. 禁止解释你的回答原因
3. 禁止说"可能是"、"不确定"等模糊回答
4. 禁止在回答中添加标点符号或多余文字
5. 禁止进行任何额外推理

## 判断示例
假设汤底是："一个人在电梯里自杀，因为他欠了巨额债务"

正确判断：
- "他是因为债务自杀的吗？" → "是"
- "他是他杀吗？" → "否"
- "他是自杀的吗？" → "是"
- "电梯里当时有几个人？" → "无关"
- "他是不是男人？" → "无关"

## 回答格式
只允许输出一个字："是"、"否"或"无关"。不要输出任何其他内容。

## 玩家的问题
${question}

请立即回答：`
}

function normalizeVerdict(response) {
  const trimmed = response.trim().replace(/[。，！？、""''【】（）]/g, '')
  
  const yesPatterns = ['是', '对的', '正确', 'YES', 'yes', 'Yes', 'true', 'True', '√', '✓']
  const noPatterns = ['否', '不是', '错', '不对', '错误', 'NO', 'no', 'No', 'false', 'False', '×', '✗']
  
  for (const pattern of yesPatterns) {
    if (trimmed.includes(pattern)) {
      return '是'
    }
  }
  
  for (const pattern of noPatterns) {
    if (trimmed.includes(pattern)) {
      return '否'
    }
  }
  
  return '无关'
}

app.post('/api/chat', async (req, res) => {
  try {
    const { question, story } = req.body

    if (!question || !story) {
      return res.status(400).json({ error: '缺少必要参数：question 和 story' })
    }

    if (!API_KEY) {
      console.warn('API Key 未配置，使用模拟回答')
      const mockAnswer = getMockAnswer(question, story)
      return res.json({ 
        answer: mockAnswer,
        note: '模拟回答（后端未配置API Key）'
      })
    }

    const prompt = buildPrompt(question, story)

    console.log('📝 玩家问题:', question)
    console.log('📝 发送的Prompt:', prompt)

    const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 50,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ DeepSeek API 错误:', errorData)
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    console.log('🤖 AI 原始回答:', aiResponse)

    if (!aiResponse) {
      throw new Error('API返回内容为空')
    }

    const verdict = normalizeVerdict(aiResponse)
    console.log('✅ 解析后的回答:', verdict)

    res.json({ answer: verdict, raw: aiResponse })
  } catch (error) {
    console.error('❌ AI API 调用失败:', error)
    
    if (!API_KEY) {
      return res.json({ answer: '无关' })
    }
    
    res.status(500).json({ error: error.message || 'AI服务出错' })
  }
})

function getMockAnswer(question, story) {
  const normalizedQuestion = question.toLowerCase()
  const normalizedTruth = story.bottom.toLowerCase()

  if (normalizedQuestion.length < 2) return '无关'

  const questionWords = normalizedQuestion.split(/[,，、\s]+/).filter(Boolean)
  const truthWords = normalizedTruth.split(/[,，、\s]+/).filter(Boolean)

  const hasOverlap = questionWords.some((qWord) =>
    truthWords.some((tWord) => tWord.includes(qWord) || qWord.includes(tWord))
  )

  if (hasOverlap) return '是'

  if (normalizedQuestion.includes('是不是') || normalizedQuestion.includes('吗')) {
    return '否'
  }

  return '无关'
}

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📋 测试接口: http://localhost:${PORT}/api/test`)
  console.log(`💬 AI对话接口: http://localhost:${PORT}/api/chat`)
})