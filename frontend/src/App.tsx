import { Routes, Route, Navigate } from 'react-router-dom'
import { Header } from '@/components'
import { Home, Study, Progress, Settings, Extract } from '@/pages'

function App() {
  return (
    <div className="min-h-screen bg-bg blob-decoration">
      <Header />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study" element={<Study />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/extract" element={<Extract />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
