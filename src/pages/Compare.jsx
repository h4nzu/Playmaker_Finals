import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { searchPlayers, getPlayerStats } from '../services/backendApi'
import './Compare.css'

function playerAvatarUrl(player, size = 128) {
  if (player?.image_url) return player.image_url
  const name = encodeURIComponent(`${player?.first_name || ''} ${player?.last_name || ''}`)
  return `https://ui-avatars.com/api/?name=${name}&background=0d1228&color=4d72f0&bold=true&size=${size}&font-size=0.38`
}

function handleAvatarError(e, player, size = 128) {
  e.currentTarget.onerror = null
  const name = encodeURIComponent(`${player?.first_name || ''} ${player?.last_name || ''}`)
  e.currentTarget.src = `https://ui-avatars.com/api/?name=${name}&background=0d1228&color=4d72f0&bold=true&size=${size}&font-size=0.38`
}

function PlayerPanel({ label, player, onSelect, onClear }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowList(false); return }
    const t = setTimeout(() => {
      setLoading(true)
      searchPlayers(query, 8)
        .then(data => {
          setResults(data.data || [])
          setShowList(true)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  function pick(p) {
    onSelect(p)
    setQuery('')
    setResults([])
    setShowList(false)
  }

  return (
    <div className="compare-panel">
      <h3 className="compare-panel-label">{label}</h3>

      {!player ? (
        <div className="compare-empty">
          <div className="compare-empty-icon">👤</div>
          <div className="compare-search-wrap">
            <input
              type="text"
              placeholder="Search player name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onBlur={() => setTimeout(() => setShowList(false), 150)}
              onFocus={() => results.length > 0 && setShowList(true)}
              className="compare-search-input"
            />
            {loading && <span className="compare-spinner" />}
            {showList && results.length > 0 && (
              <div className="compare-results">
                {results.map(p => (
                  <div key={p.id} className="compare-result-item" onMouseDown={() => pick(p)}>
                    <div className="compare-result-avatar">
                      <img src={playerAvatarUrl(p, 64)} alt="" onError={e => handleAvatarError(e, p, 64)} />
                    </div>
                    <div>
                      <div className="compare-result-name">{p.first_name} {p.last_name}</div>
                      <div className="compare-result-meta">{p.position || '—'} · {p.team?.abbreviation || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="compare-hint">Type a player name to select</p>
        </div>
      ) : (
        <div className="compare-player-card">
          <div className="compare-player-avatar">
            <img
              src={playerAvatarUrl(player, 128)}
              alt={`${player.first_name} ${player.last_name}`}
              onError={e => handleAvatarError(e, player, 128)}
            />
          </div>
          <div className="compare-player-name">
            {player.first_name} {player.last_name}
          </div>
          {player.jersey_number && (
            <div className="compare-player-jersey">#{player.jersey_number}</div>
          )}
          <button className="compare-clear-btn" onClick={onClear}>✕ Change</button>
        </div>
      )}
    </div>
  )
}

const FIELDS = [
  { key: 'position',       label: 'Position' },
  { key: 'height',         label: 'Height' },
  { key: 'weight',         label: 'Weight',       suffix: ' lbs' },
  { key: 'jersey_number',  label: 'Jersey #',     prefix: '#' },
  { key: 'college',        label: 'College' },
  { key: 'country',        label: 'Country' },
  { key: 'draft_year',     label: 'Draft Year' },
  { key: 'draft_round',    label: 'Draft Round' },
  { key: 'draft_number',   label: 'Draft Pick' },
]

const STAT_FIELDS = [
  { key: 'PTS',  label: 'Points Per Game',    suffix: ' PPG' },
  { key: 'AST',  label: 'Assists Per Game',   suffix: ' APG' },
  { key: 'REB',  label: 'Rebounds Per Game',  suffix: ' RPG' },
  { key: 'STL',  label: 'Steals Per Game',    suffix: ' SPG' },
  { key: 'BLK',  label: 'Blocks Per Game',    suffix: ' BPG' },
]

export default function Compare() {
  const [playerA, setPlayerA] = useState(null)
  const [playerB, setPlayerB] = useState(null)
  const [statsA, setStatsA] = useState(null)
  const [statsB, setStatsB] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Fetch stats when players are selected
  useEffect(() => {
    if (playerA && playerA.id) {
      setLoadingStats(true)
      getPlayerStats(playerA.id)
        .then(stats => setStatsA(stats))
        .catch(err => {
          console.error('Failed to fetch player A stats:', err)
          setStatsA(null)
        })
        .finally(() => setLoadingStats(false))
    } else {
      setStatsA(null)
    }
  }, [playerA])

  useEffect(() => {
    if (playerB && playerB.id) {
      setLoadingStats(true)
      getPlayerStats(playerB.id)
        .then(stats => setStatsB(stats))
        .catch(err => {
          console.error('Failed to fetch player B stats:', err)
          setStatsB(null)
        })
        .finally(() => setLoadingStats(false))
    } else {
      setStatsB(null)
    }
  }, [playerB])

  const showTable = playerA && playerB

  return (
    <Layout>
      <div className="cmp-page-header">
        <div className="cmp-breadcrumb">
          <span className="cmp-bc-root">Stats Home</span>
          <span className="cmp-bc-sep">/</span>
          <span className="cmp-bc-cur">Compare</span>
        </div>
        <div className="cmp-header-row">
          <h1 className="cmp-title">COMPARE PLAYERS</h1>
          <span className="cmp-season-badge">2025-26 SEASON</span>
        </div>
      </div>

      <div className="compare-panels">
        <PlayerPanel label="Player A" player={playerA} onSelect={setPlayerA} onClear={() => setPlayerA(null)} />
        <div className="compare-vs">VS</div>
        <PlayerPanel label="Player B" player={playerB} onSelect={setPlayerB} onClear={() => setPlayerB(null)} />
      </div>

      {!showTable && (
        <p className="compare-prompt">Select two players above to compare their profiles.</p>
      )}

      {showTable && (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-th compare-th-label">STAT</th>
                <th className="compare-th">
                  <div className="compare-th-player">
                    <div className="compare-th-avatar">
                      <img src={playerAvatarUrl(playerA, 64)} alt="" onError={e => handleAvatarError(e, playerA, 64)} />
                    </div>
                    {playerA.first_name} {playerA.last_name}
                  </div>
                </th>
                <th className="compare-th">
                  <div className="compare-th-player">
                    <div className="compare-th-avatar compare-th-avatar-b">
                      <img src={playerAvatarUrl(playerB, 64)} alt="" onError={e => handleAvatarError(e, playerB, 64)} />
                    </div>
                    {playerB.first_name} {playerB.last_name}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="compare-tr">
                <td className="compare-td-label">Team</td>
                <td className="compare-td">{playerA.team?.full_name || '—'}</td>
                <td className="compare-td">{playerB.team?.full_name || '—'}</td>
              </tr>
              {FIELDS.map(f => {
                const valA = playerA[f.key]
                const valB = playerB[f.key]
                const same = String(valA) === String(valB)
                return (
                  <tr key={f.key} className="compare-tr">
                    <td className="compare-td-label">{f.label}</td>
                    <td className={`compare-td${!same && valA ? ' compare-diff-a' : ''}`}>
                      {valA ? `${f.prefix || ''}${valA}${f.suffix || ''}` : '—'}
                    </td>
                    <td className={`compare-td${!same && valB ? ' compare-diff-b' : ''}`}>
                      {valB ? `${f.prefix || ''}${valB}${f.suffix || ''}` : '—'}
                    </td>
                  </tr>
                )
              })}

              {/* Stats Section */}
              {(statsA || statsB) && (
                <>
                  <tr className="compare-tr compare-stats-header">
                    <td colSpan="3" className="compare-stats-title">2025-26 SEASON STATS</td>
                  </tr>
                  {STAT_FIELDS.map(f => {
                    const valA = statsA ? statsA[f.key] : null
                    const valB = statsB ? statsB[f.key] : null
                    const numA = valA !== null && valA !== undefined ? parseFloat(valA) : null
                    const numB = valB !== null && valB !== undefined ? parseFloat(valB) : null
                    const higherA = numA !== null && numB !== null && numA > numB
                    const higherB = numA !== null && numB !== null && numB > numA
                    
                    return (
                      <tr key={f.key} className="compare-tr">
                        <td className="compare-td-label">{f.label}</td>
                        <td className={`compare-td${higherA ? ' compare-diff-a' : ''}`}>
                          {numA !== null ? `${numA.toFixed(1)}${f.suffix || ''}` : '—'}
                        </td>
                        <td className={`compare-td${higherB ? ' compare-diff-b' : ''}`}>
                          {numB !== null ? `${numB.toFixed(1)}${f.suffix || ''}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
