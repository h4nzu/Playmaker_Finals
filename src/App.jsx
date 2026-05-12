import './App.css'

const LOGO_URL = 'https://res.cloudinary.com/dv3eeuy4b/image/upload/v1778557328/LOGO_umlvbk.png'

function App() {
  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">Playmaker</div>
        <ul className="nav-links">
          <li className="active"><a href="#">Home</a></li>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <img src={LOGO_URL} className="hoop-img" alt="Playmaker logo" />
          <div className="hero-text">
            <div className="title-row">
              <span className="play-text">PLAY</span>
              <span className="maker-text">MAKER</span>
            </div>
            <p className="subtitle">NBA Data Explorer System</p>
          </div>
        </div>
        <div className="site-url">www.playmaker.com</div>
      </main>
    </>
  )
}

export default App


