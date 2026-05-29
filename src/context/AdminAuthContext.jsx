import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if admin is already logged in (from localStorage)
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem('adminUser')
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin))
      }
    } catch {
      localStorage.removeItem('adminUser')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (email, password) => {
    // Simple admin credentials (you can change this)
    const ADMIN_EMAIL = 'admin@playmaker.com'
    const ADMIN_PASSWORD = 'admin123' // Change this to a secure password!

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminData = { email, loginTime: new Date().toISOString() }
      setAdmin(adminData)
      localStorage.setItem('adminUser', JSON.stringify(adminData))
      return { success: true, message: 'Admin login successful' }
    }
    return { success: false, message: 'Invalid admin credentials' }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('adminUser')
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
