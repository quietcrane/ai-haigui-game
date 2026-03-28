export type TDifficulty = 'easy' | 'medium' | 'hard'

export type TStory = {
  id: string
  title: string
  difficulty: TDifficulty
  surface: string
  bottom: string
}

export type TVerdict = '是' | '否' | '无关'

export type TMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
