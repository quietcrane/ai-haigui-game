import { useNavigate } from 'react-router-dom'
import type { TStory } from '../types'

type TGameCardProps = {
  story: TStory
}

const DIFFICULTY_LABEL: Record<TStory['difficulty'], string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const DIFFICULTY_BADGE_CLASS: Record<TStory['difficulty'], string> = {
  easy: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  hard: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
}

function GameCard({ story }: TGameCardProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/game/${story.id}`)}
      className="group w-full rounded-lg border border-slate-700 bg-slate-800/70 p-5 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400/60"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-amber-400 transition group-hover:text-amber-300">
          {story.title}
        </h3>
        <span
          className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-medium ${DIFFICULTY_BADGE_CLASS[story.difficulty]}`}
        >
          {DIFFICULTY_LABEL[story.difficulty]}
        </span>
      </div>

      <p className="line-clamp-3 text-sm leading-6 text-slate-300">{story.surface}</p>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
        <span className="text-amber-400/90">点击进入</span>
        <span className="transition group-hover:translate-x-0.5">→</span>
      </div>
    </button>
  )
}

export default GameCard
