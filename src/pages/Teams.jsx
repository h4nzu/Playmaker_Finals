import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getStandings, getTeamGames } from '../services/backendApi'
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
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [teamGames, setTeamGames] = useState({})
  const [gamesLoading, setGamesLoading] = useState({})
  const [viewMode, setViewMode] = useState('standings')

  useEffect(() => {
    getStandings()
      .then(data => {
        setStandings(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  function toggleTeam(team) {
    if (expandedId === team.team_id) {
      setExpandedId(null)
      return
    }
    setExpandedId(team.team_id)
    if (!teamGames[team.team_id]) {
      setGamesLoading(prev => ({ ...prev, [team.team_id]: true }))
      getTeamGames(team.team_id, 6)
        .then(data => {
          setTeamGames(prev => ({ ...prev, [team.team_id]: data.data || [] }))
          setGamesLoading(prev => ({ ...prev, [team.team_id]: false }))
        })
        .catch(() => setGamesLoading(prev => ({ ...prev, [team.team_id]: false })))
    }
  }

  const grouped = CONF_ORDER.reduce((acc, conf) => {
    acc[conf] = standings
      .filter(t => t.conference === conf)
      .sort((a, b) => a.conf_rank - b.conf_rank)
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
                      <th className="tm-team-col">TEAM</th>
                      <th className="tm-stat-col">W</th>
                      <th className="tm-stat-col">L</th>
                      <th className="tm-stat-col">PCT</th>
                      <th className="tm-stat-col">HOME</th>
                      <th className="tm-stat-col">AWAY</th>
                      <th className="tm-stat-col">DIV</th>
                      <th className="tm-stat-col">CONF</th>
                      <th className="tm-stat-col">PPG</th>
                      <th className="tm-stat-col">OPP PPG</th>
                      <th className="tm-stat-col">DIFF</th>
                      <th className="tm-stat-col">STRK</th>
                      <th className="tm-stat-col">L10</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(grouped[conf] || []).map((team, idx) => {
                      const winPct = (team.win_pct).toFixed(3)
                      return (
                        <tr
                          key={team.team_id}
                          className={`tm-standings-row${expandedId === team.team_id ? ' expanded' : ''}`}
                          onClick={() => toggleTeam(team)}
                        >
                          <td className="tm-rank">{idx + 1}</td>
                          <td className="tm-team-col">
                            <div className="tm-team-info">
                              <TeamLogo abbr={team.abbreviation} size={28} />
                              <div className="tm-team-names">
                                <span className="tm-team-abbr">{team.abbreviation}</span>
                                <span className="tm-team-name">{team.team_name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="tm-stat-col tm-stat-wins">{team.wins}</td>
                          <td className="tm-stat-col tm-stat-losses">{team.losses}</td>
                          <td className="tm-stat-col tm-stat-pct">{winPct}</td>
                          <td className="tm-stat-col">{team.home}</td>
                          <td className="tm-stat-col">{team.road}</td>
                          <td className="tm-stat-col">{team.div_record}</td>
                          <td className="tm-stat-col">{team.conf_record}</td>
                          <td className="tm-stat-col tm-stat-ppg">{team.ppg.toFixed(1)}</td>
                          <td className="tm-stat-col tm-stat-opp">{team.opp_ppg.toFixed(1)}</td>
                          <td className="tm-stat-col tm-stat-diff">
                            <span className={team.diff_ppg > 0 ? 'positive' : 'negative'}>
                              {team.diff_ppg > 0 ? '+' : ''}{team.diff_ppg.toFixed(1)}
                            </span>
                          </td>
                          <td className="tm-stat-col tm-stat-streak">{team.current_streak}</td>
                          <td className="tm-stat-col tm-stat-l10">{team.last_10}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Games Panel */}
              {expandedId && (grouped[conf] || []).find(t => t.team_id === expandedId) && (
                <div className="tm-games-panel">
                  {gamesLoading[expandedId] && <div className="tm-games-loading">Loading recent games…</div>}
                  {!gamesLoading[expandedId] && (teamGames[expandedId]||[]).length === 0 && (
                    <div className="tm-games-empty">No recent games found.</div>
                  )}
                  <table className="tm-games-table">
                    <tbody>
                      {(teamGames[expandedId]||[]).map(g => {
                        const team = (grouped[conf] || []).find(t => t.team_id === expandedId)
                        const isHome = g.home_team.id === team.team_id
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
