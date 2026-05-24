import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import StatsRadarChart from '../components/StatsRadarChart'
import { getPlayers, getPlayerStats } from '../services/backendApi'
import './PlayerProfile.css'

const TEAM_LOGO_IDS = {
  ATL:'1610612737',BOS:'1610612738',BKN:'1610612751',CHA:'1610612766',
  CHI:'1610612741',CLE:'1610612739',DAL:'1610612742',DEN:'1610612743',
  DET:'1610612765',GSW:'1610612744',HOU:'1610612745',IND:'1610612754',
  LAC:'1610612746',LAL:'1610612747',MEM:'1610612763',MIA:'1610612748',
  MIL:'1610612749',MIN:'1610612750',NOP:'1610612740',NYK:'1610612752',
  OKC:'1610612760',ORL:'1610612753',PHI:'1610612755',PHX:'1610612756',
  POR:'1610612757',SAC:'1610612758',SAS:'1610612759',TOR:'1610612761',
  UTA:'1610612762',WAS:'1610612764',
}

function playerImageUrl(p) {
  if (p.image_url) return p.image_url
  const name = encodeURIComponent(`${p.first_name} ${p.last_name}`)
  return `https://ui-avatars.com/api/?name=${name}&background=0d1228&color=4d72f0&bold=true&size=256&font-size=0.38`
}

function fallbackImageUrl(p) {
  const name = encodeURIComponent(`${p.first_name} ${p.last_name}`)
  return `https://ui-avatars.com/api/?name=${name}&background=0d1228&color=4d72f0&bold=true&size=256&font-size=0.38`
}

function handleImageError(e, p) {
  e.currentTarget.onerror = null
  e.currentTarget.src = fallbackImageUrl(p)
}

function TeamBadge({ abbr }) {
  const id = TEAM_LOGO_IDS[abbr]
  if (!id) return <span className="pp-team-badge">{abbr}</span>
  return <img src={`https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`} alt={abbr} className="pp-team-logo" />
}

// Convert height to cm (assuming height format is like "7-0")
function heightToCm(heightStr) {
  if (!heightStr) return null
  const parts = heightStr.split('-')
  if (parts.length !== 2) return null
  const feet = parseInt(parts[0])
  const inches = parseInt(parts[1])
  return Math.round((feet * 12 + inches) * 2.54)
}

// Mock ranking data - in a real app, this would come from the API
function getStatRanking(statName, value) {
  // These are approximate NBA rankings for reference
  // In a production app, you'd fetch actual league rankings from the backend
  const rankings = {
    PTS: { 30: 1, 28: 2, 26: 5, 25: 10, 23: 20, 20: 50, 15: 100, 12.5: 87, 10: 150, 5: 200 },
    REB: { 15: 1, 12: 10, 10: 20, 8: 50, 8.0: 19, 6: 100, 5: 150 },
    AST: { 12: 1, 10: 10, 8: 20, 6: 50, 5: 100, 0.8: 150 },
    FG_PCT: { 0.550: 1, 0.520: 10, 0.500: 30, 0.480: 50, 0.450: 100, 0.671: 2 },
  }
  
  // Simple approximation - find closest value
  const statRankings = rankings[statName] || {}
  const values = Object.keys(statRankings).map(Number).sort((a, b) => b - a)
  
  for (let v of values) {
    if (value >= v * 0.95) {
      return statRankings[v]
    }
  }
  return '150+'
}

export default function PlayerProfile() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch player details by fetching a large batch to find the player
        let allPlayers = []
        let page = 0
        let found = false

        // Search through pages until we find the player
        while (!found && page < 50) {
          const result = await getPlayers('', 100, page)
          allPlayers = allPlayers.concat(result.data || [])
          
          const foundPlayer = allPlayers.find(p => String(p.id) === String(playerId))
          if (foundPlayer) {
            setPlayer(foundPlayer)
            found = true
            break
          }
          
          if (!result.meta?.next_cursor) break
          page++
        }

        if (!found) {
          throw new Error('Player not found')
        }

        // Fetch player stats
        const statsData = await getPlayerStats(playerId)
        setStats(statsData)
      } catch (err) {
        setError(err.message || 'Failed to load player profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [playerId])

  if (loading) {
    return (
      <Layout>
        <div className="pp-loading">Loading player profile...</div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="pp-error">
          <p>{error}</p>
          <button className="pp-back-btn" onClick={() => navigate('/players')}>
            Back to Players
          </button>
        </div>
      </Layout>
    )
  }

  if (!player || !stats) {
    return (
      <Layout>
        <div className="pp-error">
          <p>Player data not found</p>
          <button className="pp-back-btn" onClick={() => navigate('/players')}>
            Back to Players
          </button>
        </div>
      </Layout>
    )
  }

  // Calculate PPG from stats
  const pointsPerGame = parseFloat(stats.PTS) || 0
  const reboundsPerGame = parseFloat(stats.REB) || 0
  const assistsPerGame = parseFloat(stats.AST) || 0
  const stealsPerGame = parseFloat(stats.STL) || 0

  // Generate mock points per game trend (last 20 games)
  const ppgTrend = Array.from({ length: 20 }, (_, i) => ({
    game: i + 1,
    points: Math.max(0, pointsPerGame + (Math.random() - 0.5) * 10)
  }))

  return (
    <Layout>
      <div className="pp-page">
        {/* Header */}
        <div className="pp-breadcrumb">
          <button className="pp-back-link" onClick={() => navigate('/players')}>
            ← Back to Players
          </button>
        </div>

        {/* Profile Section */}
        <div className="pp-profile-section">
          <div className="pp-photo-column">
            <div className="pp-photo-wrap">
              <img
                src={playerImageUrl(player)}
                alt={`${player.first_name} ${player.last_name}`}
                className="pp-photo"
                onError={e => handleImageError(e, player)}
              />
              {player.team?.abbreviation && (
                <div className="pp-photo-badge">
                  <TeamBadge abbr={player.team.abbreviation} />
                </div>
              )}
            </div>
          </div>

          <div className="pp-info-column">
            {/* Player Name */}
            <h1 className="pp-name">
              {player.first_name} {player.last_name}
            </h1>

            {/* Basic Info */}
            <div className="pp-basic-info">
              {player.jersey_number && (
                <span className="pp-info-item">
                  <strong>Jersey:</strong> #{player.jersey_number}
                </span>
              )}
              {player.position && (
                <span className="pp-info-item">
                  <strong>Position:</strong> {player.position}
                </span>
              )}
              {player.team?.abbreviation && (
                <span className="pp-info-item">
                  <strong>Team:</strong> {player.team.abbreviation}
                </span>
              )}
            </div>

            {/* Physical Info */}
            <div className="pp-physical-info">
              {player.height && (
                <span className="pp-info-item">
                  <strong>Height:</strong> {player.height} ({heightToCm(player.height)} cm)
                </span>
              )}
              {player.weight && (
                <span className="pp-info-item">
                  <strong>Weight:</strong> {player.weight} lbs
                </span>
              )}
              {player.college && (
                <span className="pp-info-item">
                  <strong>College:</strong> {player.college}
                </span>
              )}
            </div>

            {/* Draft Info */}
            {(player.draft_year || player.draft_round || player.draft_number) && (
              <div className="pp-draft-info">
                <h4 className="pp-draft-title">Draft Information</h4>
                <div className="pp-draft-details">
                  {player.draft_year && (
                    <span className="pp-info-item">
                      <strong>Year:</strong> {player.draft_year}
                    </span>
                  )}
                  {player.draft_round && (
                    <span className="pp-info-item">
                      <strong>Round:</strong> {player.draft_round}
                    </span>
                  )}
                  {player.draft_number && (
                    <span className="pp-info-item">
                      <strong>Pick:</strong> #{player.draft_number}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Key Stats */}
            <div className="pp-key-stats">
              <h3 className="pp-stats-title">2025-26 Regular Season Stats</h3>
              <div className="pp-stats-grid">
                <div className="pp-stat-box">
                  <div className="pp-stat-value">{pointsPerGame.toFixed(1)}</div>
                  <div className="pp-stat-label">PPG</div>
                  <div className="pp-stat-ranking">{getStatRanking('PTS', pointsPerGame)}</div>
                </div>
                <div className="pp-stat-box">
                  <div className="pp-stat-value">{reboundsPerGame.toFixed(1)}</div>
                  <div className="pp-stat-label">REB</div>
                  <div className="pp-stat-ranking">{getStatRanking('REB', reboundsPerGame)}</div>
                </div>
                <div className="pp-stat-box">
                  <div className="pp-stat-value">{assistsPerGame.toFixed(1)}</div>
                  <div className="pp-stat-label">AST</div>
                  <div className="pp-stat-ranking">{getStatRanking('AST', assistsPerGame)}</div>
                </div>
                <div className="pp-stat-box">
                  <div className="pp-stat-value">{((stats.FG_PCT || 0) / 100).toFixed(3)}</div>
                  <div className="pp-stat-label">FG%</div>
                  <div className="pp-stat-ranking">{getStatRanking('FG_PCT', stats.FG_PCT || 0)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="pp-stats-section">
          {/* Points Per Game Graph */}
          <div className="pp-chart-container">
            <div className="pp-ppg-graph">
              <h3>Points Per Game Trend</h3>
              <div className="pp-graph-wrap">
                <svg viewBox="0 0 400 150" className="pp-graph">
                  <defs>
                    <linearGradient id="ppgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4d72f0" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4d72f0" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  <line x1="20" y1="30" x2="380" y2="30" stroke="#444" strokeDasharray="2,2" />
                  <line x1="20" y1="60" x2="380" y2="60" stroke="#444" strokeDasharray="2,2" />
                  <line x1="20" y1="90" x2="380" y2="90" stroke="#444" strokeDasharray="2,2" />
                  <line x1="20" y1="120" x2="380" y2="120" stroke="#444" strokeDasharray="2,2" />
                  {/* Axis */}
                  <line x1="20" y1="20" x2="20" y2="130" stroke="#fff" strokeWidth="2" />
                  <line x1="20" y1="130" x2="390" y2="130" stroke="#fff" strokeWidth="2" />
                  {/* Data points and line */}
                  {ppgTrend.map((d, i) => {
                    const x = 20 + (i / 19) * 360
                    const y = 130 - (d.points / 40) * 100
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#4d72f0"
                      />
                    )
                  })}
                  {/* Line path */}
                  <polyline
                    points={ppgTrend.map((d, i) => {
                      const x = 20 + (i / 19) * 360
                      const y = 130 - (d.points / 40) * 100
                      return `${x},${y}`
                    }).join(' ')}
                    fill="none"
                    stroke="#4d72f0"
                    strokeWidth="2"
                  />
                  {/* Labels */}
                  <text x="20" y="145" fontSize="10" fill="#888">0</text>
                  <text x="370" y="145" fontSize="10" fill="#888">20</text>
                </svg>
              </div>
            </div>

            {/* Stats Radar Chart */}
            {stats && <StatsRadarChart stats={stats} />}
          </div>
        </div>
      </div>
    </Layout>
  )
}
