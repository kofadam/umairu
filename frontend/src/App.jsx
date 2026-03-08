import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RecipePage from './pages/RecipePage'
import AddRecipePage from './pages/AddRecipePage'
import MealPlanPage from './pages/MealPlanPage'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogin = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage onLogout={handleLogout} />} />
        <Route path="/recipes/:id" element={<RecipePage />} />
        <Route path="/recipes/new" element={<AddRecipePage />} />
        <Route path="/recipes/:id/edit" element={<AddRecipePage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App