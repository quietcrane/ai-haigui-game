import type { TMessage } from '../types'

type TMessageProps = {
  message: TMessage
}

function Message({ message }: TMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-slate-900 shadow-lg">
          AI
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
          isUser
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900'
            : 'bg-slate-700/80 border border-slate-600/50 text-slate-100'
        }`}
      >
        {message.content}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-sm font-bold text-amber-400 shadow-lg">
          你
        </div>
      )}
    </div>
  )
}

export default Message