import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import './AdminLogin.css'

const LOGO_URL = 'https://res.cloudinary.com/dv3eeuy4b/image/upload/v1778557328/LOGO_umlvbk.png'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const result = login(form.email, form.password)
      setIsSubmitting(false)
      
      if (result.success) {
        navigate('/admin/messages')
      } else {
        setError(result.message)
      }
    }, 500)
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-bg">
        <div className="admin-login-glow" />
      </div>

      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src={LOGO_URL} alt="Playmaker" className="admin-login-logo" />
          <h1>Admin Portal</h1>
          <p>Playmaker Contact Messages</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label>Admin Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@playmaker.com"
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="admin-login-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div className="admin-login-credentials">
          <p>Demo Credentials:</p>
          <p>Email: <code>admin@playmaker.com</code></p>
          <p>Password: <code>admin123</code></p>
        </div>
      </div>
    </div>
  )
}
