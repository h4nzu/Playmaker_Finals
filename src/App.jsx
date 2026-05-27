import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import BballLoader from './components/BballLoader.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Players   from './pages/Players.jsx'
import PlayerProfile from './pages/PlayerProfile.jsx'
import Teams     from './pages/Teams.jsx'
import Schedule  from './pages/Schedule.jsx'
import Compare   from './pages/Compare.jsx'
import Login from './pages/Login.jsx'
import About     from './pages/About.jsx'
import './App.css'

const LOGO_URL = 'https://res.cloudinary.com/dv3eeuy4b/image/upload/v1778557328/LOGO_umlvbk.png'

function Home() {
  const navigate = useNavigate()
  const [launching, setLaunching] = useState(false)

  function handleTitleClick() {
    setLaunching(true)
    setTimeout(() => navigate('/login'), 900)
  }

  const fetchNews = () => {
    setNewsLoading(true)
    setNewsError(null)

    getNews(6)
      .then(data => {
        const items = data?.articles || data?.items || data?.news || data?.data || data
        const list = Array.isArray(items) ? items : []
        setNews(list.slice(0, 5))
        setNewsLoading(false)
      })
      .catch(err => {
        setNewsError(err.message)
        setNewsLoading(false)
      })
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">Playmaker</div>
        <ul className="nav-links">
          <li className="active"><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="#">Contact</a></li>
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
    </Routes>
    </RouteTransition>
  )
}

export default App



