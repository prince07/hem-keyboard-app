import { ref } from 'vue'
import axios from 'axios'

const user = ref(null)
const isAuthenticated = ref(false)

export function useAuth() {
  const setAuthToken = (token: string) => {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const clearAuthToken = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password })
      const { token, user: userData } = response.data
      
      setAuthToken(token)
      user.value = userData
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
      clearAuthToken()
      user.value = null
      isAuthenticated.value = false
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        clearAuthToken()
        user.value = null
        isAuthenticated.value = false
        return false
      }

      setAuthToken(token)
      const response = await axios.get('/api/auth/check')
      user.value = response.data.user
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('Auth check error:', error)
      clearAuthToken()
      user.value = null
      isAuthenticated.value = false
      return false
    }
  }

  // Initialize auth state
  const initAuth = () => {
    const token = localStorage.getItem('token')
    if (token) {
      setAuthToken(token)
      checkAuth()
    }
  }

  // Call initAuth when the composable is used
  initAuth()

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
}
