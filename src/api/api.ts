import type { TStory, TVerdict } from '../types'

export async function askAI(question: string, story: TStory): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        story: {
          id: story.id,
          title: story.title,
          surface: story.surface,
          bottom: story.bottom,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `请求失败: ${response.status}`)
    }

    const data = await response.json()

    if (!data.answer) {
      throw new Error('API返回内容为空')
    }

    return data.answer as TVerdict
  } catch (error) {
    console.error('后端 API 调用失败:', error)
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('无法连接到后端服务，请确保后端已启动')
      }
      throw new Error(`AI服务出错: ${error.message}`)
    }
    throw new Error('AI服务未知错误')
  }
}