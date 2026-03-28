import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import StoryReveal from '../components/StoryReveal'
import { stories } from '../data/stories'

type TStoredState = {
  playerReasoning: string
  truth?: string
  status: 'playing' | 'revealed'
}

const SESSION_KEY_PREFIX = 'haigui_game_state_v1:'

const buildSessionKey = (storyId: string) => `${SESSION_KEY_PREFIX}${storyId}`

function Result() {
  const { storyId = '' } = useParams()
  const navigate = useNavigate()
  const story = useMemo(() => stories.find((item) => item.id === storyId), [storyId])

  if (!story) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4 text-slate-300">未找到该故事。</p>
        <Link className="rounded-lg bg-amber-500 px-4 py-2 text-slate-900" to="/">
          返回大厅
        </Link>
      </main>
    )
  }

  const raw = sessionStorage.getItem(buildSessionKey(storyId))
  const state: TStoredState | null = raw ? (JSON.parse(raw) as TStoredState) : null

  if (!state || state.status !== 'revealed' || !state.truth) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-4 text-slate-300">当前局尚未揭晓，请先返回游戏页。</p>
        <button
          className="rounded-lg bg-amber-500 px-4 py-2 text-slate-900"
          onClick={() => navigate(`/game/${storyId}`)}
        >
          返回游戏页
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <h2 className="text-2xl font-bold text-amber-400">真相揭晓</h2>
      <StoryReveal truth={state.truth} playerReasoning={state.playerReasoning} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(buildSessionKey(storyId))
            navigate('/')
          }}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400"
        >
          再来一局
        </button>
        <button
          type="button"
          onClick={() => navigate(`/game/${storyId}`)}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          返回本局
        </button>
      </div>
    </main>
  )
}

export default Result
