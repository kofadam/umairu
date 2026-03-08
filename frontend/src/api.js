import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Auth
export const login = (username, password) =>
  api.post('/auth/token/', { username, password })

// Recipes
export const getRecipes = (params) => api.get('/recipes/', { params })
export const getRecipe = (id) => api.get(`/recipes/${id}/`)
export const createRecipe = (data) => api.post('/recipes/', data)
export const updateRecipe = (id, data) => api.patch(`/recipes/${id}/`, data)
export const deleteRecipe = (id) => api.delete(`/recipes/${id}/`)

// Import
export const importFromUrl = (url) => api.post('/recipes/import-url/', { url })
export const importFromMarkdown = (markdown) => api.post('/recipes/import-md/', { markdown })

// Notes
export const getNotes = (recipeId) => api.get(`/recipes/${recipeId}/notes/`)
export const createNote = (recipeId, content) => api.post(`/recipes/${recipeId}/notes/`, { content })

// Tags
export const getTags = () => api.get('/tags/')

// Meal plan
export const getMealPlan = (month) => api.get('/meal-plan/', { params: { month } })
export const createMealPlan = (data) => api.post('/meal-plan/', data)
export const deleteMealPlan = (id) => api.delete(`/meal-plan/${id}/`)

export default api