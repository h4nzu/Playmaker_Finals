import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProfileCard.css'

const API_BASE_URL = 'http://localhost:8000'

export default function ProfileCard({ user, onClose }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // info, username, password, picture
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const cardRef = useRef(null)
  
  // Form states
  const [newName, setNewName] = useState(user?.name || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profilePicUrl, setProfilePicUrl] = useState(user?.profile_pic || '')
  const [previewUrl, setPreviewUrl] = useState(user?.profile_pic || '')

  useEffect(() => {
    function handleClickOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        handleClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function handleClose() {
    setIsOpen(false)
    onClose?.()
  }

  async function handleUpdateUsername() {
    if (!newName.trim()) {
      setError('Please enter a name')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await fetch(
        `${API_BASE_URL}/api/users/update-username?email=${encodeURIComponent(user.email)}&new_name=${encodeURIComponent(newName)}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to update username')
        return
      }

      setSuccess('Username updated successfully!')
      
      // Update localStorage
      const updatedUser = { ...user, name: newName }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setTimeout(() => {
        setSuccess('')
        setActiveTab('info')
      }, 2000)
      
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdatePassword() {
    setError('')
    setSuccess('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword === oldPassword) {
      setError('New password must be different from current password')
      return
    }

    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(', ')}`)
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(
        `${API_BASE_URL}/api/users/update-password?email=${encodeURIComponent(user.email)}&old_password=${encodeURIComponent(oldPassword)}&new_password=${encodeURIComponent(newPassword)}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to update password')
        return
      }

      setSuccess('Password updated successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      setTimeout(() => {
        setSuccess('')
        setActiveTab('info')
      }, 2000)
      
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfilePic() {
    if (!profilePicUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await fetch(
        `${API_BASE_URL}/api/users/update-profile-pic?email=${encodeURIComponent(user.email)}&profile_pic_url=${encodeURIComponent(profilePicUrl)}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to update profile picture')
        return
      }

      setSuccess('Profile picture updated successfully!')
      
      // Update localStorage
      const updatedUser = { ...user, profile_pic: profilePicUrl }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setTimeout(() => {
        setSuccess('')
        setActiveTab('info')
      }, 2000)
      
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function validatePassword(password) {
    const errors = []
    
    if (password.length < 6) {
      errors.push('at least 6 characters')
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('at least one letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('at least one number')
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('at least one symbol (!@#$%^&*)')
    }
    
    return errors
  }

  function handleSignOut() {
    localStorage.removeItem('user')
    navigate('/login')
    handleClose()
  }

  function handleImagePreview(e) {
    const url = e.target.value
    setProfilePicUrl(url)
    setPreviewUrl(url)
  }

  return (
    <div className="profile-card-container">
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Profile menu"
      >
        {user?.profile_pic ? (
          <img src={user.profile_pic} alt="Profile" className="profile-avatar-img" />
        ) : (
          '👤'
        )}
      </button>

      {isOpen && (
        <div className="profile-card" ref={cardRef}>
          {/* Header */}
          <div className="profile-card-header">
            <div className="profile-card-avatar">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" onError={(e) => e.target.src = '👤'} />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div className="profile-card-info">
              <h3 className="profile-card-name">{user?.name || 'User'}</h3>
              <p className="profile-card-email">{user?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-card-tabs">
            <button 
              className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => { setActiveTab('info'); setError(''); setSuccess(''); }}
            >
              Info
            </button>
            <button 
              className={`profile-tab ${activeTab === 'username' ? 'active' : ''}`}
              onClick={() => { setActiveTab('username'); setError(''); setSuccess(''); }}
            >
              Username
            </button>
            <button 
              className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            >
              Password
            </button>
            <button 
              className={`profile-tab ${activeTab === 'picture' ? 'active' : ''}`}
              onClick={() => { setActiveTab('picture'); setError(''); setSuccess(''); }}
            >
              Picture
            </button>
          </div>

          {/* Content */}
          <div className="profile-card-content">
            {error && <div className="profile-error">{error}</div>}
            {success && <div className="profile-success">{success}</div>}

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="profile-tab-content">
                <div className="profile-info-item">
                  <label>Name</label>
                  <p>{user?.name}</p>
                </div>
                <div className="profile-info-item">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="profile-info-item">
                  <label>Member Since</label>
                  <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Username Tab */}
            {activeTab === 'username' && (
              <div className="profile-tab-content">
                <div className="profile-form-group">
                  <label htmlFor="new-name">New Username</label>
                  <input
                    id="new-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new username"
                    disabled={loading}
                  />
                </div>
                <button 
                  className="profile-btn-primary"
                  onClick={handleUpdateUsername}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Username'}
                </button>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="profile-tab-content">
                <div className="profile-form-group">
                  <label htmlFor="old-pwd">Current Password</label>
                  <input
                    id="old-pwd"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={loading}
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="new-pwd">New Password</label>
                  <input
                    id="new-pwd"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="confirm-pwd">Confirm Password</label>
                  <input
                    id="confirm-pwd"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                </div>
                <button 
                  className="profile-btn-primary"
                  onClick={handleUpdatePassword}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}

            {/* Picture Tab */}
            {activeTab === 'picture' && (
              <div className="profile-tab-content">
                <div className="profile-form-group">
                  <label htmlFor="pic-url">Image URL</label>
                  <input
                    id="pic-url"
                    type="text"
                    value={profilePicUrl}
                    onChange={handleImagePreview}
                    placeholder="Enter image URL"
                    disabled={loading}
                  />
                </div>
                {previewUrl && (
                  <div className="profile-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
                <button 
                  className="profile-btn-primary"
                  onClick={handleUpdateProfilePic}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Picture'}
                </button>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button 
            className="profile-btn-signout"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
