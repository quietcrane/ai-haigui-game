type TStoryRevealProps = {
  truth: string
  playerReasoning: string
}

function StoryReveal({ truth, playerReasoning }: TStoryRevealProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/70 p-5 shadow-lg">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-amber-400">汤底真相</h3>
        <p className="leading-7 text-slate-200">{truth}</p>
      </div>
      <div>
        <h4 className="mb-2 text-base font-semibold text-amber-300">玩家推理摘药</h4>
        <p className="whitespace-pre-wrap leading-7 text-slate-300">{playerReasoning}</p>
      </div>
    </section>
  )
}

export default StoryReveal
