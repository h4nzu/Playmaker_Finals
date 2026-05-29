import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '127.0.0.1:5173'],
  credentials: true
}))
app.use(express.json())

// Contact messages file path
const contactMessagesFile = path.join(__dirname, 'data', 'contact_messages.json')

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize contact messages file if it doesn't exist
if (!fs.existsSync(contactMessagesFile)) {
  fs.writeFileSync(contactMessagesFile, JSON.stringify([], null, 2))
}

// In-memory cache with TTL
class Cache {
  constructor() {
    this.store = {}
    this._stats = { hits: 0, misses: 0 }
  }

  set(key, data, ttl = 300) {
    this.store[key] = {
      data,
      expires: Date.now() + (ttl * 1000)
    }
  }

  get(key) {
    if (!this.store[key]) {
      this._stats.misses++
      return null
    }

    const entry = this.store[key]
    if (Date.now() > entry.expires) {
      delete this.store[key]
      this._stats.misses++
      return null
    }

    this._stats.hits++
    return entry.data
  }

  clear() {
    this.store = {}
  }

  getStats() {
    return {
      ...this._stats,
      size: Object.keys(this.store).length,
      entries: Object.keys(this.store)
    }
  }
}

const cache = new Cache()

// BallDontLie API config
const BALLDONTLIE_API_KEY = process.env.BALLDONTLIE_API_KEY
const BALLDONTLIE_BASE = 'https://api.balldontlie.io/v1'
const bdlHeaders = { Authorization: BALLDONTLIE_API_KEY }

// Mock data for testing
const mockTeams = [
  { id: 1, abbreviation: 'ATL', full_name: 'Atlanta Hawks', city: 'Atlanta', conference: 'East', division: 'Southeast' },
  { id: 2, abbreviation: 'BOS', full_name: 'Boston Celtics', city: 'Boston', conference: 'East', division: 'Atlantic' },
  { id: 3, abbreviation: 'BKN', full_name: 'Brooklyn Nets', city: 'Brooklyn', conference: 'East', division: 'Atlantic' },
  { id: 8, abbreviation: 'DEN', full_name: 'Denver Nuggets', city: 'Denver', conference: 'West', division: 'Northwest' },
  { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors', city: 'Golden State', conference: 'West', division: 'Pacific' },
  { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers', city: 'Los Angeles', conference: 'West', division: 'Pacific' },
]

const mockGames = [
  {
    id: '1',
    date: new Date().toISOString(),
    status: 'Final',
    home_team: mockTeams[0],
    visitor_team: mockTeams[1],
    home_team_score: 115,
    visitor_team_score: 110
  },
  {
    id: '2',
    date: new Date().toISOString(),
    status: 'Final',
    home_team: mockTeams[3],
    visitor_team: mockTeams[4],
    home_team_score: 120,
    visitor_team_score: 105
  }
]

const mockPlayers = [
  { id: '203999', first_name: 'Nikola', last_name: 'Jokic', position: 'C', team: mockTeams[3] },
  { id: '2544', first_name: 'LeBron', last_name: 'James', position: 'F', team: mockTeams[5] },
  { id: '201950', first_name: 'Stephen', last_name: 'Curry', position: 'G', team: mockTeams[4] },
]

// Routes

app.get('/', (req, res) => {
  res.json({
    message: 'Playmaker NBA API Backend',
    version: '1.0.0',
    docs: '/api/health',
    endpoints: {
      games: '/api/games',
      teams: '/api/teams',
      players: '/api/players',
      contact: '/api/contact',
      health: '/api/health'
    }
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    cache_stats: cache.getStats(),
    api_sources: ['mock_data', 'nba_api_pending']
  })
})

// Games endpoints
app.get('/api/games/recent', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 6, 30)
  const cached = cache.get('games:recent')
  
  if (cached) {
    return res.json({ data: cached, total: cached.length })
  }

  const games = mockGames.slice(0, limit)
  cache.set('games:recent', games, 15 * 60) // 15 minutes
  res.json({ data: games, total: games.length })
})

app.get('/api/games/schedule', (req, res) => {
  const { start_date, end_date } = req.query
  const limit = Math.min(parseInt(req.query.limit) || 40, 100)
  
  const games = mockGames.slice(0, limit)
  res.json({ data: games, total: games.length })
})

app.get('/api/games/team/:team_id', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 8, 30)
  const games = mockGames.slice(0, limit)
  res.json({ data: games, total: games.length })
})

// Teams endpoints

// ✅ STANDINGS ROUTE — must be before /api/teams/:team_id
app.get('/api/teams/standings/current', async (req, res) => {
  const cached = cache.get('teams:standings')
  if (cached) {
    return res.json({ data: cached, total: cached.length })
  }

  try {
    const response = await axios.get(
      `${BALLDONTLIE_BASE}/standings?season=2025`,
      { headers: bdlHeaders }
    )

    const raw = response.data.data || []

    const standings = raw.map(s => ({
      team_id: s.team.id,
      team_name: s.team.full_name,
      team_abbreviation: s.team.abbreviation,
      conference: s.conference,
      division: s.division,
      wins: s.wins,
      losses: s.losses,
      pct: s.wins + s.losses > 0
        ? parseFloat((s.wins / (s.wins + s.losses)).toFixed(3))
        : 0,
      home_record: s.home_record || '',
      away_record: s.road_record || '',
      div_record: s.division_record || '',
      conf_record: s.conference_record || '',
      ppg: s.pts_per_game ? parseFloat(s.pts_per_game.toFixed(1)) : null,
      opp_ppg: s.opp_pts_per_game ? parseFloat(s.opp_pts_per_game.toFixed(1)) : null,
      diff: s.pts_per_game && s.opp_pts_per_game
        ? parseFloat((s.pts_per_game - s.opp_pts_per_game).toFixed(1))
        : null,
      streak: s.streak || '',
      last_ten: s.last_ten_record || '',
    }))

    cache.set('teams:standings', standings, 60 * 60) // 1 hour
    res.json({ data: standings, total: standings.length })
  } catch (err) {
    console.error('❌ Standings fetch error:', err.message)
    res.status(500).json({ error: 'Failed to fetch standings from BallDontLie API' })
  }
})

app.get('/api/teams', (req, res) => {
  const cached = cache.get('teams:all')
  
  if (cached) {
    return res.json({ data: cached, total: cached.length })
  }

  cache.set('teams:all', mockTeams, 60 * 60) // 1 hour
  res.json({ data: mockTeams, total: mockTeams.length })
})

app.get('/api/teams/:team_id', (req, res) => {
  const team = mockTeams.find(t => t.id === parseInt(req.params.team_id))
  if (!team) {
    return res.status(404).json({ error: 'Team not found' })
  }
  res.json(team)
})

// Players endpoints
app.get('/api/players', (req, res) => {
  const { search } = req.query
  const limit = Math.min(parseInt(req.query.limit) || 24, 100)
  const page = parseInt(req.query.page) || 0

  let results = mockPlayers

  if (search) {
    const query = search.toLowerCase()
    results = results.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)
    )
  }

  const start = page * limit
  const paginated = results.slice(start, start + limit)

  res.json({
    data: paginated,
    total: results.length,
    next_cursor: (start + limit < results.length) ? (page + 1).toString() : null
  })
})

// Contact form endpoints
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Read existing messages
    let messages = []
    try {
      const fileContent = fs.readFileSync(contactMessagesFile, 'utf-8')
      messages = JSON.parse(fileContent)
    } catch (err) {
      messages = []
    }

    // Create new message object
    const newMessage = {
      id: Date.now(),
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
      status: 'unread'
    }

    // Add to messages array
    messages.push(newMessage)

    // Write back to file
    fs.writeFileSync(contactMessagesFile, JSON.stringify(messages, null, 2))

    res.status(201).json({
      success: true,
      message: 'Message received successfully',
      data: newMessage
    })
  } catch (error) {
    console.error('Error saving contact message:', error)
    res.status(500).json({ error: 'Failed to save message' })
  }
})

// Get all contact messages (admin view)
app.get('/api/contact/messages', (req, res) => {
  try {
    const fileContent = fs.readFileSync(contactMessagesFile, 'utf-8')
    const messages = JSON.parse(fileContent)
    res.json({ data: messages, total: messages.length })
  } catch (error) {
    console.error('Error reading contact messages:', error)
    res.status(500).json({ error: 'Failed to retrieve messages' })
  }
})

// Mark message as read
app.patch('/api/contact/messages/:id/read', (req, res) => {
  try {
    const messageId = parseInt(req.params.id)
    let messages = []
    
    const fileContent = fs.readFileSync(contactMessagesFile, 'utf-8')
    messages = JSON.parse(fileContent)
    
    const message = messages.find(m => m.id === messageId)
    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }
    
    message.status = 'read'
    fs.writeFileSync(contactMessagesFile, JSON.stringify(messages, null, 2))
    
    res.json({ success: true, data: message })
  } catch (error) {
    console.error('Error updating message:', error)
    res.status(500).json({ error: 'Failed to update message' })
  }
})

// Delete message
app.delete('/api/contact/messages/:id', (req, res) => {
  try {
    const messageId = parseInt(req.params.id)
    let messages = []
    
    const fileContent = fs.readFileSync(contactMessagesFile, 'utf-8')
    messages = JSON.parse(fileContent)
    
    const index = messages.findIndex(m => m.id === messageId)
    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' })
    }
    
    messages.splice(index, 1)
    fs.writeFileSync(contactMessagesFile, JSON.stringify(messages, null, 2))
    
    res.json({ success: true, message: 'Message deleted' })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📚 API endpoints: GET /api/{games,teams,players}`)
  console.log(`💬 Contact endpoint: POST /api/contact`)
  console.log(`📧 Contact messages stored in: ${contactMessagesFile}`)
  console.log(`🔍 View messages: GET http://localhost:${PORT}/api/contact/messages`)
})