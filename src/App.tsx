import { Navigate, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'
import Home from './pages/Home'
import Result from './pages/Result'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:storyId" element={<Game />} />
      <Route path="/result/:storyId" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
