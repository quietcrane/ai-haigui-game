import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatBox from '../components/ChatBox'
import { askAI } from '../api/api'
import { stories } from '../data/stories'
import type { TMessage } from '../types'

type TGameState = {
  storyId: string
  messages: TMessage[]
  playerReasoning: string
  status: 'playing' | 'revealed' | 'thinking'
  truth?: string
}

const SESSION_KEY_PREFIX = 'haigui_game_state_v1:'

const buildSessionKey = (storyId: string) => `${SESSION_KEY_PREFIX}${storyId}`

const makeId = () => Math.random().toString(36).slice(2, 10)

function Game() {
  const { storyId = '' } = useParams()
  const navigate = useNavigate()
  const story = useMemo(() => stories.find((item) => item.id === storyId), [storyId])

  const [state, setState] = useState<TGameState>(() => {
    if (!story) {
      return { storyId, messages: [], playerReasoning: '', status: 'playing' }
    }
    const raw = sessionStorage.getItem(buildSessionKey(storyId))
    if (!raw) {
      return { storyId, messages: [], playerReasoning: '', status: 'playing' }
    }

    try {
      return JSON.parse(raw) as TGameState
    } catch {
      return { storyId, messages: [], playerReasoning: '', status: 'playing' }
    }
  })

  if (!story) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4 text-slate-300">未找到该故事，请返回大厅重新选择。</p>
        <button
          className="rounded-lg bg-amber-500 px-4 py-2 text-slate-900"
          onClick={() => navigate('/')}
        >
          返回大厅
        </button>
      </main>
    )
  }

  const persistState = (nextState: TGameState) => {
    setState(nextState)
    sessionStorage.setItem(buildSessionKey(storyId), JSON.stringify(nextState))
  }

  const handleAsk = async (question: string) => {
    if (state.status === 'revealed' || state.status === 'thinking') return
    
    const userMessage: TMessage = {
      id: makeId(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }

    persistState({
      ...state,
      messages: [...state.messages, userMessage],
      status: 'thinking',
    })

    try {
      const verdict = await askAI(question, story)
      
      const aiMessage: TMessage = {
        id: makeId(),
        role: 'assistant',
        content: verdict,
        timestamp: Date.now(),
      }
      
      persistState({
        ...state,
        messages: [...state.messages, userMessage, aiMessage],
        status: 'playing',
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      console.error('AI 调用失败:', errorMsg)
      const errorMessage: TMessage = {
        id: makeId(),
        role: 'assistant',
        content: `AI服务出错: ${errorMsg}`,
        timestamp: Date.now(),
      }
      persistState({
        ...state,
        messages: [...state.messages, userMessage, errorMessage],
        status: 'playing',
      })
    }
  }

  const handleReveal = () => {
    const reasoning = state.playerReasoning.trim()
    if (!reasoning) {
      window.alert('请先填写你的推理摘要，再查看汤底。')
      return
    }
    const nextState: TGameState = {
      ...state,
      playerReasoning: reasoning,
      status: 'revealed',
      truth: story.bottom,
    }
    persistState(nextState)
    navigate(`/result/${storyId}`)
  }

  const handleEnd = () => {
    sessionStorage.removeItem(buildSessionKey(storyId))
    navigate('/')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
        <section className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/10 blur-2xl" />
          
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-1.5 w-8 rounded-full bg-amber-400/60" />
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400/80">
              故事背景
            </span>
            <span className="inline-block h-1.5 w-8 rounded-full bg-amber-400/60" />
          </div>
          
          <h2 className="mb-4 font-serif text-2xl font-bold text-amber-400 md:text-3xl">
            {story.title}
          </h2>
          
          <div className="relative rounded-lg border-l-4 border-amber-500/40 bg-slate-900/50 p-4">
            <p className="leading-relaxed text-slate-200">
              {story.surface}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <span className="text-amber-400/70">💡</span>
            <span>找出真相，揭开谜底</span>
          </div>
        </section>

        <ChatBox messages={state.messages} onAsk={handleAsk} />

        <section className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-medium text-slate-300">
              你的推理摘要
            </span>
            <span className="text-xs text-amber-400/70">(必填)</span>
          </div>
          
          <textarea
            id="reasoning"
            value={state.playerReasoning}
            onChange={(event) => persistState({ ...state, playerReasoning: event.target.value })}
            rows={4}
            className="w-full rounded-lg border border-slate-600/50 bg-slate-900/80 px-4 py-3 text-sm leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20"
            placeholder="例如：我怀疑关键线索在电梯反光里，受害者并不是陌生人..."
          />
          
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReveal}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              disabled={!state.playerReasoning.trim()}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>🔮</span>
                <span>查看汤底</span>
              </span>
            </button>
            
            <button
              type="button"
              onClick={handleEnd}
              className="group relative overflow-hidden rounded-lg border border-slate-600/50 bg-slate-700/30 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-100"
            >
              <span className="flex items-center gap-2">
                <span>✕</span>
                <span>结束游戏</span>
              </span>
            </button>
          </div>

          {!state.playerReasoning.trim() && (
            <p className="mt-3 text-xs text-slate-500">
              填写推理摘要后才能查看汤底哦~
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default Game