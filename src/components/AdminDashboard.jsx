import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import './AdminDashboard.css'
import React from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth()
  const [activeTab, setActiveTab] = React.useState('messages')
  const [messages, setMessages] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [selectedItem, setSelectedItem] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [messageFilter, setMessageFilter] = React.useState('all')

  React.useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages()
    } else if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  async function fetchMessages() {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/contact/messages`)
      const data = await response.json()
      setMessages(data.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/users/all`)
      const data = await response.json()
      setUsers(data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markMessageAsRead(id) {
    try {
      await fetch(`${API_BASE_URL}/api/contact/messages/${id}/read`, {
        method: 'PATCH'
      })
      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  async function deleteMessage(id) {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await fetch(`${API_BASE_URL}/api/contact/messages/${id}`, {
          method: 'DELETE'
        })
        fetchMessages()
        setSelectedItem(null)
      } catch (error) {
        console.error('Error deleting message:', error)
      }
    }
  }

  async function deleteUser(id) {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`${API_BASE_URL}/api/users/${id}`, {
          method: 'DELETE'
        })
        fetchUsers()
        setSelectedItem(null)
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const filteredMessages = messages.filter(msg => {
    if (messageFilter === 'unread') return msg.status === 'unread'
    if (messageFilter === 'read') return msg.status === 'read'
    return true
  })

  if (loading) {
    return <div className="admin-container"><p>Loading...</p></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-email">Logged in as: <strong>{admin?.email}</strong></p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(29, 66, 186, 0.2)',
        paddingBottom: '12px'
      }}>
        <button 
          className={`filter-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
          style={{ padding: '12px 24px' }}
        >
          📧 Contact Messages ({messages.filter(m => m.status === 'unread').length})
        </button>
        <button 
          className={`filter-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ padding: '12px 24px' }}
        >
          👥 Registered Users ({users.length})
        </button>
      </div>

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <>
          <div className="admin-stats">
            <span className="stat">Total: {messages.length}</span>
            <span className="stat unread">Unread: {messages.filter(m => m.status === 'unread').length}</span>
          </div>

          <div className="admin-filters">
            <button 
              className={`filter-btn ${messageFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMessageFilter('all')}
            >
              All Messages
            </button>
            <button 
              className={`filter-btn ${messageFilter === 'unread' ? 'active' : ''}`}
              onClick={() => setMessageFilter('unread')}
            >
              Unread
            </button>
            <button 
              className={`filter-btn ${messageFilter === 'read' ? 'active' : ''}`}
              onClick={() => setMessageFilter('read')}
            >
              Read
            </button>
          </div>

          <div className="admin-content">
            <div className="messages-list">
              {filteredMessages.length === 0 ? (
                <div className="no-messages">No messages found</div>
              ) : (
                filteredMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message-item ${msg.status === 'unread' ? 'unread' : ''} ${selectedItem?.id === msg.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedItem(msg)
                      if (msg.status === 'unread') {
                        markMessageAsRead(msg.id)
                      }
                    }}
                  >
                    <div className="message-header">
                      <h3>{msg.subject}</h3>
                      <span className={`status-badge ${msg.status}`}>{msg.status}</span>
                    </div>
                    <div className="message-meta">
                      <p className="sender"><strong>{msg.name}</strong> &lt;{msg.email}&gt;</p>
                      <p className="date">{new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="preview">{msg.message.substring(0, 100)}...</p>
                  </div>
                ))
              )}
            </div>

            <div className="message-detail">
              {selectedItem && !selectedItem.password ? (
                <div className="detail-content">
                  <div className="detail-header">
                    <h2>{selectedItem.subject}</h2>
                    <div className="detail-actions">
                      <button 
                        className="delete-btn"
                        onClick={() => deleteMessage(selectedItem.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="detail-info">
                    <div className="info-row">
                      <span className="label">From:</span>
                      <span className="value">{selectedItem.name} &lt;{selectedItem.email}&gt;</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Date:</span>
                      <span className="value">{new Date(selectedItem.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Status:</span>
                      <span className="value">{selectedItem.status}</span>
                    </div>
                  </div>

                  <div className="detail-message">
                    <h4>Message:</h4>
                    <p>{selectedItem.message}</p>
                  </div>

                  <div className="detail-footer">
                    <p className="contact-email">Reply to: <a href={`mailto:${selectedItem.email}`}>{selectedItem.email}</a></p>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <p>Select a message to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <>
          <div className="admin-stats">
            <span className="stat">Total Users: {users.length}</span>
          </div>

          <div className="admin-content">
            <div className="messages-list">
              {users.length === 0 ? (
                <div className="no-messages">No registered users yet</div>
              ) : (
                users.map(user => (
                  <div
                    key={user.id}
                    className={`message-item ${selectedItem?.id === user.id ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(user)}
                  >
                    <div className="message-header">
                      <h3>{user.name}</h3>
                    </div>
                    <div className="message-meta">
                      <p className="sender">{user.email}</p>
                      <p className="date">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="message-detail">
              {selectedItem && selectedItem.password ? (
                <div className="detail-content">
                  <div className="detail-header">
                    <h2>{selectedItem.name}</h2>
                    <div className="detail-actions">
                      <button 
                        className="delete-btn"
                        onClick={() => deleteUser(selectedItem.id)}
                      >
                        Delete User
                      </button>
                    </div>
                  </div>

                  <div className="detail-info">
                    <div className="info-row">
                      <span className="label">ID:</span>
                      <span className="value">{selectedItem.id}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Name:</span>
                      <span className="value">{selectedItem.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Email:</span>
                      <span className="value">{selectedItem.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Password Hash:</span>
                      <span className="value" style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        background: 'rgba(29, 66, 186, 0.1)',
                        padding: '8px',
                        borderRadius: '4px',
                        wordBreak: 'break-all'
                      }}>
                        {selectedItem.password}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Created:</span>
                      <span className="value">{new Date(selectedItem.created_at).toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Updated:</span>
                      <span className="value">{new Date(selectedItem.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <p>Select a user to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
