import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getTeams, getTeamGames } from '../services/backendApi'
import './Teams.css'

const CONF_ORDER = ['East', 'West']

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

function TeamLogo({ abbr, size = 40 }) {
  const id = TEAM_LOGO_IDS[abbr]
  if (!id) return <div className="tm-logo-fallback" style={{width:size,height:size}}>{abbr}</div>
  return <img src={`https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`} alt={abbr} style={{width:size,height:size,objectFit:'contain'}} />
}

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [teamGames, setTeamGames] = useState({})
  const [gamesLoading, setGamesLoading] = useState({})
  const [viewMode, setViewMode] = useState('standings') // standings, postseason, playoffs

  useEffect(() => {
    getTeams()
      .then(data => {
        const teamsData = data.data || []
        // Mock standings data - in a real app this would come from the API
        const teamsWithStandings = teamsData.map(team => ({
          ...team,
          wins: Math.floor(Math.random() * 25) + 35,
          losses: Math.floor(Math.random() * 25) + 25,
          gamesBack: Math.random() * 15,
        }))
        setTeams(teamsWithStandings)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  function toggleTeam(team) {
    if (expandedId === team.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(team.id)
    if (!teamGames[team.id]) {
      setGamesLoading(prev => ({ ...prev, [team.id]: true }))
      getTeamGames(team.id, 6)
        .then(data => {
          setTeamGames(prev => ({ ...prev, [team.id]: data.data || [] }))
          setGamesLoading(prev => ({ ...prev, [team.id]: false }))
        })
        .catch(() => setGamesLoading(prev => ({ ...prev, [team.id]: false })))
    }
  }

  // Sort teams by wins
  const sortedTeams = [...teams].sort((a, b) => {
    const aWinPct = a.wins / (a.wins + a.losses)
    const bWinPct = b.wins / (b.wins + b.losses)
    return bWinPct - aWinPct
  })

  const grouped = CONF_ORDER.reduce((acc, conf) => {
    acc[conf] = sortedTeams
      .filter(t => t.conference === conf)
    return acc
  }, {})

  return (
    <Layout>
      <div className="tm-page-header">
        <div className="tm-breadcrumb">
          <span className="tm-bc-root">Stats Home</span>
          <span className="tm-bc-sep">/</span>
          <span className="tm-bc-cur">Teams</span>
        </div>
        <div className="tm-header-row">
          <h1 className="tm-title">TEAMS</h1>
          <span className="tm-season-badge">2025-26 SEASON</span>
        </div>
      </div>

      {/* View Mode Buttons */}
      <div className="tm-controls">
        <div className="tm-view-buttons">
          <button
            className={`tm-view-btn${viewMode === 'standings' ? ' active' : ''}`}
            onClick={() => setViewMode('standings')}
          >
            Standings
          </button>
          <button
            className={`tm-view-btn${viewMode === 'postseason' ? ' active' : ''}`}
            onClick={() => setViewMode('postseason')}
          >
            Post Season
          </button>
          <button
            className={`tm-view-btn${viewMode === 'playoffs' ? ' active' : ''}`}
            onClick={() => setViewMode('playoffs')}
          >
            Playoffs
          </button>
        </div>
      </div>

      {loading && <div className="tm-loading">Loading teams…</div>}
      {error && <div className="tm-error">{error}</div>}

      {/* Standings View */}
      {viewMode === 'standings' && (
        <div className="tm-confs">
          {CONF_ORDER.map(conf => (
            <div key={conf} className="tm-conf">
              <div className="tm-conf-header">
                <h2 className="tm-conf-title">{conf.toUpperCase()}ERN CONFERENCE</h2>
              </div>

              <div className="tm-standings-table-wrap">
                <table className="tm-standings-table">
                  <thead>
                    <tr>
                      <th className="tm-rank">#</th>
                      <th className="tm-team-col">Team</th>
                      <th className="tm-stat-col">W</th>
                      <th className="tm-stat-col">L</th>
                      <th className="tm-stat-col">PCT</th>
                      <th className="tm-stat-col">GB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(grouped[conf] || []).map((team, idx) => {
                      const winPct = (team.wins / (team.wins + team.losses)).toFixed(3)
                      return (
                        <tr
                          key={team.id}
                          className={`tm-standings-row${expandedId === team.id ? ' expanded' : ''}`}
                          onClick={() => toggleTeam(team)}
                        >
                          <td className="tm-rank">{idx + 1}</td>
                          <td className="tm-team-col">
                            <div className="tm-team-info">
                              <TeamLogo abbr={team.abbreviation} size={28} />
                              <span className="tm-team-name">{team.abbreviation}</span>
                              <span className="tm-team-city">{team.full_name}</span>
                            </div>
                          </td>
                          <td className="tm-stat-col">{team.wins}</td>
                          <td className="tm-stat-col">{team.losses}</td>
                          <td className="tm-stat-col">{winPct}</td>
                          <td className="tm-stat-col">{team.gamesBack.toFixed(1)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Games Panel */}
              {expandedId && (grouped[conf] || []).find(t => t.id === expandedId) && (
                <div className="tm-games-panel">
                  {gamesLoading[expandedId] && <div className="tm-games-loading">Loading recent games…</div>}
                  {!gamesLoading[expandedId] && (teamGames[expandedId]||[]).length === 0 && (
                    <div className="tm-games-empty">No recent games found.</div>
                  )}
                  <table className="tm-games-table">
                    <tbody>
                      {(teamGames[expandedId]||[]).map(g => {
                        const team = (grouped[conf] || []).find(t => t.id === expandedId)
                        const isHome = g.home_team.id === team.id
                        const opp = isHome ? g.visitor_team : g.home_team
                        const teamScore = isHome ? g.home_team_score : g.visitor_team_score
                        const oppScore  = isHome ? g.visitor_team_score : g.home_team_score
                        const won = (teamScore||0) > (oppScore||0)
                        return (
                          <tr key={g.id} className="tm-game-row">
                            <td><span className={`tm-wl ${won?'win':'loss'}`}>{won?'W':'L'}</span></td>
                            <td className="tm-g-vs">{isHome?'vs':'@'}</td>
                            <td className="tm-g-opp">
                              <TeamLogo abbr={opp.abbreviation} size={22} />
                              <span>{opp.abbreviation}</span>
                            </td>
                            <td className="tm-g-score">{teamScore??'–'} – {oppScore??'–'}</td>
                            <td className="tm-g-date">{g.date?.split('T')[0]}</td>
                            <td className="tm-g-status">{g.status}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Season View */}
      {viewMode === 'postseason' && (
        <div className="tm-view-placeholder">
          <div className="tm-placeholder-content">
            <h3>Post Season Information</h3>
            <p>Post season standings and data coming soon…</p>
          </div>
        </div>
      )}

      {/* Playoffs View */}
      {viewMode === 'playoffs' && (
        <div className="tm-view-placeholder">
          <div className="tm-placeholder-content">
            <h3>Playoffs Bracket</h3>
            <p>NBA Playoffs bracket and results coming soon…</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
