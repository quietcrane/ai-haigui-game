import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { TMessage } from '../types'
import Message from './Message'

type TChatBoxProps = {
  messages: TMessage[]
  onAsk: (question: string) => void
}

function ChatBox({ messages, onAsk }: TChatBoxProps) {
  const [question, setQuestion] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) return
    onAsk(trimmedQuestion)
    setQuestion('')
  }

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 shadow-lg sm:p-4">
      <div className="mb-3 flex h-48 min-h-[12rem] flex-col gap-3 overflow-y-auto rounded-lg bg-slate-900/80 p-3 sm:h-72">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">开始提问吧，AI 只会回答"是 / 否 / 无关"。</p>
        ) : (
          messages.map((message) => <Message key={message.id} message={message} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="例如：死者是自杀吗？"
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 sm:py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-amber-400 sm:py-2"
        >
          发送
        </button>
      </form>
    </section>
  )
}

export default ChatBox