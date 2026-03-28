import GameCard from '../components/GameCard'
import { stories } from '../data/stories'

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700/20 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-5xl px-4 py-12">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-block">
            <span className="inline-block h-1 w-12 animate-pulse rounded-full bg-amber-400/60" />
            <span className="mx-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            <span className="inline-block h-1 w-12 animate-pulse rounded-full bg-amber-400/60" />
          </div>
          
          <h1 className="mb-4 font-serif text-4xl font-bold tracking-wider text-amber-400 md:text-5xl lg:text-6xl">
            <span className="text-shadow-glow">AI海龟汤</span>
          </h1>
          
          <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
            <span className="text-amber-400/80">「海龟汤」</span>
            是一种推理游戏。
            给你一个<span className="text-amber-400/80">看似荒诞的故事表面</span>，
            你需要通过不断提问来还原<span className="text-amber-400/80">真相</span>。
          </p>
          
          <p className="mt-4 text-sm text-slate-400">
            准备好了吗？选择下面的故事，揭开隐藏在黑暗中的秘密...
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <GameCard key={story.id} story={story} />
          ))}
        </section>

        <footer className="mt-16 text-center text-sm text-slate-500">
          <p>共有 {stories.length} 个谜题等待解开</p>
        </footer>
      </main>
    </div>
  )
}

export default Home