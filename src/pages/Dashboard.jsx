import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getScoreboard } from '../services/espnApi'
import './Dashboard.css'

function Dashboard() {
  // ── Games state ───────────────────────────────
  const [games, setGames] = useState([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [gamesError, setGamesError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // ── Fetch today's scoreboard (real-time) ──────
  const fetchGames = () => {
    setGamesLoading(true)
    setGamesError(null)
    getScoreboard()
      .then(data => {
        // Transform ESPN events to match Dashboard format
        const transformed = (data.events || []).slice(0, 6).map(event => {
          const comp = event.competitions?.[0]
          const homeTeam = comp?.competitors?.find(c => c.homeAway === 'home')
          const awayTeam = comp?.competitors?.find(c => c.homeAway === 'away')
          return {
            id: event.id,
            home_team: {
              abbreviation: homeTeam?.team?.abbreviation || '???',
              full_name: homeTeam?.team?.displayName || 'Unknown'
            },
            visitor_team: {
              abbreviation: awayTeam?.team?.abbreviation || '???',
              full_name: awayTeam?.team?.displayName || 'Unknown'
            },
            home_team_score: parseInt(homeTeam?.score || 0),
            visitor_team_score: parseInt(awayTeam?.score || 0),
            status: comp?.status?.type?.shortDetail || comp?.status?.type?.detail || 'Scheduled',
            date: event.date
          }
        })
        setGames(transformed)
        setLastUpdate(new Date())
        setGamesLoading(false)
      })
      .catch(err => {
        setGamesError(err.message)
        setGamesLoading(false)
      })
  }

  // ── Auto-refresh every 30 seconds for live games ──────
  useEffect(() => {
    fetchGames()
    const interval = setInterval(fetchGames, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Derive top scoring teams from games ───────
  const topTeams = (() => {
    const map = {}
    games.forEach(g => {
      if (g.home_team_score) {
        const k = g.home_team.abbreviation
        if (!map[k]) map[k] = { name: g.home_team.full_name, abbr: k, total: 0, count: 0 }
        map[k].total += g.home_team_score
        map[k].count++
      }
      if (g.visitor_team_score) {
        const k = g.visitor_team.abbreviation
        if (!map[k]) map[k] = { name: g.visitor_team.full_name, abbr: k, total: 0, count: 0 }
        map[k].total += g.visitor_team_score
        map[k].count++
      }
    })
    return Object.values(map)
      .map(t => ({ ...t, avg: Math.round(t.total / t.count) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5)
  })()
  const maxAvg = topTeams[0]?.avg || 1

  // ── Chart: home scores from recent games ──────
  const chartGames = games.slice(0, 7)
  const maxScore = chartGames.reduce((m, g) => Math.max(m, g.home_team_score || 0, g.visitor_team_score || 0), 1)

  return (
    <Layout>
      <div className="db-header">
        <h1 className="db-title">Dashboard</h1>
        {lastUpdate && (
          <div className="db-update-info">
            <span className="db-update-text">Last update: {lastUpdate.toLocaleTimeString()}</span>
            <button 
              className="db-refresh-btn" 
              onClick={fetchGames}
              disabled={gamesLoading}
              title="Refresh scores"
            >
              🔄
            </button>
          </div>
        )}
      </div>

      {/* Latest Results */}
      <section className="db-section">
        <h2 className="db-section-title">Latest Results (Live)</h2>
        {gamesLoading && <div className="db-status-msg db-loading">Loading games…</div>}
        {gamesError && <div className="db-status-msg db-error">{gamesError}</div>}
        {!gamesLoading && !gamesError && games.length === 0 && (
          <div className="db-status-msg">No recent games found.</div>
        )}
        <div className="db-results-grid">
          {games.map(g => {
            const homeWon = (g.home_team_score || 0) > (g.visitor_team_score || 0)
            return (
              <div key={g.id} className="db-result-card">
                <div className={`db-result-team-row ${homeWon ? 'db-winner' : ''}`}>
                  <div className="db-team-badge">{g.home_team.abbreviation}</div>
                  <span className="db-team-full">{g.home_team.full_name}</span>
                  <span className="db-team-score">{g.home_team_score ?? '–'}</span>
                </div>
                <div className={`db-result-team-row ${!homeWon ? 'db-winner' : ''}`}>
                  <div className="db-team-badge">{g.visitor_team.abbreviation}</div>
                  <span className="db-team-full">{g.visitor_team.full_name}</span>
                  <span className="db-team-score">{g.visitor_team_score ?? '–'}</span>
                </div>
                <div className="db-result-footer">
                  <span className="db-result-status">{g.status}</span>
                  <span className="db-result-date">{g.date?.split('T')[0]}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom row */}
      <div className="db-bottom-row">
        {/* Top Scoring Teams */}
        <section className="db-section db-scorers">
          <h2 className="db-section-title">Top Scoring Teams</h2>
          {gamesLoading && <div className="db-status-msg db-loading">Loading…</div>}
          <ul className="db-scorers-list">
            {topTeams.map((t, i) => (
              <li key={t.abbr} className="db-scorer-item">
                <span className="db-scorer-rank">#{i + 1}</span>
                <div className="db-scorer-info">
                  <span className="db-scorer-name">{t.abbr}</span>
                  <span className="db-scorer-pts">{t.avg} PPG</span>
                </div>
                <div className="db-scorer-bar-wrap">
                  <div className="db-bar-track">
                    <div className="db-bar-fill" style={{ width: `${(t.avg / maxAvg) * 100}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Score Chart */}
        <section className="db-section db-chart-section">
          <h2 className="db-section-title">Recent Scores</h2>
          {gamesLoading && <div className="db-status-msg db-loading">Loading…</div>}
          <div className="db-chart-area">
            {chartGames.map(g => (
              <div key={g.id} className="db-chart-col">
                <div
                  className="db-bar"
                  style={{ height: `${Math.round(((g.home_team_score || 0) / maxScore) * 96)}px` }}
                  title={`${g.home_team.abbreviation}: ${g.home_team_score}`}
                />
                <span className="db-chart-label">{g.home_team.abbreviation}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Dashboard
