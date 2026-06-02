import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import BballLoader from './components/BballLoader.jsx'
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Players   from './pages/Players.jsx'
import PlayerProfile from './pages/PlayerProfile.jsx'
import Teams     from './pages/Teams.jsx'
import Schedule  from './pages/Schedule.jsx'
import Compare   from './pages/Compare.jsx'
import Login from './pages/Login.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import About     from './pages/About.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import './App.css'

const LOGO_URL = 'https://res.cloudinary.com/dv3eeuy4b/image/upload/v1778557328/LOGO_umlvbk.png'
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Home() {
  const navigate = useNavigate()
  const [launching, setLaunching] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [activeNav, setActiveNav] = useState('home')
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [formStatus, setFormStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleTitleClick() {
    setLaunching(true)
    setTimeout(() => navigate('/login'), 900)
  }

  function handleNavClick(section) {
    setActiveNav(section)
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (section === 'about') {
      const aboutSection = document.getElementById('about')
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (section === 'contact') {
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById('about')
      const contactSection = document.getElementById('contact')
      
      if (contactSection && window.scrollY >= contactSection.offsetTop - 100) {
        setActiveNav('contact')
      } else if (aboutSection && window.scrollY >= aboutSection.offsetTop - 100) {
        setActiveNav('about')
      } else {
        setActiveNav('home')
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormStatus({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormStatus({ type: 'error', message: 'Please enter a valid email address' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setFormStatus({ type: 'success', message: 'Thank you for reaching out! We will get back to you soon.' })
        setFormData({ name: '', email: '', subject: '', message: '' })
        
        // Clear success message after 5 seconds
        setTimeout(() => setFormStatus(null), 5000)
      } else {
        setFormStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setFormStatus({ type: 'error', message: 'Network error. Please try again later.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">Playmaker</div>
        <ul className="nav-links">
          <li>
            <a 
              href="#" 
              className={activeNav === 'home' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); handleNavClick('home') }}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="#about" 
              className={activeNav === 'about' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); handleNavClick('about') }}
            >
              About Us
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              className={activeNav === 'contact' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); handleNavClick('contact') }}
            >
              Contact Us
            </a>
          </li>
        </ul>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <img src={LOGO_URL} className="hoop-img" alt="Playmaker logo" />
          <div className="hero-text">
            <button
              className={`title-btn${launching ? ' launching' : ''}`}
              onClick={handleTitleClick}
              aria-label="Go to Dashboard"
            >
              <div className="title-row">
                <span className="play-text">PLAY</span>
                <span className="maker-text">MAKER</span>
              </div>
              <div className="title-arrow-row">
                <p className="subtitle">NBA Data Explorer System</p>
                <span className={`title-arrow${launching ? ' arrow-go' : ''}`}>
                  &#8250;
                </span>
              </div>
            </button>
          </div>
        </div>
        <div className="site-url">www.playmaker.com</div>
      </main>

      {/* ── About Section ── */}
      <section id="about" style={{
        padding: '80px 48px 60px',
        background: '#0e0812',
        backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(90, 20, 110, 0.35) 0%, transparent 70%), radial-gradient(circle, rgba(60, 20, 80, 0.9) 1px, transparent 1px)',
        backgroundSize: 'cover, 22px 22px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.04em', color: '#fff', margin: '0 0 8px' }}>
            ABOUT PLAYMAKER
          </h2>
          <p style={{ fontSize: 14, color: '#8899bb', margin: 0 }}>NBA Data Explorer System</p>
        </div>

        <div style={{
          background: 'rgba(29,66,186,0.08)', border: '1px solid rgba(29,66,186,0.2)',
          borderRadius: 8, padding: 24, maxWidth: 900, marginBottom: 48
        }}>
          <p style={{ color: '#c8d4e8', fontSize: 14, lineHeight: 1.8, margin: '0 0 12px' }}>
            Playmaker is a comprehensive NBA statistics and analytics platform designed to provide fans, analysts, and enthusiasts with real-time data about NBA teams, players, and games.
          </p>
          <p style={{ color: '#c8d4e8', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            Built with modern web technologies, Playmaker combines frontend excellence with robust backend infrastructure to deliver a seamless user experience in exploring NBA statistics.
          </p>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', color: '#fff', margin: '0 0 28px', borderBottom: '2px solid #1d42ba', paddingBottom: 12 }}>
          OUR DEVELOPMENT TEAM
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
          {[
            { name: 'Jomari Nicoli Colesio', image: 'https://res.cloudinary.com/dc3erz7jd/image/upload/v1779760991/jommm_eyjlzw.jpg', role: 'Full Stack Developer', course: 'BS Computer Science', year: '3rd Year', age: '21 y/o' },
            { name: 'Byron Ace Rivera', image: 'https://res.cloudinary.com/dc3erz7jd/image/upload/v1779760991/bytos_k1chvg.jpg', role: 'Backend Developer', course: 'BS Computer Science', year: '3rd Year', age: '21 y/o' },
            { name: 'Chester Ian San Pedro', image: 'https://res.cloudinary.com/dc3erz7jd/image/upload/v1779760992/chester_dduwjq.jpg', role: 'Frontend Developer', course: 'BS Computer Science', year: '3rd Year', age: '21 y/o' },
            { name: 'Angel Jan Katigbak', image: 'https://res.cloudinary.com/dc3erz7jd/image/upload/v1779760991/aj_ykuesy.jpg', role: 'UI/UX Designer', course: 'BS Computer Science', year: '3rd Year', age: '21 y/o' },
            { name: 'Hanz Lorenzo Olvega', image: 'https://res.cloudinary.com/dc3erz7jd/image/upload/v1779760991/hanz_ok6m7v.jpg', role: 'Database Engineer', course: 'BS Computer Science', year: '3rd Year', age: '21 y/o' },
          ].map((dev, i) => {
            const isHovered = hoveredCard === i
            return (
            <div key={i}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: isHovered
                  ? 'linear-gradient(135deg, rgba(29,66,186,0.25), rgba(29,66,186,0.12))'
                  : 'linear-gradient(135deg, rgba(29,66,186,0.1), rgba(29,66,186,0.05))',
                border: isHovered ? '1px solid rgba(29,66,186,0.7)' : '1px solid rgba(29,66,186,0.2)',
                borderRadius: 12, padding: 24, textAlign: 'center',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: isHovered ? '0 16px 40px rgba(29,66,186,0.35), 0 0 0 1px rgba(29,66,186,0.3)' : 'none',
                cursor: 'default',
              }}>
              <div style={{
                width: 140, height: 140, margin: '0 auto 18px', borderRadius: 12, overflow: 'hidden',
                border: isHovered ? '3px solid #4d7aff' : '3px solid #1d42ba',
                transition: 'border-color 0.3s ease',
                boxShadow: isHovered ? '0 0 20px rgba(29,66,186,0.5)' : 'none',
              }}>
                <img src={dev.image} alt={dev.name} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.4s ease',
                }}
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=1d42ba&color=fff&bold=true&size=200` }} />
              </div>
              <h3 style={{
                fontSize: 16, fontWeight: 800,
                color: isHovered ? '#ffffff' : '#e0e8ff',
                margin: '0 0 4px',
                transition: 'color 0.3s ease',
              }}>{dev.name}</h3>
              <p style={{
                fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: isHovered ? '#6b9fff' : '#1d42ba',
                margin: '0 0 16px',
                transition: 'color 0.3s ease',
              }}>{dev.role}</p>
              <div style={{ borderTop: '1px solid rgba(29,66,186,0.2)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['Course', dev.course], ['Year', dev.year], ['Age', dev.age]].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: isHovered ? '#8899cc' : '#556080', fontWeight: 700, textTransform: 'uppercase', transition: 'color 0.3s ease' }}>{label}</span>
                    <span style={{ color: isHovered ? '#c8d8ff' : '#8899bb', fontWeight: 600, transition: 'color 0.3s ease' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* ── Contact Us Section ── */}
      <section id="contact" style={{
        padding: '80px 48px 60px',
        background: '#0e0812',
        backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(90, 20, 110, 0.35) 0%, transparent 70%), radial-gradient(circle, rgba(60, 20, 80, 0.9) 1px, transparent 1px)',
        backgroundSize: 'cover, 22px 22px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ marginBottom: 48, maxWidth: 900, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.04em', color: '#fff', margin: '0 0 8px' }}>
            CONTACT US
          </h2>
          <p style={{ fontSize: 14, color: '#8899bb', margin: 0 }}>Get in touch with the Playmaker team</p>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(29,66,186,0.08)',
            border: '1px solid rgba(29,66,186,0.2)',
            borderRadius: 12,
            padding: 40,
          }}>
            {formStatus && (
              <div style={{
                marginBottom: 24,
                padding: 16,
                borderRadius: 8,
                background: formStatus.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${formStatus.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                color: formStatus.type === 'success' ? '#86efac' : '#fca5a5',
              }}>
                {formStatus.message}
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: '#c8d4e8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Your Name"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(29,66,186,0.3)',
                      background: 'rgba(29,66,186,0.05)',
                      color: '#c8d4e8',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      opacity: isSubmitting ? 0.6 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'text',
                    }}
                    onFocus={(e) => {
                      if (!isSubmitting) {
                        e.target.style.borderColor = 'rgba(29,66,186,0.6)'
                        e.target.style.background = 'rgba(29,66,186,0.1)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(29,66,186,0.1)'
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(29,66,186,0.3)'
                      e.target.style.background = 'rgba(29,66,186,0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: '#c8d4e8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(29,66,186,0.3)',
                      background: 'rgba(29,66,186,0.05)',
                      color: '#c8d4e8',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      opacity: isSubmitting ? 0.6 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'text',
                    }}
                    onFocus={(e) => {
                      if (!isSubmitting) {
                        e.target.style.borderColor = 'rgba(29,66,186,0.6)'
                        e.target.style.background = 'rgba(29,66,186,0.1)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(29,66,186,0.1)'
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(29,66,186,0.3)'
                      e.target.style.background = 'rgba(29,66,186,0.05)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#c8d4e8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="How can we help?"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(29,66,186,0.3)',
                    background: 'rgba(29,66,186,0.05)',
                    color: '#c8d4e8',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => {
                    if (!isSubmitting) {
                      e.target.style.borderColor = 'rgba(29,66,186,0.6)'
                      e.target.style.background = 'rgba(29,66,186,0.1)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(29,66,186,0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(29,66,186,0.3)'
                    e.target.style.background = 'rgba(29,66,186,0.05)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#c8d4e8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Your message here..."
                  rows="6"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid rgba(29,66,186,0.3)',
                    background: 'rgba(29,66,186,0.05)',
                    color: '#c8d4e8',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    resize: 'vertical',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'text',
                  }}
                  onFocus={(e) => {
                    if (!isSubmitting) {
                      e.target.style.borderColor = 'rgba(29,66,186,0.6)'
                      e.target.style.background = 'rgba(29,66,186,0.1)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(29,66,186,0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(29,66,186,0.3)'
                    e.target.style.background = 'rgba(29,66,186,0.05)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '14px 32px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #1d42ba, #4d7aff)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(29,66,186,0.3)',
                  alignSelf: 'flex-start',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 12px 32px rgba(29,66,186,0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(29,66,186,0.3)'
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

function RouteTransition({ children }) {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 1000)
      return () => clearTimeout(t)
    }
  }, [location.pathname])

  return (
    <>
      {loading && <BballLoader />}
      {children}
    </>
  )
}

function App() {
  return (
    <AdminAuthProvider>
      <RouteTransition>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/about"     element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/players"   element={<Players />} />
          <Route path="/players/:playerId" element={<PlayerProfile />} />
          <Route path="/teams"     element={<Teams />} />
          <Route path="/schedule"  element={<Schedule />} />
          <Route path="/compare"   element={<Compare />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/messages" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
        </Routes>
      </RouteTransition>
    </AdminAuthProvider>
  )
}

export default App