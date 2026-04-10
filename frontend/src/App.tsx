import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'
import SharePage from './pages/SharePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
