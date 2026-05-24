import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'

export default function StatsRadarChart({ stats }) {
  // Extract key stats and normalize them to 0-100 scale
  // Using standard NBA stat ranges for normalization
  const normalizeValue = (value, maxValue) => {
    if (!value || isNaN(value)) return 0
    const num = parseFloat(value)
    return Math.min(100, (num / maxValue) * 100)
  }

  const data = [
    {
      stat: 'PPG',
      value: normalizeValue(stats.PTS, 30), // Points Per Game (max 30)
      fullValue: parseFloat(stats.PTS) || 0
    },
    {
      stat: 'RPG',
      value: normalizeValue(stats.REB, 15), // Rebounds (max 15)
      fullValue: parseFloat(stats.REB) || 0
    },
    {
      stat: 'APG',
      value: normalizeValue(stats.AST, 12), // Assists (max 12)
      fullValue: parseFloat(stats.AST) || 0
    },
    {
      stat: 'SPG',
      value: normalizeValue(stats.STL, 3), // Steals (max 3)
      fullValue: parseFloat(stats.STL) || 0
    },
    {
      stat: 'BPG',
      value: normalizeValue(stats.BLK, 3), // Blocks (max 3)
      fullValue: parseFloat(stats.BLK) || 0
    },
    {
      stat: 'FG%',
      value: parseFloat(stats.FG_PCT) || 0, // FG% is already in 0-100 range
      fullValue: ((parseFloat(stats.FG_PCT) || 0) / 100).toFixed(3)
    }
  ]

  return (
    <div className="radar-chart-container">
      <h3>Stats Radar Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#444" />
          <PolarAngleAxis 
            dataKey="stat" 
            tick={{ fill: '#fff', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: '#888', fontSize: 10 }}
          />
          <Radar 
            name="Stats" 
            dataKey="value" 
            stroke="#4d72f0" 
            fill="#4d72f0" 
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="radar-legend">
        {data.map(d => (
          <div key={d.stat} className="radar-legend-item">
            <span className="radar-stat-name">{d.stat}:</span>
            <span className="radar-stat-value">{d.fullValue}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
